'use client';

import { useState, useMemo } from 'react';
import {
  BanknotesIcon,
  MagnifyingGlassIcon,
  CalendarDaysIcon,
  ArrowDownTrayIcon,
  FunnelIcon,
  ArrowsUpDownIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
} from '@heroicons/react/24/outline';
import * as XLSX from 'xlsx';

type AccountType = '전체' | '법인카드' | '법인계좌' | '개인계좌' | '현금';
type VendorType = '전체' | '망고트래블' | '하노이여행사' | '다낭골프클럽' | '호치민여행클럽';
type TxCategory = '전체' | '상품판매' | '수수료' | '환불' | '기타비용';
type InOutType = '전체' | '입금' | '출금';

interface Transaction {
  id: string;
  date: string;
  accountType: string;
  vendor: string;
  category: string;
  description: string;
  inAmount: number;
  outAmount: number;
  balance: number;
  memo: string;
}

const mockTxData: Transaction[] = [
  { id: 'TX-001', date: '2024-05-31', accountType: '법인계좌', vendor: '망고트래블', category: '상품판매', description: '다낭 골프 3박5일 예약금 입금', inAmount: 2400000, outAmount: 0, balance: 38420000, memo: '예약번호 R-2405-0078' },
  { id: 'TX-002', date: '2024-05-31', accountType: '법인카드', vendor: '망고트래블', category: '기타비용', description: '사무용품 구매', inAmount: 0, outAmount: 85000, balance: 36020000, memo: '' },
  { id: 'TX-003', date: '2024-05-30', accountType: '법인계좌', vendor: '하노이여행사', category: '수수료', description: '4월 정산금 지급', inAmount: 0, outAmount: 8289600, balance: 36105000, memo: '2024-04 정산' },
  { id: 'TX-004', date: '2024-05-29', accountType: '법인계좌', vendor: '망고트래블', category: '상품판매', description: '호치민 패키지 잔금 입금', inAmount: 1280000, outAmount: 0, balance: 44394600, memo: 'R-2405-0065' },
  { id: 'TX-005', date: '2024-05-28', accountType: '법인계좌', vendor: '망고트래블', category: '환불', description: '예약 취소 환불', inAmount: 0, outAmount: 1400000, balance: 43114600, memo: 'R-2405-0071 취소' },
  { id: 'TX-006', date: '2024-05-27', accountType: '법인카드', vendor: '다낭골프클럽', category: '기타비용', description: '파트너사 접대비', inAmount: 0, outAmount: 340000, balance: 44514600, memo: '' },
  { id: 'TX-007', date: '2024-05-26', accountType: '법인계좌', vendor: '망고트래블', category: '상품판매', description: '나트랑 스파 패키지 계약금', inAmount: 800000, outAmount: 0, balance: 44854600, memo: '' },
  { id: 'TX-008', date: '2024-05-25', accountType: '법인계좌', vendor: '호치민여행클럽', category: '수수료', description: '파트너 수수료 지급', inAmount: 0, outAmount: 1100000, balance: 44054600, memo: '' },
  { id: 'TX-009', date: '2024-05-24', accountType: '법인계좌', vendor: '망고트래블', category: '상품판매', description: '하노이 야경투어 입금', inAmount: 630000, outAmount: 0, balance: 45154600, memo: '' },
  { id: 'TX-010', date: '2024-05-23', accountType: '현금', vendor: '망고트래블', category: '기타비용', description: '직원 교통비', inAmount: 0, outAmount: 50000, balance: 44524600, memo: '' },
  { id: 'TX-011', date: '2024-05-22', accountType: '법인계좌', vendor: '망고트래블', category: '상품판매', description: '푸꾸옥 리조트 예약금', inAmount: 1800000, outAmount: 0, balance: 44574600, memo: '' },
  { id: 'TX-012', date: '2024-05-21', accountType: '법인계좌', vendor: '망고트래블', category: '상품판매', description: '다낭 패키지 잔금 입금', inAmount: 3200000, outAmount: 0, balance: 42774600, memo: '' },
];

const fmt = (n: number) => n.toLocaleString('ko-KR');
const fmtW = (n: number) => (n === 0 ? '-' : `₩${n.toLocaleString('ko-KR')}`);

const ACCOUNTS: AccountType[] = ['전체', '법인카드', '법인계좌', '개인계좌', '현금'];
const VENDORS: VendorType[] = ['전체', '망고트래블', '하노이여행사', '다낭골프클럽', '호치민여행클럽'];
const CATEGORIES: TxCategory[] = ['전체', '상품판매', '수수료', '환불', '기타비용'];
const IN_OUTS: InOutType[] = ['전체', '입금', '출금'];

