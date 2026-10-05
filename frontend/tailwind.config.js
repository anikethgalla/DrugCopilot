/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "#09090b",
        "canvas-subtle": "#101013",
        surface: "#141417",
        "surface-raised": "#1a1a20",
        "surface-overlay": "#22222a",
        "surface-border": "#2c2c36",
        "surface-border-subtle": "#202028",
        brand: {
          50: "#fafafa",
          100: "#f4f4f5",
          200: "#e4e4e7",
          300: "#d4d4d8",
          400: "#a1a1aa",
          500: "#71717a",
          600: "#52525b",
          700: "#3f3f46",
          800: "#27272a",
          900: "#18181b",
          accent: "#ffffff",
        },
        biomedical: {
          drug: "#ffffff",       // Pure White
          disease: "#e4e4e7",    // Light Silver Grey
          target: "#d4d4d8",     // Silver Grey
          protein: "#f4f4f5",    // Platinum White
          gene: "#a1a1aa",       // Medium Neutral Grey
          pathway: "#d4d4d8",    // Light Grey
          trial: "#e4e4e7",      // Light Grey
          publication: "#71717a" // Muted Grey
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"]
      },
      boxShadow: {
        "specular": "inset 0 1px 0 0 rgba(255, 255, 255, 0.08)",
        "specular-strong": "inset 0 1px 0 0 rgba(255, 255, 255, 0.16)",
        "card": "0 0 0 1px rgba(255, 255, 255, 0.08), 0 4px 20px -2px rgba(0, 0, 0, 0.6)",
        "glow-brand": "0 0 24px -4px rgba(255, 255, 255, 0.15)",
      }
    },
  },
  plugins: [],
};
