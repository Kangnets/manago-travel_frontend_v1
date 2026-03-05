'use client';

import { useState, useRef, useCallback } from 'react';
import { PassportData, OcrResult } from '@/types/passport';
import { extractPassportData, getCountryName } from '@/lib/passportOcr';
import { runTesseractOcr, preparePassportImages, OcrAttempt } from '@/lib/tesseractWorker';

// ─── 정부 API 결과 타입 ───────────────────────────────────────────
interface TravelAlarmResult {
  country_nm: string;
  country_eng_nm: string;
  alarm_lvl: string | null;
  alarm_label: string | null;
  alarm_desc: string | null;
  alarm_color: string | null;
  flag_url: string | null;
  written_dt: string | null;
  found: boolean;
}

interface PassportVerifyResult {
  verified: boolean | null;
  message: string;
  apiAvailable: boolean;
}

interface GovCheckState {
  loading: boolean;
  travelAlarm: TravelAlarmResult | null;
  travelAlarmError: string | null;
  verify: PassportVerifyResult | null;
  verifyLoading: boolean;
}

interface PassportOCRProps {
  onComplete?: (data: PassportData) => void;
}

// ─── 수동 편집 폼 ─────────────────────────────────────────────────
interface EditForm {
  surname: string;
  givenNames: string;
  passportNumber: string;
  nationality: string;
  dateOfBirth: string;
  sex: string;
  expiryDate: string;
  personalNumber: string;
}

function dataToForm(d: PassportData): EditForm {
  return {
    surname: d.surname,
    givenNames: d.givenNames,
    passportNumber: d.passportNumber,
    nationality: d.nationality,
    dateOfBirth: d.dateOfBirth,
    sex: d.sex === '남성' ? 'M' : d.sex === '여성' ? 'F' : d.sex,
    expiryDate: d.expiryDate,
    personalNumber: d.personalNumber,
  };
}

