/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'SF Pro Display', 'system-ui', '-apple-system', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.02em',
      },
      colors: {
        // Pastel sophistication palette
        pastel: {
          lavender: '#E0D4F7',
          sage: '#D4E7D4',
          blue: '#D4E4F7',
          pink: '#F7D4E0',
          cream: '#F7EFD4',
        },
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          "primary": "#E0D4F7",          // Soft Lavender
          "primary-content": "#1F2937",   // Dark text on pastel
          "secondary": "#D4E7D4",         // Muted Sage
          "secondary-content": "#1F2937",
          "accent": "#D4E4F7",            // Powder Blue
          "accent-content": "#1F2937",
          "neutral": "#FAFBFC",           // Off-white background
          "neutral-content": "#1F2937",
          "base-100": "#FFFFFF",          // Pure white cards
          "base-200": "#FAFBFC",          // Off-white
          "base-300": "#E5E7EB",          // Light gray borders
          "base-content": "#1F2937",      // Near black text
          "info": "#D4E4F7",              // Powder Blue
          "success": "#D4E7D4",           // Muted Sage
          "warning": "#F7EFD4",           // Warm Cream
          "error": "#F7D4E0",             // Blush Pink
        },
        dark: {
          "primary": "#9B8BC4",           // Darker lavender for dark mode
          "primary-content": "#FFFFFF",
          "secondary": "#A0C4A0",         // Darker sage
          "secondary-content": "#FFFFFF",
          "accent": "#A0BFD4",            // Darker powder blue
          "accent-content": "#FFFFFF",
          "neutral": "#1F2937",           // Dark background
          "neutral-content": "#F9FAFB",
          "base-100": "#111827",          // Dark cards
          "base-200": "#1F2937",
          "base-300": "#374151",
          "base-content": "#F9FAFB",
          "info": "#A0BFD4",
          "success": "#A0C4A0",
          "warning": "#D4C8A0",
          "error": "#D4A0B0",
        },
      },
    ],
  },
}
