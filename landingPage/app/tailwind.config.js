/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ArachnoVa Default Theme - White & Cyan/Teal
        'arachnova-primary': '#06B6D4',
        'arachnova-secondary': '#22D3EE',
        'arachnova-accent': '#0891B2',
        'arachnova-dark': '#0A0E1A',
        'arachnova-text': '#64748B',
        // Override default primary color
        primary: {
          DEFAULT: '#06B6D4',
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
        },
        // Theme 1 - Purple Gradient
        'theme1-primary': '#667eea',
        'theme1-secondary': '#764ba2',
        // Theme 2 - Pink Gradient
        'theme2-primary': '#f093fb',
        'theme2-secondary': '#f5576c',
        // Theme 3 - Blue Gradient
        'theme3-primary': '#4facfe',
        'theme3-secondary': '#00f2fe',
        // Theme 4 - Green Gradient
        'theme4-primary': '#43e97b',
        'theme4-secondary': '#38f9d7',
        // Theme 5 - Warm Sunset
        'theme5-primary': '#fa709a',
        'theme5-secondary': '#fee140',
        // Theme 6 - Ocean Deep
        'theme6-primary': '#30cfd0',
        'theme6-secondary': '#330867',
      },
      backgroundImage: {
        'gradient-arachnova': 'linear-gradient(135deg, #06B6D4 0%, #22D3EE 100%)',
        'gradient-theme1': 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'gradient-theme2': 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'gradient-theme3': 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'gradient-theme4': 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'gradient-theme5': 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'gradient-theme6': 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      },
      animation: {
        'float': 'float 6s ease-in-out infinite',
        'fade-in': 'fadeIn 0.8s ease-out',
        'slide-up': 'slideUp 0.6s ease-out',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-30px)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(30px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
