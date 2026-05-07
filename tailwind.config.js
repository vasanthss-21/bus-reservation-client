/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Add this
  ],
  theme: {
    extend: {   fontFamily: {
      sans: ['Ubuntu', 'sans-serif'],
      heading: ['Ubuntu', 'sans-serif'],
    },},
  },
  plugins: [],
}