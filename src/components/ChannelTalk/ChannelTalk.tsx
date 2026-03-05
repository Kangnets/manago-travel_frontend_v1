'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    ChannelIO?: (...args: any[]) => void;
    ChannelIOInitialized?: boolean;
  }
}

export default function ChannelTalk() {
  const pluginKey = process.env.NEXT_PUBLIC_CHANNEL_TALK_PLUGIN_KEY;

  useEffect(() => {
    if (!pluginKey) return;

    (function initChannelTalk() {
      const w = window as any;
      if (w.ChannelIO) return;

      const ch = function (...args: any[]) {
        ch.c(args);
      } as any;

      ch.q = [];
      ch.c = function (args: any[]) {
        ch.q.push(args);
      };

      w.ChannelIO = ch;

      const loadScript = () => {
        if (w.ChannelIOInitialized) return;
        w.ChannelIOInitialized = true;
        const s = document.createElement('script');
        s.type = 'text/javascript';
        s.async = true;
        s.src = 'https://cdn.channel.io/plugin/ch-plugin-web.js';
        const x = document.getElementsByTagName('script')[0];
        if (x && x.parentNode) {
          x.parentNode.insertBefore(s, x);
        } else {
          document.head.appendChild(s);
        }
      };

      if (document.readyState === 'complete') {
        loadScript();
      } else {
        window.addEventListener('DOMContentLoaded', loadScript);
        window.addEventListener('load', loadScript);
      }
    })();

    window.ChannelIO?.('boot', { pluginKey });

    return () => {
      window.ChannelIO?.('shutdown');
    };
  }, [pluginKey]);

  return null;
}

