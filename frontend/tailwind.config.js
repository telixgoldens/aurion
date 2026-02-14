/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'aurion-navy': '#0a0e17',
        'aurion-gold': '#d4af37',
        'aurion-white': '#f8f9fa',
        'aurion-gray': '#a0aec0',
      },
      backgroundImage: {
        'radial-gold': 'radial-gradient(circle at top right, rgba(212, 175, 55, 0.05), transparent)',
        'gradient-gold': 'linear-gradient(135deg, rgba(212, 175, 55, 0.1) 0%, rgba(212, 175, 55, 0.05) 100%)',
        'gradient-dark': 'linear-gradient(135deg, rgba(15, 15, 25, 0.98) 0%, rgba(20, 20, 35, 0.98) 100%)',
        'gradient-footer': 'linear-gradient(to bottom, transparent, rgba(10, 14, 23, 0.8))',
      },
      boxShadow: {
        'aurion-card': '0 20px 40px rgba(0, 0, 0, 0.4)',
        'aurion-card-hover': '0 25px 50px rgba(0, 0, 0, 0.5)',
        'aurion-gold': '0 4px 15px rgba(212, 175, 55, 0.3)',
        'aurion-gold-hover': '0 6px 25px rgba(212, 175, 55, 0.5)',
        'dropdown': '0 20px 60px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(212, 175, 55, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
      },
      backdropBlur: {
        'aurion': '10px',
        'dropdown': '20px',
      },
      borderRadius: {
        'aurion': '24px',
        'aurion-lg': '32px',
      },
      dropShadow: {
        'gold': '0 0 10px rgba(212, 175, 55, 0.2)',
      },
      animation: {
        'fade-in-up': 'fadeInUp 0.4s ease forwards',
        'dropdown-slide': 'dropdownSlide 0.3s ease',
      },
      keyframes: {
        fadeInUp: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dropdownSlide: {
          '0%': { opacity: '0', transform: 'translateX(-50%) translateY(-20px)' },
          '100%': { opacity: '1', transform: 'translateX(-50%) translateY(0)' },
        },
      },
    },
  },
  plugins: [],
}