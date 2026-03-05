'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  PlusIcon,
  TrashIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';

// ─── 타입 ───────────────────────────────────────────────────────────────────

export interface ItineraryRow {
  day: number;
  title: string;
  description: string;
  meals: string;
}

export interface ProductFormData {
  // 기본 정보
  title: string;
  description: string;
  location: string;
  country: string;
  duration: string;
  category: string;
  imageUrl: string;
  isActive: boolean;
  isFeatured: boolean;

  // 출발/도착
  departureDate: string;
  returnDate: string;
  departureInfo: string;  // 예: "08:25 - 인천공항 (VN417)"
  returnInfo: string;

  // 가격
  price: string;
  originalPrice: string;
  priceChild: string;
  priceInfant: string;

  // 인원
  minParticipants: string;
  blockSeats: string;

  // 연락처
  inquiryPhone: string;
  inquiryFax: string;

  // 상세 일정표
  itinerary: ItineraryRow[];

  // 포함/불포함
  included: string[];
  excluded: string[];

  // 취소 정책
  cancelPolicy: string;
}

export const defaultFormData: ProductFormData = {
  title: '',
  description: '',
  location: '',
  country: '베트남',
  duration: '',
  category: 'tour',
  imageUrl: '',
  isActive: true,
  isFeatured: false,
  departureDate: '',
  returnDate: '',
  departureInfo: '',
  returnInfo: '',
  price: '',
  originalPrice: '',
  priceChild: '',
  priceInfant: '',
  minParticipants: '2',
  blockSeats: '10',
  inquiryPhone: '1588-8899',
  inquiryFax: '',
  itinerary: [{ day: 1, title: '', description: '', meals: '' }],
  included: ['왕복 항공권', '호텔 숙박', '전용 차량', '한국어 가이드'],
  excluded: ['개인 경비', '선택관광'],
  cancelPolicy: '출발 30일 전: 전액 환불\n출발 20일 전: 10% 공제\n출발 10일 전: 20% 공제\n출발 3일 전 이후: 30% 공제\n당일 취소: 환불 불가',
};

const CATEGORIES = [
  { value: 'tour',        label: '투어' },
  { value: 'hotel',       label: '호텔' },
  { value: 'golf',        label: '골프' },
  { value: 'convenience', label: '편의' },
  { value: 'insurance',   label: '보험' },
];

// ─── 재사용 스타일 ────────────────────────────────────────────────────────────

const inputCls =
  'w-full px-4 py-2.5 border border-gray-300 rounded-xl text-[14px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/20 focus:border-[#ffa726]';
const labelCls = 'block text-[13px] font-medium text-gray-700 mb-1.5';
const cardCls  = 'bg-white rounded-2xl border border-gray-100 p-6';

// ─── 공통 섹션: 포함/불포함 동적 목록 ──────────────────────────────────────

function TagList({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string;
  items: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const v = draft.trim();
    if (v) { onChange([...items, v]); setDraft(''); }
  };

  return (
    <div>
      <p className={labelCls}>{label}</p>
      <div className="flex flex-wrap gap-2 mb-2 min-h-[32px]">
        {items.map((item, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-800 rounded-lg text-[13px]"
          >
            {item}
            <button
              type="button"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
              className="text-gray-400 hover:text-red-500 ml-1 leading-none"
            >
              ×
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } }}
          className={`flex-1 ${inputCls}`}
          placeholder={placeholder ?? '항목을 입력 후 Enter 또는 추가 버튼'}
        />
        <button
          type="button"
          onClick={add}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-[13px] font-medium transition-colors"
        >
          추가
        </button>
      </div>
    </div>
  );
}

// ─── 메인 폼 컴포넌트 ────────────────────────────────────────────────────────

interface Props {
  initial: ProductFormData;
  submitLabel: string;
  isLoading: boolean;
  error: string;
  onSubmit: (data: ProductFormData) => void;
  backHref?: string;
  pageTitle: string;
  pageSubtitle: string;
}

