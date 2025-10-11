/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      // 🟢 CRITICAL FIX: Define colors as CSS variables for dynamic use
      colors: {
        // You've been using #059669 (emerald-600) and #facc15 (amber-400)
        // Let's ensure these are available as variables
        'chart-fulfilled': '#059669', // Emerald 600
        'chart-pending': '#facc15',   // Amber 400
      }
    },
  },
  plugins: [
    require('tailwind-scrollbar'),
  ],
}