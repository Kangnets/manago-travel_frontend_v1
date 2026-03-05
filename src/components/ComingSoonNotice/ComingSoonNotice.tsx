'use client';

import { useEffect, useRef, useState } from 'react';
import { COMING_SOON_NOTICE_EVENT, ComingSoonNoticeDetail } from '@/lib/regionPolicy';
import Emoji3D from '@/components/ui/Emoji3D';

export default function ComingSoonNotice() {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState('곧 출시 예정이에요.');
  const [noticeKey, setNoticeKey] = useState(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onNotice = (event: Event) => {
      const customEvent = event as CustomEvent<ComingSoonNoticeDetail>;
      const nextMessage = customEvent.detail?.message || '곧 출시 예정이에요.';

      setMessage(nextMessage);
      setVisible(true);
      setNoticeKey((prev) => prev + 1);

      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 2200);
    };

    window.addEventListener(COMING_SOON_NOTICE_EVENT, onNotice as EventListener);
    return () => {
      window.removeEventListener(COMING_SOON_NOTICE_EVENT, onNotice as EventListener);
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  if (!visible) return null;

  return (
    <div className="fixed inset-x-0 bottom-6 z-[110] flex justify-center px-4 pointer-events-none">
      <div
        key={noticeKey}
        className="w-full max-w-[300px] rounded-2xl border border-amber-200 bg-white/95 shadow-strong backdrop-blur-md px-5 py-4 flex flex-col items-center justify-center gap-2 text-center animate-scale-in"
      >
        <Emoji3D emoji="🚧" className="text-5xl animate-float -rotate-6" />
        <p className="text-sm font-semibold text-gray-800">{message}</p>
      </div>
    </div>
  );
}
