/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        forest: {
          50: '#f2f9f2', 100: '#e0f0e0', 200: '#c2e2c4', 300: '#95cb9a',
          400: '#63ad6c', 500: '#3f8f4f', 600: '#2f7340', 700: '#285c36',
          800: '#224a2f', 900: '#1d3d29', 950: '#0d2117',
        },
        leaf: '#56C02B',
        earth: '#1E5E3E',
        cream: '#F4F7F2',
        ink: '#0E2A1C',
      },
      fontFamily: {
        sans: ['"Inter"', 'system-ui', 'sans-serif'],
        display: ['"Poppins"', '"Inter"', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(20, 60, 40, 0.25)',
        glow: '0 0 40px -5px rgba(63, 143, 79, 0.5)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'float-slow': 'float 9s ease-in-out infinite',
        'spin-slow': 'spin 30s linear infinite',
        'marquee': 'marquee 22s linear infinite',
      },
      keyframes: {
        float: {
          '0%,100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-18px)' },
        },
        marquee: {
          '0%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(-50%)' },
        },
      },
    },
  },
  plugins: [],
}