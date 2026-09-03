/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#0D0E11",
        foreground: "#F3F4F6",
        workshop: {
          film: "#0D0E11",
          platen: "#16181D",
          border: "#20232A",
          muted: "#8E95A5",
          cyan: "#00A3FF",
          white: "#F3F4F6",
        },
        privae: {
          50: "#fafafa",
          100: "#f5f5f5",
          200: "#e5e5e5",
          300: "#d4d4d4",
          400: "#a3a3a3",
          500: "#737373",
          600: "#525252",
          700: "#404040",
          800: "#262626",
          900: "#171717",
          950: "#0a0a0a",
        }
      },
      boxShadow: {
        'subtle-edge': '0 1px 2px 0 rgba(0, 0, 0, 0.4)',
        'cyan-focus': '0 0 0 2px rgba(0, 163, 255, 0.3)',
      }
    },
  },
  plugins: [],
};
