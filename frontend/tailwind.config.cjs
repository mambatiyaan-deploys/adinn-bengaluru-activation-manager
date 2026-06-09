module.exports = {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif']
      },
      colors: {
        adinn: {
          black: '#050509',
          charcoal: '#111217',
          red: '#ed000b',
          redDark: '#c40009',
          soft: '#f8fafc'
        }
      },
      boxShadow: {
        soft: '0 18px 45px rgba(15, 23, 42, 0.07)',
        redButton: '0 14px 30px rgba(237, 0, 11, 0.22)'
      }
    }
  },
  plugins: []
};
