'use client';

import { useState } from 'react';
import PassportOCR from '@/components/PassportOCR/PassportOCR';
import { PassportData } from '@/types/passport';
import Footer from '@/components/Footer/Footer';

export default function PassportOCRPage() {
  const [scannedPassports, setScannedPassports] = useState<PassportData[]>([]);

  const handlePassportScanned = (data: PassportData) => {
    setScannedPassports((prev) => [...prev, data]);
  };

  const removePassport = (index: number) => {
    setScannedPassports((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 배너 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">여권 OCR 스캐너</h1>
          <p className="text-orange-100 text-lg">
            여권 사진을 업로드하면 자동으로 정보를 인식합니다
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 메인 스캐너 */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
              <PassportOCR onComplete={handlePassportScanned} />
            </div>
          </div>

          {/* 스캔 목록 사이드바 */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-4">
              <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                스캔된 여권 ({scannedPassports.length})
              </h2>

              {scannedPassports.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p>아직 스캔된 여권이 없습니다</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {scannedPassports.map((passport, index) => (
                    <div
                      key={index}
                      className="bg-gray-50 rounded-lg p-4 relative group hover:bg-gray-100 transition-colors"
                    >
                      <button
                        onClick={() => removePassport(index)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <div className="text-sm">
                        <div className="font-semibold text-gray-800">
                          {passport.surname} {passport.givenNames}
                        </div>
                        <div className="text-gray-500 mt-1">
                          <span className="inline-flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 9h3.75M15 12h3.75M15 15h3.75M4.5 19.5h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5zm6-10.125a1.875 1.875 0 11-3.75 0 1.875 1.875 0 013.75 0zm1.294 6.336a6.721 6.721 0 01-3.17.789 6.721 6.721 0 01-3.168-.789 3.376 3.376 0 016.338 0z" />
                            </svg>
                            {passport.passportNumber}
                          </span>
                        </div>
                        <div className="flex justify-between mt-2 text-xs text-gray-400">
                          <span>{passport.nationality}</span>
                          <span>만료: {passport.expiryDate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {scannedPassports.length > 0 && (
                <div className="mt-4 pt-4 border-t space-y-2">
                  <button
                    onClick={() => {
                      const data = JSON.stringify(scannedPassports, null, 2);
                      navigator.clipboard.writeText(data);
                      alert('모든 여권 정보가 클립보드에 복사되었습니다.');
                    }}
                    className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    전체 복사
                  </button>
                  <button
                    onClick={() => {
                      const data = scannedPassports.map(p =>
                        `${p.surname},${p.givenNames},${p.passportNumber},${p.nationality},${p.dateOfBirth},${p.sex},${p.expiryDate}`
                      ).join('\n');
                      const header = '성,이름,여권번호,국적,생년월일,성별,만료일\n';
                      const blob = new Blob([header + data], { type: 'text/csv;charset=utf-8;' });
                      const url = URL.createObjectURL(blob);
                      const link = document.createElement('a');
                      link.href = url;
                      link.download = `여권정보_${new Date().toISOString().split('T')[0]}.csv`;
                      link.click();
                    }}
                    className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 py-2 rounded-lg transition-colors text-sm font-medium"
                  >
                    CSV 내보내기
                  </button>
                </div>
              )}
            </div>

            {/* 보안 안내 */}
            <div className="bg-yellow-50 rounded-xl p-4 mt-4">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div>
                  <h4 className="font-semibold text-yellow-800 text-sm">개인정보 보호 안내</h4>
                  <p className="text-yellow-700 text-xs mt-1">
                    여권 이미지는 브라우저에서만 처리되며, 서버로 전송되지 않습니다.
                    모든 OCR 처리는 사용자의 기기에서 수행됩니다.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
