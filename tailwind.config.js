/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // V2 Dopamine Palette (Restored to original colors)
        primary: {
          DEFAULT: '#8B5CF6', // Electric Purple (Violet 500)
          light: '#A78BFA',   // Violet 400
          dark: '#7C3AED',    // Violet 600
        },
        secondary: '#EC4899', // Pink 500
        cta: {
          DEFAULT: '#22C55E', // Green 500 (Kept from clay update for button support)
          light: '#86EFAC',   // Green 300
          dark: '#16A34A',    // Green 600
        },
        accent: {
          mint: '#84CC16',    // Lime 500
          tangerine: '#F97316', // Orange 500
          cyan: '#06B6D4',    // Cyan 500
          yellow: '#FACC15',  // Yellow 400
          rose: '#F43F5E',    // Rose 500
        },
        background: {
          cloud: '#FFFBEB',   // Amber 50 (Warm)
          surface: '#FFFFFF',
          soft: '#F3F4F6',    // Gray 100
        },
        text: {
          main: '#4C1D95',    // Violet 900
          body: '#374151',    // Gray 700
          light: '#6B7280',   // Gray 500
        }
      },
      fontFamily: {
        sans: ['"Nunito"', '"Comic Neue"', 'sans-serif'], // Swapped priority
        heading: ['"Baloo 2"', 'cursive'],
        brand: ['"Comic Neue"', '"Baloo 2"', 'cursive'],
        kaishu: ['"LXGW WenKai"', '"KaiTi"', '"Kaiti SC"', '"STKaiti"', '"STXingkai"', '"Xingkai SC"', 'serif'],
        xingkai: ['"LXGW WenKai"', '"KaiTi"', '"Kaiti SC"', '"STKaiti"', '"STXingkai"', '"Xingkai SC"', 'serif'],
      },
      boxShadow: {
        // Claymorphism Shadows (Soft 3D)
        'clay-card': '8px 8px 16px rgba(0, 0, 0, 0.05), -8px -8px 16px rgba(255, 255, 255, 0.8), inset 4px 4px 8px rgba(255, 255, 255, 0.8), inset -4px -4px 8px rgba(0, 0, 0, 0.03)',
        'clay-card-hover': '12px 12px 20px rgba(0, 0, 0, 0.08), -12px -12px 20px rgba(255, 255, 255, 0.9), inset 4px 4px 8px rgba(255, 255, 255, 0.8), inset -4px -4px 8px rgba(0, 0, 0, 0.03)',
        'clay-card-even': '0 18px 30px -18px rgba(0, 0, 0, 0.12), 0 10px 16px -12px rgba(0, 0, 0, 0.08), 0 0 18px rgba(255, 255, 255, 0.55), inset 0 2px 10px rgba(255, 255, 255, 0.35)',
        'clay-btn': '6px 6px 12px rgba(139, 92, 246, 0.25), -4px -4px 10px rgba(255, 255, 255, 0.5), inset 2px 2px 4px rgba(255, 255, 255, 0.5), inset -4px -4px 6px rgba(0, 0, 0, 0.2)',
        'clay-btn-active': 'inset 4px 4px 8px rgba(0, 0, 0, 0.15), inset -2px -2px 4px rgba(255, 255, 255, 0.2)',
        'clay-btn-cta': '6px 6px 12px rgba(34, 197, 94, 0.25), -4px -4px 10px rgba(255, 255, 255, 0.5), inset 2px 2px 4px rgba(255, 255, 255, 0.5), inset -4px -4px 6px rgba(0, 0, 0, 0.2)',
        
        // Legacy Pop Shadows (Restored original colors)
        'pop-purple': '0 14px 28px -16px rgba(139, 92, 246, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
        'pop-pink': '0 14px 28px -16px rgba(236, 72, 153, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
        'pop-orange': '0 14px 28px -16px rgba(249, 115, 22, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
        'pop-green': '0 14px 28px -16px rgba(132, 204, 22, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
        'pop-cyan': '0 14px 28px -16px rgba(6, 182, 212, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
        'pop-yellow': '0 14px 28px -16px rgba(250, 204, 21, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.65)',
        'pop-pink-soft': '0 14px 28px -20px rgba(236, 72, 153, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
        'pop-green-soft': '0 14px 28px -20px rgba(132, 204, 22, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
        'pop-cyan-soft': '0 14px 28px -20px rgba(6, 182, 212, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
        'pop-yellow-soft': '0 14px 28px -20px rgba(250, 204, 21, 0.38), inset 0 1px 0 rgba(255, 255, 255, 0.75)',
      },
      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
        '5xl': '2.5rem',
        'blob': '40% 60% 70% 30% / 40% 50% 60% 50%', // Organic shape
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'wiggle': 'wiggle 1s ease-in-out infinite',
        'blob': 'blob 7s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-3deg)' },
          '50%': { transform: 'rotate(3deg)' },
        },
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        }
      }
    },
  },
  plugins: [],
}
