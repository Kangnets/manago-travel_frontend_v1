'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { reservationAPI, agencyProductAPI, travelerAPI } from '@/lib/agencyApi';
import { Reservation, ReservationStatus } from '@/types/reservation';
import { Product } from '@/types/product';
import {
  ClipboardDocumentListIcon,
  PlusIcon,
  PencilIcon,
  CheckIcon,
  XCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  UserIcon,
  DocumentTextIcon,
  MapIcon,
  PaperAirplaneIcon,
  UsersIcon,
  ClipboardIcon,
  BriefcaseIcon,
  HomeIcon,
} from '@heroicons/react/24/outline';

type CRSMode = 'list' | 'new' | 'view' | 'edit';
type RightPanelTab = 'traveler' | 'additional' | 'itinerary' | 'airport';

interface TravelerForm {
  id?: string;
  type: 'adult' | 'child' | 'infant';
  lastName: string;
  firstName: string;
  korName: string;
  birthDate: string;
  gender: 'male' | 'female';
  phone: string;
  passportNo: string;
  passportExpiry: string;
  nationality: string;
}

interface ReservationForm {
  productCode: string;
  productId: string;
  productName: string;
  departureDate: string;
  returnDate: string;
  travelType: 'package' | 'group' | 'individual';
  adultCount: number;
  childCount: number;
  infantCount: number;
  contactName: string;
  contactPhone: string;
  contactEmail: string;
  totalAmount: number;
  paidAmount: number;
  paymentMethod: 'card' | 'cash' | 'transfer' | '';
  status: ReservationStatus;
  memo: string;
  pnr: string;
  incentive: string;
  managerName: string;
}

const emptyForm = (name = ''): ReservationForm => ({
  productCode: '',
  productId: '',
  productName: '',
  departureDate: '',
  returnDate: '',
  travelType: 'package',
  adultCount: 1,
  childCount: 0,
  infantCount: 0,
  contactName: '',
  contactPhone: '',
  contactEmail: '',
  totalAmount: 0,
  paidAmount: 0,
  paymentMethod: '',
  status: 'pending',
  memo: '',
  pnr: '',
  incentive: '',
  managerName: name,
});

const STATUS_LABELS: Record<ReservationStatus, string> = {
  pending: '대기',
  confirmed: '확정',
  cancelled: '취소',
  completed: '완료',
};

