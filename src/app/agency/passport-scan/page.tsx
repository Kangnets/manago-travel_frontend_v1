'use client';

import { useState, useCallback, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line,
} from 'recharts';
import PassportOCR from '@/components/PassportOCR/PassportOCR';
import { PassportData } from '@/types/passport';
import { getCountryName } from '@/lib/passportOcr';
import {
  IdentificationIcon,
  TrashIcon,
  ArrowDownTrayIcon,
  ClipboardDocumentIcon,
  PlusCircleIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  UserGroupIcon,
  DocumentMagnifyingGlassIcon,
  InformationCircleIcon,
  ChartBarIcon,
} from '@heroicons/react/24/outline';

interface ScannedRecord extends PassportData {
  scannedAt: string;
  id: string;
}

let idCounter = 1;

// ─── 발급현황 타입 ─────────────────────────────────────────────────
interface IssuanceItem { year: string; month?: string; issuanceCount: number; }
interface IssuanceResult { items: IssuanceItem[]; totalCount: number; year: string; isMock: boolean; }

// ─── 발급현황 훅 ───────────────────────────────────────────────────
function usePassportIssuance(year: string) {
  const [data, setData] = useState<IssuanceResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    fetch(`${apiBase}/passport-check/issuance?year=${year}`)
      .then((r) => r.json())
      .then((d: IssuanceResult) => setData(d))
      .catch((e) => setError(e instanceof Error ? e.message : '조회 실패'))
      .finally(() => setLoading(false));
  }, [year]);

  return { data, loading, error };
}

