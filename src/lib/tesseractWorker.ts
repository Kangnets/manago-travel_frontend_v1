import Tesseract from 'tesseract.js';

export interface OcrAttempt {
  image: string;
  label: string;
  psm: string;
}

export interface OcrAttemptResult {
  text: string;
  confidence: number;
}

// ─── Otsu 이진화 ─────────────────────────────────────────────────
// 단순 대비 조정보다 훨씬 정확한 자동 임계값 계산
function otsuThreshold(grayArr: Uint8Array): number {
  const hist = new Array(256).fill(0);
  for (let k = 0; k < grayArr.length; k++) hist[grayArr[k]]++;
  const total = grayArr.length;
  let sum = 0;
  for (let i = 0; i < 256; i++) sum += i * hist[i];
  let sumB = 0, wB = 0, maxVar = 0, thresh = 127;
  for (let i = 0; i < 256; i++) {
    wB += hist[i];
    if (!wB) continue;
    const wF = total - wB;
    if (!wF) break;
    sumB += i * hist[i];
    const mB = sumB / wB;
    const mF = (sum - sumB) / wF;
    const v = wB * wF * (mB - mF) * (mB - mF);
    if (v > maxVar) { maxVar = v; thresh = i; }
  }
  return thresh;
}

// ─── 이미지 전처리 함수들 ─────────────────────────────────────────

/** 그레이스케일 변환 */
function toGray(data: Uint8ClampedArray, out: Uint8Array) {
  for (let i = 0; i < data.length; i += 4) {
    out[i >> 2] = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
  }
}

/** Otsu 이진화 + 선택적 반전 적용 */
function applyOtsu(ctx: CanvasRenderingContext2D, w: number, h: number, invert = false) {
  const imgData = ctx.getImageData(0, 0, w, h);
  const d = imgData.data;
  const gray = new Uint8Array(w * h);
  toGray(d, gray);
  const thresh = otsuThreshold(gray);
  for (let i = 0; i < gray.length; i++) {
    const v = invert
      ? (gray[i] > thresh ? 0 : 255)
      : (gray[i] > thresh ? 255 : 0);
    const p = i * 4;
    d[p] = d[p + 1] = d[p + 2] = v;
  }
  ctx.putImageData(imgData, 0, 0);
}

/** Unsharp Mask — OCR-B 폰트 엣지 강화 */
function unsharpMask(ctx: CanvasRenderingContext2D, w: number, h: number, amount = 1.2) {
  const orig = ctx.getImageData(0, 0, w, h);
  // 3×3 평균 블러 (근사)
  const blurred = ctx.getImageData(0, 0, w, h);
  const s = orig.data;
  const b = blurred.data;
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const c = (y * w + x) * 4;
      for (let ch = 0; ch < 3; ch++) {
        b[c + ch] = Math.round(
          (s[(y - 1) * w * 4 + (x - 1) * 4 + ch] + s[(y - 1) * w * 4 + x * 4 + ch] + s[(y - 1) * w * 4 + (x + 1) * 4 + ch] +
           s[y * w * 4 + (x - 1) * 4 + ch]       + s[y * w * 4 + x * 4 + ch]       + s[y * w * 4 + (x + 1) * 4 + ch] +
           s[(y + 1) * w * 4 + (x - 1) * 4 + ch] + s[(y + 1) * w * 4 + x * 4 + ch] + s[(y + 1) * w * 4 + (x + 1) * 4 + ch]) / 9
        );
      }
    }
  }
  // original + amount * (original - blurred)
  const out = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < s.length; i += 4) {
    for (let ch = 0; ch < 3; ch++) {
      out.data[i + ch] = Math.min(255, Math.max(0, Math.round(s[i + ch] + amount * (s[i + ch] - b[i + ch]))));
    }
  }
  ctx.putImageData(out, 0, 0);
}

/** 표준 대비 조정 */
function applyContrast(ctx: CanvasRenderingContext2D, w: number, h: number, factor: number) {
  const d = ctx.getImageData(0, 0, w, h);
  const px = d.data;
  for (let i = 0; i < px.length; i += 4) {
    const g = 0.299 * px[i] + 0.587 * px[i + 1] + 0.114 * px[i + 2];
    const c = Math.min(255, Math.max(0, (g - 128) * factor + 128));
    px[i] = px[i + 1] = px[i + 2] = c;
  }
  ctx.putImageData(d, 0, 0);
}

