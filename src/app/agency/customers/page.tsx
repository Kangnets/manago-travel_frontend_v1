'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { ClipboardDocumentListIcon } from '@heroicons/react/24/outline';
import { reservationAPI } from '@/lib/agencyApi';

interface Customer {
  id: string;
  name: string;
  family: string;
  phone: string;
  email: string;
  estimateStatus: 'Y' | 'N';
  reservationDate?: string;
  customerType: string;
  source: string;
  consultDate: string;
  region: string;
  memo?: string;
  birthDate?: string;
  address?: string;
  createdAt: string;
}

type Mode = 'list' | 'view' | 'new' | 'edit';
type TabType = 'info' | 'reservations';

export default function CustomersPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('list');
  const [activeTab, setActiveTab] = useState<TabType>('info');
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filterManager, setFilterManager] = useState('전체');
  const [filterStartDate, setFilterStartDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  });
  const [filterEndDate, setFilterEndDate] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  });
  const [filterRegion, setFilterRegion] = useState('전체');
  const [filterStatus, setFilterStatus] = useState('전체');
  const [filterEstimate, setFilterEstimate] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    family: '',
    phone: '',
    email: '',
    customerType: '여행예약 상담',
    source: '',
    region: '',
    memo: '',
    birthDate: '',
    address: '',
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      // 예약 데이터에서 고객 정보 추출 (contactName + contactPhone 기준 중복 제거)
      const res = await reservationAPI.getAll({ limit: 500 });
      const reservations = res.data ?? [];

      const seen = new Set<string>();
      const built: Customer[] = [];

      for (const r of reservations) {
        const name = r.contactName || (r as any).customer?.name || '';
        const phone = r.contactPhone || (r as any).customer?.phone || '';
        const email = r.contactEmail || (r as any).customer?.email || '';
        const key = `${name}__${phone}`;
        if (!name || seen.has(key)) continue;
        seen.add(key);

        // 해당 고객의 예약들 중 가장 최근 확정 예약 날짜
        const custReservations = reservations.filter(
          (rv) => rv.contactName === name && rv.contactPhone === phone,
        );
        const confirmedDates = custReservations
          .filter((rv) => rv.status === 'confirmed' || rv.status === 'completed')
          .map((rv) => rv.departureDate ?? '')
          .filter(Boolean)
          .sort((a, b) => b.localeCompare(a));

        built.push({
          id: r.customerId || r.id,
          name,
          family: custReservations.length > 1 ? `${custReservations.length}회 이용` : '신규',
          phone,
          email,
          estimateStatus: confirmedDates.length > 0 ? 'Y' : 'N',
          reservationDate: confirmedDates[0] || undefined,
          customerType: '여행예약 상담',
          source: (r as any).product?.category === 'golf' ? '골프예약' : '온라인',
          consultDate: r.createdAt?.slice(0, 19).replace('T', ' ') ?? '',
          region: (r as any).product?.location ?? '',
          memo: r.memo || '',
          createdAt: r.createdAt?.slice(0, 10) ?? '',
        });
      }

      // 검색어 필터
      const filtered = searchKeyword.trim()
        ? built.filter(
            (c) =>
              c.name.includes(searchKeyword.trim()) ||
              c.phone.includes(searchKeyword.trim()),
          )
        : built;

      setCustomers(filtered);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setFormData({
      name: '',
      family: '',
      phone: '',
      email: '',
      customerType: '여행예약 상담',
      source: '',
      region: '',
      memo: '',
      birthDate: '',
      address: '',
    });
    setSelectedCustomer(null);
    setMode('new');
  };

  const handleView = (customer: Customer) => {
    setSelectedCustomer(customer);
    setFormData({
      name: customer.name,
      family: customer.family,
      phone: customer.phone,
      email: customer.email,
      customerType: customer.customerType,
      source: customer.source,
      region: customer.region,
      memo: customer.memo || '',
      birthDate: customer.birthDate || '',
      address: customer.address || '',
    });
    setMode('view');
    setActiveTab('info');
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleSave = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      alert('고객명과 연락처는 필수 항목입니다.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'new') {
        const newCustomer: Customer = {
          id: String(Date.now()),
          name: formData.name,
          family: formData.family,
          phone: formData.phone,
          email: formData.email,
          estimateStatus: 'N',
          customerType: formData.customerType,
          source: formData.source,
          consultDate: new Date().toISOString(),
          region: formData.region,
          memo: formData.memo,
          birthDate: formData.birthDate,
          address: formData.address,
          createdAt: new Date().toISOString(),
        };
        setCustomers([newCustomer, ...customers]);
        alert('고객이 등록되었습니다.');
      } else if (mode === 'edit' && selectedCustomer) {
        const updatedCustomers = customers.map((c) =>
          c.id === selectedCustomer.id
            ? {
                ...c,
                name: formData.name,
                family: formData.family,
                phone: formData.phone,
                email: formData.email,
                customerType: formData.customerType,
                source: formData.source,
                region: formData.region,
                memo: formData.memo,
                birthDate: formData.birthDate,
                address: formData.address,
              }
            : c
        );
        setCustomers(updatedCustomers);
        alert('고객 정보가 수정되었습니다.');
      }
      setMode('list');
    } catch (error) {
      console.error('Failed to save customer:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedCustomer || !confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      const updatedCustomers = customers.filter((c) => c.id !== selectedCustomer.id);
      setCustomers(updatedCustomers);
      alert('고객이 삭제되었습니다.');
      setMode('list');
    } catch (error) {
      console.error('Failed to delete customer:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedCustomer(null);
  };

  const handleFilter = () => {
    fetchCustomers();
  };

  const filteredCustomers = customers.filter((c) => {
    if (searchKeyword && !c.name.includes(searchKeyword) && !c.phone.includes(searchKeyword)) {
      return false;
    }
    return true;
  });

  const inputCls =
    'px-2 py-1 border border-gray-300 rounded text-[12px] focus:outline-none focus:border-[#ffa726] bg-white w-full';

  return (
    <div className="min-h-screen bg-[#f0f2f5] -m-8 flex">
      {/* ═══════════════ LEFT SIDEBAR - FILTERS ═══════════════ */}
      <div className="w-[220px] bg-white border-r border-gray-200 flex-shrink-0">
        <div className="p-4">
          <h2 className="text-[14px] font-bold text-gray-800 mb-4">고객 조회</h2>

          <div className="space-y-3">
            {/* 필터 조회 */}
            <div className="pb-2 border-b border-gray-200">
              <span className="text-[11px] font-semibold text-gray-500">필터 조회</span>
            </div>

            {/* 담당자 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">담당자</label>
              <select
                value={filterManager}
                onChange={(e) => setFilterManager(e.target.value)}
                className={inputCls}
              >
                <option>전체</option>
                <option>{user?.name || '담당자'}</option>
              </select>
            </div>

            {/* 기간 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">기간</label>
              <input
                type="date"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
                className={inputCls}
              />
              <input
                type="date"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
                className={`${inputCls} mt-1`}
              />
            </div>

            {/* 지역 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">지역</label>
              <select
                value={filterRegion}
                onChange={(e) => setFilterRegion(e.target.value)}
                className={inputCls}
              >
                <option>전체</option>
                <option>국내</option>
                <option>동남아</option>
                <option>일본</option>
                <option>유럽</option>
              </select>
            </div>

            {/* 상태 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">상태</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className={inputCls}
              >
                <option>전체</option>
                <option>상담</option>
                <option>예약</option>
                <option>완료</option>
              </select>
            </div>

            {/* 견적서 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">견적서</label>
              <select
                value={filterEstimate}
                onChange={(e) => setFilterEstimate(e.target.value)}
                className={inputCls}
              >
                <option>전체</option>
                <option value="Y">있음</option>
                <option value="N">없음</option>
              </select>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-[11px] text-gray-600 mb-1">검색</label>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                placeholder="고객명, 연락처"
                className={inputCls}
              />
            </div>

            {/* 조회 버튼 */}
            <button
              onClick={handleFilter}
              className="w-full py-2 bg-[#4a5dd8] text-white text-[12px] font-bold rounded hover:bg-[#3a4dc8] transition-colors"
            >
              조회
            </button>
          </div>
        </div>
      </div>

      {/* ═══════════════ MAIN CONTENT ═══════════════ */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[16px] font-bold text-gray-900">
                home &gt; 고객조회
              </h1>
            </div>
            <div className="flex items-center gap-2 text-[12px]">
              <span className="text-gray-600">오늘의 할일</span>
              <span className="font-bold text-[#ffa726]">0/0</span>
              <span className="text-gray-400 mx-2">|</span>
              <span className="text-gray-600">출간일정자</span>
              <span className="font-bold">{user?.name || 'dgtour-m'}</span>
            </div>
          </div>
        </div>

        <div className="p-4">
          {/* List Mode */}
          {mode === 'list' && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Tabs */}
              <div className="border-b border-gray-200 flex">
                <button className="px-6 py-3 text-[13px] font-medium border-b-2 border-[#ffa726] text-[#ffa726]">
                  회원 정보 검색
                </button>
                <button className="px-6 py-3 text-[13px] font-medium text-gray-500 hover:text-gray-700">
                  회원 검색 대행
                </button>
                <button className="px-6 py-3 text-[13px] font-medium text-gray-500 hover:text-gray-700">
                  회원전환
                </button>
                <button
                  onClick={handleNew}
                  className="ml-auto px-4 py-2 mr-4 my-2 bg-[#4a5dd8] text-white text-[12px] font-medium rounded hover:bg-[#3a4dc8] transition-colors"
                >
                  회원 등록 추가
                </button>
              </div>

              {/* Customer List */}
              <div className="p-4">
                <h3 className="text-[14px] font-bold text-gray-800 mb-3">고객 목록</h3>

                <div className="overflow-x-auto">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">
                          <input type="checkbox" className="rounded" />
                        </th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">번호</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">가족</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">전화번호</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">이메일</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">견적서</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">예약일자</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">고객분류</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">수집경로</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">상담일자</th>
                        <th className="px-3 py-2.5 text-left font-semibold text-gray-600">지역</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-gray-600">수정</th>
                        <th className="px-3 py-2.5 text-center font-semibold text-gray-600">삭제</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loading ? (
                        <tr>
                          <td colSpan={13} className="px-4 py-10 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
                              <span className="text-[12px] text-gray-500">로딩 중...</span>
                            </div>
                          </td>
                        </tr>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan={13} className="px-4 py-10 text-center text-[12px] text-gray-400">
                            등록된 고객이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((customer, idx) => (
                          <tr
                            key={customer.id}
                            className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleView(customer)}
                          >
                            <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                              <input type="checkbox" className="rounded" />
                            </td>
                            <td className="px-3 py-2.5 text-gray-700">{idx + 1}</td>
                            <td className="px-3 py-2.5 text-gray-700">{customer.family || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-700">{customer.phone}</td>
                            <td className="px-3 py-2.5 text-gray-600">{customer.email || '-'}</td>
                            <td className="px-3 py-2.5 text-center">
                              <span className={customer.estimateStatus === 'Y' ? 'text-green-600' : 'text-red-500'}>
                                {customer.estimateStatus}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 text-gray-600">
                              {customer.reservationDate || '-'}
                            </td>
                            <td className="px-3 py-2.5 text-gray-700">{customer.customerType}</td>
                            <td className="px-3 py-2.5 text-gray-600">{customer.source || '-'}</td>
                            <td className="px-3 py-2.5 text-gray-600">{customer.consultDate}</td>
                            <td className="px-3 py-2.5 text-gray-600">{customer.region || '-'}</td>
                            <td
                              className="px-3 py-2.5 text-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleView(customer);
                                handleEdit();
                              }}
                            >
                              <button className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[10px] hover:bg-blue-200">
                                수정
                              </button>
                            </td>
                            <td
                              className="px-3 py-2.5 text-center"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedCustomer(customer);
                                handleDelete();
                              }}
                            >
                              <button className="px-2 py-1 bg-red-100 text-red-700 rounded text-[10px] hover:bg-red-200">
                                삭제
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                <div className="mt-4 flex justify-center">
                  <div className="flex items-center gap-1">
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                      ‹
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded bg-[#4a5dd8] text-white text-[12px] font-medium">
                      1
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px]">
                      2
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 text-[12px]">
                      3
                    </button>
                    <button className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50">
                      ›
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* View/Edit/New Mode */}
          {(mode === 'view' || mode === 'edit' || mode === 'new') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-[16px] font-bold text-gray-900">
                  {mode === 'new' ? '고객 등록' : mode === 'edit' ? '고객 수정' : '고객 상세'}
                </h2>
                <div className="flex gap-2">
                  {mode === 'view' && (
                    <>
                      <button
                        onClick={handleEdit}
                        className="px-4 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700"
                      >
                        수정
                      </button>
                      <button
                        onClick={handleDelete}
                        className="px-4 py-2 bg-red-600 text-white text-[13px] font-medium rounded-lg hover:bg-red-700"
                      >
                        삭제
                      </button>
                    </>
                  )}
                  {(mode === 'edit' || mode === 'new') && (
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="px-4 py-2 bg-[#ffa726] text-white text-[13px] font-medium rounded-lg hover:bg-[#f57c00] disabled:opacity-50"
                    >
                      {loading ? '저장 중...' : '저장'}
                    </button>
                  )}
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-100 text-gray-700 text-[13px] font-medium rounded-lg hover:bg-gray-200"
                  >
                    {mode === 'view' ? '목록' : '취소'}
                  </button>
                </div>
              </div>

              {/* Tabs */}
              {mode !== 'new' && (
                <div className="border-b border-gray-200 flex px-6">
                  <button
                    onClick={() => setActiveTab('info')}
                    className={`px-4 py-3 text-[13px] font-medium border-b-2 ${
                      activeTab === 'info'
                        ? 'border-[#ffa726] text-[#ffa726]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    회원 정보
                  </button>
                  <button
                    onClick={() => setActiveTab('reservations')}
                    className={`px-4 py-3 text-[13px] font-medium border-b-2 ${
                      activeTab === 'reservations'
                        ? 'border-[#ffa726] text-[#ffa726]'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    예약 정보
                  </button>
                </div>
              )}

              {/* Content */}
              <div className="p-6">
                {(mode === 'new' || activeTab === 'info') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      {/* 고객명 */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-2">
                          고객명 *
                        </label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                            {formData.name}
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="고객명"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726]"
                          />
                        )}
                      </div>

                      {/* 연락처 */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-2">
                          연락처 *
                        </label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                            {formData.phone}
                          </div>
                        ) : (
                          <input
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="010-0000-0000"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726]"
                          />
                        )}
                      </div>

                      {/* 이메일 */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-2">
                          이메일
                        </label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                            {formData.email || '-'}
                          </div>
                        ) : (
                          <input
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="email@example.com"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726]"
                          />
                        )}
                      </div>

                      {/* 생년월일 */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-2">
                          생년월일
                        </label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                            {formData.birthDate || '-'}
                          </div>
                        ) : (
                          <input
                            type="date"
                            value={formData.birthDate}
                            onChange={(e) =>
                              setFormData({ ...formData, birthDate: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726]"
                          />
                        )}
                      </div>

                      {/* 고객분류 */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-2">
                          고객분류
                        </label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                            {formData.customerType}
                          </div>
                        ) : (
                          <select
                            value={formData.customerType}
                            onChange={(e) =>
                              setFormData({ ...formData, customerType: e.target.value })
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726]"
                          >
                            <option>여행예약 상담</option>
                            <option>기업 고객</option>
                            <option>개인 고객</option>
                          </select>
                        )}
                      </div>

                      {/* 지역 */}
                      <div>
                        <label className="block text-[13px] font-medium text-gray-700 mb-2">
                          지역
                        </label>
                        {mode === 'view' ? (
                          <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                            {formData.region || '-'}
                          </div>
                        ) : (
                          <select
                            value={formData.region}
                            onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726]"
                          >
                            <option value="">선택</option>
                            <option>국내</option>
                            <option>동남아</option>
                            <option>일본</option>
                            <option>유럽</option>
                          </select>
                        )}
                      </div>
                    </div>

                    {/* 주소 */}
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        주소
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.address || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                          placeholder="주소"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726]"
                        />
                      )}
                    </div>

                    {/* 메모 */}
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        메모
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px] min-h-[100px] whitespace-pre-wrap">
                          {formData.memo || '-'}
                        </div>
                      ) : (
                        <textarea
                          value={formData.memo}
                          onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                          placeholder="메모"
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726] resize-none"
                        />
                      )}
                    </div>
                  </div>
                )}

                {/* 예약 정보 탭 */}
                {mode !== 'new' && activeTab === 'reservations' && (
                  <div className="text-center py-12 text-gray-400">
                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                      <ClipboardDocumentListIcon className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-[14px]">예약 정보가 없습니다</p>
                    <p className="text-[12px] mt-1">
                      고객의 예약 내역이 여기에 표시됩니다
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
