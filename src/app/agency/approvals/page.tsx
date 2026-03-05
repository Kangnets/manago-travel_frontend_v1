'use client';

import { useState } from 'react';
import {
  DocumentCheckIcon,
  PlusIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  EyeIcon,
  PencilSquareIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

type ApprovalStatus = '대기' | '승인' | '반려' | '취소';
type ApprovalCategory = '휴가신청' | '출장신청' | '비용신청' | '업무보고' | '기타';

interface Approval {
  id: string;
  no: number;
  category: ApprovalCategory;
  title: string;
  author: string;
  createdAt: string;
  status: ApprovalStatus;
  approver?: string;
  approvedAt?: string;
  content?: string;
  rejectionReason?: string;
}

const STATUS_CONFIG: Record<ApprovalStatus, { label: string; color: string; icon: React.ElementType }> = {
  대기: { label: '결재 대기', color: 'bg-amber-100 text-amber-700', icon: ClockIcon },
  승인: { label: '승인', color: 'bg-green-100 text-green-700', icon: CheckCircleIcon },
  반려: { label: '반려', color: 'bg-red-100 text-red-700', icon: XCircleIcon },
  취소: { label: '취소', color: 'bg-gray-100 text-gray-600', icon: DocumentTextIcon },
};

const CATEGORY_COLORS: Record<ApprovalCategory, string> = {
  휴가신청: 'bg-blue-50 text-blue-700',
  출장신청: 'bg-purple-50 text-purple-700',
  비용신청: 'bg-orange-50 text-orange-700',
  업무보고: 'bg-teal-50 text-teal-700',
  기타: 'bg-gray-50 text-gray-600',
};

const mockPending: Approval[] = [
  { id: 'AP-004', no: 4, category: '휴가신청', title: '연차 휴가 신청 (3일)', author: '박서연', createdAt: '2024-05-31 09:30', status: '대기', content: '6월 5일~7일(3일) 개인 사유로 연차 신청합니다.' },
  { id: 'AP-005', no: 5, category: '비용신청', title: '파트너사 접대비 정산', author: '이준호', createdAt: '2024-05-30 14:22', status: '대기', content: '다낭 골프클럽 파트너 미팅 접대비 340,000원 지출 결재 요청합니다.' },
  { id: 'AP-006', no: 6, category: '출장신청', title: '베트남 현지 출장 신청', author: '최현우', createdAt: '2024-05-29 16:45', status: '대기', content: '6월 10일~14일 하노이 현지 파트너 미팅 출장 신청합니다.' },
];

const mockCompleted: Approval[] = [
  { id: 'AP-001', no: 1, category: '휴가신청', title: '연차 휴가 신청', author: '김민지', createdAt: '2024-02-02 23:52', status: '승인', approver: '관리자', approvedAt: '2024-02-03 10:15' },
  { id: 'AP-002', no: 2, category: '비용신청', title: '사무용품 구매 결재 요청', author: '정수아', createdAt: '2024-05-20 11:00', status: '승인', approver: '관리자', approvedAt: '2024-05-20 14:30' },
  { id: 'AP-003', no: 3, category: '업무보고', title: '5월 실적 보고서 제출', author: '한동훈', createdAt: '2024-05-28 18:00', status: '승인', approver: '관리자', approvedAt: '2024-05-29 09:00' },
];

const mockMine: Approval[] = [
  { id: 'AP-007', no: 7, category: '휴가신청', title: '내가 신청한 연차 (승인)', author: '나', createdAt: '2024-05-15 09:00', status: '승인', approver: '관리자', approvedAt: '2024-05-15 11:00' },
  { id: 'AP-008', no: 8, category: '비용신청', title: '교통비 정산 요청', author: '나', createdAt: '2024-05-22 10:30', status: '반려', rejectionReason: '영수증 첨부 필요' },
];

interface ApprovalDetailModalProps {
  approval: Approval;
  onClose: () => void;
  onApprove?: (id: string) => void;
  onReject?: (id: string, reason: string) => void;
  canAction?: boolean;
}

function ApprovalDetailModal({ approval, onClose, onApprove, onReject, canAction }: ApprovalDetailModalProps) {
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const cfg = STATUS_CONFIG[approval.status];
  const StatusIcon = cfg.icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h3 className="text-[16px] font-bold text-gray-900 flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-[#ffa726]" />
            결재 문서 상세
          </h3>
          <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
            <XCircleIcon className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${CATEGORY_COLORS[approval.category]}`}>{approval.category}</span>
              <span className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${cfg.color}`}>
                <StatusIcon className="w-3.5 h-3.5" />{cfg.label}
              </span>
            </div>
            <span className="text-[12px] text-gray-400">{approval.createdAt}</span>
          </div>

          <div>
            <p className="text-[13px] font-semibold text-gray-500 mb-1">제목</p>
            <p className="text-[15px] font-bold text-gray-900">{approval.title}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[12px] font-semibold text-gray-500 mb-1">신청자</p>
              <p className="text-[14px] text-gray-800 font-medium">{approval.author}</p>
            </div>
            {approval.approver && (
              <div>
                <p className="text-[12px] font-semibold text-gray-500 mb-1">결재자</p>
                <p className="text-[14px] text-gray-800 font-medium">{approval.approver}</p>
              </div>
            )}
          </div>

          {approval.content && (
            <div>
              <p className="text-[12px] font-semibold text-gray-500 mb-1">내용</p>
              <div className="bg-gray-50 rounded-xl p-4 text-[13px] text-gray-700 leading-relaxed">
                {approval.content}
              </div>
            </div>
          )}

          {approval.rejectionReason && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-[12px] font-bold text-red-700 mb-0.5">반려 사유</p>
                <p className="text-[12px] text-red-600">{approval.rejectionReason}</p>
              </div>
            </div>
          )}

          {canAction && approval.status === '대기' && (
            <div>
              {showRejectForm ? (
                <div className="space-y-2">
                  <textarea
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="반려 사유를 입력하세요"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-300 h-20 resize-none"
                  />
                  <div className="flex gap-2">
                    <button onClick={() => { onReject?.(approval.id, rejectReason); onClose(); }}
                      className="flex-1 py-2 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition-colors">
                      반려 확정
                    </button>
                    <button onClick={() => setShowRejectForm(false)}
                      className="flex-1 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[13px] font-semibold rounded-xl transition-colors">
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => { onApprove?.(approval.id); onClose(); }}
                    className="flex-1 py-2.5 bg-green-500 hover:bg-green-600 text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" /> 승인
                  </button>
                  <button onClick={() => setShowRejectForm(true)}
                    className="flex-1 py-2.5 bg-red-500 hover:bg-red-600 text-white text-[13px] font-semibold rounded-xl transition-colors flex items-center justify-center gap-2">
                    <XCircleIcon className="w-4 h-4" /> 반려
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ApprovalsPage() {
  const [pending, setPending] = useState(mockPending);
  const [completed, setCompleted] = useState(mockCompleted);
  const [mine] = useState(mockMine);
  const [detailApproval, setDetailApproval] = useState<Approval | null>(null);
  const [showNewForm, setShowNewForm] = useState(false);
  const [newCategory, setNewCategory] = useState<ApprovalCategory>('휴가신청');
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  const handleApprove = (id: string) => {
    const target = pending.find((a) => a.id === id);
    if (!target) return;
    setPending((prev) => prev.filter((a) => a.id !== id));
    setCompleted((prev) => [{ ...target, status: '승인', approver: '관리자', approvedAt: new Date().toLocaleString('ko-KR') }, ...prev]);
  };

  const handleReject = (id: string, reason: string) => {
    const target = pending.find((a) => a.id === id);
    if (!target) return;
    setPending((prev) => prev.filter((a) => a.id !== id));
    setCompleted((prev) => [{ ...target, status: '반려', rejectionReason: reason, approvedAt: new Date().toLocaleString('ko-KR') }, ...prev]);
  };

  const handleNewSubmit = () => {
    if (!newTitle.trim()) return;
    const newItem: Approval = {
      id: `AP-${Date.now()}`,
      no: (pending.length + completed.length + mine.length + 1),
      category: newCategory,
      title: newTitle,
      author: '나',
      createdAt: new Date().toLocaleString('ko-KR'),
      status: '대기',
      content: newContent,
    };
    setPending((prev) => [newItem, ...prev]);
    setShowNewForm(false);
    setNewTitle('');
    setNewContent('');
  };

  const ApprovalTable = ({ list, canAction }: { list: Approval[]; canAction?: boolean }) => (
    <table className="w-full text-[12px]">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-600">NO</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600">카테고리</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600">제목</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600">신청자</th>
          <th className="px-4 py-3 text-right font-semibold text-gray-600">등록일</th>
          <th className="px-4 py-3 text-center font-semibold text-gray-600">진행상태</th>
          <th className="px-4 py-3 text-center font-semibold text-gray-600">보기</th>
        </tr>
      </thead>
      <tbody>
        {list.length === 0 ? (
          <tr>
            <td colSpan={7} className="text-center py-10 text-gray-400 text-[13px]">데이터가 존재하지 않습니다.</td>
          </tr>
        ) : (
          list.map((item) => {
            const cfg = STATUS_CONFIG[item.status];
            const StatusIcon = cfg.icon;
            return (
              <tr key={item.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-3 text-gray-500">{item.no}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${CATEGORY_COLORS[item.category]}`}>
                    {item.category}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button
                    onClick={() => setDetailApproval(item)}
                    className="text-gray-800 font-medium hover:text-[#ffa726] hover:underline text-left"
                  >
                    {item.title}
                  </button>
                </td>
                <td className="px-4 py-3 text-gray-600">{item.author}</td>
                <td className="px-4 py-3 text-right text-gray-500">{item.createdAt}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`flex items-center justify-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold w-fit mx-auto ${cfg.color}`}>
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <button
                    onClick={() => setDetailApproval(item)}
                    className="p-1.5 hover:bg-gray-100 rounded-lg group transition-colors"
                  >
                    <EyeIcon className="w-4 h-4 text-gray-400 group-hover:text-[#ffa726]" />
                  </button>
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  );

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900 flex items-center gap-2">
            <DocumentCheckIcon className="w-7 h-7 text-[#ffa726]" />
            결재 관리
          </h1>
          <p className="text-[14px] text-gray-500 mt-1">결재 문서 작성, 승인, 반려 관리</p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-semibold rounded-xl hover:from-[#f57c00] hover:to-[#ffa726] transition-all shadow-md text-[13px]"
        >
          <PlusIcon className="w-4 h-4" />
          결재 등록
        </button>
      </div>

      {/* 새 결재 등록 폼 */}
      {showNewForm && (
        <div className="bg-white border border-[#ffa726]/40 rounded-2xl p-6 mb-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-gray-800 flex items-center gap-2 mb-4">
            <PencilSquareIcon className="w-5 h-5 text-[#ffa726]" />
            새 결재 문서 작성
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">카테고리</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as ApprovalCategory)}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
              >
                {(['휴가신청', '출장신청', '비용신청', '업무보고', '기타'] as ApprovalCategory[]).map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">제목</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="결재 문서 제목"
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="text-[12px] font-semibold text-gray-600 mb-1.5 block">내용</label>
            <textarea
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              placeholder="결재 요청 내용을 입력하세요"
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-[13px] text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30 h-24 resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button onClick={() => setShowNewForm(false)} className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-[13px] font-semibold rounded-xl transition-colors">취소</button>
            <button onClick={handleNewSubmit} className="px-5 py-2 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white text-[13px] font-semibold rounded-xl hover:from-[#f57c00] hover:to-[#ffa726] transition-all">제출</button>
          </div>
        </div>
      )}

      {/* 결재 대기 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClockIcon className="w-5 h-5 text-amber-500" />
            <h2 className="text-[14px] font-bold text-gray-800">결재 대기 문서</h2>
            {pending.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[11px] font-bold rounded-full">{pending.length}</span>
            )}
          </div>
          <button className="text-[12px] text-[#ffa726] hover:underline flex items-center gap-1">
            더보기 <ChevronRightIcon className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <ApprovalTable list={pending} canAction />
        </div>
      </div>

      {/* 결재 완료 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm mb-5">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircleIcon className="w-5 h-5 text-green-500" />
            <h2 className="text-[14px] font-bold text-gray-800">결재 완료 문서</h2>
          </div>
          <button className="text-[12px] text-[#ffa726] hover:underline flex items-center gap-1">
            더보기 <ChevronRightIcon className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <ApprovalTable list={completed} />
        </div>
      </div>

      {/* 결재함 (내가 신청) */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-3.5 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DocumentTextIcon className="w-5 h-5 text-blue-500" />
            <h2 className="text-[14px] font-bold text-gray-800">결재함 (내가 신청한 문서)</h2>
          </div>
          <button className="text-[12px] text-[#ffa726] hover:underline flex items-center gap-1">
            더보기 <ChevronRightIcon className="w-3 h-3" />
          </button>
        </div>
        <div className="overflow-x-auto">
          <ApprovalTable list={mine} />
        </div>
      </div>

      {/* 상세 모달 */}
      {detailApproval && (
        <ApprovalDetailModal
          approval={detailApproval}
          onClose={() => setDetailApproval(null)}
          onApprove={handleApprove}
          onReject={handleReject}
          canAction={detailApproval.status === '대기'}
        />
      )}
    </div>
  );
}
