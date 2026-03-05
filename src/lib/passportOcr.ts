import { PassportData, OcrResult, MrzLine } from '@/types/passport';

// ─── MRZ 체크 디짓 ────────────────────────────────────────────────
const MRZ_WEIGHTS = [7, 3, 1];

function mrzCharToNumber(char: string): number {
  if (char === '<') return 0;
  if (char >= '0' && char <= '9') return parseInt(char);
  if (char >= 'A' && char <= 'Z') return char.charCodeAt(0) - 55;
  return 0;
}

function calculateCheckDigit(data: string): number {
  let sum = 0;
  for (let i = 0; i < data.length; i++) {
    sum += mrzCharToNumber(data[i]) * MRZ_WEIGHTS[i % 3];
  }
  return sum % 10;
}

function verifyCheckDigit(data: string, checkDigit: string): boolean {
  if (!checkDigit || checkDigit === '<') return false;
  return calculateCheckDigit(data) === parseInt(checkDigit);
}

// ─── 날짜 변환 ────────────────────────────────────────────────────
function convertDate(yymmdd: string, isBirthDate = false): string {
  if (!yymmdd || yymmdd.length < 6) return yymmdd;
  const yy = parseInt(yymmdd.substring(0, 2));
  const mm = yymmdd.substring(2, 4);
  const dd = yymmdd.substring(4, 6);
  const yyyy = isBirthDate ? (yy <= 30 ? 2000 + yy : 1900 + yy) : 2000 + yy;
  return `${yyyy}-${mm}-${dd}`;
}

// ─── 이름 파싱 ────────────────────────────────────────────────────
function formatName(rawName: string): { surname: string; givenNames: string } {
  const parts = rawName.split('<<');
  const surname = (parts[0] || '').replace(/</g, ' ').trim();
  const givenNames = (parts[1] || '').replace(/</g, ' ').trim();
  return { surname, givenNames };
}

// ─── OCR 혼동 문자 맵 ─────────────────────────────────────────────
// 체크디짓 실패 시 한 문자 교정을 시도하는 혼동 쌍
const CONFUSION_MAP: Record<string, string[]> = {
  '0': ['O', 'D', 'Q'],
  'O': ['0', 'D'],
  'D': ['0', 'O'],
  '1': ['I', 'L'],
  'I': ['1', 'L'],
  'L': ['1', 'I'],
  '8': ['B'],
  'B': ['8'],
  '5': ['S'],
  'S': ['5'],
  '6': ['G'],
  'G': ['6'],
  '2': ['Z'],
  'Z': ['2'],
  '7': ['T'],
  'T': ['7'],
  '4': ['A'],
  'A': ['4'],
  '<': [' '],
  ' ': ['<'],
};

// ─── 체크디짓 기반 단일 문자 자동 교정 ───────────────────────────
// 체크디짓이 실패할 경우 1문자씩 대안을 시도해 자동 수정
function tryFixWithCheckDigit(data: string, check: string): string {
  if (verifyCheckDigit(data, check)) return data;
  const chars = data.split('');
  for (let i = 0; i < chars.length; i++) {
    const alts = CONFUSION_MAP[chars[i]] ?? [];
    for (const alt of alts) {
      const orig = chars[i];
      chars[i] = alt;
      if (verifyCheckDigit(chars.join(''), check)) return chars.join('');
      chars[i] = orig;
    }
  }
  return data; // 교정 실패 시 원본 반환
}

// ─── 문자 보정 맵 ─────────────────────────────────────────────────
const DIGIT_CORRECTIONS: Record<string, string> = {
  O: '0', D: '0', Q: '0',
  I: '1', L: '1',
  Z: '2',
  S: '5',
  G: '6',
  B: '8',
};

const LETTER_CORRECTIONS: Record<string, string> = {
  '0': 'O', '1': 'I', '8': 'B', '6': 'G', '5': 'S',
};

function correctAtPositions(
  chars: string[],
  positions: number[],
  corrections: Record<string, string>,
): void {
  for (const pos of positions) {
    if (pos < chars.length && chars[pos] in corrections) {
      chars[pos] = corrections[chars[pos]];
    }
  }
}

// ─── 라인 1 정규화: P<KOR + 이름 영역 ────────────────────────────
function normalizeLine1(raw: string): string {
  const chars = raw
    .toUpperCase()
    .replace(/\s/g, '')
    .replace(/[-–—_=]/g, '<')
    .replace(/[^A-Z0-9<]/g, '<')
    .split('');

  // 국가코드 (2-4): 숫자 → 문자
  correctAtPositions(chars, [2, 3, 4], LETTER_CORRECTIONS);
  // 이름 영역 (5-43): 숫자 → 문자
  const namePositions = Array.from({ length: 39 }, (_, i) => i + 5);
  correctAtPositions(chars, namePositions, LETTER_CORRECTIONS);

  return chars.join('').substring(0, 44).padEnd(44, '<');
}

