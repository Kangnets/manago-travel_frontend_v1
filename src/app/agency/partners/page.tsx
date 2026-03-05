'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Partner {
  id: string;
  companyName: string;
  businessNumber: string;
  category: string;
  managerName: string;
  managerPhone: string;
  managerEmail: string;
  faxNumber: string;
  address: string;
  bankName: string;
  accountNumber: string;
  accountHolder: string;
  memo: string;
  createdAt: string;
}

type Mode = 'list' | 'view' | 'new' | 'edit';

export default function PartnersPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('list');
  const [partners, setPartners] = useState<Partner[]>([]);
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(false);

  // Filter states
  const [filterCategory, setFilterCategory] = useState('전체');
  const [searchKeyword, setSearchKeyword] = useState('');

  // Form states
  const [formData, setFormData] = useState({
    companyName: '',
    businessNumber: '',
    category: '항공사',
    managerName: '',
    managerPhone: '',
    managerEmail: '',
    faxNumber: '',
    address: '',
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    memo: '',
  });

  useEffect(() => {
    fetchPartners();
  }, []);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      // Mock data
      const mockPartners: Partner[] = [
        {
          id: '1',
          companyName: '아시아나항공',
          businessNumber: '229-81-01273',
          category: '항공사',
          managerName: '김담당',
          managerPhone: '02-2669-8000',
          managerEmail: 'contact@flyasiana.com',
          faxNumber: '02-2669-8100',
          address: '서울시 강서구 하늘길 260',
          bankName: '국민은행',
          accountNumber: '123456-01-123456',
          accountHolder: '아시아나항공',
          memo: '주요 항공 파트너',
          createdAt: '2023-01-15',
        },
        {
          id: '2',
          companyName: '하나투어',
          businessNumber: '214-81-42865',
          category: '여행사',
          managerName: '이담당',
          managerPhone: '02-6900-9000',
          managerEmail: 'info@hanatour.com',
          faxNumber: '02-6900-9100',
          address: '서울시 중구 남대문로 117',
          bankName: '신한은행',
          accountNumber: '100-123-456789',
          accountHolder: '하나투어',
          memo: '국내 1위 여행사',
          createdAt: '2023-02-20',
        },
        {
          id: '3',
          companyName: '롯데호텔',
          businessNumber: '106-81-14560',
          category: '호텔',
          managerName: '박담당',
          managerPhone: '02-771-1000',
          managerEmail: 'reservation@lottehotel.com',
          faxNumber: '02-771-1100',
          address: '서울시 중구 을지로 30',
          bankName: '우리은행',
          accountNumber: '1002-123-456789',
          accountHolder: '롯데호텔',
          memo: '5성급 호텔 체인',
          createdAt: '2023-03-10',
        },
        {
          id: '4',
          companyName: '제주패스',
          businessNumber: '616-81-12345',
          category: '관광',
          managerName: '최담당',
          managerPhone: '064-720-8000',
          managerEmail: 'info@jejupass.com',
          faxNumber: '064-720-8100',
          address: '제주시 첨단로 213-65',
          bankName: '하나은행',
          accountNumber: '123-456789-01234',
          accountHolder: '제주패스',
          memo: '제주 관광 전문',
          createdAt: '2023-04-05',
        },
        {
          id: '5',
          companyName: '인터파크투어',
          businessNumber: '220-81-83676',
          category: '여행사',
          managerName: '정담당',
          managerPhone: '1544-1555',
          managerEmail: 'tour@interpark.com',
          faxNumber: '02-1234-5678',
          address: '서울시 강남구 삼성로 512',
          bankName: '기업은행',
          accountNumber: '012-345678-01-012',
          accountHolder: '인터파크투어',
          memo: 'IT 기반 여행 플랫폼',
          createdAt: '2023-05-12',
        },
      ];
      setPartners(mockPartners);
    } catch (error) {
      console.error('Failed to fetch partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setFormData({
      companyName: '',
      businessNumber: '',
      category: '항공사',
      managerName: '',
      managerPhone: '',
      managerEmail: '',
      faxNumber: '',
      address: '',
      bankName: '',
      accountNumber: '',
      accountHolder: '',
      memo: '',
    });
    setSelectedPartner(null);
    setMode('new');
  };

  const handleView = (partner: Partner) => {
    setSelectedPartner(partner);
    setFormData({
      companyName: partner.companyName,
      businessNumber: partner.businessNumber,
      category: partner.category,
      managerName: partner.managerName,
      managerPhone: partner.managerPhone,
      managerEmail: partner.managerEmail,
      faxNumber: partner.faxNumber,
      address: partner.address,
      bankName: partner.bankName,
      accountNumber: partner.accountNumber,
      accountHolder: partner.accountHolder,
      memo: partner.memo,
    });
    setMode('view');
  };

  const handleEdit = () => {
    setMode('edit');
  };

  const handleSave = async () => {
    if (!formData.companyName.trim() || !formData.managerPhone.trim()) {
      alert('회사명과 연락처는 필수 항목입니다.');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'new') {
        const newPartner: Partner = {
          id: String(Date.now()),
          companyName: formData.companyName,
          businessNumber: formData.businessNumber,
          category: formData.category,
          managerName: formData.managerName,
          managerPhone: formData.managerPhone,
          managerEmail: formData.managerEmail,
          faxNumber: formData.faxNumber,
          address: formData.address,
          bankName: formData.bankName,
          accountNumber: formData.accountNumber,
          accountHolder: formData.accountHolder,
          memo: formData.memo,
          createdAt: new Date().toISOString(),
        };
        setPartners([newPartner, ...partners]);
        alert('파트너가 등록되었습니다.');
      } else if (mode === 'edit' && selectedPartner) {
        const updatedPartners = partners.map((p) =>
          p.id === selectedPartner.id
            ? {
                ...p,
                companyName: formData.companyName,
                businessNumber: formData.businessNumber,
                category: formData.category,
                managerName: formData.managerName,
                managerPhone: formData.managerPhone,
                managerEmail: formData.managerEmail,
                faxNumber: formData.faxNumber,
                address: formData.address,
                bankName: formData.bankName,
                accountNumber: formData.accountNumber,
                accountHolder: formData.accountHolder,
                memo: formData.memo,
              }
            : p
        );
        setPartners(updatedPartners);
        alert('파트너 정보가 수정되었습니다.');
      }
      setMode('list');
    } catch (error) {
      console.error('Failed to save partner:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedPartner || !confirm('정말 삭제하시겠습니까?')) return;

    setLoading(true);
    try {
      const updatedPartners = partners.filter((p) => p.id !== selectedPartner.id);
      setPartners(updatedPartners);
      alert('파트너가 삭제되었습니다.');
      setMode('list');
    } catch (error) {
      console.error('Failed to delete partner:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedPartner(null);
  };

  const filteredPartners = partners.filter((p) => {
    if (filterCategory !== '전체' && p.category !== filterCategory) return false;
    if (
      searchKeyword &&
      !p.companyName.includes(searchKeyword) &&
      !p.managerName.includes(searchKeyword)
    ) {
      return false;
    }
    return true;
  });

  const inputCls =
    'px-4 py-3 border border-gray-300 rounded-lg text-[14px] focus:outline-none focus:border-[#ffa726] bg-white w-full';

  return (
    <div className="min-h-screen bg-[#f0f2f5] -m-8">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-bold text-gray-900">파트너 관리</h1>
            <p className="text-[13px] text-gray-500 mt-0.5">home &gt; 파트너사 관리</p>
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

      {/* Main Content */}
      <div className="p-6">
        {/* List Mode */}
        {mode === 'list' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Toolbar */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h2 className="text-[16px] font-bold text-gray-900">파트너 목록</h2>
                <div className="flex items-center gap-2">
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:border-[#ffa726]"
                  >
                    <option>전체</option>
                    <option>항공사</option>
                    <option>여행사</option>
                    <option>호텔</option>
                    <option>관광</option>
                    <option>기타</option>
                  </select>
                  <input
                    type="text"
                    value={searchKeyword}
                    onChange={(e) => setSearchKeyword(e.target.value)}
                    placeholder="회사명, 담당자명"
                    className="px-3 py-2 border border-gray-300 rounded-lg text-[13px] w-48 focus:outline-none focus:border-[#ffa726]"
                  />
                </div>
              </div>
              <button
                onClick={handleNew}
                className="px-4 py-2 bg-[#ffa726] text-white text-[13px] font-medium rounded-lg hover:bg-[#f57c00] transition-colors"
              >
                + 파트너 등록
              </button>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600 w-20">
                      NO
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      회사명
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      사업자번호
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      분류
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      담당자
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      연락처
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      은행
                    </th>
                    <th className="px-4 py-3 text-left text-[12px] font-semibold text-gray-600">
                      계좌번호
                    </th>
                    <th className="px-4 py-3 text-center text-[12px] font-semibold text-gray-600">
                      관리
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-10 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
                          <span className="text-[13px] text-gray-500">로딩 중...</span>
                        </div>
                      </td>
                    </tr>
                  ) : filteredPartners.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="px-4 py-12 text-center text-[13px] text-gray-400">
                        등록된 파트너가 없습니다.
                      </td>
                    </tr>
                  ) : (
                    filteredPartners.map((partner, idx) => (
                      <tr
                        key={partner.id}
                        className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleView(partner)}
                      >
                        <td className="px-4 py-3 text-[13px] text-gray-700">{idx + 1}</td>
                        <td className="px-4 py-3 text-[13px] text-gray-900 font-medium">
                          {partner.companyName}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600 font-mono">
                          {partner.businessNumber}
                        </td>
                        <td className="px-4 py-3 text-[13px]">
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[11px] font-medium">
                            {partner.category}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-700">
                          {partner.managerName}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {partner.managerPhone}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600">
                          {partner.bankName || '-'}
                        </td>
                        <td className="px-4 py-3 text-[13px] text-gray-600 font-mono">
                          {partner.accountNumber || '-'}
                        </td>
                        <td
                          className="px-4 py-3 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => {
                                handleView(partner);
                                setTimeout(() => handleEdit(), 0);
                              }}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-[11px] hover:bg-blue-200"
                            >
                              수정
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPartner(partner);
                                handleDelete();
                              }}
                              className="px-2 py-1 bg-red-100 text-red-700 rounded text-[11px] hover:bg-red-200"
                            >
                              삭제
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* View/Edit/New Mode */}
        {(mode === 'view' || mode === 'edit' || mode === 'new') && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-gray-900">
                {mode === 'new'
                  ? '파트너 등록'
                  : mode === 'edit'
                  ? '파트너 수정'
                  : '파트너 상세'}
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

            {/* Form */}
            <div className="p-6">
              <div className="space-y-6">
                {/* 기본 정보 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b">
                    기본 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        회사명 *
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.companyName}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.companyName}
                          onChange={(e) =>
                            setFormData({ ...formData, companyName: e.target.value })
                          }
                          placeholder="회사명"
                          className={inputCls}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        사업자번호
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.businessNumber || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.businessNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, businessNumber: e.target.value })
                          }
                          placeholder="000-00-00000"
                          className={inputCls}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        분류
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.category}
                        </div>
                      ) : (
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          className={inputCls}
                        >
                          <option>항공사</option>
                          <option>여행사</option>
                          <option>호텔</option>
                          <option>관광</option>
                          <option>기타</option>
                        </select>
                      )}
                    </div>
                  </div>
                </div>

                {/* 담당자 정보 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b">
                    담당자 정보
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        담당자명
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.managerName || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.managerName}
                          onChange={(e) =>
                            setFormData({ ...formData, managerName: e.target.value })
                          }
                          placeholder="담당자명"
                          className={inputCls}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        연락처 *
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.managerPhone}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          value={formData.managerPhone}
                          onChange={(e) =>
                            setFormData({ ...formData, managerPhone: e.target.value })
                          }
                          placeholder="02-0000-0000"
                          className={inputCls}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        이메일
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.managerEmail || '-'}
                        </div>
                      ) : (
                        <input
                          type="email"
                          value={formData.managerEmail}
                          onChange={(e) =>
                            setFormData({ ...formData, managerEmail: e.target.value })
                          }
                          placeholder="email@example.com"
                          className={inputCls}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        팩스번호
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.faxNumber || '-'}
                        </div>
                      ) : (
                        <input
                          type="tel"
                          value={formData.faxNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, faxNumber: e.target.value })
                          }
                          placeholder="02-0000-0000"
                          className={inputCls}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* 주소 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b">
                    주소
                  </h3>
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
                        className={inputCls}
                      />
                    )}
                  </div>
                </div>

                {/* 계좌 정보 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b">
                    계좌 정보
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        은행명
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.bankName || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.bankName}
                          onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                          placeholder="은행명"
                          className={inputCls}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        계좌번호
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px] font-mono">
                          {formData.accountNumber || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.accountNumber}
                          onChange={(e) =>
                            setFormData({ ...formData, accountNumber: e.target.value })
                          }
                          placeholder="000-000-000000"
                          className={inputCls}
                        />
                      )}
                    </div>

                    <div>
                      <label className="block text-[13px] font-medium text-gray-700 mb-2">
                        예금주
                      </label>
                      {mode === 'view' ? (
                        <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px]">
                          {formData.accountHolder || '-'}
                        </div>
                      ) : (
                        <input
                          type="text"
                          value={formData.accountHolder}
                          onChange={(e) =>
                            setFormData({ ...formData, accountHolder: e.target.value })
                          }
                          placeholder="예금주"
                          className={inputCls}
                        />
                      )}
                    </div>
                  </div>
                </div>

                {/* 메모 */}
                <div>
                  <h3 className="text-[14px] font-bold text-gray-800 mb-4 pb-2 border-b">
                    메모
                  </h3>
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
