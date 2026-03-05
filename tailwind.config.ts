import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          yellow: '#ffa726',
          gray: '#888',
          lightGray: '#f4f6f8',
        },
        mango: {
          primary: '#ffa726',
          light: '#ffb74d',
          dark: '#f57c00',
          accent: '#ffd54f',
          gradient: {
            from: '#ffa726',
            via: '#ffb74d',
            to: '#ffd54f',
          },
        },
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        goorm: ['goorm Sans', 'sans-serif'],
      },
      animation: {
        'pulse': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'slide-in-up': 'slideInUp 0.7s ease-out forwards',
        'float': 'float 4s ease-in-out infinite',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        slideInUp: {
          from: { opacity: '0', transform: 'translateY(40px)' },
          to:   { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%':       { transform: 'translateY(-8px)' },
        },
        scaleIn: {
          from: { opacity: '0', transform: 'scale(0.93)' },
          to:   { opacity: '1', transform: 'scale(1)' },
        },
      },
      boxShadow: {
        'soft':        '0 2px 8px rgba(0,0,0,0.04), 0 4px 16px rgba(0,0,0,0.06)',
        'strong':      '0 4px 16px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.12)',
        'glow-orange': '0 0 30px rgba(255,167,38,0.35), 0 4px 16px rgba(255,167,38,0.2)',
      },
      backdropBlur: {
        xs: '4px',
      },
    },
  },
  plugins: [],
};
export default config;
