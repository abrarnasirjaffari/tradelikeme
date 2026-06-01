/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: "#1d4ed8", // Tailwind blue-700
        secondary: "#3b82f6", // Tailwind blue-500
        background: "#ffffff",
        textPrimary: "#111827", // Tailwind gray-900
        textSecondary: "#6b7280", // Tailwind gray-500
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
