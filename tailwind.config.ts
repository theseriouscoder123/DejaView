/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Light Mode Palette
        background: '#F1F5F9', // slate-100 (light gray)
        card: '#FFFFFF',       // white
        primary: '#0F172A',   // slate-900 (dark text)
        secondary: '#64748B', // slate-500 (medium-gray text)
	ytred:"FF0033",
        // Accent colors (kept the same)
        success: '#00F5A0',
        viral: '#FF3366',
        warning: '#FFB800',
        info: '#00D4FF',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
    },
  },
  plugins: [],
}