// ─── 라인 2 정규화 + 체크디짓 교정 ──────────────────────────────
function normalizeLine2(raw: string): string {
  const chars = raw
    .toUpperCase()
    .replace(/\s/g, '')
    .replace(/[-–—_=]/g, '<')
    .replace(/[^A-Z0-9<]/g, '<')
    .split('');

  // 숫자여야 할 자리 교정
  const numericPositions = [
    1, 2, 3, 4, 5, 6, 7, 8, 9,
    13, 14, 15, 16, 17, 18, 19,
    21, 22, 23, 24, 25, 26, 27,
    42, 43,
  ];
  for (let i = 28; i <= 41; i++) numericPositions.push(i);
  correctAtPositions(chars, numericPositions, DIGIT_CORRECTIONS);

  // 국적 코드 (10-12): 문자여야 함
  correctAtPositions(chars, [10, 11, 12], LETTER_CORRECTIONS);

  // 성별 (20): 0→O 교정
  if (chars[20] === '0') chars[20] = 'O';

  const normalized = chars.join('').substring(0, 44).padEnd(44, '<');

  // ── 체크디짓 기반 자동 교정 ────────────────────────────────────
  // 여권번호 (0-8) + 체크 (9)
  const pnRaw = normalized.substring(0, 9);
  const pnCheck = normalized[9];
  const pnFixed = tryFixWithCheckDigit(pnRaw, pnCheck);

  // 생년월일 (13-18) + 체크 (19)
  const dobRaw = normalized.substring(13, 19);
  const dobCheck = normalized[19];
  const dobFixed = tryFixWithCheckDigit(dobRaw, dobCheck);

  // 만료일 (21-26) + 체크 (27)
  const expRaw = normalized.substring(21, 27);
  const expCheck = normalized[27];
  const expFixed = tryFixWithCheckDigit(expRaw, expCheck);

  // 교정된 필드로 라인2 재조립
  const result = (
    pnFixed +
    normalized[9] +
    normalized.substring(10, 13) +
    dobFixed +
    normalized[19] +
    normalized[20] +
    expFixed +
    normalized[27] +
    normalized.substring(28, 44)
  );

  return result.substring(0, 44).padEnd(44, '<');
}

// ─── MRZ 라인 추출 ────────────────────────────────────────────────
export function extractMrzLines(text: string): MrzLine | null {
  const cleaned = text.replace(/\t/g, ' ');

  // ── 전략 1: 줄 단위 탐색 ──────────────────────────────────────
  const rawLines = cleaned.split(/[\n\r]+/);
  const candidates: string[] = [];
  for (const line of rawLines) {
    const stripped = line.replace(/\s/g, '').toUpperCase().replace(/[^A-Z0-9<\-_=]/g, '<');
    if (stripped.length >= 38) candidates.push(stripped);
  }

  for (let i = 0; i < candidates.length; i++) {
    if (candidates[i].startsWith('P')) {
      for (let j = i + 1; j < Math.min(candidates.length, i + 4); j++) {
        if (candidates[j].length >= 38) {
          const line1 = normalizeLine1(candidates[i]);
          const line2 = normalizeLine2(candidates[j]);
          if (isValidLine2(line2)) return { line1, line2 };
        }
      }
    }
  }

  // ── 전략 2: 전체 concat + 정규식 ──────────────────────────────
  const fullText = cleaned
    .replace(/[\n\r]/g, ' ')
    .toUpperCase()
    .replace(/[^A-Z0-9<\s\-_=]/g, ' ')
    .replace(/[-_=]/g, '<');
  const noSpace = fullText.replace(/\s+/g, ' ').trim();

  const line1Regex = /P[A-Z<][A-Z]{3}[A-Z0-9< ]{35,}/;
  const m1 = line1Regex.exec(noSpace);
  if (m1) {
    const rawLine1 = m1[0].replace(/\s/g, '').substring(0, 44);
    const afterLine1 = noSpace.substring(m1.index + m1[0].length);
    const m2 = /[A-Z0-9<][A-Z0-9< ]{40,}/.exec(afterLine1.substring(0, 200));
    if (m2) {
      const rawLine2 = m2[0].replace(/\s/g, '').substring(0, 44);
      const line1 = normalizeLine1(rawLine1);
      const line2 = normalizeLine2(rawLine2);
      if (isValidLine2(line2)) return { line1, line2 };
    }
  }

  // ── 전략 3: 공백 완전 제거 후 P…88자 패턴 ─────────────────────
  const allChars = cleaned.replace(/[^A-Z0-9<Pp\-_=]/g, '').toUpperCase();
  for (let i = 0; i < allChars.length - 87; i++) {
    if (allChars[i] === 'P') {
      const rawLine1 = allChars.substring(i, i + 44);
      const rawLine2 = allChars.substring(i + 44, i + 88);
      if (rawLine1.length >= 40 && rawLine2.length >= 40) {
        const line1 = normalizeLine1(rawLine1);
        const line2 = normalizeLine2(rawLine2);
        if (isValidLine2(line2)) return { line1, line2 };
      }
    }
  }

  // ── 전략 4: 완화된 검사 (국적코드 형식만 확인) ────────────────
  for (let i = 0; i < allChars.length - 80; i++) {
    if (allChars[i] === 'P') {
      const rawLine1 = allChars.substring(i, i + 44);
      const rawLine2 = allChars.substring(i + 44, i + 88);
      if (rawLine1.length >= 38 && rawLine2.length >= 38) {
        const line1 = normalizeLine1(rawLine1);
        const line2 = normalizeLine2(rawLine2);
        const nationality = line2.substring(10, 13);
        if (/^[A-Z]{3}$/.test(nationality)) return { line1, line2 };
      }
    }
  }

  return null;
}

