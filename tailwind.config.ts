import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0f2b48',
          50: '#f4f7fb',
          100: '#e8eff7',
          200: '#c9dbed',
          300: '#99bcde',
          400: '#6196cc',
          500: '#3d78b8',
          600: '#2d5e9b',
          700: '#254e81',
          800: '#21426c',
          900: '#1f395b',
          950: '#0f2b48',
        },
        gold: {
          DEFAULT: '#c5a059',
          50: '#faf8f4',
          100: '#f4ecd9',
          200: '#e8dbb7',
          300: '#dac28d',
          400: '#c5a059',
          500: '#b48b48',
          600: '#997138',
          700: '#7f592c',
          800: '#664523',
          900: '#53371d',
          950: '#2d1c0e',
        }
      },
    },
  },
  plugins: [],
};
export default config;
