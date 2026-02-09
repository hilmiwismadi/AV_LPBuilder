export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#512D8C',
          DEFAULT: '#4B2E83',
          dark: '#3D2469',
        },
        accent: {
          light: '#FFC83D',
          DEFAULT: '#F4C430',
          dark: '#E5B82C',
        },
        neutral: {
          white: '#FFFFFF',
          light: '#F5F5F5',
          DEFAULT: '#F2F2F2',
          medium: '#9CA3AF',
          dark: '#1F2937',
        },
      },
      borderRadius: {
        '4xl': '2rem',
      },
      boxShadow: {
        'medium': '0 4px 14px rgba(75, 46, 131, 0.15)',
        'large': '0 8px 30px rgba(75, 46, 131, 0.2)',
      },
      animation: {
        'slide-up': 'slideUp 0.3s ease-out',
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    }
  },
  plugins: []
}
