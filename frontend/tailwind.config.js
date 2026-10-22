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
        background: "#000000",
        "canvas-subtle": "#08080a",
        surface: "#0e0e11",
        "surface-raised": "#141418",
        "surface-overlay": "#1c1c21",
        "surface-border": "#27272a",
        "surface-border-subtle": "rgba(255, 255, 255, 0.08)",

        // Pure Monochrome Palette
        drug: "#ffffff",
        "drug-dark": "#d4d4d8",
        "drug-glow": "rgba(255, 255, 255, 0.15)",
        disease: "#e4e4e7",
        "disease-dark": "#a1a1aa",
        protein: "#f4f4f5",
        gene: "#d4d4d8",
        pathway: "#a1a1aa",
        trial: "#ffffff",
        publication: "#71717a",

        brand: {
          50: "#ffffff",
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
          drug: "#ffffff",
          disease: "#d4d4d8",
          target: "#f4f4f5",
          protein: "#e4e4e7",
          gene: "#a1a1aa",
          pathway: "#71717a",
          trial: "#ffffff",
          publication: "#a1a1aa"
        }
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "Roboto", "sans-serif"],
        mono: ["JetBrains Mono", "ui-monospace", "SFMono-Regular", "Menlo", "Monaco", "monospace"]
      },
      boxShadow: {
        "specular": "inset 0 1px 0 0 rgba(255, 255, 255, 0.15)",
        "specular-strong": "inset 0 1px 0 0 rgba(255, 255, 255, 0.35)",
        "card": "0 0 0 1px rgba(255, 255, 255, 0.08), 0 8px 32px -4px rgba(0, 0, 0, 0.8)",
        "card-hover": "0 0 0 1px rgba(255, 255, 255, 0.22), 0 14px 44px -4px rgba(0, 0, 0, 0.95)",
        "glow-brand": "0 0 30px -4px rgba(255, 255, 255, 0.25)",
        "glow-sm": "0 0 15px -2px rgba(255, 255, 255, 0.2)",
        "glow-pill": "0 0 20px rgba(255, 255, 255, 0.15)",
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-monochrome': 'linear-gradient(180deg, #ffffff 0%, #71717a 100%)',
        'gradient-silver': 'linear-gradient(135deg, #ffffff 0%, #a1a1aa 50%, #3f3f46 100%)',
      },
      animation: {
        'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'float-slow': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 15px -5px rgba(255, 255, 255, 0.15)' },
          '50%': { boxShadow: '0 0 30px -5px rgba(255, 255, 255, 0.35)' },
        },
        fadeIn: {
          from: { opacity: 0, transform: 'translateY(8px)' },
          to: { opacity: 1, transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
};
