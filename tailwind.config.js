module.exports = {
  darkMode: 'class', // Enable dark mode
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        main: '#dd0e7c',
        secondary: '#6b1d68',
        background: '#f9fafb',
        text: '#27272a',
        border: '#fcd6e2',
        hover: '#c6006d',
      },
      fontFamily: {
        sans: ['Urbanist', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
