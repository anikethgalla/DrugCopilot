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
        background: "#08090d",
        "canvas-subtle": "#0c0e14",
        surface: "#11141c",
        "surface-raised": "#161a24",
        "surface-overlay": "#1c212e",
        "surface-border": "#212738",
        "surface-border-subtle": "#171b26",
        brand: {
          50: "#f0f9ff",
          100: "#e0f2fe",
          200: "#bae6fd",
          300: "#7dd3fc",
          400: "#38bdf8",
          500: "#0ea5e9",
          600: "#0284c7",
          700: "#0369a1",
          800: "#075985",
          900: "#0c4a6e",
          accent: "#00d2ff",
        },
        biomedical: {
          drug: "#38bdf8",       // Sky
          disease: "#fb7185",    // Rose
          target: "#818cf8",     // Indigo
          protein: "#60a5fa",    // Blue
          gene: "#34d399",       // Emerald
          pathway: "#fbbf24",    // Amber
          trial: "#f472b6",      // Pink
          publication: "#94a3b8" // Slate
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"]
      },
      boxShadow: {
        "specular": "inset 0 1px 0 0 rgba(255, 255, 255, 0.06)",
        "specular-strong": "inset 0 1px 0 0 rgba(255, 255, 255, 0.12)",
        "card": "0 0 0 1px rgba(255, 255, 255, 0.05), 0 4px 20px -2px rgba(0, 0, 0, 0.5)",
        "glow-brand": "0 0 24px -4px rgba(14, 165, 233, 0.25)",
      }
    },
  },
  plugins: [],
};
