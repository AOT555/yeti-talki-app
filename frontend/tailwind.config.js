/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'ice-blue': '#E8F4FD',
        'glacier-blue': '#7DD3FC',
        'arctic-blue': '#0EA5E9',
        'frost-white': '#F8FAFC',
        'yeti-purple': '#A855F7',
        'snow-gray': '#E2E8F0',
      },
      backgroundImage: {
        'ice-gradient': 'linear-gradient(135deg, #E8F4FD 0%, #7DD3FC 50%, #0EA5E9 100%)',
        'glacier-gradient': 'linear-gradient(45deg, #F8FAFC 0%, #E8F4FD 30%, #7DD3FC 100%)',
      },
      boxShadow: {
        'ice': '0 10px 25px rgba(14, 165, 233, 0.2)',
        'glacier': '0 20px 40px rgba(125, 211, 252, 0.3)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
      },
      keyframes: {
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 20px rgba(14, 165, 233, 0.5)' },
          '100%': { boxShadow: '0 0 30px rgba(125, 211, 252, 0.8)' },
        },
      },
    },
  },
  plugins: [],
}