function isValidLine2(line2: string): boolean {
  if (line2.length < 43) return false;
  const nationality = line2.substring(10, 13);
  if (!/^[A-Z]{3}$/.test(nationality)) return false;
  const sex = line2[20];
  if (sex !== 'M' && sex !== 'F' && sex !== '<') return false;
  const dob = line2.substring(13, 19);
  if (!/^\d{6}$/.test(dob)) return false;
  return true;
}

// ─── MRZ 파싱 ─────────────────────────────────────────────────────
export function parseMrz(mrzLines: MrzLine): PassportData | null {
  const { line1, line2 } = mrzLines;

  const type = line1.substring(0, 1);
  const countryCode = line1.substring(2, 5);
  const nameField = line1.substring(5, 44);
  const { surname, givenNames } = formatName(nameField);

  const passportNumber = line2.substring(0, 9).replace(/</g, '');
  const passportCheck = line2.substring(9, 10);
  const nationality = line2.substring(10, 13);
  const birthDate = line2.substring(13, 19);
  const birthCheck = line2.substring(19, 20);
  const sex = line2.substring(20, 21);
  const expiryDate = line2.substring(21, 27);
  const expiryCheck = line2.substring(27, 28);
  const personalNumber = line2.substring(28, 42).replace(/</g, '');
  const overallCheck = line2.substring(43, 44);

  const passportOk = verifyCheckDigit(line2.substring(0, 9), passportCheck);
  const birthOk = verifyCheckDigit(birthDate, birthCheck);
  const expiryOk = verifyCheckDigit(expiryDate, expiryCheck);
  const isValid = passportOk && birthOk && expiryOk;

  if (!passportNumber || passportNumber.length < 5) return null;

  return {
    type,
    countryCode,
    surname,
    givenNames,
    passportNumber,
    nationality,
    dateOfBirth: convertDate(birthDate, true),
    sex: sex === 'M' ? '남성' : sex === 'F' ? '여성' : sex,
    expiryDate: convertDate(expiryDate, false),
    personalNumber,
    isValid,
    rawMrz: [line1, line2],
    checkDigitStatus: { passportOk, birthOk, expiryOk, overallCheck },
  };
}

// ─── 메인 함수 ────────────────────────────────────────────────────
export function extractPassportData(ocrText: string): OcrResult {
  const startTime = Date.now();
  try {
    const mrzLines = extractMrzLines(ocrText);
    if (!mrzLines) {
      return {
        success: false,
        error:
          'MRZ 영역을 찾을 수 없습니다.\n\n' +
          '• 여권 하단 기계판독영역(MRZ) 두 줄이 모두 보여야 합니다\n' +
          '• 이미지가 너무 어둡거나 흐리지 않은지 확인하세요\n' +
          '• 여권 전체(특히 하단부)가 잘리지 않았는지 확인하세요',
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }

    const passportData = parseMrz(mrzLines);
    if (!passportData) {
      return {
        success: false,
        error: 'MRZ 데이터 파싱에 실패했습니다. 더 선명한 이미지로 다시 시도해주세요.',
        confidence: 0,
        processingTime: Date.now() - startTime,
      };
    }

    const confidence = passportData.isValid
      ? 95
      : passportData.surname && passportData.passportNumber
      ? 65
      : 40;

    return {
      success: true,
      data: passportData,
      confidence,
      processingTime: Date.now() - startTime,
    };
  } catch (error) {
    return {
      success: false,
      error: `OCR 처리 중 오류: ${error instanceof Error ? error.message : '알 수 없는 오류'}`,
      confidence: 0,
      processingTime: Date.now() - startTime,
    };
  }
}

// ─── 유틸리티 ─────────────────────────────────────────────────────
export function getSexDisplay(sex: string): string {
  switch (sex.toUpperCase()) {
    case 'M': return '남성';
    case 'F': return '여성';
    default: return sex;
  }
}

export function getCountryName(code: string): string {
  const countries: Record<string, string> = {
    KOR: '대한민국', USA: '미국', JPN: '일본', CHN: '중국',
    VNM: '베트남', THA: '태국', PHL: '필리핀', SGP: '싱가포르',
    GBR: '영국', DEU: '독일', FRA: '프랑스', AUS: '호주',
    CAN: '캐나다', IND: '인도', IDN: '인도네시아', MYS: '말레이시아',
    HKG: '홍콩', TWN: '대만', NZL: '뉴질랜드', RUS: '러시아',
  };
  return countries[code] || code;
}
