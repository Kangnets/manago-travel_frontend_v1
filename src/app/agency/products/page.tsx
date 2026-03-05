'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import { Table, TableColumn, TablePagination } from '@/components/ui/Table';
import { StatusBadge } from '@/components/ui/Badge';
import { agencyProductAPI } from '@/lib/agencyApi';
import { Product } from '@/types/product';
import {
  ArrowUpTrayIcon,
  ArrowDownTrayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

interface ExcelRow {
  title: string;
  location: string;
  country: string;
  duration: string;
  price: number;
  originalPrice?: number;
  category: string;
  imageUrl?: string;
  description?: string;
  isActive?: boolean;
}

interface BulkResult {
  success: number;
  failed: number;
  errors: { row: number; title: string; error: string }[];
}

const EXCEL_COLUMNS = ['상품명(필수)', '지역(필수)', '국가(필수)', '기간(필수)', '판매가(필수)', '정가', '카테고리(필수)', '이미지URL', '상품설명'];
const EXCEL_KEYS: (keyof ExcelRow)[] = ['title', 'location', 'country', 'duration', 'price', 'originalPrice', 'category', 'imageUrl', 'description'];
const CATEGORY_OPTIONS = ['hotel', 'golf', 'tour', 'spa', 'restaurant', 'vehicle', 'guide', 'convenience', 'insurance'];

export default function AgencyProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [total, setTotal] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // 엑셀 업로드 관련
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadRows, setUploadRows] = useState<ExcelRow[]>([]);
  const [uploadFilename, setUploadFilename] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [bulkResult, setBulkResult] = useState<BulkResult | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await agencyProductAPI.getMyProducts({
        category: categoryFilter || undefined,
        isActive: statusFilter === '' ? undefined : statusFilter === 'active',
        page,
        limit,
      });
      setProducts(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, limit, categoryFilter, statusFilter]);

  // 엑셀 템플릿 다운로드
  const downloadTemplate = () => {
    const ws = XLSX.utils.aoa_to_sheet([
      EXCEL_COLUMNS,
      ['하노이 문화 투어', '하노이', '베트남', '3박 4일', '550000', '680000', 'tour', 'https://example.com/img.jpg', '하노이 역사 투어 상품'],
      ['다낭 골프 패키지', '다낭', '베트남', '4박 6일', '1500000', '', 'golf', '', '오션뷰 골프 리조트'],
    ]);
    ws['!cols'] = EXCEL_COLUMNS.map(() => ({ wch: 20 }));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, '상품등록');
    XLSX.writeFile(wb, '상품등록_템플릿.xlsx');
  };

  // 엑셀 파일 파싱
  const handleExcelFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadFilename(file.name);
    setBulkResult(null);

    const reader = new FileReader();
    reader.onload = (evt) => {
      const data = evt.target?.result;
      const workbook = XLSX.read(data, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const raw = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1 }) as unknown[][];

      const rows: ExcelRow[] = [];
      for (let i = 1; i < raw.length; i++) {
        const row = raw[i] as (string | number | undefined)[];
        if (!row[0]) continue;
        rows.push({
          title: String(row[0] || ''),
          location: String(row[1] || ''),
          country: String(row[2] || ''),
          duration: String(row[3] || ''),
          price: Number(row[4]) || 0,
          originalPrice: row[5] ? Number(row[5]) : undefined,
          category: String(row[6] || 'tour'),
          imageUrl: row[7] ? String(row[7]) : undefined,
          description: row[8] ? String(row[8]) : undefined,
        });
      }
      setUploadRows(rows);
      setShowUploadModal(true);
    };
    reader.readAsBinaryString(file);
    e.target.value = '';
  };

  // 엑셀 일괄 등록
  const handleBulkUpload = async () => {
    if (uploadRows.length === 0) return;
    setIsUploading(true);
    let success = 0;
    const errors: BulkResult['errors'] = [];

    for (let i = 0; i < uploadRows.length; i++) {
      const row = uploadRows[i];
      try {
        if (!row.title || !row.location || !row.price || !row.category) {
          throw new Error('필수 항목(상품명, 지역, 판매가, 카테고리)이 누락되었습니다.');
        }
        await agencyProductAPI.create({
          title: row.title,
          location: row.location,
          country: row.country || '베트남',
          duration: row.duration || '-',
          price: row.price,
          originalPrice: row.originalPrice,
          category: row.category as Product['category'],
          imageUrl: row.imageUrl || '',
          description: row.description,
          isActive: true,
        });
        success++;
      } catch (err: unknown) {
        errors.push({
          row: i + 2,
          title: row.title || `행 ${i + 2}`,
          error: err instanceof Error ? err.message : '등록 실패',
        });
      }
    }

    setBulkResult({ success, failed: errors.length, errors });
    setIsUploading(false);
    if (success > 0) fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('정말 이 상품을 삭제하시겠습니까?')) return;

    try {
      await agencyProductAPI.delete(id);
      fetchProducts();
    } catch (error) {
      console.error('Failed to delete product:', error);
      alert('상품 삭제에 실패했습니다.');
    }
  };

  const columns: TableColumn<Product>[] = [
    {
      key: 'imageUrl',
      header: '이미지',
      width: '80px',
      render: (value) => (
        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
          {value && (
            <img
              src={value}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: '상품명',
      render: (value) => <span className="font-medium line-clamp-1">{value}</span>,
    },
    {
      key: 'category',
      header: '카테고리',
      render: (value) => {
        const categoryLabels: Record<string, string> = {
          hotel: '호텔',
          golf: '골프',
          tour: '투어',
          convenience: '편의',
          insurance: '보험',
        };
        return categoryLabels[value] || value;
      },
    },
    {
      key: 'location',
      header: '지역',
    },
    {
      key: 'price',
      header: '가격',
      render: (value) => `₩${Number(value).toLocaleString()}`,
    },
    {
      key: 'isActive',
      header: '상태',
      render: (value) => (
        <StatusBadge
          status={value ? 'active' : 'inactive'}
          type="product"
          size="sm"
        />
      ),
    },
    {
      key: 'actions',
      header: '관리',
      width: '120px',
      render: (_, row) => (
        <div className="flex items-center gap-2">
          <Link
            href={`/agency/products/${row.id}/edit`}
            className="px-3 py-1.5 text-[12px] font-medium text-[#ffa726] hover:bg-orange-50 rounded-lg transition-colors"
          >
            수정
          </Link>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row.id);
            }}
            className="px-3 py-1.5 text-[12px] font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            삭제
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">상품 관리</h1>
          <p className="text-[14px] text-gray-500 mt-1">등록된 상품을 관리하세요</p>
        </div>
        <div className="flex items-center gap-3">
          {/* 엑셀 템플릿 다운로드 */}
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-2 px-4 py-2.5 border border-gray-300 text-gray-700 font-semibold rounded-xl text-[14px] hover:bg-gray-50 transition-all"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            템플릿
          </button>
          {/* 엑셀 업로드 */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 border border-green-500 text-green-700 font-semibold rounded-xl text-[14px] hover:bg-green-50 transition-all"
          >
            <ArrowUpTrayIcon className="w-4 h-4" />
            엑셀 일괄등록
          </button>
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleExcelFile} />
          {/* 개별 등록 */}
          <Link
            href="/agency/products/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-semibold rounded-xl text-[14px] hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-md"
          >
            + 새 상품 등록
          </Link>
        </div>
      </div>

      {/* 엑셀 업로드 모달 */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col">
            {/* 모달 헤더 */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-[18px] font-bold text-gray-900">엑셀 일괄 등록</h2>
                <p className="text-[13px] text-gray-500 mt-0.5">{uploadFilename} — {uploadRows.length}개 행 감지됨</p>
              </div>
              <button onClick={() => { setShowUploadModal(false); setBulkResult(null); }} className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
                <XCircleIcon className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* 결과 표시 */}
            {bulkResult ? (
              <div className="p-6 overflow-y-auto flex-1">
                <div className="flex gap-4 mb-6">
                  <div className="flex-1 bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                    <CheckCircleIcon className="w-8 h-8 text-green-500 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-green-700">{bulkResult.success}</p>
                    <p className="text-sm text-green-600">등록 성공</p>
                  </div>
                  <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-4 text-center">
                    <XCircleIcon className="w-8 h-8 text-red-400 mx-auto mb-1" />
                    <p className="text-2xl font-bold text-red-600">{bulkResult.failed}</p>
                    <p className="text-sm text-red-500">등록 실패</p>
                  </div>
                </div>
                {bulkResult.errors.length > 0 && (
                  <div className="bg-red-50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-red-700 mb-3">오류 내역</p>
                    <div className="space-y-2">
                      {bulkResult.errors.map((e, i) => (
                        <div key={i} className="flex items-start gap-2 text-sm">
                          <ExclamationTriangleIcon className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                          <span className="text-red-600"><span className="font-medium">{e.row}행 ({e.title})</span> — {e.error}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={() => { setShowUploadModal(false); setBulkResult(null); }} className="w-full mt-4 py-2.5 bg-[#ffa726] text-white rounded-xl font-semibold hover:bg-[#f57c00] transition-colors">
                  닫기
                </button>
              </div>
            ) : (
              <>
                {/* 미리보기 테이블 */}
                <div className="overflow-auto flex-1 p-6">
                  {uploadRows.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                      <p>파싱된 데이터가 없습니다. 템플릿 양식에 맞게 작성해주세요.</p>
                    </div>
                  ) : (
                    <table className="w-full text-[13px] border-collapse">
                      <thead>
                        <tr className="bg-gray-50">
                          <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-700">행</th>
                          {EXCEL_COLUMNS.slice(0, 7).map((col) => (
                            <th key={col} className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-700 whitespace-nowrap">{col}</th>
                          ))}
                          <th className="text-left px-3 py-2 border border-gray-200 font-semibold text-gray-700">상태</th>
                        </tr>
                      </thead>
                      <tbody>
                        {uploadRows.slice(0, 20).map((row, i) => {
                          const hasError = !row.title || !row.location || !row.price || !CATEGORY_OPTIONS.includes(row.category);
                          return (
                            <tr key={i} className={hasError ? 'bg-red-50' : 'hover:bg-gray-50'}>
                              <td className="px-3 py-2 border border-gray-200 text-gray-500">{i + 2}</td>
                              <td className="px-3 py-2 border border-gray-200 font-medium max-w-[160px] truncate">{row.title}</td>
                              <td className="px-3 py-2 border border-gray-200">{row.location}</td>
                              <td className="px-3 py-2 border border-gray-200">{row.country}</td>
                              <td className="px-3 py-2 border border-gray-200">{row.duration}</td>
                              <td className="px-3 py-2 border border-gray-200 text-right">₩{Number(row.price).toLocaleString()}</td>
                              <td className="px-3 py-2 border border-gray-200 text-right text-gray-400">{row.originalPrice ? `₩${Number(row.originalPrice).toLocaleString()}` : '-'}</td>
                              <td className="px-3 py-2 border border-gray-200">
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${CATEGORY_OPTIONS.includes(row.category) ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                  {row.category}
                                </span>
                              </td>
                              <td className="px-3 py-2 border border-gray-200">
                                {hasError
                                  ? <span className="flex items-center gap-1 text-red-500"><XCircleIcon className="w-4 h-4" /> 오류</span>
                                  : <span className="flex items-center gap-1 text-green-500"><CheckCircleIcon className="w-4 h-4" /> 정상</span>
                                }
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  )}
                  {uploadRows.length > 20 && (
                    <p className="text-[12px] text-gray-400 mt-2">... 외 {uploadRows.length - 20}건 더 있음</p>
                  )}
                </div>

                {/* 모달 하단 */}
                <div className="p-6 border-t border-gray-100 flex items-center justify-between">
                  <p className="text-[13px] text-gray-500">
                    총 <span className="font-bold text-gray-800">{uploadRows.length}개</span> 상품 중&nbsp;
                    <span className="font-bold text-green-600">{uploadRows.filter(r => r.title && r.location && r.price && CATEGORY_OPTIONS.includes(r.category)).length}개</span> 정상
                  </p>
                  <div className="flex gap-3">
                    <button onClick={() => setShowUploadModal(false)} className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors">
                      취소
                    </button>
                    <button
                      onClick={handleBulkUpload}
                      disabled={isUploading || uploadRows.length === 0}
                      className="px-5 py-2.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white rounded-xl font-semibold hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
                    >
                      {isUploading ? (
                        <><span className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span> 등록 중...</>
                      ) : (
                        <><ArrowUpTrayIcon className="w-4 h-4" /> {uploadRows.length}개 일괄 등록</>
                      )}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-4 mb-6">
        <select
          value={categoryFilter}
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
        >
          <option value="">전체 카테고리</option>
          <option value="hotel">호텔</option>
          <option value="golf">골프</option>
          <option value="tour">투어</option>
          <option value="convenience">편의</option>
          <option value="insurance">보험</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]"
        >
          <option value="">전체 상태</option>
          <option value="active">판매중</option>
          <option value="inactive">판매중지</option>
        </select>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={products}
        loading={loading}
        emptyMessage="등록된 상품이 없습니다"
        emptyIcon={
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
        }
      />

      {/* Pagination */}
      {total > 0 && (
        <div className="mt-4">
          <TablePagination
            currentPage={page}
            totalPages={Math.ceil(total / limit)}
            totalItems={total}
            itemsPerPage={limit}
            onPageChange={setPage}
            onItemsPerPageChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        </div>
      )}
    </div>
  );
}