export default function AgencyProductForm({
  initial,
  submitLabel,
  isLoading,
  error,
  onSubmit,
  backHref = '/agency/products',
  pageTitle,
  pageSubtitle,
}: Props) {
  const [form, setForm] = useState<ProductFormData>(initial);

  const set = (patch: Partial<ProductFormData>) =>
    setForm((prev) => ({ ...prev, ...patch }));

  // ── 일정표 조작 ─────────────────────────────────────────────────────────
  const addDay = () =>
    set({
      itinerary: [
        ...form.itinerary,
        { day: form.itinerary.length + 1, title: '', description: '', meals: '' },
      ],
    });

  const removeDay = (idx: number) => {
    const next = form.itinerary
      .filter((_, i) => i !== idx)
      .map((row, i) => ({ ...row, day: i + 1 }));
    set({ itinerary: next });
  };

  const moveDay = (idx: number, dir: -1 | 1) => {
    const arr = [...form.itinerary];
    const target = idx + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[idx], arr[target]] = [arr[target], arr[idx]];
    set({ itinerary: arr.map((r, i) => ({ ...r, day: i + 1 })) });
  };

  const updateDay = (idx: number, patch: Partial<ItineraryRow>) => {
    const next = form.itinerary.map((r, i) => (i === idx ? { ...r, ...patch } : r));
    set({ itinerary: next });
  };

  // ── 제출 ────────────────────────────────────────────────────────────────
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <div className="max-w-3xl">
      {/* 헤더 */}
      <div className="mb-6">
        <Link href={backHref} className="inline-flex items-center gap-1 text-[14px] text-gray-500 hover:text-gray-700 mb-4">
          ← 목록으로
        </Link>
        <h1 className="text-[24px] font-bold text-gray-900">{pageTitle}</h1>
        <p className="text-[14px] text-gray-500 mt-1">{pageSubtitle}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── 1. 기본 정보 ─────────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">1. 기본 정보</h2>
          <div className="space-y-4">
            <div>
              <label className={labelCls}>상품명 *</label>
              <input
                type="text" required value={form.title}
                onChange={(e) => set({ title: e.target.value })}
                className={inputCls} placeholder="예: 다낭 럭셔리 리조트 3박 4일"
              />
            </div>
            <div>
              <label className={labelCls}>상품 설명</label>
              <textarea
                value={form.description}
                onChange={(e) => set({ description: e.target.value })}
                className={`${inputCls} min-h-[90px]`}
                placeholder="고객에게 보여줄 상품 소개 문구를 입력하세요"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>카테고리 *</label>
                <select value={form.category} onChange={(e) => set({ category: e.target.value })} className={inputCls}>
                  {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>여행 기간 *</label>
                <input type="text" required value={form.duration}
                  onChange={(e) => set({ duration: e.target.value })}
                  className={inputCls} placeholder="예: 3박 4일" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>지역 *</label>
                <input type="text" required value={form.location}
                  onChange={(e) => set({ location: e.target.value })}
                  className={inputCls} placeholder="예: 다낭" />
              </div>
              <div>
                <label className={labelCls}>국가 *</label>
                <input type="text" required value={form.country}
                  onChange={(e) => set({ country: e.target.value })}
                  className={inputCls} placeholder="예: 베트남" />
              </div>
            </div>
          </div>
        </div>

        {/* ── 2. 출발/도착 정보 ────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">2. 출발 · 도착 정보</h2>
          <p className="text-[12px] text-gray-400 mb-4">예약 상세 페이지의 출발/도착 일시 표시에 사용됩니다</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>출발일</label>
                <input type="date" value={form.departureDate}
                  onChange={(e) => set({ departureDate: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>도착(귀국)일</label>
                <input type="date" value={form.returnDate}
                  onChange={(e) => set({ returnDate: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>출발 시간 · 항공편</label>
              <input type="text" value={form.departureInfo}
                onChange={(e) => set({ departureInfo: e.target.value })}
                className={inputCls} placeholder="예: 08:25 - 인천공항 (VN417)" />
            </div>
            <div>
              <label className={labelCls}>도착 시간 · 항공편</label>
              <input type="text" value={form.returnInfo}
                onChange={(e) => set({ returnInfo: e.target.value })}
                className={inputCls} placeholder="예: 22:40 - 인천공항 (VN418)" />
            </div>
          </div>
        </div>

        {/* ── 3. 가격 / 인원 ────────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-1">3. 가격 · 인원</h2>
          <p className="text-[12px] text-gray-400 mb-4">연령별 가격을 입력하지 않으면 성인가로 통일 표시됩니다</p>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>성인 판매가 (만 12세 이상) *</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                  <input type="number" required value={form.price}
                    onChange={(e) => set({ price: e.target.value })}
                    className={`${inputCls} pl-8`} placeholder="0" />
                </div>
              </div>
              <div>
                <label className={labelCls}>정가 (할인 표시용)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                  <input type="number" value={form.originalPrice}
                    onChange={(e) => set({ originalPrice: e.target.value })}
                    className={`${inputCls} pl-8`} placeholder="0" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>소아가 (만 12세 미만)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                  <input type="number" value={form.priceChild}
                    onChange={(e) => set({ priceChild: e.target.value })}
                    className={`${inputCls} pl-8`} placeholder="0 (미입력 시 무료)" />
                </div>
              </div>
              <div>
                <label className={labelCls}>유아가 (만 2세 미만, No Bed)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">₩</span>
                  <input type="number" value={form.priceInfant}
                    onChange={(e) => set({ priceInfant: e.target.value })}
                    className={`${inputCls} pl-8`} placeholder="0 (미입력 시 무료)" />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelCls}>최소 출발 인원</label>
                <input type="number" min="1" value={form.minParticipants}
                  onChange={(e) => set({ minParticipants: e.target.value })}
                  className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>블럭(정원)</label>
                <input type="number" min="1" value={form.blockSeats}
                  onChange={(e) => set({ blockSeats: e.target.value })}
                  className={inputCls} />
              </div>
            </div>
          </div>
        </div>

        {/* ── 4. 이미지 ──────────────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">4. 이미지</h2>
          <div>
            <label className={labelCls}>대표 이미지 URL *</label>
            <input type="url" required value={form.imageUrl}
              onChange={(e) => set({ imageUrl: e.target.value })}
              className={inputCls} placeholder="https://images.unsplash.com/..." />
            {form.imageUrl && (
              <div className="mt-3">
                <img src={form.imageUrl} alt="미리보기"
                  className="w-full max-w-sm h-44 object-cover rounded-xl border border-gray-200"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                />
              </div>
            )}
          </div>
        </div>

        {/* ── 5. 상세 일정표 ─────────────────────────────────────────────── */}
        <div className={cardCls}>
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-[16px] font-bold text-gray-900">5. 상세 일정표</h2>
            <button type="button" onClick={addDay}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#ffa726] text-white rounded-xl text-[13px] font-bold hover:bg-[#f57c00] transition-colors">
              <PlusIcon className="w-4 h-4" />일정 추가
            </button>
          </div>
          <p className="text-[12px] text-gray-400 mb-4">일차별로 세부 일정을 입력하세요. 드래그 대신 ▲▼ 버튼으로 순서를 조정합니다.</p>

          {form.itinerary.length === 0 && (
            <div className="text-center py-8 text-gray-400 text-[14px] border-2 border-dashed border-gray-200 rounded-xl">
              일정을 추가해주세요
            </div>
          )}

          <div className="space-y-3">
            {form.itinerary.map((row, idx) => (
              <div key={idx}
                className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                <div className="flex items-center gap-3 px-4 py-3 bg-white border-b border-gray-100">
                  <span className="w-8 h-8 flex items-center justify-center rounded-full bg-[#ffa726] text-white text-[13px] font-bold flex-shrink-0">
                    {row.day}
                  </span>
                  <input type="text" value={row.title}
                    onChange={(e) => updateDay(idx, { title: e.target.value })}
                    className="flex-1 px-3 py-1.5 border border-gray-200 rounded-lg text-[14px] font-semibold focus:outline-none focus:border-[#ffa726]"
                    placeholder={`${row.day}일차 제목 (예: 인천 → 다낭)`} />
                  <div className="flex items-center gap-1 ml-auto flex-shrink-0">
                    <button type="button" onClick={() => moveDay(idx, -1)} disabled={idx === 0}
                      className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                      <ChevronUpIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button type="button" onClick={() => moveDay(idx, 1)} disabled={idx === form.itinerary.length - 1}
                      className="p-1.5 hover:bg-gray-100 rounded-lg disabled:opacity-30 transition-colors">
                      <ChevronDownIcon className="w-4 h-4 text-gray-600" />
                    </button>
                    <button type="button" onClick={() => removeDay(idx)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition-colors ml-1">
                      <TrashIcon className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                <div className="p-4 space-y-3">
                  <div>
                    <label className="text-[12px] font-medium text-gray-500 mb-1 block">일정 설명</label>
                    <textarea value={row.description}
                      onChange={(e) => updateDay(idx, { description: e.target.value })}
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#ffa726] resize-none bg-white"
                      placeholder="해당 일차의 세부 일정을 입력하세요" />
                  </div>
                  <div>
                    <label className="text-[12px] font-medium text-gray-500 mb-1 block">식사</label>
                    <input type="text" value={row.meals}
                      onChange={(e) => updateDay(idx, { meals: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-[13px] focus:outline-none focus:border-[#ffa726] bg-white"
                      placeholder="예: 조식, 중식, 석식 / 기내식" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── 6. 포함/불포함 ─────────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">6. 포함 · 불포함 사항</h2>
          <div className="space-y-6">
            <TagList
              label="포함 사항"
              items={form.included}
              onChange={(v) => set({ included: v })}
              placeholder="예: 왕복 항공권"
            />
            <TagList
              label="불포함 사항"
              items={form.excluded}
              onChange={(v) => set({ excluded: v })}
              placeholder="예: 개인 경비"
            />
          </div>
        </div>

        {/* ── 7. 취소·환불 정책 ──────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">7. 취소 · 환불 정책</h2>
          <textarea value={form.cancelPolicy}
            onChange={(e) => set({ cancelPolicy: e.target.value })}
            rows={6}
            className={`${inputCls} font-mono text-[13px]`}
            placeholder={"예:\n출발 30일 전: 전액 환불\n출발 20일 전: 10% 공제\n출발 10일 전: 20% 공제\n당일 취소: 환불 불가"} />
        </div>

        {/* ── 8. 문의 안내 ───────────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">8. 문의 안내</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>문의 전화</label>
              <input type="tel" value={form.inquiryPhone}
                onChange={(e) => set({ inquiryPhone: e.target.value })}
                className={inputCls} placeholder="예: 1588-8899" />
            </div>
            <div>
              <label className={labelCls}>팩스 번호</label>
              <input type="tel" value={form.inquiryFax}
                onChange={(e) => set({ inquiryFax: e.target.value })}
                className={inputCls} placeholder="예: 02-0000-0000" />
            </div>
          </div>
        </div>

        {/* ── 9. 판매 설정 ───────────────────────────────────────────────── */}
        <div className={cardCls}>
          <h2 className="text-[16px] font-bold text-gray-900 mb-4">9. 판매 설정</h2>
          <div className="space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isActive}
                onChange={(e) => set({ isActive: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#ffa726] focus:ring-[#ffa726]" />
              <div>
                <p className="text-[14px] font-medium text-gray-900">판매 활성화</p>
                <p className="text-[12px] text-gray-500">체크 시 고객에게 노출됩니다</p>
              </div>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.isFeatured}
                onChange={(e) => set({ isFeatured: e.target.checked })}
                className="w-5 h-5 rounded border-gray-300 text-[#ffa726] focus:ring-[#ffa726]" />
              <div>
                <p className="text-[14px] font-medium text-gray-900">추천 상품</p>
                <p className="text-[12px] text-gray-500">체크 시 홈 추천 상품으로 노출됩니다</p>
              </div>
            </label>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-[13px] px-4 py-3 rounded-xl">
            {error}
          </div>
        )}

        <div className="flex items-center gap-4 pb-10">
          <button type="submit" disabled={isLoading}
            className="px-8 py-3 bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white font-bold rounded-xl text-[14px] hover:from-[#f57c00] hover:to-[#ffa726] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md">
            {isLoading ? '저장 중...' : submitLabel}
          </button>
          <Link href={backHref} className="px-6 py-3 text-gray-600 font-medium text-[14px] hover:text-gray-900">
            취소
          </Link>
        </div>

      </form>
    </div>
  );
}