// ─── 컴포넌트 ─────────────────────────────────────────────────────
export default function PassportOCR({ onComplete }: PassportOCRProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressPct, setProgressPct] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');
  const [attemptLog, setAttemptLog] = useState<string[]>([]);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [rawOcrText, setRawOcrText] = useState('');
  const [showRaw, setShowRaw] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [govCheck, setGovCheck] = useState<GovCheckState>({
    loading: false,
    travelAlarm: null,
    travelAlarmError: null,
    verify: null,
    verifyLoading: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const pickFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB 이하여야 합니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string);
      setResult(null);
      setRawOcrText('');
      setEditMode(false);
      setEditForm(null);
      setAttemptLog([]);
      setGovCheck({ loading: false, travelAlarm: null, travelAlarmError: null, verify: null, verifyLoading: false });
    };
    reader.readAsDataURL(file);
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) pickFile(file);
    },
    [pickFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      const file = e.dataTransfer.files?.[0];
      if (file) pickFile(file);
    },
    [pickFile],
  );

  const processOcr = useCallback(async () => {
    if (!selectedImage) return;
    setIsProcessing(true);
    setProgressPct(0);
    setProgressLabel('이미지 전처리 중...');
    setResult(null);
    setRawOcrText('');
    setAttemptLog([]);
    setEditMode(false);

    try {
      // ── 전처리 이미지 생성 (Otsu, Unsharp, Wide 등) ──────────
      setProgressLabel('이미지 전처리 중 (Otsu 이진화)...');
      const imgs = await preparePassportImages(selectedImage);

      // ── 시도 전략 (총 6가지) ──────────────────────────────────
      // PSM 6: 균일 텍스트 블록 / PSM 11: 희소 텍스트 / PSM 13: raw 라인
      const attempts: OcrAttempt[] = [
        { image: imgs.mrzOtsu,    label: '① MRZ 크롭 + Otsu (PSM 6)',       psm: '6'  },
        { image: imgs.mrzOtsu,    label: '② MRZ 크롭 + Otsu (PSM 11)',      psm: '11' },
        { image: imgs.mrzSharp,   label: '③ MRZ 크롭 + Unsharp (PSM 6)',    psm: '6'  },
        { image: imgs.mrzWide,    label: '④ MRZ 광역 크롭 + Otsu (PSM 6)', psm: '6'  },
        { image: imgs.mrzOtsuInv, label: '⑤ MRZ 반전 + Otsu (PSM 11)',     psm: '11' },
        { image: imgs.fullOtsu,   label: '⑥ 전체 이미지 + Otsu (PSM 6)',   psm: '6'  },
      ];

      let bestText = '';
      let bestResult: OcrResult | null = null;
      const log: string[] = [];

      for (let i = 0; i < attempts.length; i++) {
        const atm = attempts[i];
        setProgressLabel(atm.label);
        setProgressPct(0);

        const { text, confidence } = await runTesseractOcr(atm, (pct, lbl) => {
          setProgressPct(pct);
          setProgressLabel(lbl);
        });

        const ocrResult = extractPassportData(text);
        const status = ocrResult.success
          ? `✅ 성공 (신뢰도 ${ocrResult.confidence}%, Tesseract ${confidence.toFixed(0)}%)`
          : `❌ 실패`;
        log.push(`${atm.label}: ${status}`);
        setAttemptLog([...log]);

        if (i === 0) bestText = text;

        if (ocrResult.success && ocrResult.data) {
          bestResult = ocrResult;
          bestText = text;
          // 체크디짓 모두 통과하면 즉시 종료
          if (ocrResult.data.isValid) break;
          // 부분 성공이면 더 좋은 결과를 위해 계속 시도
          if (!bestResult.data?.isValid) bestResult = ocrResult;
        } else if (i === attempts.length - 1 && !bestResult) {
          bestResult = ocrResult;
        }
      }

      setRawOcrText(bestText);
      setResult(bestResult);

      if (bestResult?.success && bestResult.data) {
        setEditForm(dataToForm(bestResult.data));
        if (onComplete) onComplete(bestResult.data);
        // 여행경보 자동 조회
        checkTravelAlarm(bestResult.data.nationality);
      }
    } catch (err) {
      setResult({
        success: false,
        error: `오류 발생: ${err instanceof Error ? err.message : String(err)}`,
        confidence: 0,
        processingTime: 0,
      });
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImage, onComplete]);

  const reset = useCallback(() => {
    setSelectedImage(null);
    setResult(null);
    setRawOcrText('');
    setProgressPct(0);
    setEditMode(false);
    setEditForm(null);
    setAttemptLog([]);
    setGovCheck({ loading: false, travelAlarm: null, travelAlarmError: null, verify: null, verifyLoading: false });
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  // ── 정부 API: 여행경보 조회 ────────────────────────────────────
  const checkTravelAlarm = useCallback(async (nationality: string) => {
    setGovCheck((prev) => ({ ...prev, loading: true, travelAlarmError: null }));
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const res = await fetch(
        `${apiBase}/passport-check/travel-alarm?nationality=${encodeURIComponent(nationality)}`,
      );
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message ?? `HTTP ${res.status}`);
      }
      const data: TravelAlarmResult = await res.json();
      setGovCheck((prev) => ({ ...prev, loading: false, travelAlarm: data }));
    } catch (err) {
      setGovCheck((prev) => ({
        ...prev,
        loading: false,
        travelAlarmError: err instanceof Error ? err.message : '여행경보 조회 실패',
      }));
    }
  }, []);

  // ── 정부 API: 여권 진위확인 ────────────────────────────────────
  const verifyPassport = useCallback(async (data: PassportData) => {
    setGovCheck((prev) => ({ ...prev, verifyLoading: true, verify: null }));
    try {
      const apiBase2 = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
      const res = await fetch(`${apiBase2}/passport-check/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          passportNumber: data.passportNumber,
          surname: data.surname,
          givenNames: data.givenNames,
          dateOfBirth: data.dateOfBirth,
        }),
      });
      const verifyData: PassportVerifyResult = await res.json();
      setGovCheck((prev) => ({ ...prev, verifyLoading: false, verify: verifyData }));
    } catch (err) {
      setGovCheck((prev) => ({
        ...prev,
        verifyLoading: false,
        verify: {
          verified: null,
          message: err instanceof Error ? err.message : '연결 실패',
          apiAvailable: false,
        },
      }));
    }
  }, []);

  const applyEdits = useCallback(() => {
    if (!editForm || !result?.data) return;
    const updated: PassportData = {
      ...result.data,
      surname: editForm.surname.toUpperCase(),
      givenNames: editForm.givenNames.toUpperCase(),
      passportNumber: editForm.passportNumber.toUpperCase(),
      nationality: editForm.nationality.toUpperCase(),
      dateOfBirth: editForm.dateOfBirth,
      sex: editForm.sex === 'M' ? '남성' : editForm.sex === 'F' ? '여성' : editForm.sex,
      expiryDate: editForm.expiryDate,
      personalNumber: editForm.personalNumber,
    };
    const newResult = { ...result, data: updated };
    setResult(newResult);
    setEditMode(false);
    if (onComplete) onComplete(updated);
  }, [editForm, result, onComplete]);

  return (
    <div className="w-full">
      {/* 업로드 영역 */}
      {!selectedImage && (
        <div
          className="border-2 border-dashed border-orange-300 rounded-xl p-8 text-center bg-orange-50 hover:bg-orange-100 transition-colors cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
          <div className="w-14 h-14 bg-orange-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <svg className="w-7 h-7 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm font-semibold text-gray-700 mb-1">여권 이미지를 업로드하세요</p>
          <p className="text-xs text-gray-500">클릭 또는 드래그 • JPG, PNG, HEIC (최대 10MB)</p>
        </div>
      )}

      {selectedImage && (
        <div className="space-y-3">
          {/* 미리보기 */}
          <div className="relative rounded-xl overflow-hidden bg-gray-100">
            <img src={selectedImage} alt="여권 이미지" className="w-full max-h-64 object-contain" />
            {!isProcessing && (
              <button
                onClick={reset}
                className="absolute top-2 right-2 bg-white/90 hover:bg-white text-gray-700 px-2.5 py-1 rounded-lg text-xs shadow font-medium"
              >
                다시 선택
              </button>
            )}
          </div>

          {/* 인식 시작 버튼 */}
          {!isProcessing && !result && (
            <button
              onClick={processOcr}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              여권 자동 인식 (Otsu 6단계)
            </button>
          )}

          {/* 진행 상태 */}
          {isProcessing && (
            <div className="bg-white rounded-xl p-4 border border-gray-200 space-y-3">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-orange-500 border-t-transparent flex-shrink-0" />
                <span className="text-sm text-gray-700 font-medium">{progressLabel}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div
                  className="bg-orange-500 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              {attemptLog.length > 0 && (
                <div className="text-xs text-gray-500 space-y-0.5 max-h-28 overflow-y-auto">
                  {attemptLog.map((log, i) => (
                    <div key={i}>{log}</div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* 시도 로그 (처리 완료 후) */}
          {!isProcessing && result && attemptLog.length > 0 && (
            <details className="bg-gray-50 border border-gray-200 rounded-xl">
              <summary className="px-4 py-2 text-xs text-gray-500 cursor-pointer select-none">
                OCR 시도 로그 ({attemptLog.length}회)
              </summary>
              <div className="px-4 pb-3 text-xs text-gray-600 space-y-0.5">
                {attemptLog.map((log, i) => <div key={i}>{log}</div>)}
              </div>
            </details>
          )}

          {/* 결과 */}
          {result && !isProcessing && (
            <div className="space-y-3">
              {result.success && result.data ? (
                <>
                  {/* 결과 헤더 */}
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className={`px-4 py-3 flex items-center justify-between text-white ${result.data.isValid ? 'bg-green-500' : 'bg-amber-500'}`}>
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-semibold text-sm">
                          {result.data.isValid ? '인식 완료 — MRZ 체크디짓 전부 통과 ✓' : '인식 완료 — 체크디짓 일부 불일치'}
                        </span>
                      </div>
                      <span className="text-xs opacity-90 whitespace-nowrap">신뢰도 {result.confidence}%</span>
                    </div>

                    {/* 체크디짓 상태 */}
                    {result.data.checkDigitStatus && (
                      <div className="flex gap-2 px-4 py-2 bg-gray-50 border-b border-gray-100 text-xs">
                        <CheckBadge label="여권번호" ok={result.data.checkDigitStatus.passportOk} />
                        <CheckBadge label="생년월일" ok={result.data.checkDigitStatus.birthOk} />
                        <CheckBadge label="만료일" ok={result.data.checkDigitStatus.expiryOk} />
                      </div>
                    )}

                    {/* 인식 결과 또는 편집 폼 */}
                    {!editMode ? (
                      <div className="p-4 grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
                        <InfoRow label="성 (영문)" value={result.data.surname} bold />
                        <InfoRow label="이름 (영문)" value={result.data.givenNames} bold />
                        <InfoRow label="여권번호" value={result.data.passportNumber} highlight />
                        <InfoRow label="국적" value={`${getCountryName(result.data.nationality)} (${result.data.nationality})`} />
                        <InfoRow label="생년월일" value={result.data.dateOfBirth} />
                        <InfoRow label="성별" value={result.data.sex} />
                        <InfoRow
                          label="만료일"
                          value={result.data.expiryDate}
                          warn={!!result.data.expiryDate && new Date(result.data.expiryDate) < new Date(Date.now() + 180 * 86400000)}
                        />
                        <InfoRow label="발행국" value={getCountryName(result.data.countryCode)} />
                        {result.data.personalNumber && (
                          <InfoRow label="개인번호" value={result.data.personalNumber} />
                        )}
                      </div>
                    ) : (
                      /* 수동 편집 폼 */
                      editForm && (
                        <div className="p-4 space-y-3">
                          <p className="text-xs text-amber-600 font-medium">✏️ 잘못 인식된 필드를 직접 수정하세요</p>
                          <div className="grid grid-cols-2 gap-3">
                            <EditField label="성 (영문)" value={editForm.surname} onChange={(v) => setEditForm({ ...editForm, surname: v })} placeholder="HONG" />
                            <EditField label="이름 (영문)" value={editForm.givenNames} onChange={(v) => setEditForm({ ...editForm, givenNames: v })} placeholder="GILDONG" />
                            <EditField label="여권번호" value={editForm.passportNumber} onChange={(v) => setEditForm({ ...editForm, passportNumber: v })} placeholder="M12345678" />
                            <EditField label="국적 코드" value={editForm.nationality} onChange={(v) => setEditForm({ ...editForm, nationality: v })} placeholder="KOR" />
                            <EditField label="생년월일" value={editForm.dateOfBirth} onChange={(v) => setEditForm({ ...editForm, dateOfBirth: v })} placeholder="1990-01-01" type="date" />
                            <div>
                              <label className="text-xs text-gray-500 block mb-1">성별</label>
                              <select
                                value={editForm.sex}
                                onChange={(e) => setEditForm({ ...editForm, sex: e.target.value })}
                                className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm"
                              >
                                <option value="M">남성 (M)</option>
                                <option value="F">여성 (F)</option>
                              </select>
                            </div>
                            <EditField label="만료일" value={editForm.expiryDate} onChange={(v) => setEditForm({ ...editForm, expiryDate: v })} placeholder="2030-01-01" type="date" />
                            <EditField label="개인번호" value={editForm.personalNumber} onChange={(v) => setEditForm({ ...editForm, personalNumber: v })} placeholder="" />
                          </div>
                        </div>
                      )
                    )}

                    {/* 만료/체크섬 경고 */}
                    {!result.data.isValid && !editMode && (
                      <div className="mx-4 mb-3 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700">
                        ⚠ 체크디짓이 일치하지 않는 필드가 있습니다. 아래 <strong>직접 수정</strong> 버튼으로 교정하세요.
                      </div>
                    )}
                    {result.data.expiryDate && new Date(result.data.expiryDate) < new Date() && (
                      <div className="mx-4 mb-3 bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-700 font-semibold">
                        🚫 이 여권은 이미 만료되었습니다!
                      </div>
                    )}

                    {/* 하단 버튼 */}
                    <div className="bg-gray-50 px-4 py-3 flex items-center justify-between flex-wrap gap-2">
                      <button onClick={() => setShowRaw((v) => !v)} className="text-xs text-gray-500 hover:text-gray-700 underline">
                        {showRaw ? 'OCR 원본 숨기기' : 'OCR 원본 보기'}
                      </button>
                      <div className="flex gap-2">
                        <button onClick={reset} className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg font-medium">
                          다시 스캔
                        </button>
                        {!editMode ? (
                          <button
                            onClick={() => setEditMode(true)}
                            className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs rounded-lg font-medium border border-amber-300"
                          >
                            ✏️ 직접 수정
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditMode(false)}
                              className="px-3 py-1.5 bg-gray-200 hover:bg-gray-300 text-gray-700 text-xs rounded-lg font-medium"
                            >
                              취소
                            </button>
                            <button
                              onClick={applyEdits}
                              className="px-3 py-1.5 bg-green-500 hover:bg-green-600 text-white text-xs rounded-lg font-medium"
                            >
                              저장
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            if (result.data) navigator.clipboard.writeText(JSON.stringify(result.data, null, 2));
                          }}
                          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg font-medium"
                        >
                          정보 복사
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* MRZ 원본 표시 */}
                  {result.data.rawMrz?.length > 0 && (
                    <div className="bg-gray-900 rounded-xl p-4 font-mono text-xs overflow-x-auto">
                      <p className="text-gray-500 mb-2 text-[10px] uppercase tracking-wide">MRZ 라인</p>
                      {result.data.rawMrz.map((line, i) => (
                        <div key={i} className="text-green-400 tracking-widest break-all">{line}</div>
                      ))}
                    </div>
                  )}

                  {/* ── 정부 API 검증 패널 ─────────────────────── */}
                  <GovCheckPanel
                    passportData={result.data}
                    govCheck={govCheck}
                    onRetryAlarm={() => checkTravelAlarm(result.data!.nationality)}
                    onVerify={() => verifyPassport(result.data!)}
                  />
                </>
              ) : (
                /* 인식 실패 */
                <div className="bg-white rounded-xl border border-red-200 overflow-hidden">
                  <div className="bg-red-500 text-white px-4 py-3 flex items-center gap-2">
                    <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="font-semibold text-sm">인식 실패</span>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{result.error}</p>
                    <div className="mt-3 flex justify-between items-center">
                      <button onClick={() => setShowRaw((v) => !v)} className="text-xs text-gray-500 underline">
                        {showRaw ? 'OCR 원본 숨기기' : 'OCR 원본 확인 (디버그)'}
                      </button>
                      <button onClick={reset} className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs rounded-lg font-semibold">
                        다시 시도
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {showRaw && rawOcrText && (
                <div className="bg-gray-900 text-green-400 rounded-xl p-4 font-mono text-xs overflow-x-auto max-h-48 overflow-y-auto">
                  <p className="text-gray-500 mb-2 text-[10px] uppercase tracking-wide">OCR 원본 출력</p>
                  <pre className="whitespace-pre-wrap break-all">{rawOcrText}</pre>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 가이드 */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-xl p-4">
        <p className="text-xs font-bold text-blue-800 mb-2">📋 촬영 가이드</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• 여권 신원정보면(사진면) 전체가 보이도록 촬영</li>
          <li>• 하단 MRZ 두 줄 (P{'<'} 로 시작)이 반드시 포함되어야 합니다</li>
          <li>• 빛 반사·그림자 없이 평평하게, 선명하게 촬영</li>
          <li>• 인식 후 잘못된 필드는 <strong>직접 수정</strong> 버튼으로 교정 가능</li>
        </ul>
      </div>
    </div>
  );
}

// ─── 서브 컴포넌트 ─────────────────────────────────────────────────

function InfoRow({
  label, value, bold, highlight, warn,
}: {
  label: string;
  value: string;
  bold?: boolean;
  highlight?: boolean;
  warn?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className="text-gray-500">{label}</span>
      <span className={`font-medium ${highlight ? 'text-orange-600 font-bold' : warn ? 'text-red-600 font-semibold' : bold ? 'text-gray-900 font-semibold' : 'text-gray-800'}`}>
        {value || '-'}
      </span>
    </div>
  );
}

function CheckBadge({ label, ok }: { label: string; ok: boolean }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium ${ok ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
      {ok ? '✓' : '✗'} {label}
    </span>
  );
}

function EditField({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div>
      <label className="text-xs text-gray-500 block mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border border-gray-300 rounded-lg px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
      />
    </div>
  );
}

// ─── 정부 API 검증 패널 ───────────────────────────────────────────
const ALARM_COLOR: Record<string, string> = {
  green:   'bg-green-50 border-green-200 text-green-800',
  yellow:  'bg-yellow-50 border-yellow-300 text-yellow-800',
  orange:  'bg-orange-50 border-orange-300 text-orange-800',
  red:     'bg-red-50 border-red-300 text-red-800',
  darkred: 'bg-red-100 border-red-500 text-red-900',
};
const ALARM_ICON: Record<string, string> = {
  green: '✅', yellow: '⚠️', orange: '🔶', red: '🚨', darkred: '🚫',
};

function GovCheckPanel({
  passportData,
  govCheck,
  onRetryAlarm,
  onVerify,
}: {
  passportData: PassportData;
  govCheck: GovCheckState;
  onRetryAlarm: () => void;
  onVerify: () => void;
}) {
  const alarm = govCheck.travelAlarm;
  const alarmColor = alarm?.alarm_color ?? 'green';
  const colorCls = ALARM_COLOR[alarmColor] ?? ALARM_COLOR.green;
  const icon = ALARM_ICON[alarmColor] ?? '✅';

  return (
    <div className="border border-blue-200 rounded-xl overflow-hidden">
      {/* 헤더 */}
      <div className="bg-blue-600 text-white px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-semibold">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          정부 API 연동 검증
        </div>
        <span className="text-xs opacity-80">data.go.kr · 외교부</span>
      </div>

      <div className="p-4 space-y-3 bg-white">
        {/* ── 1. 여행경보 ──────────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1.5">
            🌍 국가·지역별 여행경보 ({passportData.nationality})
          </p>

          {govCheck.loading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-400 border-t-transparent" />
              외교부 여행경보 조회 중...
            </div>
          )}

          {!govCheck.loading && govCheck.travelAlarmError && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-600 flex items-center justify-between">
              <span>⚠ {govCheck.travelAlarmError}</span>
              <button onClick={onRetryAlarm} className="ml-2 text-blue-500 underline whitespace-nowrap">
                재시도
              </button>
            </div>
          )}

          {!govCheck.loading && alarm && (
            <div className={`border rounded-lg px-3 py-2 text-xs flex items-start gap-2 ${colorCls}`}>
              <span className="text-base leading-none mt-0.5">{icon}</span>
              <div>
                <div className="font-semibold">
                  {alarm.found
                    ? `${alarm.country_nm} (${alarm.country_eng_nm}) — ${alarm.alarm_label}`
                    : `${passportData.nationality} — 여행경보 없음`}
                </div>
                {alarm.alarm_desc && <div className="opacity-80 mt-0.5">{alarm.alarm_desc}</div>}
                {alarm.written_dt && <div className="opacity-60 mt-0.5">기준일: {alarm.written_dt}</div>}
              </div>
            </div>
          )}
        </div>

        {/* ── 2. 여권 진위확인 ─────────────────────────────── */}
        <div>
          <p className="text-xs font-semibold text-gray-600 mb-1.5">
            🔐 여권 진위확인 (외교부 공식 API)
          </p>

          {!govCheck.verify && !govCheck.verifyLoading && (
            <button
              onClick={onVerify}
              className="w-full border border-blue-300 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-medium py-2 rounded-lg transition-colors"
            >
              여권번호 + 성명 진위확인 요청
            </button>
          )}

          {govCheck.verifyLoading && (
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-blue-400 border-t-transparent" />
              외교부 진위확인 API 조회 중...
            </div>
          )}

          {govCheck.verify && (
            <div className={`border rounded-lg px-3 py-2 text-xs ${
              govCheck.verify.verified === true  ? 'bg-green-50 border-green-200 text-green-800' :
              govCheck.verify.verified === false ? 'bg-red-50 border-red-200 text-red-800' :
              'bg-gray-50 border-gray-200 text-gray-700'
            }`}>
              <div className="font-semibold mb-0.5">
                {govCheck.verify.verified === true  ? '✅ 진위 확인됨' :
                 govCheck.verify.verified === false ? '❌ 정보 불일치' :
                 '⚙ API 키 설정 필요'}
              </div>
              <p className="whitespace-pre-line opacity-90">{govCheck.verify.message}</p>
              {!govCheck.verify.apiAvailable && (
                <a
                  href="https://www.data.go.kr/tcs/dss/selectApiDataDetailView.do?publicDataPk=15076237"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-blue-600 underline"
                >
                  → data.go.kr 신청 바로가기
                </a>
              )}
            </div>
          )}
        </div>

        {/* ── API 키 설정 안내 ─────────────────────────────── */}
        {(govCheck.travelAlarmError?.includes('DATA_GO_KR_API_KEY') || govCheck.travelAlarmError?.includes('설정되지 않았습니다')) && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-800">
            <p className="font-semibold mb-1">⚙ data.go.kr API 키 설정 방법</p>
            <ol className="space-y-0.5 list-decimal list-inside">
              <li><a href="https://www.data.go.kr" target="_blank" rel="noopener noreferrer" className="underline">data.go.kr</a> 회원가입 후 로그인</li>
              <li>[외교부_국가·지역별 여행경보] 활용 신청 (자동 승인)</li>
              <li>발급된 인증키를 백엔드 <code>.env</code>의 <code>DATA_GO_KR_API_KEY</code>에 입력</li>
              <li>백엔드 서버 재시작</li>
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
