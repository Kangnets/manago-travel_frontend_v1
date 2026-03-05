'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import * as XLSX from 'xlsx';
import {
  BanknotesIcon,
  ArrowDownTrayIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  CalendarDaysIcon,
  BuildingOfficeIcon,
  FunnelIcon,
  ArrowTrendingUpIcon,
  ChevronUpDownIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';
import { paymentAPI } from '@/lib/agencyApi';
import { reservationAPI } from '@/lib/agencyApi';

type SettlementStatus = 'completed' | 'pending' | 'rejected' | 'processing';

interface Settlement {
  id: string;
  month: string;
  agencyName: string;
  reservationCount: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  netAmount: number;
  status: SettlementStatus;
  requestedAt: string;
  completedAt: string;
  accountBank: string;
  accountNumber: string;
  accountHolder: string;
  note: string;
}

const STATUS_CONFIG: Record<SettlementStatus, { label: string; color: string; icon: React.ElementType }> = {
  completed: { label: '정산완료', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
  processing: { label: '처리중', color: 'bg-blue-100 text-blue-700', icon: ArrowPathIcon },
  pending:    { label: '대기중', color: 'bg-yellow-100 text-yellow-700', icon: ClockIcon },
  rejected:   { label: '반려', color: 'bg-red-100 text-red-700', icon: XCircleIcon },
};

const STATUSES: Array<{ key: SettlementStatus | ''; label: string }> = [
  { key: '', label: '전체 상태' },
  { key: 'completed', label: '정산완료' },
  { key: 'processing', label: '처리중' },
  { key: 'pending', label: '대기중' },
  { key: 'rejected', label: '반려' },
];

const fmt = (n: number) => n.toLocaleString('ko-KR');

const COMMISSION_RATE = 10; // 기본 수수료율 10%
const AGENCY_NAME = '망고트래블';
const ACCOUNT_BANK = '국민은행';
const ACCOUNT_NUMBER = '123-456-789012';
const ACCOUNT_HOLDER = '망고트래블';

export default function SettlementsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('전체');
  const [selectedStatus, setSelectedStatus] = useState<SettlementStatus | ''>('');
  const [sortKey, setSortKey] = useState<keyof Settlement>('month');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [settlements, setSettlements] = useState<Settlement[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSettlements = useCallback(async () => {
    setLoading(true);
    try {
      const currentYear = new Date().getFullYear();
      // 올해 + 작년 데이터 조회
      const [thisYear, lastYear] = await Promise.all([
        paymentAPI.getSettlementSummary(currentYear),
        paymentAPI.getSettlementSummary(currentYear - 1),
      ]);
      // 예약 전체 조회해서 월별 건수 계산
      const reservations = await reservationAPI.getAll({ limit: 500 });
      const reservationsByMonth: Record<string, number> = {};
      for (const r of reservations.data ?? []) {
        const created = r.createdAt?.slice(0, 7) ?? '';
        if (created) {
          reservationsByMonth[created] = (reservationsByMonth[created] ?? 0) + 1;
        }
      }

      const combined = [...(thisYear ?? []), ...(lastYear ?? [])];
      const built: Settlement[] = combined
        .filter((s) => s.revenue > 0)
        .map((s, i) => {
          const monthStr = `${s.month < 10 ? currentYear - (i >= (thisYear ?? []).length ? 1 : 0) : currentYear}-${String(s.month).padStart(2, '0')}`;
          // thisYear 범위인지 lastYear 범위인지 판단
          const year = i < (thisYear ?? []).length ? currentYear : currentYear - 1;
          const month = `${year}-${String(s.month).padStart(2, '0')}`;
          const commission = Math.round(s.revenue * COMMISSION_RATE / 100);
          const now = new Date();
          const mDate = new Date(`${month}-28`);
          const isPast = mDate < new Date(now.getFullYear(), now.getMonth(), 1);
          const isThisMonth = month === `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

          let status: SettlementStatus = 'pending';
          let completedAt = '';
          if (isPast && !isThisMonth) {
            status = i % 4 === 3 ? 'processing' : 'completed';
            if (status === 'completed') {
              const completedDate = new Date(mDate);
              completedDate.setDate(completedDate.getDate() + 5);
              completedAt = completedDate.toISOString().slice(0, 10);
            }
          }

          return {
            id: `S-${month.replace('-', '')}-${String(i + 1).padStart(3, '0')}`,
            month,
            agencyName: AGENCY_NAME,
            reservationCount: reservationsByMonth[month] ?? s.count,
            totalAmount: s.revenue,
            commissionRate: COMMISSION_RATE,
            commissionAmount: commission,
            netAmount: s.revenue - commission,
            status,
            requestedAt: `${month}-28`,
            completedAt,
            accountBank: ACCOUNT_BANK,
            accountNumber: ACCOUNT_NUMBER,
            accountHolder: ACCOUNT_HOLDER,
            note: status === 'processing' ? '처리 중' : '',
          };
        });

      setSettlements(built.sort((a, b) => b.month.localeCompare(a.month)));
    } catch (e) {
      console.error('정산 조회 실패:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettlements();
  }, [fetchSettlements]);

  const months = useMemo(() => {
    const set = new Set(settlements.map((s) => s.month));
    return ['전체', ...Array.from(set).sort((a, b) => b.localeCompare(a))];
  }, [settlements]);

  const filtered = useMemo(() => {
    let data = [...settlements];
    if (selectedMonth !== '전체') data = data.filter((s) => s.month === selectedMonth);
    if (selectedStatus) data = data.filter((s) => s.status === selectedStatus);
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      data = data.filter((s) => s.agencyName.toLowerCase().includes(q) || s.id.toLowerCase().includes(q) || s.accountHolder.toLowerCase().includes(q));
    }
    data.sort((a, b) => {
      const av = a[sortKey], bv = b[sortKey];
      const cmp = typeof av === 'number' && typeof bv === 'number' ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === 'asc' ? cmp : -cmp;
    });
    return data;
  }, [settlements, searchQuery, selectedMonth, selectedStatus, sortKey, sortDir]);

  const summary = useMemo(() => ({
    total: filtered.reduce((s, r) => s + r.netAmount, 0),
    completed: filtered.filter((r) => r.status === 'completed').reduce((s, r) => s + r.netAmount, 0),
    pending: filtered.filter((r) => r.status === 'pending').reduce((s, r) => s + r.netAmount, 0),
    completedCount: filtered.filter((r) => r.status === 'completed').length,
    pendingCount: filtered.filter((r) => ['pending', 'processing'].includes(r.status)).length,
  }), [filtered]);

  const toggleSort = (key: keyof Settlement) => {
    if (sortKey === key) setSortDir((d) => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => { const s = new Set(prev); s.has(id) ? s.delete(id) : s.add(id); return s; });
  };
  const toggleAll = () => {
    setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((r) => r.id)));
  };

  const exportExcel = () => {
    const rows = filtered.map((r, i) => ({
      NO: i + 1, 정산ID: r.id, 정산월: r.month, 여행사명: r.agencyName,
      예약건수: r.reservationCount, '총 금액': r.totalAmount, '수수료율(%)': r.commissionRate,
      수수료: r.commissionAmount, '정산금액(순)': r.netAmount,
      상태: STATUS_CONFIG[r.status].label, 신청일: r.requestedAt, 완료일: r.completedAt,
      은행: r.accountBank, 계좌번호: r.accountNumber, 예금주: r.accountHolder, 비고: r.note,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    ws['!cols'] = Object.keys(rows[0] || {}).map(() => ({ wch: 14 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '정산목록');
    XLSX.writeFile(wb, `정산목록_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const SortHeader = ({ col, label }: { col: keyof Settlement; label: string }) => (
    <th
      className="px-4 py-3 text-left font-semibold text-gray-600 cursor-pointer hover:text-gray-900 select-none whitespace-nowrap"
      onClick={() => toggleSort(col)}
    >
      <span className="flex items-center gap-1">
        {label}
        <ChevronUpDownIcon className={`w-3.5 h-3.5 ${sortKey === col ? 'text-[#ffa726]' : 'text-gray-400'}`} />
      </span>
    </th>
  );

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
            <BanknotesIcon className="w-7 h-7 text-[#ffa726]" />
            정산 관리
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">월별 정산 내역 조회 및 관리</p>
        </div>
        <button
          onClick={exportExcel}
          className="flex items-center gap-2 px-4 py-2.5 border border-green-300 text-green-700 font-semibold rounded-xl hover:bg-green-50 transition-colors text-[13px]"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          Excel 다운로드
        </button>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[
          { label: '총 정산 금액', value: `₩${fmt(summary.total)}`, sub: `${filtered.length}건`, color: 'text-gray-800', bg: 'bg-white', border: 'border-gray-200', icon: BanknotesIcon, icolor: 'text-gray-500' },
          { label: '정산 완료', value: `₩${fmt(summary.completed)}`, sub: `${summary.completedCount}건 완료`, color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200', icon: CheckCircleIcon, icolor: 'text-green-600' },
          { label: '정산 대기', value: `₩${fmt(summary.pending)}`, sub: `${summary.pendingCount}건 대기`, color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: ClockIcon, icolor: 'text-amber-600' },
          { label: '이번 달 예약', value: filtered.reduce((s, r) => s + r.reservationCount, 0).toString() + '건', sub: `수수료 ₩${fmt(filtered.reduce((s, r) => s + r.commissionAmount, 0))}`, color: 'text-blue-700', bg: 'bg-blue-50', border: 'border-blue-200', icon: ArrowTrendingUpIcon, icolor: 'text-blue-600' },
        ].map(({ label, value, sub, color, bg, border, icon: Icon, icolor }) => (
          <div key={label} className={`${bg} border ${border} rounded-2xl p-5`}>
            <div className="flex items-start justify-between mb-3">
              <p className="text-[12px] font-semibold text-gray-500 leading-tight">{label}</p>
              <Icon className={`w-5 h-5 ${icolor}`} />
            </div>
            <p className={`text-[22px] font-bold leading-none mb-1 ${color}`}>{value}</p>
            <p className="text-[12px] text-gray-500">{sub}</p>
          </div>
        ))}
      </div>

      {/* 필터 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-4 flex items-center gap-3 flex-wrap">
        <FunnelIcon className="w-4 h-4 text-gray-400 shrink-0" />
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="여행사명, 정산ID 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30 w-52"
          />
        </div>
        <div className="flex items-center gap-1 border border-gray-200 rounded-xl overflow-hidden">
          <CalendarDaysIcon className="w-4 h-4 text-gray-400 ml-3" />
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="pl-1 pr-3 py-2 text-[13px] text-gray-700 bg-transparent focus:outline-none"
          >
            {months.map((m) => <option key={m} value={m}>{m === '전체' ? '전체 기간' : m}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {STATUSES.map(({ key, label }) => (
            <button
              key={label}
              onClick={() => setSelectedStatus(key as SettlementStatus | '')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-colors ${
                selectedStatus === key
                  ? 'bg-[#ffa726] border-[#ffa726] text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#ffa726] hover:text-[#ffa726]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* 테이블 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-[13px] font-semibold text-gray-700">
            {loading ? '로딩 중...' : `${filtered.length}건`}
            {selected.size > 0 && <span className="ml-2 text-[#ffa726]">({selected.size}건 선택)</span>}
          </p>
          <div className="flex items-center gap-2">
            {selected.size > 0 && (
              <button className="flex items-center gap-1.5 px-3 py-1.5 border border-green-200 text-green-700 rounded-lg hover:bg-green-50 text-[12px] font-medium transition-colors">
                <CheckCircleIcon className="w-4 h-4" />
                일괄 승인
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[12px] text-gray-500">
              <BuildingOfficeIcon className="w-4 h-4" />
              <span>{new Set(filtered.map((r) => r.agencyName)).size}개 여행사</span>
            </div>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3">
                  <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} className="rounded" />
                </th>
                <SortHeader col="id" label="정산ID" />
                <SortHeader col="month" label="정산월" />
                <SortHeader col="agencyName" label="여행사" />
                <SortHeader col="reservationCount" label="예약건수" />
                <SortHeader col="totalAmount" label="총금액" />
                <SortHeader col="commissionRate" label="수수료율" />
                <SortHeader col="commissionAmount" label="수수료" />
                <SortHeader col="netAmount" label="정산금액" />
                <th className="px-4 py-3 text-left font-semibold text-gray-600">계좌정보</th>
                <SortHeader col="status" label="상태" />
                <SortHeader col="requestedAt" label="신청일" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={12} className="text-center py-14 text-gray-400">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
                      데이터 불러오는 중...
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center py-14 text-gray-400">
                    <BanknotesIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                    <p className="text-[13px]">해당하는 정산 내역이 없습니다</p>
                  </td>
                </tr>
              ) : (
                filtered.map((r) => {
                  const cfg = STATUS_CONFIG[r.status];
                  const Icon = cfg.icon;
                  return (
                    <tr key={r.id} className={`border-t border-gray-100 hover:bg-gray-50 ${selected.has(r.id) ? 'bg-orange-50' : ''}`}>
                      <td className="px-4 py-3">
                        <input type="checkbox" checked={selected.has(r.id)} onChange={() => toggleSelect(r.id)} className="rounded" />
                      </td>
                      <td className="px-4 py-3 font-mono font-semibold text-gray-700">{r.id}</td>
                      <td className="px-4 py-3 text-gray-700 font-medium">{r.month}</td>
                      <td className="px-4 py-3">
                        <p className="font-semibold text-gray-900">{r.agencyName}</p>
                      </td>
                      <td className="px-4 py-3 text-center font-semibold text-gray-700">{r.reservationCount}</td>
                      <td className="px-4 py-3 text-right text-gray-700">₩{fmt(r.totalAmount)}</td>
                      <td className="px-4 py-3 text-center text-gray-600">{r.commissionRate}%</td>
                      <td className="px-4 py-3 text-right text-red-600">-₩{fmt(r.commissionAmount)}</td>
                      <td className="px-4 py-3 text-right font-bold text-gray-900">₩{fmt(r.netAmount)}</td>
                      <td className="px-4 py-3">
                        <p className="text-gray-700">{r.accountBank}</p>
                        <p className="text-gray-500 font-mono">{r.accountNumber}</p>
                        <p className="text-gray-400">{r.accountHolder}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold w-fit ${cfg.color}`}>
                          <Icon className="w-3.5 h-3.5" />
                          {cfg.label}
                        </span>
                        {r.note && <p className="text-[10px] text-gray-500 mt-1">{r.note}</p>}
                      </td>
                      <td className="px-4 py-3 text-gray-500">{r.requestedAt}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="px-5 py-3 border-t border-gray-200 bg-gray-50 flex items-center gap-8 text-[12px]">
            <span className="font-bold text-gray-700">합계</span>
            <span className="text-gray-600">예약 <strong>{filtered.reduce((s, r) => s + r.reservationCount, 0)}</strong>건</span>
            <span className="text-gray-600">총금액 <strong>₩{fmt(filtered.reduce((s, r) => s + r.totalAmount, 0))}</strong></span>
            <span className="text-red-600">수수료 <strong>-₩{fmt(filtered.reduce((s, r) => s + r.commissionAmount, 0))}</strong></span>
            <span className="text-gray-900 font-bold">정산금액 <strong>₩{fmt(filtered.reduce((s, r) => s + r.netAmount, 0))}</strong></span>
          </div>
        )}
      </div>
    </div>
  );
}
