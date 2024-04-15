/** @type {import('tailwindcss').Config} */
export default {
   content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      animation: {
        'expand-top-left': 'expandTopLeft 0.5s ease-out forwards',
        'collapse-bottom-right': 'collapseBottomRight 0.5s ease-in forwards',
        'expand-zoom': 'expandZoom 0.5s ease-out forwards',
        'collapse-zoom': 'collapseZoom 0.5s ease-in forwards',
        'expand-fade': 'expandFade 0.5s ease-out forwards',
        'collapse-fade': 'collapseFade 0.5s ease-in forwards',
        'slide-down': 'slideDown 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.5s ease-in forwards',
      },
      keyframes: {
        expand: {
          '0%': { height: '0px' },
          '100%': { height: '500px' }, // 可根据需要调整最终高度
        },
        expandTopLeft: {
          '0%': { transform: 'scale(0.5) translate(-50%, -50%)', opacity: 0 },
          '100%': { transform: 'scale(1) translate(0, 0)', opacity: 1 }
        },
        collapseBottomRight: {
          '0%': { transform: 'scale(1) translate(0, 0)', opacity: 1 },
          '100%': { transform: 'scale(0.5) translate(50%, 50%)', opacity: 0 }
        },
        expandZoom: {
          '0%': { transform: 'scale(0)' },
          '100%': { transform: 'scale(1)' }
        },
        collapseZoom: {
          '0%': { transform: 'scale(1)' },
          '100%': { transform: 'scale(0)' }
        },
        expandFade: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 }
        },
        collapseFade: {
          '0%': { opacity: 1 },
          '100%': { opacity: 0 }
        },
        slideDown: {
          '0%': { transform: 'translateY(-10%)', opacity: 0 },
          '100%': { transform: 'translateY(0)', opacity: 1 }
        },
        slideUp: {
          '0%': { transform: 'translateY(0)', opacity: 1 },
          '100%': { transform: 'translateY(-100%)', opacity: 0 }
        },
      },
    },
  },
  plugins: [],
}

