'use client';

import { useState, useMemo } from 'react';
import {
  BellIcon,
  BellAlertIcon,
  CheckCircleIcon,
  XMarkIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  ClipboardDocumentListIcon,
  CubeIcon,
  BanknotesIcon,
  UserCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  TrashIcon,
  EnvelopeOpenIcon,
} from '@heroicons/react/24/outline';
import {
  BellIcon as BellSolid,
} from '@heroicons/react/24/solid';

type NotifCategory = 'reservation' | 'product' | 'settlement' | 'system' | 'alert';
type NotifPriority = 'high' | 'medium' | 'low';

interface Notification {
  id: string;
  category: NotifCategory;
  priority: NotifPriority;
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
  link?: string;
}

let mockNotifications: Notification[] = [
  { id: '1', category: 'reservation', priority: 'high', title: '신규 예약 접수', body: '다낭 골프 패키지 3박 5일 예약이 들어왔습니다. (예약번호: R-2405-0078)', createdAt: '2024-05-31 14:22', read: false, link: '/agency/reservations' },
  { id: '2', category: 'settlement', priority: 'high', title: '정산 반려 알림', body: '2024-04월 푸꾸옥리조트투어 정산이 반려되었습니다. 계좌 정보를 확인하세요.', createdAt: '2024-05-30 11:05', read: false, link: '/agency/settlements' },
  { id: '3', category: 'alert', priority: 'high', title: '여권 만료 임박 여행자', body: '예약 R-2405-0065의 여행자 1명의 여권이 6개월 이내에 만료됩니다.', createdAt: '2024-05-29 09:30', read: false, link: '/agency/reservations' },
  { id: '4', category: 'reservation', priority: 'medium', title: '예약 취소 요청', body: '호치민 3박 4일 패키지 예약(R-2405-0071)에서 취소 요청이 들어왔습니다.', createdAt: '2024-05-28 16:44', read: true, link: '/agency/reservations' },
  { id: '5', category: 'product', priority: 'medium', title: '상품 마감 임박', body: '나트랑 스파 힐링 2박 3일 상품이 잔여석 3석입니다.', createdAt: '2024-05-27 10:00', read: true, link: '/agency/products' },
  { id: '6', category: 'settlement', priority: 'medium', title: '5월 정산 신청 가능', body: '2024년 5월 정산 신청 기간이 시작되었습니다. (~ 2024-06-07)', createdAt: '2024-05-31 00:00', read: false, link: '/agency/settlements' },
  { id: '7', category: 'system', priority: 'low', title: '시스템 정기 점검 안내', body: '2024-06-03 02:00~04:00 서버 정기 점검이 예정되어 있습니다.', createdAt: '2024-05-26 15:00', read: true },
  { id: '8', category: 'product', priority: 'low', title: '상품 등록 완료', body: '하노이 야경투어 2박 3일 상품이 성공적으로 등록되었습니다.', createdAt: '2024-05-24 13:20', read: true, link: '/agency/products' },
  { id: '9', category: 'system', priority: 'low', title: '공지사항 등록', body: '2024년 여름 시즌 운영 가이드가 공지사항에 등록되었습니다.', createdAt: '2024-05-22 09:00', read: true, link: '/agency/notices' },
  { id: '10', category: 'reservation', priority: 'medium', title: '결제 완료 알림', body: '예약 R-2405-0058 잔금 결제가 완료되었습니다. (₩1,280,000)', createdAt: '2024-05-21 17:55', read: true, link: '/agency/reservations' },
  { id: '11', category: 'alert', priority: 'high', title: '미결제 예약 마감 임박', body: '예약 R-2405-0069의 입금 마감일이 내일까지입니다.', createdAt: '2024-05-20 08:30', read: false, link: '/agency/reservations' },
  { id: '12', category: 'settlement', priority: 'low', title: '3월 정산 완료', body: '2024년 3월 정산이 완료되어 계좌로 입금되었습니다. (₩28,080,000)', createdAt: '2024-04-04 14:00', read: true, link: '/agency/settlements' },
];

