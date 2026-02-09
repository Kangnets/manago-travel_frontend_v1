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
          yellow: '#fbd865',
          gray: '#888',
          lightGray: '#f4f6f8',
        },
      },
      fontFamily: {
        pretendard: ['Pretendard', 'sans-serif'],
        goorm: ['goorm Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
export default config;
