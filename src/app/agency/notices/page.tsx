'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { noticesAPI, NoticeRecord } from '@/lib/agencyApi';
import {
  MegaphoneIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline';

type Mode = 'list' | 'new' | 'view' | 'edit';

const CATEGORY_LABELS: Record<string, string> = {
  general: '일반',
  urgent: '긴급',
  system: '시스템',
  travel: '여행정보',
};

const CATEGORY_COLORS: Record<string, string> = {
  general: 'bg-gray-100 text-gray-700',
  urgent: 'bg-red-100 text-red-700',
  system: 'bg-blue-100 text-blue-700',
  travel: 'bg-green-100 text-green-700',
};

export default function NoticesPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>('list');
  const [notices, setNotices] = useState<NoticeRecord[]>([]);
  const [selectedNotice, setSelectedNotice] = useState<NoticeRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<'general' | 'urgent' | 'system' | 'travel'>('general');
  const [isPinned, setIsPinned] = useState(false);

  useEffect(() => {
    fetchNotices();
  }, [currentPage]);

  const fetchNotices = async () => {
    setLoading(true);
    try {
      const result = await noticesAPI.getAll({ page: currentPage, limit: itemsPerPage, my: true });
      setNotices(result.data);
      setTotal(result.total);
    } catch (error) {
      console.error('공지사항 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNew = () => {
    setTitle('');
    setContent('');
    setCategory('general');
    setIsPinned(false);
    setSelectedNotice(null);
    setMode('new');
  };

  const handleView = async (notice: NoticeRecord) => {
    setSelectedNotice(notice);
    setTitle(notice.title);
    setContent(notice.content);
    setCategory(notice.category);
    setIsPinned(notice.isPinned);
    setMode('view');
  };

  const handleEdit = () => setMode('edit');

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert('제목과 내용을 입력해주세요.');
      return;
    }
    setSaving(true);
    try {
      if (mode === 'new') {
        await noticesAPI.create({ title, content, category, isPinned });
        alert('공지사항이 등록되었습니다.');
      } else if (mode === 'edit' && selectedNotice) {
        await noticesAPI.update(selectedNotice.id, { title, content, category, isPinned });
        alert('공지사항이 수정되었습니다.');
      }
      await fetchNotices();
      setMode('list');
    } catch (error) {
      console.error('공지사항 저장 실패:', error);
      alert('저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedNotice || !confirm('정말 삭제하시겠습니까?')) return;
    setSaving(true);
    try {
      await noticesAPI.delete(selectedNotice.id);
      alert('공지사항이 삭제되었습니다.');
      await fetchNotices();
      setMode('list');
    } catch (error) {
      console.error('공지사항 삭제 실패:', error);
      alert('삭제에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setMode('list');
    setSelectedNotice(null);
  };

  const totalPages = Math.ceil(total / itemsPerPage);

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
            <MegaphoneIcon className="w-7 h-7 text-[#ffa726]" />
            공지사항
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">여행사 내부 공지 및 안내사항 관리</p>
        </div>
        {mode === 'list' && (
          <button
            onClick={handleNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#ffa726] text-white font-semibold rounded-xl hover:bg-[#f57c00] transition-colors text-[13px]"
          >
            <PlusIcon className="w-4 h-4" />
            신규 등록
          </button>
        )}
      </div>

      {/* 목록 */}
      {mode === 'list' && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200">
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-600 w-16">NO</th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-600 w-28">분류</th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-600">제목</th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-600 w-36">작성자</th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-600 w-40">등록일</th>
                  <th className="px-5 py-3 text-left text-[12px] font-semibold text-gray-600 w-16">조회</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-5 h-5 border-2 border-[#ffa726] border-t-transparent rounded-full animate-spin" />
                        <span className="text-[13px] text-gray-500">로딩 중...</span>
                      </div>
                    </td>
                  </tr>
                ) : notices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-[13px] text-gray-400">
                      등록된 공지사항이 없습니다.
                    </td>
                  </tr>
                ) : (
                  notices.map((notice, idx) => (
                    <tr
                      key={notice.id}
                      className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
                      onClick={() => handleView(notice)}
                    >
                      <td className="px-5 py-3.5 text-[13px] text-gray-600">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${CATEGORY_COLORS[notice.category] || 'bg-gray-100 text-gray-700'}`}>
                          {CATEGORY_LABELS[notice.category] || notice.category}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-900 font-medium">
                        <div className="flex items-center gap-1.5">
                          {notice.isPinned && (
                            <span className="text-[#ffa726]">📌</span>
                          )}
                          {notice.title}
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600">
                        {notice.authorName || user?.name || '-'}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600">
                        {new Date(notice.created).toLocaleDateString('ko-KR')}
                      </td>
                      <td className="px-5 py-3.5 text-[13px] text-gray-600">
                        {notice.viewCount}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-5 py-4 border-t border-gray-100 flex justify-center">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm"
                >
                  ‹
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 flex items-center justify-center rounded text-[13px] font-medium ${
                      currentPage === page
                        ? 'bg-[#ffa726] text-white'
                        : 'border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="w-8 h-8 flex items-center justify-center rounded border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 text-sm"
                >
                  ›
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* 상세/작성/수정 */}
      {(mode === 'view' || mode === 'edit' || mode === 'new') && (
        <div className="bg-white border border-gray-200 rounded-2xl">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 text-gray-600 hover:text-gray-900 text-[13px] font-medium"
            >
              <ChevronLeftIcon className="w-4 h-4" />
              목록으로
            </button>
            <h2 className="text-[15px] font-bold text-gray-900">
              {mode === 'new' ? '공지사항 등록' : mode === 'edit' ? '공지사항 수정' : '공지사항 상세'}
            </h2>
            <div className="flex gap-2">
              {mode === 'view' && selectedNotice?.authorId === user?.id && (
                <>
                  <button
                    onClick={handleEdit}
                    className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-[13px] font-medium rounded-lg hover:bg-blue-700"
                  >
                    <PencilSquareIcon className="w-3.5 h-3.5" />
                    수정
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={saving}
                    className="flex items-center gap-1.5 px-3 py-2 bg-red-600 text-white text-[13px] font-medium rounded-lg hover:bg-red-700 disabled:opacity-50"
                  >
                    <TrashIcon className="w-3.5 h-3.5" />
                    삭제
                  </button>
                </>
              )}
              {(mode === 'edit' || mode === 'new') && (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-[#ffa726] text-white text-[13px] font-medium rounded-lg hover:bg-[#f57c00] disabled:opacity-50"
                >
                  {saving ? '저장 중...' : '저장'}
                </button>
              )}
            </div>
          </div>

          <div className="p-6 space-y-5">
            {/* 분류 & 고정 */}
            {mode !== 'view' && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">분류</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as typeof category)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
                  >
                    {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">상단 고정</label>
                  <label className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg cursor-pointer h-[38px]">
                    <input
                      type="checkbox"
                      checked={isPinned}
                      onChange={(e) => setIsPinned(e.target.checked)}
                      className="accent-[#ffa726]"
                    />
                    <span className="text-[13px] text-gray-700">고정</span>
                  </label>
                </div>
              </div>
            )}

            {mode === 'view' && selectedNotice && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${CATEGORY_COLORS[selectedNotice.category] || 'bg-gray-100 text-gray-700'}`}>
                  {CATEGORY_LABELS[selectedNotice.category] || selectedNotice.category}
                </span>
                {selectedNotice.isPinned && (
                  <span className="text-[12px] text-[#ffa726] font-medium">📌 상단 고정</span>
                )}
                <span className="text-[12px] text-gray-500 ml-auto">
                  조회 {selectedNotice.viewCount}회 · {new Date(selectedNotice.created).toLocaleString('ko-KR')}
                </span>
              </div>
            )}

            {/* 제목 */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">제목</label>
              {mode === 'view' ? (
                <div className="px-4 py-3 bg-gray-50 rounded-lg text-[14px] text-gray-900 font-medium">
                  {title}
                </div>
              ) : (
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="제목을 입력하세요"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[14px] text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
                />
              )}
            </div>

            {/* 내용 */}
            <div>
              <label className="block text-[12px] font-semibold text-gray-600 mb-1.5">내용</label>
              {mode === 'view' ? (
                <div className="px-4 py-4 bg-gray-50 rounded-lg text-[14px] text-gray-800 min-h-[200px] whitespace-pre-wrap leading-relaxed">
                  {content}
                </div>
              ) : (
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="내용을 입력하세요"
                  rows={12}
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg text-[14px] text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30 resize-none"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