const STATUS_COLORS: Record<ReservationStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  confirmed: 'bg-green-100 text-green-800 border-green-200',
  cancelled: 'bg-red-100 text-red-800 border-red-200',
  completed: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function CRSPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<CRSMode>('list');
  const [rightTab, setRightTab] = useState<RightPanelTab>('traveler');
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);
  const [travelers, setTravelers] = useState<TravelerForm[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [form, setForm] = useState<ReservationForm>(emptyForm(user?.name));

  useEffect(() => {
    fetchReservations();
    fetchProducts();
  }, []);

  const fetchReservations = async () => {
    setIsLoading(true);
    try {
      const data = await reservationAPI.getAll({ limit: 100 });
      setReservations(data.data);
    } catch {
      // mock 데이터로 fallback
      setReservations([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const data = await agencyProductAPI.getMyProducts({ limit: 100 });
      setProducts(data.data);
    } catch {
      setProducts([]);
    }
  };

  const handleNewReservation = () => {
    setForm(emptyForm(user?.name));
    setTravelers([]);
    setSelectedReservation(null);
    setMode('new');
    setRightTab('traveler');
    setError('');
  };

  const handleSelectReservation = async (reservation: Reservation) => {
    setSelectedReservation(reservation);
    setForm({
      productCode: reservation.productId,
      productId: reservation.productId,
      productName: reservation.product?.title || '',
      departureDate: reservation.departureDate?.split('T')[0] || '',
      returnDate: reservation.returnDate ? reservation.returnDate.split('T')[0] : '',
      travelType: 'package',
      adultCount: reservation.adultCount,
      childCount: reservation.childCount,
      infantCount: reservation.infantCount,
      contactName: reservation.contactName || '',
      contactPhone: reservation.contactPhone || '',
      contactEmail: reservation.contactEmail || '',
      totalAmount: reservation.totalAmount,
      paidAmount: reservation.paidAmount,
      paymentMethod: '',
      status: reservation.status,
      memo: reservation.memo || '',
      pnr: '',
      incentive: '',
      managerName: user?.name || '',
    });
    try {
      const travelersData = await travelerAPI.getAll(reservation.id);
      setTravelers(
        travelersData.map((t) => ({
          id: t.id,
          type: t.travelerType,
          lastName: t.passportLastName,
          firstName: t.passportFirstName,
          korName: '',
          birthDate: t.birthDate,
          gender: t.gender,
          phone: t.phone || '',
          passportNo: t.passportNumber,
          passportExpiry: t.passportExpiry,
          nationality: t.nationality,
        }))
      );
    } catch {
      setTravelers([]);
    }
    setMode('view');
    setRightTab('traveler');
    setError('');
  };

  const handleProductSelect = (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      setForm((prev) => ({
        ...prev,
        productId: product.id,
        productCode: product.id,
        productName: product.title,
        totalAmount: product.price * prev.adultCount,
      }));
    }
  };

  const handleSave = async () => {
    if (!form.productId || !form.departureDate || !form.contactName || !form.contactPhone) {
      setError('필수 항목을 모두 입력해주세요 (상품, 출발일, 예약자명, 연락처)');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      if (mode === 'new') {
        const reservation = await reservationAPI.create({
          productId: form.productId,
          departureDate: form.departureDate,
          returnDate: form.returnDate || undefined,
          adultCount: form.adultCount,
          childCount: form.childCount,
          infantCount: form.infantCount,
          totalAmount: form.totalAmount,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail || undefined,
          memo: form.memo || undefined,
        });
        for (const t of travelers) {
          if (t.lastName && t.firstName && t.passportNo) {
            await travelerAPI.create(reservation.id, {
              travelerType: t.type,
              passportLastName: t.lastName,
              passportFirstName: t.firstName,
              passportNumber: t.passportNo,
              passportExpiry: t.passportExpiry,
              birthDate: t.birthDate,
              gender: t.gender,
              nationality: t.nationality || 'KR',
              phone: t.phone || undefined,
            });
          }
        }
        setSuccessMessage(`예약이 등록되었습니다. (${reservation.reservationNumber})`);
        await fetchReservations();
        setMode('list');
      } else if (mode === 'edit' && selectedReservation) {
        await reservationAPI.update(selectedReservation.id, {
          status: form.status,
          departureDate: form.departureDate,
          returnDate: form.returnDate || undefined,
          adultCount: form.adultCount,
          childCount: form.childCount,
          infantCount: form.infantCount,
          totalAmount: form.totalAmount,
          paidAmount: form.paidAmount,
          memo: form.memo || undefined,
          contactName: form.contactName,
          contactPhone: form.contactPhone,
          contactEmail: form.contactEmail || undefined,
        });
        setSuccessMessage('예약이 수정되었습니다.');
        await fetchReservations();
        setMode('list');
      }
    } catch (err: unknown) {
      const errObj = err as { response?: { data?: { message?: string } } };
      setError(errObj.response?.data?.message || '저장에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelReservation = async () => {
    if (!selectedReservation || !confirm('예약을 취소하시겠습니까?')) return;
    try {
      await reservationAPI.updateStatus(selectedReservation.id, 'cancelled');
      setSuccessMessage('예약이 취소되었습니다.');
      await fetchReservations();
      setMode('list');
    } catch {
      setError('취소에 실패했습니다.');
    }
  };

  const addTraveler = (type: 'adult' | 'child' | 'infant') => {
    setTravelers((prev) => [
      ...prev,
      { type, lastName: '', firstName: '', korName: '', birthDate: '', gender: 'male', phone: '', passportNo: '', passportExpiry: '', nationality: 'KR' },
    ]);
  };

  const removeTraveler = (index: number) => {
    setTravelers((prev) => prev.filter((_, i) => i !== index));
  };

  const updateTraveler = (index: number, field: keyof TravelerForm, value: string) => {
    setTravelers((prev) => prev.map((t, i) => (i === index ? { ...t, [field]: value } : t)));
  };

  const filteredReservations = reservations.filter((r) => {
    const matchesSearch =
      !searchQuery ||
      r.reservationNumber?.includes(searchQuery) ||
      r.contactName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.product?.title?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isEditable = mode === 'new' || mode === 'edit';

  const inputCls = (disabled: boolean) =>
    `px-2 py-1 border rounded text-[12px] focus:outline-none focus:border-[#ffa726] transition-colors ${
      disabled ? 'bg-gray-50 border-gray-200 text-gray-600 cursor-default' : 'border-gray-300 bg-white'
    }`;

  return (
    <div className="min-h-screen bg-[#f0f2f5] -m-8">
      {/* ───────────── TOP TOOLBAR ───────────── */}
      <div className="bg-[#1a1a2e] text-white shadow-lg">
        {/* Agency info bar */}
        <div className="px-4 py-1.5 flex items-center gap-3 border-b border-white/10 text-[11px] bg-[#0f0f1a]">
          <span className="text-[#ffa726] font-bold tracking-wide">◆ MANGO CRS</span>
          <span className="text-white/30">│</span>
          <span className="text-white/80">{user?.agencyName || user?.name}</span>
          <span className="text-white/30">│</span>
          <span className="text-white/60">담당: {user?.name}</span>
          <span className="text-white/30">│</span>
          <span className="text-white/60">
            {new Date().toLocaleDateString('ko-KR')} {new Date().toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
          </span>
          <div className="flex-1" />
          <span className="text-green-400">● 연결됨</span>
        </div>

        {/* Action button bar */}
        <div className="px-3 py-2 flex items-center gap-1 flex-wrap">
          <button
            onClick={() => { setMode('list'); setError(''); setSuccessMessage(''); }}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded border transition-all ${
              mode === 'list' ? 'bg-[#ffa726] border-[#ffa726] text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
            }`}
          >
            <ClipboardDocumentListIcon className="w-4 h-4" />
            전체 예약조회
          </button>
          <button
            onClick={handleNewReservation}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded border transition-all ${
              mode === 'new' ? 'bg-[#ffa726] border-[#ffa726] text-white' : 'bg-white/10 border-white/20 text-white/80 hover:bg-white/20'
            }`}
          >
            <PlusIcon className="w-4 h-4" />
            신규 예약
          </button>

          {(mode === 'view' || mode === 'edit') && (
            <>
              <div className="w-px h-5 bg-white/20 mx-1" />
              {mode === 'view' && (
                <button
                  onClick={() => setMode('edit')}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded border bg-blue-600/50 border-blue-400/50 text-blue-200 hover:bg-blue-700/70"
                >
                  <PencilIcon className="w-4 h-4" />
                  수정
                </button>
              )}
              {mode === 'edit' && (
                <button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded border bg-green-600/50 border-green-400/50 text-green-200 hover:bg-green-700/70 disabled:opacity-50"
                >
                  <CheckIcon className="w-4 h-4" />
                  저장
                </button>
              )}
              <button
                onClick={handleCancelReservation}
                className="flex items-center gap-1.5 px-3 py-1.5 text-[12px] font-medium rounded border bg-red-900/50 border-red-500/50 text-red-200 hover:bg-red-900/80"
              >
                <XCircleIcon className="w-4 h-4" />
                예약취소
              </button>
              <button
                onClick={() => setMode('list')}
                className="px-3 py-1.5 text-[12px] font-medium rounded border bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
              >
                ← 목록
              </button>
            </>
          )}

          <div className="flex-1" />

          {mode === 'list' && (
            <div className="flex items-center gap-2">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-2 py-1.5 text-[11px] bg-white/10 border border-white/20 rounded text-white focus:outline-none focus:border-[#ffa726]"
              >
                <option value="all">전체 상태</option>
                <option value="pending">대기</option>
                <option value="confirmed">확정</option>
                <option value="cancelled">취소</option>
                <option value="completed">완료</option>
              </select>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="예약번호 / 예약자 / 상품명"
                className="px-3 py-1.5 text-[12px] bg-white/10 border border-white/20 rounded text-white placeholder-white/40 w-52 focus:outline-none focus:border-[#ffa726]"
              />
              <button
                onClick={fetchReservations}
                className="px-2.5 py-1.5 text-[12px] font-medium rounded border bg-white/10 border-white/20 text-white/80 hover:bg-white/20"
              >
                <ArrowPathIcon className="w-4 h-4" />
              </button>
            </div>
          )}

          {mode === 'new' && (
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 bg-[#ffa726] text-white text-[12px] font-bold rounded hover:bg-[#f57c00] disabled:opacity-50 transition-colors"
              >
                {isLoading ? '저장 중...' : <><CheckIcon className="w-4 h-4" /> 예약 저장</>}
              </button>
              <button
                onClick={() => setMode('list')}
                className="px-3 py-1.5 bg-white/10 text-white/80 text-[12px] rounded border border-white/20 hover:bg-white/20"
              >
                취소
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ───────────── MESSAGES ───────────── */}
      {error && (
        <div className="mx-4 mt-2 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-red-700 text-[13px] flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2"><ExclamationTriangleIcon className="w-4 h-4" /> {error}</span>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 ml-3">
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>
      )}
      {successMessage && (
        <div className="mx-4 mt-2 px-4 py-2.5 bg-green-50 border border-green-200 rounded-lg text-green-700 text-[13px] flex items-center justify-between shadow-sm">
          <span className="flex items-center gap-2"><CheckCircleIcon className="w-4 h-4" /> {successMessage}</span>
          <button onClick={() => setSuccessMessage('')} className="text-green-400 hover:text-green-600 ml-3">
            <XCircleIcon className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ───────────── LIST MODE ───────────── */}
      {mode === 'list' && (
        <div className="p-4">
          {/* Summary Stats */}
          <div className="grid grid-cols-4 gap-3 mb-4">
            {[
              { label: '전체', count: reservations.length, color: 'bg-white', text: 'text-gray-900', border: 'border-gray-200' },
              { label: '대기', count: reservations.filter((r) => r.status === 'pending').length, color: 'bg-yellow-50', text: 'text-yellow-800', border: 'border-yellow-200' },
              { label: '확정', count: reservations.filter((r) => r.status === 'confirmed').length, color: 'bg-green-50', text: 'text-green-800', border: 'border-green-200' },
              { label: '취소', count: reservations.filter((r) => r.status === 'cancelled').length, color: 'bg-red-50', text: 'text-red-800', border: 'border-red-200' },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.color} border ${stat.border} rounded-lg p-3 text-center shadow-sm`}>
                <div className={`text-[22px] font-bold ${stat.text}`}>{stat.count}</div>
                <div className={`text-[11px] ${stat.text} opacity-70`}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Reservation Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between bg-gray-50">
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-bold text-gray-900">예약 목록</span>
                <span className="text-[12px] text-gray-500">({filteredReservations.length}건)</span>
              </div>
              <button
                onClick={handleNewReservation}
                className="px-4 py-2 bg-[#ffa726] text-white text-[13px] font-bold rounded-lg hover:bg-[#f57c00] transition-colors shadow-sm"
              >
                + 신규 예약 등록
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-[#1a1a2e] text-white text-[11px]">
                    {['예약번호', '상품명', '예약자', '연락처', '출발일', '귀국일', '인원', '총금액', '입금', '상태', '조회'].map((h) => (
                      <th key={h} className="px-3 py-2.5 text-left font-medium whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-10 text-center text-gray-500">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[13px]">로딩 중...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredReservations.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="px-4 py-12 text-center">
                        <div className="text-gray-400">
                          <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                            <ClipboardDocumentListIcon className="w-6 h-6 text-gray-300" />
                          </div>
                          <div className="text-[13px]">예약 내역이 없습니다</div>
                          <button onClick={handleNewReservation} className="mt-3 px-4 py-2 bg-[#ffa726] text-white text-[12px] rounded-lg font-medium">
                            첫 예약 등록하기
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredReservations.map((reservation, i) => (
                      <tr
                        key={reservation.id}
                        className={`border-b border-gray-100 hover:bg-orange-50/50 cursor-pointer transition-colors text-[12px] ${
                          i % 2 === 0 ? 'bg-white' : 'bg-gray-50/30'
                        }`}
                        onClick={() => handleSelectReservation(reservation)}
                      >
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-[#ffa726] font-bold text-[11px]">{reservation.reservationNumber}</span>
                        </td>
                        <td className="px-3 py-2.5 max-w-[180px]">
                          <span className="truncate block">{reservation.product?.title || '-'}</span>
                        </td>
                        <td className="px-3 py-2.5 font-medium">{reservation.contactName || '-'}</td>
                        <td className="px-3 py-2.5 text-gray-600">{reservation.contactPhone || '-'}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap">{new Date(reservation.departureDate).toLocaleDateString('ko-KR')}</td>
                        <td className="px-3 py-2.5 whitespace-nowrap text-gray-500">
                          {reservation.returnDate ? new Date(reservation.returnDate).toLocaleDateString('ko-KR') : '-'}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {reservation.adultCount}성/{reservation.childCount}아/{reservation.infantCount}유
                        </td>
                        <td className="px-3 py-2.5 font-medium">₩{reservation.totalAmount.toLocaleString()}</td>
                        <td className="px-3 py-2.5">
                          <span className={reservation.paidAmount >= reservation.totalAmount ? 'text-green-600' : 'text-red-500'}>
                            ₩{reservation.paidAmount.toLocaleString()}
                          </span>
                        </td>
                        <td className="px-3 py-2.5">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${STATUS_COLORS[reservation.status]}`}>
                            {STATUS_LABELS[reservation.status]}
                          </span>
                        </td>
                        <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => handleSelectReservation(reservation)}
                            className="px-2 py-1 bg-[#1a1a2e] text-white text-[10px] rounded hover:bg-[#2d2d4e] transition-colors"
                          >
                            조회
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ───────────── FORM MODE (new / view / edit) ───────────── */}
      {(mode === 'new' || mode === 'view' || mode === 'edit') && (
        <div className="p-4 space-y-3">
          {/* Reservation header bar */}
          <div className="bg-white rounded-xl border border-gray-200 shadow-sm px-4 py-2.5 flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-500 font-medium">예약번호</span>
              <span className="font-mono font-bold text-[#ffa726] text-[15px] tracking-wide">
                {mode === 'new' ? '신규 등록' : selectedReservation?.reservationNumber}
              </span>
            </div>
            {mode !== 'new' && (
              <>
                <div className="w-px h-4 bg-gray-200" />
                <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${STATUS_COLORS[form.status]}`}>
                  {STATUS_LABELS[form.status]}
                </span>
                <div className="w-px h-4 bg-gray-200" />
                <span className="text-[11px] text-gray-500">
                  등록: {selectedReservation ? new Date(selectedReservation.createdAt).toLocaleDateString('ko-KR') : ''}
                </span>
              </>
            )}
            <div className="flex-1" />
            <div className="flex items-center gap-1 text-[11px] text-gray-500">
              <span>담당:</span>
              <span className="font-medium text-gray-700">{form.managerName || user?.name}</span>
            </div>
          </div>

          {/* Main panel: Left form + Right tabs */}
          <div className="flex gap-3 items-start">
            {/* ── Left: Reservation Form ── */}
            <div className="w-[52%] space-y-3">
              {/* Product Info */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#1a1a2e] px-4 py-2">
                  <span className="text-[12px] font-bold text-[#ffa726]">◆ 상품 정보</span>
                </div>
                <div className="p-3 space-y-2.5">
                  {isEditable && (
                    <div className="flex items-center gap-2">
                      <label className="text-[11px] text-gray-500 w-16 shrink-0 font-medium">상품 선택</label>
                      <select
                        value={form.productId}
                        onChange={(e) => handleProductSelect(e.target.value)}
                        className="flex-1 px-2 py-1.5 border border-gray-300 rounded-lg text-[12px] focus:outline-none focus:border-[#ffa726] bg-white"
                      >
                        <option value="">상품을 선택하세요</option>
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.title} — ₩{p.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-16 shrink-0 font-medium">상품명</label>
                    <input
                      value={form.productName}
                      readOnly
                      className="flex-1 px-2 py-1.5 border border-gray-200 rounded-lg text-[12px] bg-gray-50 text-gray-700 font-medium"
                      placeholder="상품 선택 후 자동 입력"
                    />
                  </div>
                </div>
              </div>

              {/* Travel Info */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#1a1a2e] px-4 py-2">
                  <span className="text-[12px] font-bold text-[#ffa726]">◆ 여행 정보</span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">출발일 *</label>
                    <input
                      type="date"
                      value={form.departureDate}
                      onChange={(e) => setForm((p) => ({ ...p, departureDate: e.target.value }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">귀국일</label>
                    <input
                      type="date"
                      value={form.returnDate}
                      onChange={(e) => setForm((p) => ({ ...p, returnDate: e.target.value }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">여행종류</label>
                    <select
                      value={form.travelType}
                      onChange={(e) => setForm((p) => ({ ...p, travelType: e.target.value as ReservationForm['travelType'] }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                    >
                      <option value="package">패키지</option>
                      <option value="group">단체</option>
                      <option value="individual">개별</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">상태</label>
                    <select
                      value={form.status}
                      onChange={(e) => setForm((p) => ({ ...p, status: e.target.value as ReservationStatus }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                    >
                      <option value="pending">대기</option>
                      <option value="confirmed">확정</option>
                      <option value="cancelled">취소</option>
                      <option value="completed">완료</option>
                    </select>
                  </div>

                  {/* Counts spanning full width */}
                  <div className="col-span-2 flex items-center gap-4">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">인원</label>
                    <div className="flex items-center gap-4">
                      {[
                        { key: 'adultCount' as const, label: '성인' },
                        { key: 'childCount' as const, label: '아동' },
                        { key: 'infantCount' as const, label: '유아' },
                      ].map(({ key, label }) => (
                        <div key={key} className="flex items-center gap-1">
                          <span className="text-[11px] text-gray-500">{label}</span>
                          <input
                            type="number"
                            value={form[key]}
                            onChange={(e) => setForm((p) => ({ ...p, [key]: parseInt(e.target.value) || 0 }))}
                            disabled={!isEditable}
                            min="0"
                            className={`w-12 text-center ${inputCls(!isEditable)}`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#1a1a2e] px-4 py-2">
                  <span className="text-[12px] font-bold text-[#ffa726]">◆ 예약자 정보</span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">예약자명 *</label>
                    <input
                      type="text"
                      value={form.contactName}
                      onChange={(e) => setForm((p) => ({ ...p, contactName: e.target.value }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                      placeholder="홍길동"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">연락처 *</label>
                    <input
                      type="tel"
                      value={form.contactPhone}
                      onChange={(e) => setForm((p) => ({ ...p, contactPhone: e.target.value }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                      placeholder="010-0000-0000"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">이메일</label>
                    <input
                      type="email"
                      value={form.contactEmail}
                      onChange={(e) => setForm((p) => ({ ...p, contactEmail: e.target.value }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                      placeholder="email@example.com"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Info */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#1a1a2e] px-4 py-2">
                  <span className="text-[12px] font-bold text-[#ffa726]">◆ 결제 정보</span>
                </div>
                <div className="p-3 grid grid-cols-2 gap-2.5">
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">결제방법</label>
                    <select
                      value={form.paymentMethod}
                      onChange={(e) => setForm((p) => ({ ...p, paymentMethod: e.target.value as ReservationForm['paymentMethod'] }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                    >
                      <option value="">선택</option>
                      <option value="card">카드</option>
                      <option value="cash">현금</option>
                      <option value="transfer">무통장 입금</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">총금액</label>
                    <input
                      type="number"
                      value={form.totalAmount}
                      onChange={(e) => setForm((p) => ({ ...p, totalAmount: parseInt(e.target.value) || 0 }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">입금액</label>
                    <input
                      type="number"
                      value={form.paidAmount}
                      onChange={(e) => setForm((p) => ({ ...p, paidAmount: parseInt(e.target.value) || 0 }))}
                      disabled={!isEditable}
                      className={`flex-1 ${inputCls(!isEditable)}`}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-[11px] text-gray-500 w-14 shrink-0 font-medium">미수금</label>
                    <div className={`flex-1 px-2 py-1.5 rounded-lg text-[12px] font-bold border ${
                      form.totalAmount - form.paidAmount > 0
                        ? 'text-red-600 bg-red-50 border-red-200'
                        : 'text-green-600 bg-green-50 border-green-200'
                    }`}>
                      ₩{(form.totalAmount - form.paidAmount).toLocaleString()}
                      {form.totalAmount - form.paidAmount <= 0 && ' (완납)'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Memo */}
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="bg-[#1a1a2e] px-4 py-2">
                  <span className="text-[12px] font-bold text-[#ffa726]">◆ 비고</span>
                </div>
                <div className="p-3">
                  <textarea
                    value={form.memo}
                    onChange={(e) => setForm((p) => ({ ...p, memo: e.target.value }))}
                    disabled={!isEditable}
                    rows={2}
                    className={`w-full ${inputCls(!isEditable)} resize-none`}
                    placeholder="예약 관련 메모 입력"
                  />
                </div>
              </div>
            </div>

            {/* ── Right: Tabbed Panel ── */}
            <div className="flex-1 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Tab headers */}
              <div className="flex border-b border-gray-200 bg-gray-50">
                {[
                  { key: 'traveler' as RightPanelTab, label: '여행자 정보', icon: UserIcon },
                  { key: 'additional' as RightPanelTab, label: '부가 정보', icon: DocumentTextIcon },
                  { key: 'itinerary' as RightPanelTab, label: '일정표', icon: MapIcon },
                  { key: 'airport' as RightPanelTab, label: '공항 안내', icon: PaperAirplaneIcon },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setRightTab(tab.key)}
                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 text-[12px] font-medium border-b-2 transition-all ${
                      rightTab === tab.key
                        ? 'border-[#ffa726] text-[#ffa726] bg-white'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-white/60'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Tab content */}
              <div className="p-4">
                {/* ── TRAVELER TAB ── */}
                {rightTab === 'traveler' && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-bold text-gray-800">
                        승객 목록 ({travelers.length}명)
                      </span>
                      {isEditable && (
                        <div className="flex gap-1">
                          {[
                            { type: 'adult' as const, label: '성인', color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                            { type: 'child' as const, label: '아동', color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                            { type: 'infant' as const, label: '유아', color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
                          ].map(({ type, label, color }) => (
                            <button
                              key={type}
                              onClick={() => addTraveler(type)}
                              className={`px-2.5 py-1 text-[11px] font-medium rounded ${color} transition-colors`}
                            >
                              + {label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>

                    {travelers.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-[12px]">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <UsersIcon className="w-6 h-6 text-gray-300" />
                        </div>
                        <p>승객 정보가 없습니다</p>
                        {isEditable && <p className="mt-1 text-[11px]">위의 버튼으로 승객을 추가하세요</p>}
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
                        {travelers.map((t, idx) => (
                          <div key={idx} className="border border-gray-200 rounded-lg p-3 bg-gray-50/50">
                            <div className="flex items-center justify-between mb-2.5">
                              <div className="flex items-center gap-2">
                                <span className="w-6 h-6 rounded-full bg-[#1a1a2e] text-white text-[10px] font-bold flex items-center justify-center">
                                  {idx + 1}
                                </span>
                                <span
                                  className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                    t.type === 'adult' ? 'bg-blue-100 text-blue-700' : t.type === 'child' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  {t.type === 'adult' ? '성인' : t.type === 'child' ? '아동' : '유아'}
                                </span>
                                {t.lastName && (
                                  <span className="text-[11px] font-bold text-gray-700 font-mono">
                                    {t.lastName}/{t.firstName}
                                  </span>
                                )}
                              </div>
                              {isEditable && (
                                <button onClick={() => removeTraveler(idx)} className="text-red-400 hover:text-red-600 text-[12px]">
                                  ✕
                                </button>
                              )}
                            </div>
                            <div className="grid grid-cols-2 gap-1.5">
                              {[
                                { field: 'lastName' as const, label: '영문성', ph: 'HONG' },
                                { field: 'firstName' as const, label: '영문명', ph: 'GILDONG' },
                                { field: 'birthDate' as const, label: '생년월일', type: 'date', ph: '' },
                                { field: 'passportNo' as const, label: '여권번호', ph: 'M12345678' },
                                { field: 'passportExpiry' as const, label: '만료일', type: 'date', ph: '' },
                                { field: 'phone' as const, label: 'HP', ph: '010-0000-0000' },
                              ].map(({ field, label, type, ph }) => (
                                <div key={field} className="flex items-center gap-1">
                                  <label className="text-[10px] text-gray-500 w-14 shrink-0">{label}</label>
                                  <input
                                    type={type || 'text'}
                                    value={t[field]}
                                    onChange={(e) => updateTraveler(idx, field, e.target.value)}
                                    disabled={!isEditable}
                                    placeholder={ph}
                                    className={`flex-1 px-1.5 py-1 border rounded text-[11px] focus:outline-none focus:border-[#ffa726] ${
                                      !isEditable ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                                    } ${field === 'lastName' || field === 'firstName' || field === 'passportNo' ? 'font-mono uppercase' : ''}`}
                                  />
                                </div>
                              ))}
                              <div className="flex items-center gap-1">
                                <label className="text-[10px] text-gray-500 w-14 shrink-0">성별</label>
                                <select
                                  value={t.gender}
                                  onChange={(e) => updateTraveler(idx, 'gender', e.target.value)}
                                  disabled={!isEditable}
                                  className={`flex-1 px-1.5 py-1 border rounded text-[11px] focus:outline-none focus:border-[#ffa726] ${
                                    !isEditable ? 'bg-gray-50 border-gray-200' : 'border-gray-300'
                                  }`}
                                >
                                  <option value="male">남 (M)</option>
                                  <option value="female">여 (F)</option>
                                </select>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* ── ADDITIONAL TAB ── */}
                {rightTab === 'additional' && (
                  <div className="space-y-4">
                    <h3 className="text-[13px] font-bold text-gray-800">부가 정보</h3>
                    <div className="space-y-2.5">
                      {[
                        { field: 'pnr' as const, label: 'PNR', ph: '항공 PNR 코드 (예: ABC123)' },
                        { field: 'managerName' as const, label: '담당자', ph: '' },
                        { field: 'incentive' as const, label: '인센티브', ph: '인센티브 조건' },
                      ].map(({ field, label, ph }) => (
                        <div key={field} className="flex items-center gap-2">
                          <label className="text-[11px] text-gray-500 w-20 shrink-0 font-medium">{label}</label>
                          <input
                            type="text"
                            value={form[field]}
                            onChange={(e) => setForm((p) => ({ ...p, [field]: e.target.value }))}
                            disabled={!isEditable}
                            placeholder={ph}
                            className={`flex-1 ${inputCls(!isEditable)}`}
                          />
                        </div>
                      ))}
                    </div>

                    <div className="p-3 bg-blue-50 rounded-lg border border-blue-100 mt-4">
                      <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-blue-800 mb-2">
                        <ClipboardIcon className="w-4 h-4" />
                        비자 / ESTA 안내
                      </h4>
                      <div className="space-y-1 text-[11px] text-blue-700">
                        <p>• 미국 방문 시 ESTA 신청 필요 (출발 72시간 전까지)</p>
                        <p>• 비자 발급 소요시간: 국가별 상이 (최소 2주 권고)</p>
                        <p>• 여권 유효기간: 출발일 기준 6개월 이상 필요</p>
                        <p>• 여권 내 서명란 서명 필수</p>
                      </div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                      <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-yellow-800 mb-2">
                        <ExclamationTriangleIcon className="w-4 h-4" />
                        예약 주의사항
                      </h4>
                      <div className="space-y-1 text-[11px] text-yellow-700">
                        <p>• 이름 변경 시 항공사 수수료 발생</p>
                        <p>• 취소 시 상품별 취소수수료 정책 적용</p>
                        <p>• 출발 30일 전 최종 인원 확정 필요</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── ITINERARY TAB ── */}
                {rightTab === 'itinerary' && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-gray-800">여행 일정표</h3>
                    {form.productId ? (
                      <div className="relative">
                        <div className="absolute left-3.5 top-0 bottom-0 w-0.5 bg-gray-200" />
                        {[
                          { day: 1, title: '인천 출발 → 현지 도착', desc: '인천국제공항 집결 및 출국 / 현지 공항 도착 후 호텔 이동', highlight: true },
                          { day: 2, title: '현지 주요 관광지 투어', desc: '오전: 시내 관광 / 오후: 문화 체험 / 저녁: 현지 식사' },
                          { day: 3, title: '자유 일정', desc: '선택 관광 또는 자유 시간 / 쇼핑 안내' },
                          { day: 4, title: '귀국', desc: '공항 이동 및 탑승 수속 / 인천국제공항 도착' },
                        ].map((d) => (
                          <div key={d.day} className="flex gap-4 pb-4 last:pb-0">
                            <div
                              className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 z-10 ${
                                d.highlight ? 'bg-[#ffa726] text-white' : 'bg-gray-200 text-gray-600'
                              }`}
                            >
                              {d.day}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <p className="text-[12px] font-semibold text-gray-800">{d.title}</p>
                              <p className="text-[11px] text-gray-500 mt-0.5">{d.desc}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400 text-[12px]">
                        <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                          <MapIcon className="w-6 h-6 text-gray-300" />
                        </div>
                        <p>상품을 선택하면 일정이 표시됩니다</p>
                      </div>
                    )}
                  </div>
                )}

                {/* ── AIRPORT TAB ── */}
                {rightTab === 'airport' && (
                  <div className="space-y-3">
                    <h3 className="text-[13px] font-bold text-gray-800">공항 안내</h3>
                    <div className="space-y-2.5">
                      <div className="p-3 bg-orange-50 rounded-lg border border-orange-100">
                        <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-orange-800 mb-2">
                          <PaperAirplaneIcon className="w-4 h-4" />
                          출발 안내
                        </h4>
                        <div className="space-y-1 text-[11px] text-orange-700">
                          <p>• 체크인 마감: 출발 3시간 전</p>
                          <p>• 인천공항 T1: 3층 출국장 F카운터</p>
                          <p>• 집결 장소: 인솔자 배너 확인</p>
                          <p>• 여권 지참 필수</p>
                        </div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                        <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-green-800 mb-2">
                          <BriefcaseIcon className="w-4 h-4" />
                          수하물 규정
                        </h4>
                        <div className="space-y-1 text-[11px] text-green-700">
                          <p>• 위탁수하물: 1인 23kg × 1개</p>
                          <p>• 기내수하물: 10kg × 1개 (55×40×20cm 이내)</p>
                          <p>• 액체류: 100ml 이하, 투명 지퍼백 1개</p>
                          <p>• 라이터: 기내 반입 1개 허용 (위탁 불가)</p>
                        </div>
                      </div>
                      <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                        <h4 className="flex items-center gap-1.5 text-[12px] font-bold text-blue-800 mb-2">
                          <HomeIcon className="w-4 h-4" />
                          귀국 안내
                        </h4>
                        <div className="space-y-1 text-[11px] text-blue-700">
                          <p>• 세관 신고: 면세 한도 600달러</p>
                          <p>• 농산물 반입 금지</p>
                          <p>• 주류: 1L 이하, 1병 허용</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Passenger Summary Table (bottom) ── */}
          {travelers.length > 0 && (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              <div className="px-4 py-2.5 bg-[#1a1a2e] flex items-center justify-between">
                <span className="text-[12px] font-bold text-[#ffa726]">◆ 승객 명단 ({travelers.length}명)</span>
                <div className="flex gap-3 text-[11px]">
                  <span className="text-blue-300">성인 {travelers.filter((t) => t.type === 'adult').length}명</span>
                  <span className="text-green-300">아동 {travelers.filter((t) => t.type === 'child').length}명</span>
                  <span className="text-purple-300">유아 {travelers.filter((t) => t.type === 'infant').length}명</span>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-[11px]">
                  <thead>
                    <tr className="bg-gray-50">
                      {['No', '구분', '영문성', '영문명', '생년월일', '성별', 'HP', '여권번호', '만료일'].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-gray-600 border-b border-r border-gray-200 whitespace-nowrap last:border-r-0">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {travelers.map((t, i) => (
                      <tr key={i} className={`border-b border-gray-100 ${i % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}>
                        <td className="px-3 py-2 border-r border-gray-100 font-bold text-gray-700">{i + 1}</td>
                        <td className="px-3 py-2 border-r border-gray-100">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                            t.type === 'adult' ? 'bg-blue-100 text-blue-700' : t.type === 'child' ? 'bg-green-100 text-green-700' : 'bg-purple-100 text-purple-700'
                          }`}>
                            {t.type === 'adult' ? '성인' : t.type === 'child' ? '아동' : '유아'}
                          </span>
                        </td>
                        <td className="px-3 py-2 border-r border-gray-100 font-mono font-bold text-gray-800 uppercase">{t.lastName || '-'}</td>
                        <td className="px-3 py-2 border-r border-gray-100 font-mono uppercase">{t.firstName || '-'}</td>
                        <td className="px-3 py-2 border-r border-gray-100 tabular-nums">{t.birthDate || '-'}</td>
                        <td className="px-3 py-2 border-r border-gray-100 font-medium">{t.gender === 'male' ? 'M' : 'F'}</td>
                        <td className="px-3 py-2 border-r border-gray-100 tabular-nums">{t.phone || '-'}</td>
                        <td className="px-3 py-2 border-r border-gray-100 font-mono font-bold">{t.passportNo || '-'}</td>
                        <td className="px-3 py-2 tabular-nums">{t.passportExpiry || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
