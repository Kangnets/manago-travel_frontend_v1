'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAdminLanguage } from '@/contexts/AdminLanguageContext';
import { agencyCustomizationAPI } from '@/lib/agencyCustomizationApi';
import {
  SwatchIcon,
  DocumentTextIcon,
  Cog6ToothIcon,
  PhoneIcon,
  LinkIcon,
  EyeIcon,
  CheckIcon,
  CheckCircleIcon,
  GlobeAltIcon,
  BuildingOffice2Icon,
  SquaresPlusIcon,
  SunIcon,
  MinusIcon,
  BuildingOfficeIcon,
  TruckIcon,
  MapPinIcon,
  SparklesIcon,
  ShieldCheckIcon,
  StarIcon,
  BookOpenIcon,
  CameraIcon,
  UserIcon,
  PlayIcon,
  ExclamationTriangleIcon,
  ClipboardIcon,
  LightBulbIcon,
  ArrowTopRightOnSquareIcon,
  EnvelopeIcon,
} from '@heroicons/react/24/outline';

interface AgencyCustomization {
  // Brand
  agencyDisplayName: string;
  slogan: string;
  logoUrl: string;
  primaryColor: string;
  secondaryColor: string;
  fontFamily: string;
  // Contact
  phone: string;
  email: string;
  address: string;
  kakaoId: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  // Content
  bannerTitle: string;
  bannerSubtitle: string;
  bannerImageUrl: string;
  welcomeText: string;
  footerText: string;
  // Features
  showHotel: boolean;
  showTour: boolean;
  showGolf: boolean;
  showSpa: boolean;
  showInsurance: boolean;
  showReviews: boolean;
  showBlog: boolean;
  showPassportOcr: boolean;
  // Template
  templateId: string;
  // Slug
  slug: string;
  // Language
  adminLanguage: Language;
  serviceLanguage: Language;
}

const defaultCustomization = (
  agencyName: string,
  email: string,
  adminLanguage: Language,
  serviceLanguage: Language,
): AgencyCustomization => ({
  agencyDisplayName: agencyName,
  slogan: '행복한 여행의 시작',
  logoUrl: '',
  primaryColor: '#ffa726',
  secondaryColor: '#1a1a2e',
  fontFamily: 'Pretendard',
  phone: '',
  email: email,
  address: '',
  kakaoId: '',
  instagramUrl: '',
  facebookUrl: '',
  youtubeUrl: '',
  bannerTitle: `${agencyName}과 함께하는 특별한 여행`,
  bannerSubtitle: '최고의 여행 전문가가 여러분의 여행을 완성합니다',
  bannerImageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1600&q=80',
  welcomeText: `${agencyName}을 방문해 주셔서 감사합니다. 저희는 고객님의 소중한 여행을 최상의 퀄리티로 준비해 드립니다.`,
  footerText: `© ${new Date().getFullYear()} ${agencyName}. All rights reserved.`,
  showHotel: true,
  showTour: true,
  showGolf: false,
  showSpa: false,
  showInsurance: false,
  showReviews: true,
  showBlog: false,
  showPassportOcr: false,
  templateId: 'modern',
  slug: '',
  adminLanguage,
  serviceLanguage,
});

const PRESET_COLORS = [
  { name: '오렌지', primary: '#ffa726', secondary: '#1a1a2e' },
  { name: '블루', primary: '#1976d2', secondary: '#0d1b2a' },
  { name: '그린', primary: '#2e7d32', secondary: '#1b2920' },
  { name: '퍼플', primary: '#7b1fa2', secondary: '#1a0a2e' },
  { name: '레드', primary: '#c62828', secondary: '#1a0a0a' },
  { name: '티얼', primary: '#00695c', secondary: '#0a1a18' },
  { name: '인디고', primary: '#283593', secondary: '#0a0f2e' },
  { name: '핑크', primary: '#ad1457', secondary: '#1a0a12' },
];

const TEMPLATES = [
  { id: 'modern', name: '모던', desc: '심플하고 세련된 스타일', icon: BuildingOffice2Icon },
  { id: 'classic', name: '클래식', desc: '전통적이고 신뢰감 있는 스타일', icon: SquaresPlusIcon },
  { id: 'vibrant', name: '활기찬', desc: '컬러풀하고 활동적인 스타일', icon: SunIcon },
  { id: 'minimal', name: '미니멀', desc: '깔끔하고 여백이 있는 스타일', icon: MinusIcon },
];

