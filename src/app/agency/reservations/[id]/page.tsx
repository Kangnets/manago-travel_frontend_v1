'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { reservationAPI, travelerAPI, agencyProductAPI } from '@/lib/agencyApi';
import { Reservation, Traveler, ReservationStatus } from '@/types/reservation';
import { Product } from '@/types/product';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import {
  CubeIcon,
  PencilSquareIcon,
  PhoneIcon,
  UsersIcon,
  ChartBarIcon,
  IdentificationIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import PassportOCR from '@/components/PassportOCR/PassportOCR';
import { PassportData } from '@/types/passport';

export default function ReservationDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { adminLanguage } = useAdminLanguage();
  const tr = (ko: string, en: string) => (adminLanguage === 'en' ? en : ko);

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [product, setProduct] = useState<Product | null>(null);
  const [travelers, setTravelers] = useState<Traveler[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // 모달 상태
  const [showTravelerModal, setShowTravelerModal] = useState(false);
  const [editingTraveler, setEditingTraveler] = useState<Traveler | null>(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showPassportScanner, setShowPassportScanner] = useState(false);

  // 예약 기본 정보 수정
  const [formData, setFormData] = useState({
    departureDate: '',
    returnDate: '',
    adultCount: '1',
    childCount: '0',
    infantCount: '0',
    totalAmount: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    memo: '',
  });

  // 여행자 폼
  const [travelerForm, setTravelerForm] = useState({
    travelerType: 'adult' as 'adult' | 'child' | 'infant',
    passportLastName: '',
    passportFirstName: '',
    koreanName: '',
    dateOfBirth: '',
    gender: 'male' as 'male' | 'female',
    passportNumber: '',
    passportExpiry: '',
    passportIssueDate: '',
    nationality: 'KR',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchReservation();
  }, [id]);

  const fetchReservation = async () => {
    try {
      setIsLoading(true);
      const data = await reservationAPI.getById(id);
      setReservation(data);
      setTravelers(data.travelers || []);

      // 폼 데이터 채우기
      setFormData({
        departureDate: data.departureDate.toString().split('T')[0],
        returnDate: data.returnDate ? data.returnDate.toString().split('T')[0] : '',
        adultCount: data.adultCount.toString(),
        childCount: data.childCount.toString(),
        infantCount: data.infantCount.toString(),
        totalAmount: data.totalAmount.toString(),
        contactName: data.contactName || '',
        contactPhone: data.contactPhone || '',
        contactEmail: data.contactEmail || '',
        memo: data.memo || '',
      });

      // 상품 정보 가져오기
      if (data.product) {
        setProduct(data.product as any);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || tr('예약 정보를 불러오는데 실패했습니다', 'Failed to load reservation'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      await reservationAPI.update(id, {
        departureDate: formData.departureDate,
        returnDate: formData.returnDate || undefined,
        adultCount: parseInt(formData.adultCount),
        childCount: parseInt(formData.childCount),
        infantCount: parseInt(formData.infantCount),
        totalAmount: parseFloat(formData.totalAmount),
        contactName: formData.contactName,
        contactPhone: formData.contactPhone,
        contactEmail: formData.contactEmail,
        memo: formData.memo,
      });
      setSuccessMessage(tr('예약 정보가 수정되었습니다', 'Reservation updated successfully'));
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || tr('예약 수정에 실패했습니다', 'Failed to update reservation'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    try {
      await reservationAPI.updateStatus(id, newStatus);
      setSuccessMessage(tr('예약 상태가 변경되었습니다', 'Reservation status updated'));
      setShowStatusModal(false);
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || tr('상태 변경에 실패했습니다', 'Failed to update status'));
    }
  };

  const handleAddTraveler = () => {
    setEditingTraveler(null);
    setTravelerForm({
      travelerType: 'adult',
      passportLastName: '',
      passportFirstName: '',
      koreanName: '',
      dateOfBirth: '',
      gender: 'male',
      passportNumber: '',
      passportExpiry: '',
      passportIssueDate: '',
      nationality: 'KR',
      phone: '',
      email: '',
    });
    setShowTravelerModal(true);
  };

  const handlePassportScanned = (data: PassportData) => {
    setTravelerForm((prev) => ({
      ...prev,
      passportLastName: data.surname || prev.passportLastName,
      passportFirstName: data.givenNames || prev.passportFirstName,
      passportNumber: data.passportNumber || prev.passportNumber,
      nationality: data.nationality || prev.nationality,
      dateOfBirth: data.dateOfBirth || prev.dateOfBirth,
      gender: data.sex === 'M' ? 'male' : data.sex === 'F' ? 'female' : prev.gender,
      passportExpiry: data.expiryDate || prev.passportExpiry,
      koreanName: data.koreanName || prev.koreanName,
    }));
    setShowPassportScanner(false);
  };

  const handleEditTraveler = (traveler: Traveler) => {
    setEditingTraveler(traveler);
    setTravelerForm({
      travelerType: traveler.travelerType,
      passportLastName: traveler.passportLastName,
      passportFirstName: traveler.passportFirstName,
      koreanName: traveler.koreanName || '',
      dateOfBirth: (traveler.dateOfBirth || traveler.birthDate || '').toString().split('T')[0],
      gender: traveler.gender,
      passportNumber: traveler.passportNumber || '',
      passportExpiry: traveler.passportExpiry ? traveler.passportExpiry.toString().split('T')[0] : '',
      passportIssueDate: traveler.passportIssueDate ? traveler.passportIssueDate.toString().split('T')[0] : '',
      nationality: traveler.nationality || 'KR',
      phone: traveler.phone || '',
      email: traveler.email || '',
    });
    setShowTravelerModal(true);
  };

  const handleSaveTraveler = async () => {
    try {
      if (editingTraveler) {
        await travelerAPI.update(id, editingTraveler.id, travelerForm);
        setSuccessMessage(tr('여행자 정보가 수정되었습니다', 'Traveler updated'));
      } else {
        await travelerAPI.create(id, travelerForm);
        setSuccessMessage(tr('여행자가 추가되었습니다', 'Traveler added'));
      }
      setShowTravelerModal(false);
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || tr('여행자 정보 저장에 실패했습니다', 'Failed to save traveler'));
    }
  };

  const handleDeleteTraveler = async (travelerId: string) => {
    if (!confirm(tr('이 여행자를 삭제하시겠습니까?', 'Delete this traveler?'))) return;
    try {
      await travelerAPI.delete(id, travelerId);
      setSuccessMessage(tr('여행자가 삭제되었습니다', 'Traveler deleted'));
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || tr('여행자 삭제에 실패했습니다', 'Failed to delete traveler'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffa726]"></div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {tr('예약을 찾을 수 없습니다.', 'Reservation not found.')}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/agency/reservations"
            className="text-sm text-gray-500 hover:text-gray-700 mb-2 inline-block"
          >
            ← {tr('예약 목록', 'Reservations')}
          </Link>
          <h1 className="text-2xl font-bold">{tr('예약 상세 및 수정', 'Reservation Details & Edit')}</h1>
          <p className="text-sm text-gray-500 mt-1">{tr('예약번호', 'Reservation No.')}: {reservation.reservationNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={reservation.status} type="reservation" lang={adminLanguage} />
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            {tr('상태 변경', 'Change Status')}
          </button>
        </div>
      </div>

      {/* 메시지 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
          {error}
        </div>
      )}
      {successMessage && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-green-700">
          {successMessage}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 왼쪽: 예약 정보 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 상품 정보 */}
          {product && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
                <CubeIcon className="w-5 h-5 text-gray-600" />
                {tr('상품 정보', 'Product Info')}
              </h2>
              <div className="flex gap-4">
                {product.imageUrl && (
                  <img
                    src={product.imageUrl}
                    alt={product.title}
                    className="w-24 h-24 rounded-lg object-cover"
                  />
                )}
                <div>
                  <h3 className="font-bold text-lg">{product.title}</h3>
                  <p className="text-sm text-gray-600 mt-1">{product.location}</p>
                  <p className="text-sm text-gray-600">{product.duration}</p>
                  <p className="font-bold text-[#ffa726] mt-2">
                    {product.price.toLocaleString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}{tr('원', ' KRW')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 예약 기본 정보 수정 폼 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
              <PencilSquareIcon className="w-5 h-5 text-gray-600" />
              {tr('예약 정보 수정', 'Edit Reservation')}
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr('출발일', 'Departure')} *</label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr('귀국일', 'Return')}</label>
                <input
                  type="date"
                  value={formData.returnDate}
                  onChange={(e) => setFormData({ ...formData, returnDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr('성인', 'Adult')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.adultCount}
                  onChange={(e) => setFormData({ ...formData, adultCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr('아동', 'Child')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.childCount}
                  onChange={(e) => setFormData({ ...formData, childCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{tr('유아', 'Infant')}</label>
                <input
                  type="number"
                  min="0"
                  value={formData.infantCount}
                  onChange={(e) => setFormData({ ...formData, infantCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('총 금액', 'Total Amount')} *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={formData.totalAmount}
                onChange={(e) => setFormData({ ...formData, totalAmount: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                required
              />
            </div>

            <div className="border-t pt-4 mb-4">
              <h3 className="flex items-center gap-2 font-bold mb-3">
                <PhoneIcon className="w-4 h-4 text-gray-600" />
                {tr('연락처 정보', 'Contact Info')}
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{tr('담당자명', 'Contact Name')}</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
                  <input
                    type="tel"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
                  <input
                    type="email"
                    value={formData.contactEmail}
                    onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('메모', 'Memo')}</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                placeholder={tr('고객 요청사항, 특이사항 등', 'Customer requests, notes, etc.')}
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#ffa726] text-white py-3 rounded-lg font-bold hover:bg-[#ff9800] transition-colors disabled:bg-gray-300"
            >
              {isSaving ? tr('저장 중...', 'Saving...') : tr('예약 정보 저장', 'Save Reservation')}
            </button>
          </form>

          {/* 여행자 목록 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <UsersIcon className="w-5 h-5 text-gray-600" />
                {tr('여행자 정보', 'Travelers')} ({travelers.length}{tr('명', '')})
              </h2>
              <button
                onClick={handleAddTraveler}
                className="px-4 py-2 bg-[#ffa726] text-white rounded-lg hover:bg-[#ff9800] text-sm font-medium"
              >
                + {tr('여행자 추가', 'Add Traveler')}
              </button>
            </div>

            {travelers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {tr('등록된 여행자가 없습니다.', 'No travelers registered.')}
              </div>
            ) : (
              <div className="space-y-3">
                {travelers.map((traveler, idx) => (
                  <div key={traveler.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {traveler.travelerType === 'adult' ? tr('성인', 'Adult') : traveler.travelerType === 'child' ? tr('아동', 'Child') : tr('유아', 'Infant')}
                        </span>
                        <h3 className="font-bold mt-1">
                          {traveler.passportLastName} {traveler.passportFirstName}
                          {traveler.koreanName && <span className="text-gray-600 ml-2">({traveler.koreanName})</span>}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditTraveler(traveler)}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {tr('수정', 'Edit')}
                        </button>
                        <button
                          onClick={() => handleDeleteTraveler(traveler.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          {tr('삭제', 'Delete')}
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div>{tr('생년월일', 'DOB')}: {new Date(traveler.dateOfBirth ?? traveler.birthDate).toLocaleDateString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}</div>
                      <div>{tr('성별', 'Gender')}: {traveler.gender === 'male' ? tr('남성', 'Male') : tr('여성', 'Female')}</div>
                      {traveler.passportNumber && <div>{tr('여권번호', 'Passport No.')}: {traveler.passportNumber}</div>}
                      {traveler.passportExpiry && (
                        <div>{tr('여권만료일', 'Passport Expiry')}: {new Date(traveler.passportExpiry).toLocaleDateString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}</div>
                      )}
                      {traveler.phone && <div>{tr('연락처', 'Phone')}: {traveler.phone}</div>}
                      {traveler.email && <div>{tr('이메일', 'Email')}: {traveler.email}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* 오른쪽: 예약 요약 */}
        <div className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sticky top-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
              <ChartBarIcon className="w-5 h-5 text-gray-600" />
              {tr('예약 요약', 'Reservation Summary')}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">{tr('예약번호', 'Reservation No.')}:</span>
                <span className="font-medium">{reservation.reservationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{tr('상태', 'Status')}:</span>
                <StatusBadge status={reservation.status} type="reservation" size="sm" lang={adminLanguage} />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{tr('출발일', 'Departure')}:</span>
                <span className="font-medium">
                  {new Date(reservation.departureDate).toLocaleDateString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}
                </span>
              </div>
              {reservation.returnDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">{tr('귀국일', 'Return')}:</span>
                  <span className="font-medium">
                    {new Date(reservation.returnDate).toLocaleDateString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="text-gray-600">{tr('인원', 'Guests')}:</span>
                <span className="font-medium">
                  {tr('성인', 'Adult')} {reservation.adultCount}
                  {reservation.childCount > 0 && `, ${tr('아동', 'Child')} ${reservation.childCount}`}
                  {reservation.infantCount > 0 && `, ${tr('유아', 'Infant')} ${reservation.infantCount}`}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">{tr('총 금액', 'Total')}:</span>
                <span className="font-bold text-[#ffa726]">
                  {parseFloat(reservation.totalAmount.toString()).toLocaleString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}{tr('원', ' KRW')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{tr('입금액', 'Paid')}:</span>
                <span className="font-medium text-green-600">
                  {parseFloat(reservation.paidAmount.toString()).toLocaleString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}{tr('원', ' KRW')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">{tr('잔액', 'Balance')}:</span>
                <span className="font-medium text-red-600">
                  {(parseFloat(reservation.totalAmount.toString()) - parseFloat(reservation.paidAmount.toString())).toLocaleString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}{tr('원', ' KRW')}
                </span>
              </div>
              <div className="border-t pt-3 text-xs text-gray-500">
                <div>{tr('생성일', 'Created')}: {new Date(reservation.createdAt).toLocaleString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}</div>
                <div>{tr('수정일', 'Updated')}: {new Date(reservation.updatedAt).toLocaleString(adminLanguage === 'en' ? 'en-US' : 'ko-KR')}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 여행자 추가/수정 모달 */}
      <Modal
        isOpen={showTravelerModal}
        onClose={() => { setShowTravelerModal(false); setShowPassportScanner(false); }}
        title={editingTraveler ? tr('여행자 정보 수정', 'Edit Traveler') : tr('여행자 추가', 'Add Traveler')}
        size="lg"
      >
        <div className="space-y-4">
          {/* 여권 스캔 배너 */}
          {!showPassportScanner ? (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <IdentificationIcon className="w-6 h-6 text-orange-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">{tr('여권 OCR 자동 입력', 'Passport OCR Auto-fill')}</p>
                  <p className="text-xs text-orange-600">{tr('여권 사진을 스캔하면 아래 정보가 자동으로 채워집니다', 'Scan passport photo to auto-fill the form')}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPassportScanner(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                {tr('여권 스캔', 'Scan Passport')}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <IdentificationIcon className="w-5 h-5 text-orange-500" />
                  {tr('여권 스캔', 'Scan Passport')}
                </p>
                <button type="button" onClick={() => setShowPassportScanner(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <PassportOCR onComplete={handlePassportScanned} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('여행자 유형', 'Traveler Type')} *</label>
            <select
              value={travelerForm.travelerType}
              onChange={(e) => setTravelerForm({ ...travelerForm, travelerType: e.target.value as 'adult' | 'child' | 'infant' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
            >
              <option value="adult">{tr('성인', 'Adult')}</option>
              <option value="child">{tr('아동', 'Child')}</option>
              <option value="infant">{tr('유아', 'Infant')}</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('여권 영문 성', 'Passport Surname')} *</label>
              <input
                type="text"
                value={travelerForm.passportLastName}
                onChange={(e) => setTravelerForm({ ...travelerForm, passportLastName: e.target.value.toUpperCase() })}
                placeholder="KIM"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('여권 영문 이름', 'Passport Given Name')} *</label>
              <input
                type="text"
                value={travelerForm.passportFirstName}
                onChange={(e) => setTravelerForm({ ...travelerForm, passportFirstName: e.target.value.toUpperCase() })}
                placeholder="YOUNGHEE"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('한글 이름', 'Korean Name')}</label>
            <input
              type="text"
              value={travelerForm.koreanName}
              onChange={(e) => setTravelerForm({ ...travelerForm, koreanName: e.target.value })}
              placeholder="김영희"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('생년월일', 'Date of Birth')} *</label>
              <input
                type="date"
                value={travelerForm.dateOfBirth}
                onChange={(e) => setTravelerForm({ ...travelerForm, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('성별', 'Gender')} *</label>
              <select
                value={travelerForm.gender}
                onChange={(e) => setTravelerForm({ ...travelerForm, gender: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              >
                <option value="male">{tr('남성', 'Male')}</option>
                <option value="female">{tr('여성', 'Female')}</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">{tr('여권번호', 'Passport No.')}</label>
            <input
              type="text"
              value={travelerForm.passportNumber}
              onChange={(e) => setTravelerForm({ ...travelerForm, passportNumber: e.target.value.toUpperCase() })}
              placeholder="M12345678"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('여권 발급일', 'Passport Issue Date')}</label>
              <input
                type="date"
                value={travelerForm.passportIssueDate}
                onChange={(e) => setTravelerForm({ ...travelerForm, passportIssueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('여권 만료일', 'Passport Expiry')}</label>
              <input
                type="date"
                value={travelerForm.passportExpiry}
                onChange={(e) => setTravelerForm({ ...travelerForm, passportExpiry: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('연락처', 'Phone')}</label>
              <input
                type="tel"
                value={travelerForm.phone}
                onChange={(e) => setTravelerForm({ ...travelerForm, phone: e.target.value })}
                placeholder="010-1234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">{tr('이메일', 'Email')}</label>
              <input
                type="email"
                value={travelerForm.email}
                onChange={(e) => setTravelerForm({ ...travelerForm, email: e.target.value })}
                placeholder="example@email.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              />
            </div>
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={() => setShowTravelerModal(false)}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              {tr('취소', 'Cancel')}
            </button>
            <button
              type="button"
              onClick={handleSaveTraveler}
              className="flex-1 px-4 py-2 bg-[#ffa726] text-white rounded-lg hover:bg-[#ff9800]"
            >
              {tr('저장', 'Save')}
            </button>
          </div>
        </div>
      </Modal>

      {/* 상태 변경 모달 */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title={tr('예약 상태 변경', 'Change Reservation Status')}
        size="sm"
      >
        <div className="space-y-3">
          <button
            onClick={() => handleStatusChange('pending' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="pending" type="reservation" lang={adminLanguage} /> {tr('대기', 'Pending')}
          </button>
          <button
            onClick={() => handleStatusChange('confirmed' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="confirmed" type="reservation" lang={adminLanguage} /> {tr('확정', 'Confirmed')}
          </button>
          <button
            onClick={() => handleStatusChange('cancelled' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="cancelled" type="reservation" lang={adminLanguage} /> {tr('취소', 'Cancelled')}
          </button>
          <button
            onClick={() => handleStatusChange('completed' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="completed" type="reservation" lang={adminLanguage} /> {tr('완료', 'Completed')}
          </button>
        </div>
      </Modal>
    </div>
  );
}
