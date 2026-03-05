'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { reservationAPI, travelerAPI, agencyProductAPI } from '@/lib/agencyApi';
import { Reservation, Traveler, ReservationStatus } from '@/types/reservation';
import { Product } from '@/types/product';
import { StatusBadge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
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
      setError(err.response?.data?.message || '예약 정보를 불러오는데 실패했습니다');
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
      setSuccessMessage('예약 정보가 수정되었습니다');
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || '예약 수정에 실패했습니다');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus: ReservationStatus) => {
    try {
      await reservationAPI.updateStatus(id, newStatus);
      setSuccessMessage('예약 상태가 변경되었습니다');
      setShowStatusModal(false);
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || '상태 변경에 실패했습니다');
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
        setSuccessMessage('여행자 정보가 수정되었습니다');
      } else {
        await travelerAPI.create(id, travelerForm);
        setSuccessMessage('여행자가 추가되었습니다');
      }
      setShowTravelerModal(false);
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || '여행자 정보 저장에 실패했습니다');
    }
  };

  const handleDeleteTraveler = async (travelerId: string) => {
    if (!confirm('이 여행자를 삭제하시겠습니까?')) return;
    try {
      await travelerAPI.delete(id, travelerId);
      setSuccessMessage('여행자가 삭제되었습니다');
      await fetchReservation();
    } catch (err: any) {
      setError(err.response?.data?.message || '여행자 삭제에 실패했습니다');
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
          예약을 찾을 수 없습니다.
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
            ← 예약 목록
          </Link>
          <h1 className="text-2xl font-bold">예약 상세 및 수정</h1>
          <p className="text-sm text-gray-500 mt-1">예약번호: {reservation.reservationNumber}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusBadge status={reservation.status} type="reservation" />
          <button
            onClick={() => setShowStatusModal(true)}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium"
          >
            상태 변경
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
                상품 정보
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
                    {product.price.toLocaleString()}원
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* 예약 기본 정보 수정 폼 */}
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="flex items-center gap-2 text-lg font-bold mb-4">
              <PencilSquareIcon className="w-5 h-5 text-gray-600" />
              예약 정보 수정
            </h2>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">출발일 *</label>
                <input
                  type="date"
                  value={formData.departureDate}
                  onChange={(e) => setFormData({ ...formData, departureDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">귀국일</label>
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
                <label className="block text-sm font-medium text-gray-700 mb-1">성인</label>
                <input
                  type="number"
                  min="0"
                  value={formData.adultCount}
                  onChange={(e) => setFormData({ ...formData, adultCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">아동</label>
                <input
                  type="number"
                  min="0"
                  value={formData.childCount}
                  onChange={(e) => setFormData({ ...formData, childCount: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">유아</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">총 금액 *</label>
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
                연락처 정보
              </h3>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">담당자명</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">메모</label>
              <textarea
                value={formData.memo}
                onChange={(e) => setFormData({ ...formData, memo: e.target.value })}
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726] focus:border-transparent"
                placeholder="고객 요청사항, 특이사항 등"
              />
            </div>

            <button
              type="submit"
              disabled={isSaving}
              className="w-full bg-[#ffa726] text-white py-3 rounded-lg font-bold hover:bg-[#ff9800] transition-colors disabled:bg-gray-300"
            >
              {isSaving ? '저장 중...' : '예약 정보 저장'}
            </button>
          </form>

          {/* 여행자 목록 */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="flex items-center gap-2 text-lg font-bold">
                <UsersIcon className="w-5 h-5 text-gray-600" />
                여행자 정보 ({travelers.length}명)
              </h2>
              <button
                onClick={handleAddTraveler}
                className="px-4 py-2 bg-[#ffa726] text-white rounded-lg hover:bg-[#ff9800] text-sm font-medium"
              >
                + 여행자 추가
              </button>
            </div>

            {travelers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                등록된 여행자가 없습니다.
              </div>
            ) : (
              <div className="space-y-3">
                {travelers.map((traveler, idx) => (
                  <div key={traveler.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {traveler.travelerType === 'adult' ? '성인' : traveler.travelerType === 'child' ? '아동' : '유아'}
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
                          수정
                        </button>
                        <button
                          onClick={() => handleDeleteTraveler(traveler.id)}
                          className="text-sm text-red-600 hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-gray-600">
                      <div>생년월일: {new Date(traveler.dateOfBirth ?? traveler.birthDate).toLocaleDateString()}</div>
                      <div>성별: {traveler.gender === 'male' ? '남성' : '여성'}</div>
                      {traveler.passportNumber && <div>여권번호: {traveler.passportNumber}</div>}
                      {traveler.passportExpiry && (
                        <div>여권만료일: {new Date(traveler.passportExpiry).toLocaleDateString()}</div>
                      )}
                      {traveler.phone && <div>연락처: {traveler.phone}</div>}
                      {traveler.email && <div>이메일: {traveler.email}</div>}
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
              예약 요약
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">예약번호:</span>
                <span className="font-medium">{reservation.reservationNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">상태:</span>
                <StatusBadge status={reservation.status} type="reservation" size="sm" />
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">출발일:</span>
                <span className="font-medium">
                  {new Date(reservation.departureDate).toLocaleDateString()}
                </span>
              </div>
              {reservation.returnDate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">귀국일:</span>
                  <span className="font-medium">
                    {new Date(reservation.returnDate).toLocaleDateString()}
                  </span>
                </div>
              )}
              <div className="border-t pt-3 flex justify-between">
                <span className="text-gray-600">인원:</span>
                <span className="font-medium">
                  성인 {reservation.adultCount}명
                  {reservation.childCount > 0 && `, 아동 ${reservation.childCount}명`}
                  {reservation.infantCount > 0 && `, 유아 ${reservation.infantCount}명`}
                </span>
              </div>
              <div className="border-t pt-3 flex justify-between text-lg">
                <span className="font-bold">총 금액:</span>
                <span className="font-bold text-[#ffa726]">
                  {parseFloat(reservation.totalAmount.toString()).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">입금액:</span>
                <span className="font-medium text-green-600">
                  {parseFloat(reservation.paidAmount.toString()).toLocaleString()}원
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">잔액:</span>
                <span className="font-medium text-red-600">
                  {(parseFloat(reservation.totalAmount.toString()) - parseFloat(reservation.paidAmount.toString())).toLocaleString()}원
                </span>
              </div>
              <div className="border-t pt-3 text-xs text-gray-500">
                <div>생성일: {new Date(reservation.createdAt).toLocaleString()}</div>
                <div>수정일: {new Date(reservation.updatedAt).toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 여행자 추가/수정 모달 */}
      <Modal
        isOpen={showTravelerModal}
        onClose={() => { setShowTravelerModal(false); setShowPassportScanner(false); }}
        title={editingTraveler ? '여행자 정보 수정' : '여행자 추가'}
        size="lg"
      >
        <div className="space-y-4">
          {/* 여권 스캔 배너 */}
          {!showPassportScanner ? (
            <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <IdentificationIcon className="w-6 h-6 text-orange-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-orange-800">여권 OCR 자동 입력</p>
                  <p className="text-xs text-orange-600">여권 사진을 스캔하면 아래 정보가 자동으로 채워집니다</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPassportScanner(true)}
                className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors whitespace-nowrap"
              >
                여권 스캔
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                  <IdentificationIcon className="w-5 h-5 text-orange-500" />
                  여권 스캔
                </p>
                <button type="button" onClick={() => setShowPassportScanner(false)} className="p-1 hover:bg-gray-200 rounded-lg transition-colors">
                  <XMarkIcon className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <PassportOCR onComplete={handlePassportScanned} />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">여행자 유형 *</label>
            <select
              value={travelerForm.travelerType}
              onChange={(e) => setTravelerForm({ ...travelerForm, travelerType: e.target.value as 'adult' | 'child' | 'infant' })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
            >
              <option value="adult">성인</option>
              <option value="child">아동</option>
              <option value="infant">유아</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">여권 영문 성 *</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">여권 영문 이름 *</label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">한글 이름</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">생년월일 *</label>
              <input
                type="date"
                value={travelerForm.dateOfBirth}
                onChange={(e) => setTravelerForm({ ...travelerForm, dateOfBirth: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">성별 *</label>
              <select
                value={travelerForm.gender}
                onChange={(e) => setTravelerForm({ ...travelerForm, gender: e.target.value as any })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              >
                <option value="male">남성</option>
                <option value="female">여성</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">여권번호</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">여권 발급일</label>
              <input
                type="date"
                value={travelerForm.passportIssueDate}
                onChange={(e) => setTravelerForm({ ...travelerForm, passportIssueDate: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">여권 만료일</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">연락처</label>
              <input
                type="tel"
                value={travelerForm.phone}
                onChange={(e) => setTravelerForm({ ...travelerForm, phone: e.target.value })}
                placeholder="010-1234-5678"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#ffa726]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">이메일</label>
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
              취소
            </button>
            <button
              type="button"
              onClick={handleSaveTraveler}
              className="flex-1 px-4 py-2 bg-[#ffa726] text-white rounded-lg hover:bg-[#ff9800]"
            >
              저장
            </button>
          </div>
        </div>
      </Modal>

      {/* 상태 변경 모달 */}
      <Modal
        isOpen={showStatusModal}
        onClose={() => setShowStatusModal(false)}
        title="예약 상태 변경"
        size="sm"
      >
        <div className="space-y-3">
          <button
            onClick={() => handleStatusChange('pending' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="pending" type="reservation" /> 대기
          </button>
          <button
            onClick={() => handleStatusChange('confirmed' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="confirmed" type="reservation" /> 확정
          </button>
          <button
            onClick={() => handleStatusChange('cancelled' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="cancelled" type="reservation" /> 취소
          </button>
          <button
            onClick={() => handleStatusChange('completed' as ReservationStatus)}
            className="w-full px-4 py-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
          >
            <StatusBadge status="completed" type="reservation" /> 완료
          </button>
        </div>
      </Modal>
    </div>
  );
}
