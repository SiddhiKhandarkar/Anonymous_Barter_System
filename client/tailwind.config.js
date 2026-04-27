/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Outfit', 'sans-serif'],
      },
      colors: {
        primary: "#2D5A27",
        secondary: "#A7C957",
        community: "#BC4749",
        error: "#8B2635",
        background: "#F2E8CF",
        text: "#1B3022",
        border: "#BDC4A7"
      }
    },
  },
  plugins: [],
}
