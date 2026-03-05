export const PRIMARY_REGION = '푸꾸옥' as const;
export const REGION_OPTIONS = ['푸꾸옥', '호치민', '하노이', '나트랑'] as const;
export const COMING_SOON_NOTICE_EVENT = 'mango:coming-soon-notice';

export interface ComingSoonNoticeDetail {
  region: string;
  message: string;
}

export function isPrimaryRegion(region: string): boolean {
  return region === PRIMARY_REGION;
}

export function notifyComingSoon(region: string): void {
  if (typeof window === 'undefined') return;
  const detail: ComingSoonNoticeDetail = {
    region,
    message: `${region} 서비스는 곧 출시 예정이에요.`,
  };
  window.dispatchEvent(new CustomEvent(COMING_SOON_NOTICE_EVENT, { detail }));
}