// ─── 전처리 파이프라인 생성 ────────────────────────────────────────
// 원본 이미지 → 여러 전처리 결과 DataURL 생성
// 각 전처리를 다른 Tesseract 시도에 사용

export interface PreparedImages {
  /** 하단 32% 크롭 + 4× 스케일 + Otsu 이진화 */
  mrzOtsu: string;
  /** 하단 32% 크롭 + 4× 스케일 + Otsu 이진화 + 반전 */
  mrzOtsuInv: string;
  /** 하단 32% 크롭 + 4× 스케일 + Unsharp + 대비 */
  mrzSharp: string;
  /** 전체 이미지 2× 스케일 + Otsu */
  fullOtsu: string;
  /** 하단 40% 크롭 (더 넓게) + 4× + Otsu */
  mrzWide: string;
}

function loadImageEl(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function cropCanvas(img: HTMLImageElement, yFrac: number, heightFrac: number, scale: number): HTMLCanvasElement {
  const ow = img.naturalWidth, oh = img.naturalHeight;
  const sy = Math.floor(oh * yFrac);
  const sh = Math.floor(oh * heightFrac);
  const c = document.createElement('canvas');
  c.width = ow * scale;
  c.height = sh * scale;
  c.getContext('2d')!.drawImage(img, 0, sy, ow, sh, 0, 0, c.width, c.height);
  return c;
}

export async function preparePassportImages(dataUrl: string): Promise<PreparedImages> {
  const img = await loadImageEl(dataUrl);
  const ow = img.naturalWidth, oh = img.naturalHeight;

  // ── mrzOtsu: 하단 32%, 4× ────────────────────────────────────
  const c1 = cropCanvas(img, 0.68, 0.32, 4);
  const ctx1 = c1.getContext('2d')!;
  applyOtsu(ctx1, c1.width, c1.height, false);
  const mrzOtsu = c1.toDataURL('image/png');

  // ── mrzOtsuInv: 반전 버전 (어두운 배경 여권 대응) ─────────────
  const c2 = cropCanvas(img, 0.68, 0.32, 4);
  const ctx2 = c2.getContext('2d')!;
  applyOtsu(ctx2, c2.width, c2.height, true);
  const mrzOtsuInv = c2.toDataURL('image/png');

  // ── mrzSharp: Unsharp Mask + 대비 강화 ────────────────────────
  const c3 = cropCanvas(img, 0.68, 0.32, 4);
  const ctx3 = c3.getContext('2d')!;
  unsharpMask(ctx3, c3.width, c3.height, 1.5);
  applyContrast(ctx3, c3.width, c3.height, 2.0);
  const mrzSharp = c3.toDataURL('image/png');

  // ── fullOtsu: 전체 이미지 2× ───────────────────────────────────
  const c4 = document.createElement('canvas');
  c4.width = ow * 2; c4.height = oh * 2;
  c4.getContext('2d')!.drawImage(img, 0, 0, c4.width, c4.height);
  applyOtsu(c4.getContext('2d')!, c4.width, c4.height, false);
  const fullOtsu = c4.toDataURL('image/png');

  // ── mrzWide: 하단 40% (MRZ가 아래쪽에 있는 경우 대응) ─────────
  const c5 = cropCanvas(img, 0.60, 0.40, 3);
  const ctx5 = c5.getContext('2d')!;
  applyOtsu(ctx5, c5.width, c5.height, false);
  const mrzWide = c5.toDataURL('image/png');

  return { mrzOtsu, mrzOtsuInv, mrzSharp, fullOtsu, mrzWide };
}

// ─── Tesseract OCR 실행 ───────────────────────────────────────────

export async function runTesseractOcr(
  attempt: OcrAttempt,
  onProgress: (pct: number, label: string) => void,
): Promise<OcrAttemptResult> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const worker: any = await Tesseract.createWorker('eng', 1, {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    logger: (m: any) => {
      if (m.status === 'recognizing text') {
        onProgress(Math.round(m.progress * 100), attempt.label);
      }
    },
  });

  try {
    await worker.setParameters({
      // MRZ 허용 문자만 지정 → 오인식률 대폭 감소
      tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789<',
      tessedit_pageseg_mode: attempt.psm,
      preserve_interword_spaces: '0',
    });
  } catch {
    // 구버전 무시
  }

  const result = await worker.recognize(attempt.image);
  await worker.terminate();
  return { text: result.data.text as string, confidence: result.data.confidence as number };
}