export default function TransactionsPage() {
  const [startDate, setStartDate] = useState('2024-05-01');
  const [endDate, setEndDate] = useState('2024-05-31');
  const [accountType, setAccountType] = useState<AccountType>('전체');
  const [vendor, setVendor] = useState<VendorType>('전체');
  const [category, setCategory] = useState<TxCategory>('전체');
  const [inOut, setInOut] = useState<InOutType>('전체');
  const [searched, setSearched] = useState(true);

  const filtered = useMemo(() => {
    let data = [...mockTxData];
    if (accountType !== '전체') data = data.filter((t) => t.accountType === accountType);
    if (vendor !== '전체') data = data.filter((t) => t.vendor === vendor);
    if (category !== '전체') data = data.filter((t) => t.category === category);
    if (inOut === '입금') data = data.filter((t) => t.inAmount > 0);
    if (inOut === '출금') data = data.filter((t) => t.outAmount > 0);
    return data;
  }, [accountType, vendor, category, inOut]);

  const totalIn = filtered.reduce((s, t) => s + t.inAmount, 0);
  const totalOut = filtered.reduce((s, t) => s + t.outAmount, 0);

  const exportExcel = () => {
    const rows = filtered.map((t, i) => ({
      NO: i + 1, 날짜: t.date, 통장구분: t.accountType, 랜드사: t.vendor,
      지출구분: t.category, 내용: t.description,
      입금: t.inAmount || '', 출금: t.outAmount || '',
      잔액: t.balance, 메모: t.memo,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 14 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '거래내역');
    XLSX.writeFile(wb, `거래내역_${startDate}_${endDate}.xlsx`);
  };

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
            <ArrowsUpDownIcon className="w-7 h-7 text-[#ffa726]" />
            거래내역 조회
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">법인 계좌 및 카드 거래내역 조회</p>
        </div>
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2.5 border border-green-300 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors text-[13px]"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Excel 내보내기
        </button>
      </div>

      {/* 검색 필터 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-5">
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">통장구분</label>
            <select
              value={accountType}
              onChange={(e) => setAccountType(e.target.value as AccountType)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
            >
              {ACCOUNTS.map((a) => <option key={a}>{a}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">랜드사</label>
            <select
              value={vendor}
              onChange={(e) => setVendor(e.target.value as VendorType)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
            >
              {VENDORS.map((v) => <option key={v}>{v}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">거래구분</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TxCategory)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">입출금구분</label>
            <select
              value={inOut}
              onChange={(e) => setInOut(e.target.value as InOutType)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
            >
              {IN_OUTS.map((io) => <option key={io}>{io}</option>)}
            </select>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <CalendarDaysIcon className="w-4 h-4 text-gray-400" />
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold text-gray-600">시작날짜</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30" />
          </div>
          <span className="text-gray-400">~</span>
          <div className="flex items-center gap-2">
            <label className="text-[12px] font-semibold text-gray-600">종료날짜</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
              className="border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30" />
          </div>
          <button
            onClick={() => setSearched(true)}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-semibold rounded-xl hover:from-[#f57c00] hover:to-[#ffa726] transition-all text-[13px]"
          >
            <MagnifyingGlassIcon className="w-4 h-4" />
            검색
          </button>
        </div>
      </div>

      {searched && (
        <>
          {/* 요약 */}
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <ArrowDownCircleIcon className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">총 입금</p>
                <p className="text-[18px] font-bold text-blue-700">₩{fmt(totalIn)}</p>
              </div>
            </div>
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <ArrowUpCircleIcon className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">총 출금</p>
                <p className="text-[18px] font-bold text-red-700">₩{fmt(totalOut)}</p>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-2xl p-4 flex items-center gap-4">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <BanknotesIcon className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-[11px] font-semibold text-gray-500">순이익</p>
                <p className={`text-[18px] font-bold ${totalIn - totalOut >= 0 ? 'text-green-700' : 'text-red-600'}`}>
                  ₩{fmt(totalIn - totalOut)}
                </p>
              </div>
            </div>
          </div>

          {/* 테이블 */}
          <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
            <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FunnelIcon className="w-4 h-4 text-gray-400" />
                <span className="text-[13px] font-semibold text-gray-700">{filtered.length}건</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead className="bg-gray-50">
                  <tr>
                    {['통장구분', '랜드사', '지출구분/내용', '입금', '출금', '입출금날짜'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left font-semibold text-gray-600 whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-12 text-gray-400">
                        <ArrowsUpDownIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                        <p className="text-[13px]">데이터가 존재하지 않습니다.</p>
                      </td>
                    </tr>
                  ) : (
                    filtered.map((tx) => (
                      <tr key={tx.id} className="border-t border-gray-100 hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[11px] font-semibold rounded-full">{tx.accountType}</span>
                        </td>
                        <td className="px-4 py-3 text-gray-700 font-medium">{tx.vendor}</td>
                        <td className="px-4 py-3">
                          <p className="text-gray-900 font-medium">{tx.description}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="px-1.5 py-0.5 bg-orange-50 text-orange-700 text-[10px] font-semibold rounded">{tx.category}</span>
                            {tx.memo && <p className="text-gray-400 text-[11px]">{tx.memo}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          {tx.inAmount > 0 && (
                            <span className="text-blue-700 font-bold">+₩{fmt(tx.inAmount)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {tx.outAmount > 0 && (
                            <span className="text-red-600 font-bold">-₩{fmt(tx.outAmount)}</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500">{tx.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            {filtered.length > 0 && (
              <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-8 text-[12px] font-semibold">
                <span className="text-gray-600">총 {filtered.length}건</span>
                <span className="text-blue-700">입금 합계: ₩{fmt(totalIn)}</span>
                <span className="text-red-600">출금 합계: ₩{fmt(totalOut)}</span>
                <span className={totalIn - totalOut >= 0 ? 'text-green-700' : 'text-red-600'}>
                  순이익: ₩{fmt(totalIn - totalOut)}
                </span>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