const CATEGORY_CONFIG: Record<NotifCategory, { label: string; color: string; icon: React.ElementType }> = {
  reservation: { label: '예약', color: 'bg-blue-100 text-blue-700', icon: ClipboardDocumentListIcon },
  product:     { label: '상품', color: 'bg-purple-100 text-purple-700', icon: CubeIcon },
  settlement:  { label: '정산', color: 'bg-green-100 text-green-700', icon: BanknotesIcon },
  system:      { label: '시스템', color: 'bg-gray-100 text-gray-600', icon: InformationCircleIcon },
  alert:       { label: '알림', color: 'bg-red-100 text-red-700', icon: ExclamationTriangleIcon },
};

const PRIORITY_CONFIG: Record<NotifPriority, { label: string; color: string }> = {
  high:   { label: '중요', color: 'bg-red-500' },
  medium: { label: '보통', color: 'bg-amber-400' },
  low:    { label: '낮음', color: 'bg-gray-300' },
};

const FILTER_TABS: Array<{ key: NotifCategory | 'all'; label: string }> = [
  { key: 'all', label: '전체' },
  { key: 'reservation', label: '예약' },
  { key: 'product', label: '상품' },
  { key: 'settlement', label: '정산' },
  { key: 'alert', label: '알림' },
  { key: 'system', label: '시스템' },
];

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [categoryFilter, setCategoryFilter] = useState<NotifCategory | 'all'>('all');
  const [readFilter, setReadFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = useMemo(() => {
    let data = [...notifications];
    if (categoryFilter !== 'all') data = data.filter((n) => n.category === categoryFilter);
    if (readFilter === 'unread') data = data.filter((n) => !n.read);
    if (readFilter === 'read') data = data.filter((n) => n.read);
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      data = data.filter((n) => n.title.toLowerCase().includes(q) || n.body.toLowerCase().includes(q));
    }
    return data;
  }, [notifications, categoryFilter, readFilter, searchQuery]);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, read: true } : n));
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const deleteNotif = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const deleteAll = () => {
    setNotifications((prev) => prev.filter((n) => !n.read));
  };

  const relativeTime = (dateStr: string) => {
    const d = new Date(dateStr.replace(' ', 'T'));
    const now = new Date();
    const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
    if (diff < 60) return '방금 전';
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`;
    return `${Math.floor(diff / 86400)}일 전`;
  };

  return (
    <div className="h-full">
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            <BellSolid className="w-7 h-7 text-[#ffa726]" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          <div>
            <h1 className="text-[24px] font-bold text-gray-900">알림</h1>
            <p className="text-[14px] text-gray-500">읽지 않은 알림 {unreadCount}개</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-2 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors text-[13px]">
              <EnvelopeOpenIcon className="w-4 h-4" />
              전체 읽음
            </button>
          )}
          <button onClick={deleteAll} className="flex items-center gap-2 px-4 py-2.5 border border-red-200 text-red-600 font-semibold rounded-xl hover:bg-red-50 transition-colors text-[13px]">
            <TrashIcon className="w-4 h-4" />
            읽은 알림 삭제
          </button>
        </div>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-5 gap-3 mb-5">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
          const cnt = notifications.filter((n) => n.category === key).length;
          const unread = notifications.filter((n) => n.category === key && !n.read).length;
          const Icon = cfg.icon;
          return (
            <button
              key={key}
              onClick={() => setCategoryFilter(key as NotifCategory | 'all')}
              className={`text-left p-4 rounded-2xl border transition-all ${categoryFilter === key ? 'ring-2 ring-[#ffa726] border-[#ffa726]/30' : 'border-gray-200 hover:border-gray-300'} bg-white`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`p-1.5 rounded-lg ${cfg.color}`}>
                  <Icon className="w-4 h-4" />
                </span>
                {unread > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">{unread}</span>
                )}
              </div>
              <p className="text-[11px] font-semibold text-gray-500 mb-0.5">{cfg.label}</p>
              <p className="text-[20px] font-bold text-gray-800">{cnt}</p>
            </button>
          );
        })}
      </div>

      {/* 필터 바 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-3 mb-4 flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1.5">
          <FunnelIcon className="w-4 h-4 text-gray-400" />
          {FILTER_TABS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => setCategoryFilter(key as NotifCategory | 'all')}
              className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-colors ${
                categoryFilter === key
                  ? 'bg-[#ffa726] border-[#ffa726] text-white'
                  : 'bg-white border-gray-200 text-gray-600 hover:border-[#ffa726]/50'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="h-4 w-px bg-gray-200" />
        {(['all', 'unread', 'read'] as const).map((k) => (
          <button
            key={k}
            onClick={() => setReadFilter(k)}
            className={`px-3 py-1.5 rounded-xl text-[12px] font-semibold border transition-colors ${
              readFilter === k ? 'bg-gray-800 border-gray-800 text-white' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'
            }`}
          >
            {k === 'all' ? '전체' : k === 'unread' ? '읽지 않음' : '읽음'}
          </button>
        ))}
        <div className="ml-auto relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="알림 검색"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-[13px] text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30 w-44"
          />
        </div>
      </div>

      {/* 알림 목록 */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-16 text-center">
            <BellIcon className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-[14px] font-medium text-gray-500">알림이 없습니다</p>
            <p className="text-[12px] text-gray-400 mt-1">선택된 조건에 해당하는 알림이 없습니다</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filtered.map((notif) => {
              const cfg = CATEGORY_CONFIG[notif.category];
              const pCfg = PRIORITY_CONFIG[notif.priority];
              const CatIcon = cfg.icon;
              return (
                <div
                  key={notif.id}
                  className={`group relative flex items-start gap-4 px-5 py-4 transition-colors ${
                    !notif.read ? 'bg-orange-50/40' : 'hover:bg-gray-50'
                  }`}
                >
                  {/* 읽음 표시 dot */}
                  {!notif.read && (
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#ffa726]" />
                  )}

                  {/* 카테고리 아이콘 */}
                  <div className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center ${cfg.color}`}>
                    <CatIcon className="w-4.5 h-4.5" />
                  </div>

                  {/* 본문 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className={`w-2 h-2 rounded-full ${pCfg.color} shrink-0`} />
                      <p className={`text-[13px] font-semibold truncate ${!notif.read ? 'text-gray-900' : 'text-gray-700'}`}>
                        {notif.title}
                      </p>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${cfg.color}`}>{cfg.label}</span>
                      {!notif.read && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-orange-100 text-orange-700">NEW</span>}
                    </div>
                    <p className="text-[12px] text-gray-500 leading-relaxed line-clamp-2">{notif.body}</p>
                    <p className="text-[11px] text-gray-400 mt-1">{relativeTime(notif.createdAt)} · {notif.createdAt}</p>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="shrink-0 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {notif.link && (
                      <a
                        href={notif.link}
                        onClick={() => markRead(notif.id)}
                        className="px-3 py-1.5 bg-[#ffa726] text-white text-[11px] font-semibold rounded-lg hover:bg-[#f57c00] transition-colors"
                      >
                        바로가기
                      </a>
                    )}
                    {!notif.read && (
                      <button onClick={() => markRead(notif.id)} className="p-1.5 hover:bg-gray-100 rounded-lg" title="읽음 처리">
                        <CheckCircleIcon className="w-4 h-4 text-green-600" />
                      </button>
                    )}
                    <button onClick={() => deleteNotif(notif.id)} className="p-1.5 hover:bg-red-50 rounded-lg" title="삭제">
                      <XMarkIcon className="w-4 h-4 text-gray-400 hover:text-red-500" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