type Tab = 'brand' | 'content' | 'features' | 'contact' | 'url' | 'preview';

export default function CustomizePage() {
  const { user } = useAuth();
  const router = useRouter();
  const { adminLanguage, setAdminLanguage } = useAdminLanguage();
  const { language: publicLanguage, setLanguage } = useLanguage();
  const tr = (ko: string, en: string) => (adminLanguage === 'en' ? en : ko);
  const [activeTab, setActiveTab] = useState<Tab>('brand');
  const [settings, setSettings] = useState<AgencyCustomization>(
    defaultCustomization(
      user?.agencyName || user?.name || '여행사',
      user?.email || '',
      adminLanguage,
      publicLanguage,
    )
  );
  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loadError, setLoadError] = useState('');
  const [slugError, setSlugError] = useState('');

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    const base = defaultCustomization(
      user.agencyName || user.name || '여행사',
      user.email,
      adminLanguage,
      publicLanguage,
    );
    setLoadError('');

    agencyCustomizationAPI
      .getMine<AgencyCustomization>()
      .then((saved) => {
        if (cancelled) return;
        if (!saved?.settings) {
          setSettings(base);
          return;
        }

        const nextAdminLanguage: Language =
          saved.settings.adminLanguage === 'en' || saved.adminLanguage === 'en' ? 'en' : 'ko';
        const nextServiceLanguage: Language =
          saved.settings.serviceLanguage === 'en' || saved.serviceLanguage === 'en' ? 'en' : 'ko';

        setSettings({
          ...base,
          ...saved.settings,
          slug: saved.slug || saved.settings.slug || '',
          adminLanguage: nextAdminLanguage,
          serviceLanguage: nextServiceLanguage,
        });
        setAdminLanguage(nextAdminLanguage);
        setLanguage(nextServiceLanguage);
      })
      .catch((err: any) => {
        if (cancelled) return;
        setSettings(base);
        setLoadError(
          err?.response?.data?.message ||
            '커스터마이징 설정을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.',
        );
      });

    return () => {
      cancelled = true;
    };
  }, [user, adminLanguage, publicLanguage, setAdminLanguage, setLanguage]);

  const handleSave = async (navigateToPortal: boolean = false) => {
    if (!user) return;
    if (settings.slug && !/^[a-z0-9-]+$/.test(settings.slug)) {
      setSlugError('영문 소문자, 숫자, 하이픈(-)만 사용 가능합니다');
      setActiveTab('url');
      return;
    }

    setLoadError('');
    setIsSaving(true);

    try {
      const saved = await agencyCustomizationAPI.saveMine<AgencyCustomization>(settings);
      const nextAdminLanguage: Language =
        saved.settings.adminLanguage === 'en' || saved.adminLanguage === 'en' ? 'en' : 'ko';
      const nextServiceLanguage: Language =
        saved.settings.serviceLanguage === 'en' || saved.serviceLanguage === 'en' ? 'en' : 'ko';

      const nextSettings: AgencyCustomization = {
        ...settings,
        ...saved.settings,
        slug: saved.slug || saved.settings.slug || '',
        adminLanguage: nextAdminLanguage,
        serviceLanguage: nextServiceLanguage,
      };

      setSettings(nextSettings);
      setAdminLanguage(nextAdminLanguage);
      setLanguage(nextServiceLanguage);
      setIsSaved(true);

      if (navigateToPortal && nextSettings.slug) {
        router.push(`/portal/${nextSettings.slug}`);
        return;
      }

      setTimeout(() => setIsSaved(false), 2500);
    } catch (err: any) {
      setLoadError(err?.response?.data?.message || tr('저장에 실패했습니다.', 'Failed to save settings.'));
    } finally {
      setIsSaving(false);
    }
  };

  const update = (field: keyof AgencyCustomization, value: string | boolean) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const portalUrl = settings.slug
    ? `${typeof window !== 'undefined' ? window.location.origin : ''}/portal/${settings.slug}`
    : null;

  const tabs: { key: Tab; label: string; icon: typeof SwatchIcon }[] = [
    { key: 'brand', label: tr('브랜드 설정', 'Brand'), icon: SwatchIcon },
    { key: 'content', label: tr('콘텐츠 설정', 'Content'), icon: DocumentTextIcon },
    { key: 'features', label: tr('기능 설정', 'Features'), icon: Cog6ToothIcon },
    { key: 'contact', label: tr('연락처 / SNS', 'Contact / SNS'), icon: PhoneIcon },
    { key: 'url', label: tr('URL 설정', 'URL'), icon: LinkIcon },
    { key: 'preview', label: tr('미리보기', 'Preview'), icon: EyeIcon },
  ];

  const inputCls = 'w-full px-3 py-2 border border-gray-300 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-[#ffa726]/30 focus:border-[#ffa726] transition-all';
  const labelCls = 'block text-[12px] font-semibold text-gray-700 mb-1';

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold text-gray-900">{tr('홈페이지 커스터마이징', 'Website Customization')}</h1>
          <p className="text-[14px] text-gray-500 mt-1">
            {tr('고객용 웹사이트를 여행사 브랜드에 맞게 커스터마이징하세요', 'Customize your customer-facing website for your agency brand')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleSave(false)}
            disabled={isSaving}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all shadow-md ${
              isSaved
                ? 'bg-green-500 text-white'
                : 'bg-gradient-to-r from-[#ffa726] to-[#ffb74d] text-white hover:from-[#f57c00] hover:to-[#ffa726] disabled:opacity-60 disabled:cursor-not-allowed'
            }`}
          >
            {isSaved
              ? <><CheckCircleIcon className="w-5 h-5" /> {tr('저장됨', 'Saved')}</>
              : <><CheckIcon className="w-5 h-5" /> {isSaving ? tr('저장 중...', 'Saving...') : tr('저장하기', 'Save')}</>}
          </button>
          {settings.slug && (
            <button
              onClick={() => handleSave(true)}
              disabled={isSaving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-[14px] transition-all shadow-md bg-[#1a1a2e] text-white hover:bg-[#2d2d4e] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
              {tr('저장 후 확인', 'Save & Open')}
            </button>
          )}
        </div>
      </div>

      {loadError && (
        <div className="mb-4 px-4 py-3 rounded-xl border border-red-200 bg-red-50 text-red-700 text-[13px]">
          {loadError}
        </div>
      )}

      {/* Portal URL Banner (if slug is set) */}
      {portalUrl && (
        <div className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-green-600 text-[13px]">
            <GlobeAltIcon className="w-4 h-4" />
            {tr('고객용 포털:', 'Customer Portal:')}
          </span>
          <a href={portalUrl} target="_blank" rel="noopener noreferrer" className="text-green-700 font-mono text-[13px] font-bold hover:underline">
            {portalUrl}
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(portalUrl)}
            className="ml-auto flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 text-[12px] rounded-lg hover:bg-green-200 transition-colors"
          >
            <ClipboardIcon className="w-3.5 h-3.5" />
            {tr('복사', 'Copy')}
          </button>
        </div>
      )}

      {/* Tab navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-white text-[#ffa726] shadow-sm font-bold'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── BRAND TAB ── */}
      {activeTab === 'brand' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">{tr('언어 설정', 'Language Settings')}</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>{tr('관리자 페이지 언어', 'Admin Console Language')}</label>
                  <select
                    value={settings.adminLanguage}
                    onChange={(e) => update('adminLanguage', e.target.value as Language)}
                    className={inputCls}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>{tr('본 서비스 기본 언어', 'Public Site Default Language')}</label>
                  <select
                    value={settings.serviceLanguage}
                    onChange={(e) => update('serviceLanguage', e.target.value as Language)}
                    className={inputCls}
                  >
                    <option value="ko">한국어</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <p className="text-[11px] text-gray-500">
                  {tr('저장하기를 누르면 관리자 화면 언어와 본 서비스 기본 언어가 함께 적용됩니다.', 'Click Save to apply both admin and public site language settings.')}
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">{tr('기본 정보', 'Basic Info')}</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>{tr('여행사 표시명 *', 'Agency Display Name *')}</label>
                  <input value={settings.agencyDisplayName} onChange={(e) => update('agencyDisplayName', e.target.value)} className={inputCls} placeholder={tr('홈페이지에 표시될 여행사 이름', 'Agency name shown on the website')} />
                </div>
                <div>
                  <label className={labelCls}>{tr('슬로건', 'Slogan')}</label>
                  <input value={settings.slogan} onChange={(e) => update('slogan', e.target.value)} className={inputCls} placeholder={tr('짧고 인상적인 한 문장', 'A short, memorable sentence')} />
                </div>
                <div>
                  <label className={labelCls}>{tr('로고 이미지 URL', 'Logo Image URL')}</label>
                  <input value={settings.logoUrl} onChange={(e) => update('logoUrl', e.target.value)} className={inputCls} placeholder="https://..." />
                  <p className="text-[11px] text-gray-400 mt-1">{tr('※ 빈칸이면 텍스트 로고가 표시됩니다', 'If empty, a text logo will be shown')}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">{tr('템플릿 선택', 'Template')}</h2>
              <div className="grid grid-cols-2 gap-3">
                {TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.id}
                    onClick={() => update('templateId', tpl.id)}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${
                      settings.templateId === tpl.id
                        ? 'border-[#ffa726] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="w-8 h-8 mb-2 rounded-lg bg-gray-100 flex items-center justify-center">
                      <tpl.icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div className="text-[13px] font-bold text-gray-900">{tpl.name}</div>
                    <div className="text-[11px] text-gray-500">{tpl.desc}</div>
                    {settings.templateId === tpl.id && (
                      <div className="mt-1 flex items-center gap-1 text-[11px] text-[#ffa726] font-bold">
                        <CheckIcon className="w-3 h-3" /> {tr('선택됨', 'Selected')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">{tr('색상 테마', 'Color Theme')}</h2>
              <div className="space-y-4">
                <div>
                  <label className={labelCls}>{tr('프리셋 색상', 'Preset Colors')}</label>
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    {PRESET_COLORS.map((preset) => (
                      <button
                        key={preset.name}
                        onClick={() => {
                          update('primaryColor', preset.primary);
                          update('secondaryColor', preset.secondary);
                        }}
                        className={`flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${
                          settings.primaryColor === preset.primary
                            ? 'border-gray-400 shadow-md'
                            : 'border-transparent hover:border-gray-200'
                        }`}
                      >
                        <div className="flex gap-1">
                          <div className="w-5 h-5 rounded-full shadow-inner" style={{ background: preset.primary }} />
                          <div className="w-5 h-5 rounded-full shadow-inner" style={{ background: preset.secondary }} />
                        </div>
                        <span className="text-[10px] text-gray-600">{preset.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>{tr('주 색상', 'Primary')}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.primaryColor}
                        onChange={(e) => update('primaryColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        value={settings.primaryColor}
                        onChange={(e) => update('primaryColor', e.target.value)}
                        className={`flex-1 ${inputCls} font-mono text-[12px]`}
                        placeholder="#ffa726"
                      />
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>{tr('보조 색상', 'Secondary')}</label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={settings.secondaryColor}
                        onChange={(e) => update('secondaryColor', e.target.value)}
                        className="w-10 h-10 rounded cursor-pointer border border-gray-300"
                      />
                      <input
                        value={settings.secondaryColor}
                        onChange={(e) => update('secondaryColor', e.target.value)}
                        className={`flex-1 ${inputCls} font-mono text-[12px]`}
                        placeholder="#1a1a2e"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Color Preview */}
            <div
              className="rounded-2xl overflow-hidden shadow-md border border-gray-200"
              style={{ '--primary': settings.primaryColor, '--secondary': settings.secondaryColor } as React.CSSProperties}
            >
              <div className="px-4 py-3 flex items-center gap-3" style={{ background: settings.secondaryColor }}>
                <div className="w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] font-bold" style={{ background: settings.primaryColor }}>
                  M
                </div>
                <span className="text-white font-bold text-[13px]">{settings.agencyDisplayName}</span>
                <span className="text-white/50 text-[11px] ml-auto">{settings.slogan}</span>
              </div>
              <div className="p-4 bg-white">
                <div className="text-[12px] font-medium text-gray-700 mb-2">{tr('색상 미리보기', 'Color Preview')}</div>
                <div className="flex gap-2 flex-wrap">
                  <span className="px-3 py-1.5 rounded-lg text-white text-[12px] font-bold shadow-sm" style={{ background: settings.primaryColor }}>
                    {tr('주 색상 버튼', 'Primary Button')}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-white text-[12px] font-bold shadow-sm" style={{ background: settings.secondaryColor }}>
                    {tr('보조 색상', 'Secondary')}
                  </span>
                  <span className="px-3 py-1.5 rounded-lg text-[12px] font-bold border-2" style={{ color: settings.primaryColor, borderColor: settings.primaryColor }}>
                    {tr('아웃라인', 'Outline')}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTENT TAB ── */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">메인 배너</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>배너 제목</label>
                  <input value={settings.bannerTitle} onChange={(e) => update('bannerTitle', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>배너 부제목</label>
                  <input value={settings.bannerSubtitle} onChange={(e) => update('bannerSubtitle', e.target.value)} className={inputCls} />
                </div>
                <div>
                  <label className={labelCls}>배너 이미지 URL</label>
                  <input value={settings.bannerImageUrl} onChange={(e) => update('bannerImageUrl', e.target.value)} className={inputCls} placeholder="https://..." />
                  <p className="text-[11px] text-gray-400 mt-1">권장 크기: 1600×700px</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-4">소개 텍스트</h2>
              <div className="space-y-3">
                <div>
                  <label className={labelCls}>환영 메시지</label>
                  <textarea
                    value={settings.welcomeText}
                    onChange={(e) => update('welcomeText', e.target.value)}
                    rows={4}
                    className={`${inputCls} resize-none`}
                    placeholder="여행사 소개 및 환영 메시지를 작성하세요"
                  />
                </div>
                <div>
                  <label className={labelCls}>푸터 텍스트</label>
                  <input value={settings.footerText} onChange={(e) => update('footerText', e.target.value)} className={inputCls} />
                </div>
              </div>
            </div>
          </div>

          {/* Banner Preview */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-3">배너 미리보기</h2>
              <div className="rounded-xl overflow-hidden h-48 relative">
                {settings.bannerImageUrl ? (
                  <img src={settings.bannerImageUrl} alt="banner" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-gray-800 to-gray-600" />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center p-4">
                  <p className="text-[17px] font-bold leading-tight mb-1">{settings.bannerTitle}</p>
                  <p className="text-[12px] text-white/80">{settings.bannerSubtitle}</p>
                  <div className="mt-3 px-4 py-1.5 rounded-full text-[12px] font-bold" style={{ background: settings.primaryColor }}>
                    지금 예약하기
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
              <h2 className="text-[15px] font-bold text-gray-900 mb-3">소개 미리보기</h2>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 text-[13px] text-gray-700 leading-relaxed">
                {settings.welcomeText || '환영 메시지를 입력하세요'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── FEATURES TAB ── */}
      {activeTab === 'features' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-900 mb-2">카테고리 노출 설정</h2>
            <p className="text-[12px] text-gray-500 mb-4">고객용 홈페이지에 표시할 카테고리를 선택하세요</p>
            <div className="space-y-3">
              {[
                { key: 'showHotel' as const, label: '호텔', desc: '호텔 패키지 상품', icon: BuildingOfficeIcon },
                { key: 'showTour' as const, label: '투어', desc: '가이드 투어 상품', icon: TruckIcon },
                { key: 'showGolf' as const, label: '골프', desc: '골프 여행 상품', icon: MapPinIcon },
                { key: 'showSpa' as const, label: '스파', desc: '스파 & 웰니스 상품', icon: SparklesIcon },
                { key: 'showInsurance' as const, label: '여행자 보험', desc: '여행 보험 상품', icon: ShieldCheckIcon },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    settings[key] ? 'border-[#ffa726] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => update(key, !settings[key])}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${settings[key] ? 'bg-[#ffa726]/20' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${settings[key] ? 'text-[#ffa726]' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-gray-800">{label}</div>
                      <div className="text-[11px] text-gray-500">{desc}</div>
                    </div>
                  </div>
                  <div
                    className={`w-11 h-6 rounded-full transition-colors relative ${settings[key] ? 'bg-[#ffa726]' : 'bg-gray-300'}`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-900 mb-2">기능 설정</h2>
            <p className="text-[12px] text-gray-500 mb-4">고객용 홈페이지에 포함할 기능을 선택하세요</p>
            <div className="space-y-3">
              {[
                { key: 'showReviews' as const, label: '리뷰/후기', desc: '고객 여행 후기 섹션', icon: StarIcon },
                { key: 'showBlog' as const, label: '여행 블로그', desc: '여행 정보 블로그 포스트', icon: BookOpenIcon },
                { key: 'showPassportOcr' as const, label: '여권 스캔', desc: '여권 정보 자동 입력 기능', icon: CameraIcon },
              ].map(({ key, label, desc, icon: Icon }) => (
                <div
                  key={key}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 transition-all cursor-pointer ${
                    settings[key] ? 'border-[#ffa726] bg-orange-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => update(key, !settings[key])}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${settings[key] ? 'bg-[#ffa726]/20' : 'bg-gray-100'}`}>
                      <Icon className={`w-5 h-5 ${settings[key] ? 'text-[#ffa726]' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <div className="text-[14px] font-medium text-gray-800">{label}</div>
                      <div className="text-[11px] text-gray-500">{desc}</div>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors relative ${settings[key] ? 'bg-[#ffa726]' : 'bg-gray-300'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </div>
              ))}
            </div>

            {/* Active features summary */}
            <div className="mt-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
              <div className="text-[12px] font-bold text-gray-700 mb-2">활성화된 기능</div>
              <div className="flex flex-wrap gap-1.5">
                {settings.showHotel && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">호텔</span>}
                {settings.showTour && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">투어</span>}
                {settings.showGolf && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">골프</span>}
                {settings.showSpa && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">스파</span>}
                {settings.showInsurance && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">보험</span>}
                {settings.showReviews && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">리뷰</span>}
                {settings.showBlog && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">블로그</span>}
                {settings.showPassportOcr && <span className="px-2 py-0.5 bg-[#ffa726]/10 text-[#f57c00] text-[11px] rounded-full font-medium">여권 스캔</span>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── CONTACT TAB ── */}
      {activeTab === 'contact' && (
        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-900 mb-4">연락처 정보</h2>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>전화번호</label>
                <input value={settings.phone} onChange={(e) => update('phone', e.target.value)} className={inputCls} placeholder="02-1234-5678" />
              </div>
              <div>
                <label className={labelCls}>이메일</label>
                <input type="email" value={settings.email} onChange={(e) => update('email', e.target.value)} className={inputCls} placeholder="info@agency.com" />
              </div>
              <div>
                <label className={labelCls}>주소</label>
                <input value={settings.address} onChange={(e) => update('address', e.target.value)} className={inputCls} placeholder="서울특별시 강남구 ..." />
              </div>
              <div>
                <label className={labelCls}>카카오톡 채널 ID</label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-yellow-100 text-yellow-800 text-[12px] rounded-l-lg border border-r-0 border-gray-300 font-medium">@</span>
                  <input value={settings.kakaoId} onChange={(e) => update('kakaoId', e.target.value)} className={`flex-1 px-3 py-2 border border-gray-300 rounded-r-lg text-[13px] focus:outline-none focus:border-[#ffa726]`} placeholder="채널 아이디" />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-900 mb-4">SNS 링크</h2>
            <div className="space-y-3">
              <div>
                <label className={labelCls}>인스타그램</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-pink-100 text-pink-700 rounded-l-lg border border-r-0 border-gray-300">
                    <CameraIcon className="w-4 h-4" />
                  </span>
                  <input value={settings.instagramUrl} onChange={(e) => update('instagramUrl', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg text-[13px] focus:outline-none focus:border-[#ffa726]" placeholder="https://instagram.com/..." />
                </div>
              </div>
              <div>
                <label className={labelCls}>페이스북</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-blue-100 text-blue-700 rounded-l-lg border border-r-0 border-gray-300">
                    <UserIcon className="w-4 h-4" />
                  </span>
                  <input value={settings.facebookUrl} onChange={(e) => update('facebookUrl', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg text-[13px] focus:outline-none focus:border-[#ffa726]" placeholder="https://facebook.com/..." />
                </div>
              </div>
              <div>
                <label className={labelCls}>유튜브</label>
                <div className="flex items-center">
                  <span className="px-3 py-2.5 bg-red-100 text-red-700 rounded-l-lg border border-r-0 border-gray-300">
                    <PlayIcon className="w-4 h-4" />
                  </span>
                  <input value={settings.youtubeUrl} onChange={(e) => update('youtubeUrl', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-r-lg text-[13px] focus:outline-none focus:border-[#ffa726]" placeholder="https://youtube.com/..." />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── URL TAB ── */}
      {activeTab === 'url' && (
        <div className="max-w-2xl">
          <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
            <h2 className="text-[15px] font-bold text-gray-900 mb-1">고객용 포털 URL 설정</h2>
            <p className="text-[13px] text-gray-500 mb-4">
              고객들이 접속할 고유 URL을 설정하세요. 이 URL로 고객들이 여행사의 커스터마이징된 홈페이지에 접근합니다.
            </p>

            <div className="mb-4">
              <label className={labelCls}>URL 슬러그 (고유 주소)</label>
              <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:border-[#ffa726] focus-within:ring-2 focus-within:ring-[#ffa726]/20 transition-all">
                <span className="px-3 py-2.5 bg-gray-50 text-gray-500 text-[13px] border-r border-gray-300 whitespace-nowrap">
                  {typeof window !== 'undefined' ? window.location.origin : 'https://mango-travel.com'}/portal/
                </span>
                <input
                  value={settings.slug}
                  onChange={(e) => {
                    setSlugError('');
                    update('slug', e.target.value.toLowerCase());
                  }}
                  className="flex-1 px-3 py-2.5 text-[13px] focus:outline-none font-mono"
                  placeholder="my-agency"
                />
              </div>
              {slugError && <p className="flex items-center gap-1 text-[12px] text-red-500 mt-1"><ExclamationTriangleIcon className="w-3.5 h-3.5" /> {slugError}</p>}
              <p className="text-[11px] text-gray-400 mt-1">영문 소문자, 숫자, 하이픈(-) 사용 가능 (예: korea-travel, my-agency-2024)</p>
            </div>

            {settings.slug && (
              <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-1.5 text-[12px] font-bold text-green-800 mb-1">
                      <CheckCircleIcon className="w-4 h-4" />
                      포털 URL 미리보기
                    </div>
                    <div className="font-mono text-[13px] text-green-700">
                      {typeof window !== 'undefined' ? window.location.origin : 'https://mango-travel.com'}/portal/{settings.slug}
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const url = `${window.location.origin}/portal/${settings.slug}`;
                      navigator.clipboard.writeText(url);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 text-[12px] rounded-lg hover:bg-green-200 transition-colors font-medium"
                  >
                    <ClipboardIcon className="w-3.5 h-3.5" />
                    복사
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 bg-blue-50 rounded-2xl border border-blue-100 p-4">
            <h3 className="flex items-center gap-1.5 text-[14px] font-bold text-blue-800 mb-2">
              <LightBulbIcon className="w-4 h-4" />
              사용 방법
            </h3>
            <ol className="space-y-2 text-[13px] text-blue-700">
              <li>1. 위의 슬러그를 입력하고 <strong>저장하기</strong>를 클릭하세요</li>
              <li>2. 생성된 URL을 고객에게 공유하세요 (명함, SNS, 이메일 등)</li>
              <li>3. 고객이 해당 URL에 접속하면 여행사 브랜드로 커스터마이징된 홈페이지가 표시됩니다</li>
              <li>4. 고객은 이 페이지에서 상품 조회, 예약, 문의를 할 수 있습니다</li>
            </ol>
          </div>
        </div>
      )}

      {/* ── PREVIEW TAB ── */}
      {activeTab === 'preview' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[16px] font-bold text-gray-900">고객용 홈페이지 미리보기</h2>
              <p className="text-[13px] text-gray-500 mt-0.5">실제 고객에게 표시되는 화면을 미리 확인합니다</p>
            </div>
            {settings.slug && (
              <a
                href={`/portal/${settings.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-[#1a1a2e] text-white rounded-xl text-[13px] font-medium hover:bg-[#2d2d4e] transition-colors flex items-center gap-2"
              >
                <ArrowTopRightOnSquareIcon className="w-4 h-4" />
                새 탭에서 열기
              </a>
            )}
          </div>

          {/* Browser-style preview */}
          <div className="border-2 border-gray-300 rounded-2xl overflow-hidden shadow-xl">
            {/* Browser chrome */}
            <div className="bg-gray-200 px-4 py-2 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
              </div>
              <div className="flex-1 bg-white rounded-lg px-3 py-1 text-[11px] text-gray-500 font-mono truncate">
                {settings.slug ? `${typeof window !== 'undefined' ? window.location.origin : 'https://mango-travel.com'}/portal/${settings.slug}` : '(URL 미설정)'}
              </div>
            </div>

            {/* Simulated website */}
            <div className="bg-white">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-3 shadow-sm" style={{ background: settings.secondaryColor }}>
                <div className="flex items-center gap-2">
                  {settings.logoUrl ? (
                    <img src={settings.logoUrl} alt="logo" className="h-7 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                  ) : (
                    <span className="font-bold text-white text-[14px]">{settings.agencyDisplayName}</span>
                  )}
                </div>
                <div className="flex gap-4 text-[11px] text-white/70">
                  {settings.showHotel && <span>호텔</span>}
                  {settings.showTour && <span>투어</span>}
                  {settings.showGolf && <span>골프</span>}
                  {settings.showSpa && <span>스파</span>}
                  <span>예약조회</span>
                </div>
                <button className="px-3 py-1 rounded-full text-[11px] font-bold text-white" style={{ background: settings.primaryColor }}>
                  예약하기
                </button>
              </div>

              {/* Banner */}
              <div className="relative h-40 overflow-hidden">
                {settings.bannerImageUrl && (
                  <img src={settings.bannerImageUrl} alt="banner" className="w-full h-full object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white text-center">
                  <p className="text-[15px] font-bold mb-1">{settings.bannerTitle}</p>
                  <p className="text-[11px] text-white/80 mb-3">{settings.bannerSubtitle}</p>
                  <button className="px-4 py-1.5 rounded-full text-[11px] font-bold text-white" style={{ background: settings.primaryColor }}>
                    지금 예약하기
                  </button>
                </div>
              </div>

              {/* Category quick buttons */}
              <div className="px-6 py-4 bg-gray-50">
                <div className="flex gap-3 justify-center flex-wrap">
                  {settings.showHotel && (
                    <div className="flex flex-col items-center gap-1 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <BuildingOfficeIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-[11px] text-gray-700 font-medium">호텔</span>
                    </div>
                  )}
                  {settings.showTour && (
                    <div className="flex flex-col items-center gap-1 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <TruckIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-[11px] text-gray-700 font-medium">투어</span>
                    </div>
                  )}
                  {settings.showGolf && (
                    <div className="flex flex-col items-center gap-1 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <MapPinIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-[11px] text-gray-700 font-medium">골프</span>
                    </div>
                  )}
                  {settings.showSpa && (
                    <div className="flex flex-col items-center gap-1 px-4 py-2 bg-white rounded-xl shadow-sm border border-gray-100">
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <SparklesIcon className="w-4 h-4 text-gray-600" />
                      </div>
                      <span className="text-[11px] text-gray-700 font-medium">스파</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Welcome text */}
              <div className="px-6 py-4 border-t border-gray-100">
                <p className="text-[12px] text-gray-700 text-center leading-relaxed">{settings.welcomeText}</p>
              </div>

              {/* Footer */}
              <div className="px-6 py-3 text-center" style={{ background: settings.secondaryColor }}>
                <p className="text-[11px] text-white/50">{settings.footerText}</p>
                <div className="flex justify-center gap-3 mt-1">
                  {settings.phone && <span className="flex items-center gap-1 text-[10px] text-white/60"><PhoneIcon className="w-3 h-3" /> {settings.phone}</span>}
                  {settings.email && <span className="flex items-center gap-1 text-[10px] text-white/60"><EnvelopeIcon className="w-3 h-3" /> {settings.email}</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