export default function PassportScanPage() {
  const [scanned, setScanned] = useState<ScannedRecord[]>([]);
  const [showScanner, setShowScanner] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [issuanceYear, setIssuanceYear] = useState(String(new Date().getFullYear()));
  const { data: issuanceData, loading: issuanceLoading, error: issuanceError } = usePassportIssuance(issuanceYear);

  const showToast = (type: 'success' | 'error', msg: string) => {
    setToast({ type, msg });
    setTimeout(() => setToast(null), 3000);
  };

  const handleScanned = useCallback((data: PassportData) => {
    const record: ScannedRecord = {
      ...data,
      id: String(idCounter++),
      scannedAt: new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    };
    setScanned((prev) => [record, ...prev]);
    setShowScanner(false);
    showToast('success', `여권 스캔 완료: ${data.surname} ${data.givenNames}`);
  }, []);

  const deleteRecord = (id: string) => {
    setScanned((prev) => prev.filter((r) => r.id !== id));
    setSelected((prev) => { const s = new Set(prev); s.delete(id); return s; });
  };

  const clearAll = () => {
    setScanned([]);
    setSelected(new Set());
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const s = new Set(prev);
      s.has(id) ? s.delete(id) : s.add(id);
      return s;
    });
  };

  const toggleSelectAll = () => {
    if (selected.size === scanned.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(scanned.map((r) => r.id)));
    }
  };

  const copySelected = () => {
    const targets = scanned.filter((r) => selected.has(r.id));
    const text = targets
      .map((r) => `${r.surname} ${r.givenNames} | ${r.passportNumber} | ${r.dateOfBirth} | ${r.expiryDate}`)
      .join('\n');
    navigator.clipboard.writeText(text);
    showToast('success', `${targets.length}건이 클립보드에 복사되었습니다`);
  };

  const exportExcel = () => {
    const rows = scanned.map((r, i) => ({
      NO: i + 1,
      성: r.surname,
      이름: r.givenNames,
      '한글 이름': r.koreanName || '',
      여권번호: r.passportNumber,
      국적: getCountryName(r.nationality),
      생년월일: r.dateOfBirth,
      성별: r.sex === 'M' ? '남성' : '여성',
      만료일: r.expiryDate,
      발행국: getCountryName(r.countryCode),
      유효여부: r.isValid ? '정상' : '체크섬 불일치',
      스캔시각: r.scannedAt,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 16 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '여권목록');
    XLSX.writeFile(wb, `여권목록_${new Date().toISOString().slice(0, 10)}.xlsx`);
    showToast('success', 'Excel 파일로 내보냈습니다');
  };

  const exportCSV = () => {
    const header = '성,이름,한글이름,여권번호,국적,생년월일,성별,만료일,유효여부\n';
    const rows = scanned
      .map((r) => `${r.surname},${r.givenNames},${r.koreanName || ''},${r.passportNumber},${r.nationality},${r.dateOfBirth},${r.sex === 'M' ? '남성' : '여성'},${r.expiryDate},${r.isValid ? '정상' : '불일치'}`)
      .join('\n');
    const blob = new Blob(['\uFEFF' + header + rows], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `여권목록_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    showToast('success', 'CSV 파일로 내보냈습니다');
  };

  const validCount = scanned.filter((r) => r.isValid).length;
  const expiredCount = scanned.filter((r) => r.expiryDate && new Date(r.expiryDate) < new Date()).length;
  const expiringSoonCount = scanned.filter((r) => {
    if (!r.expiryDate) return false;
    const d = new Date(r.expiryDate);
    const now = new Date();
    return d >= now && d < new Date(now.getTime() + 180 * 86400000);
  }).length;

  return (
    <div className="h-full">
      {/* 토스트 */}
      {toast && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {toast.type === 'success' ? <CheckCircleIcon className="w-5 h-5" /> : <ExclamationTriangleIcon className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
            <IdentificationIcon className="w-7 h-7 text-[#ffa726]" />
            여권 OCR 스캔
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">여권 이미지를 스캔해 여행자 정보를 자동으로 추출합니다</p>
        </div>
        <button
          onClick={() => setShowScanner(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-semibold rounded-xl hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-md text-sm"
        >
          <PlusCircleIcon className="w-5 h-5" />
          여권 스캔 추가
        </button>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '총 스캔', value: scanned.length, color: 'text-gray-800', bg: 'bg-gray-50', border: 'border-gray-200', icon: UserGroupIcon },
          { label: 'MRZ 정상', value: validCount, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircleIcon },
          { label: '만료 임박 (6개월)', value: expiringSoonCount, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: ExclamationTriangleIcon },
          { label: '만료됨', value: expiredCount, color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XMarkIcon },
        ].map(({ label, value, color, bg, border, icon: Icon }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-4`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[12px] font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
              <Icon className={`w-5 h-5 ${color}`} />
            </div>
            <p className={`text-[28px] font-bold leading-none ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* ── 외교부 여권발급 현황 (data.go.kr) ────────────────────── */}
      <div className="bg-white rounded-2xl border border-blue-200 shadow-sm mb-6 overflow-hidden">
        <div className="px-5 py-3 bg-blue-600 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <ChartBarIcon className="w-5 h-5" />
            <span className="text-sm font-bold">외교부 여권발급 현황</span>
            <span className="text-xs opacity-70 ml-1">data.go.kr · 공공데이터</span>
          </div>
          <div className="flex items-center gap-2">
            {issuanceData?.isMock && (
              <span className="text-xs bg-amber-400 text-amber-900 px-2 py-0.5 rounded-full font-medium">
                목업 데이터 (API 키 활성화 필요)
              </span>
            )}
            <select
              value={issuanceYear}
              onChange={(e) => setIssuanceYear(e.target.value)}
              className="text-xs bg-white/20 text-white border border-white/30 rounded-lg px-2 py-1 focus:outline-none"
            >
              {[2024, 2023, 2022, 2021, 2020, 2019].map((y) => (
                <option key={y} value={String(y)} className="text-gray-800">{y}년</option>
              ))}
            </select>
          </div>
        </div>

        <div className="p-5">
          {issuanceLoading && (
            <div className="flex items-center justify-center h-32 text-gray-400 text-sm gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-400 border-t-transparent" />
              데이터 조회 중...
            </div>
          )}
          {issuanceError && (
            <div className="flex items-center justify-center h-32 text-red-500 text-sm">
              ⚠ {issuanceError}
            </div>
          )}
          {!issuanceLoading && !issuanceError && issuanceData && (
            <div className="grid grid-cols-4 gap-6">
              {/* 연간 합계 */}
              <div className="col-span-1 flex flex-col justify-center">
                <p className="text-xs text-gray-500 mb-1">{issuanceYear}년 총 발급</p>
                <p className="text-3xl font-bold text-blue-700">
                  {(issuanceData.items.reduce((s, i) => s + i.issuanceCount, 0) / 10000).toFixed(1)}
                  <span className="text-base font-normal text-gray-500 ml-1">만 건</span>
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  월 평균 {Math.round(issuanceData.items.reduce((s, i) => s + i.issuanceCount, 0) / issuanceData.items.length / 1000)}천 건
                </p>
                {issuanceData.isMock && (
                  <p className="text-xs text-amber-600 mt-3 bg-amber-50 border border-amber-200 rounded px-2 py-1">
                    ⚙ API 키를 설정하면<br />실제 데이터로 교체됩니다
                  </p>
                )}
              </div>
              {/* 월별 바 차트 */}
              <div className="col-span-3">
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={issuanceData.items.map((it) => ({
                    name: `${it.month ?? ''}월`,
                    발급건수: Math.round(it.issuanceCount / 1000),
                  }))} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} unit="천" />
                    <Tooltip
                      formatter={(v: number | undefined) => [`${v ?? 0}천 건`, '발급건수'] as [string, string]}
                      contentStyle={{ fontSize: 12 }}
                    />
                    <Bar dataKey="발급건수" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* OCR 스캐너 패널 */}
        <div className="col-span-1">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <DocumentMagnifyingGlassIcon className="w-5 h-5 text-[#ffa726]" />
              <h2 className="text-[14px] font-bold text-gray-800">스캐너</h2>
            </div>
            <div className="p-5">
              {showScanner ? (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-[13px] font-semibold text-gray-700">여권 이미지 업로드</p>
                    <button onClick={() => setShowScanner(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                      <XMarkIcon className="w-4 h-4 text-gray-500" />
                    </button>
                  </div>
                  <PassportOCR onComplete={handleScanned} />
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="w-16 h-16 rounded-2xl bg-orange-50 flex items-center justify-center mx-auto mb-4">
                    <IdentificationIcon className="w-8 h-8 text-[#ffa726]" />
                  </div>
                  <p className="text-[13px] font-semibold text-gray-700 mb-2">여권을 스캔하세요</p>
                  <p className="text-[12px] text-gray-500 mb-4 leading-relaxed">
                    여권 하단 MRZ 영역이 포함된<br />선명한 이미지를 업로드하세요
                  </p>
                  <button
                    onClick={() => setShowScanner(true)}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-semibold rounded-xl hover:from-[#f57c00] hover:to-[#ffa726] transition-all text-[13px]"
                  >
                    스캔 시작
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* 안내 */}
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mt-4">
            <div className="flex gap-3">
              <InformationCircleIcon className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-bold text-blue-800 mb-2">스캔 가이드</p>
                <ul className="space-y-1 text-[11px] text-blue-700">
                  <li>• 여권 신원정보면(사진 있는 면) 전체 촬영</li>
                  <li>• 하단 MRZ(기계판독영역) 2줄이 선명해야 함</li>
                  <li>• 빛 반사나 그림자 없는 환경에서 촬영</li>
                  <li>• JPG, PNG, HEIC 지원 (최대 10MB)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* 개인정보 보호 */}
          <div className="bg-yellow-50 border border-yellow-100 rounded-2xl p-4 mt-3">
            <p className="text-[11px] font-bold text-yellow-800 mb-1">🔒 개인정보 보호 안내</p>
            <p className="text-[11px] text-yellow-700 leading-relaxed">
              여권 이미지는 서버로 전송되지 않으며, OCR 처리는 사용자 기기(브라우저)에서만 수행됩니다.
            </p>
          </div>
        </div>

        {/* 스캔 결과 목록 */}
        <div className="col-span-2">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* 목록 헤더 */}
            <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <UserGroupIcon className="w-5 h-5 text-gray-600" />
                <h2 className="text-[14px] font-bold text-gray-800">
                  스캔 목록
                  <span className="ml-2 text-[12px] font-normal text-gray-500">({scanned.length}명)</span>
                </h2>
              </div>
              {scanned.length > 0 && (
                <div className="flex items-center gap-2">
                  {selected.size > 0 && (
                    <button onClick={copySelected} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-[12px] font-medium transition-colors">
                      <ClipboardDocumentIcon className="w-4 h-4" />
                      복사 ({selected.size})
                    </button>
                  )}
                  <button onClick={exportExcel} className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 text-[12px] font-medium transition-colors">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    Excel
                  </button>
                  <button onClick={exportCSV} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-[12px] font-medium transition-colors">
                    <ArrowDownTrayIcon className="w-4 h-4" />
                    CSV
                  </button>
                  <button onClick={clearAll} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 text-[12px] font-medium transition-colors">
                    <TrashIcon className="w-4 h-4" />
                    전체 삭제
                  </button>
                </div>
              )}
            </div>

            {/* 결과 테이블 */}
            {scanned.length === 0 ? (
              <div className="py-16 text-center">
                <IdentificationIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-[14px] font-medium text-gray-500">스캔된 여권이 없습니다</p>
                <p className="text-[12px] text-gray-400 mt-1">왼쪽 스캐너에서 여권을 스캔하세요</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[12px]">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">
                        <input
                          type="checkbox"
                          checked={selected.size === scanned.length}
                          onChange={toggleSelectAll}
                          className="rounded"
                        />
                      </th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">이름 (영문)</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">여권번호</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">생년월일</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">만료일</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">상태</th>
                      <th className="px-4 py-3 text-left font-semibold text-gray-600">스캔시각</th>
                      <th className="px-4 py-3 text-center font-semibold text-gray-600">삭제</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scanned.map((r) => {
                      const isExpired = r.expiryDate && new Date(r.expiryDate) < new Date();
                      const isExpiringSoon = !isExpired && r.expiryDate && new Date(r.expiryDate) < new Date(Date.now() + 180 * 86400000);
                      return (
                        <tr key={r.id} className={`border-t border-gray-100 hover:bg-gray-50 ${selected.has(r.id) ? 'bg-orange-50' : ''}`}>
                          <td className="px-4 py-3">
                            <input
                              type="checkbox"
                              checked={selected.has(r.id)}
                              onChange={() => toggleSelect(r.id)}
                              className="rounded"
                            />
                          </td>
                          <td className="px-4 py-3">
                            <p className="font-semibold text-gray-900">{r.surname} {r.givenNames}</p>
                            {r.koreanName && <p className="text-gray-500">{r.koreanName}</p>}
                            <p className="text-gray-400">{r.sex === 'M' ? '남' : '여'} · {getCountryName(r.nationality)}</p>
                          </td>
                          <td className="px-4 py-3 font-mono font-semibold text-orange-700">{r.passportNumber}</td>
                          <td className="px-4 py-3 text-gray-700">{r.dateOfBirth}</td>
                          <td className="px-4 py-3">
                            <span className={isExpired ? 'text-red-600 font-semibold' : isExpiringSoon ? 'text-amber-600 font-semibold' : 'text-gray-700'}>
                              {r.expiryDate}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            {isExpired ? (
                              <span className="px-2 py-0.5 bg-red-100 text-red-700 rounded-full text-[10px] font-bold">만료</span>
                            ) : isExpiringSoon ? (
                              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 rounded-full text-[10px] font-bold">임박</span>
                            ) : r.isValid ? (
                              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded-full text-[10px] font-bold">정상</span>
                            ) : (
                              <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px] font-bold">확인필요</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">{r.scannedAt}</td>
                          <td className="px-4 py-3 text-center">
                            <button onClick={() => deleteRecord(r.id)} className="p-1.5 hover:bg-red-50 rounded-lg group transition-colors">
                              <TrashIcon className="w-4 h-4 text-gray-400 group-hover:text-red-500" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
