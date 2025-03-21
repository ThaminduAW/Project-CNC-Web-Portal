/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      keyframes: {
        'slide-in': {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' }
        },
        'fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        'bounce-delayed': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-4px)' }
        },
        'typing': {
          '0%, 100%': { opacity: '0.4' },
          '50%': { opacity: '1' }
        },
        'badge-pop': {
          '0%': { transform: 'scale(0)' },
          '50%': { transform: 'scale(1.2)' },
          '100%': { transform: 'scale(1)' }
        }
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out forwards',
        'fade-out': 'fade-out 0.3s ease-out forwards',
        'bounce-delayed': 'bounce-delayed 1s infinite',
        'typing': 'typing 1s infinite',
        'badge-pop': 'badge-pop 0.3s ease-out forwards'
      }
    },
  },
  plugins: [],
} 