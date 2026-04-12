/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        slate: {
          50: "#f8fafc",
          100: "#f1f5f9",
          500: "#64748b",
          700: "#334155",
          900: "#0f172a",
        },
        teal: {
          50: "#f0fdfa",
          500: "#14b8a6",
          600: "#0d9488",
          700: "#0f766e",
        },
        brand: {
          ink: "#0f172a",
          blue: "#1d4ed8",
          navy: "#1e40af",
          mist: "#f8fafc",
        },
      },
      boxShadow: {
        soft: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
        xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 0px 10px -5px rgb(0 0 0 / 0.1)",
      },
      backgroundImage: {
        "hero-glow":
          "radial-gradient(circle at top left, rgba(255,255,255,0.9) 0%, rgba(231,243,255,0.86) 28%, rgba(255,249,241,0.74) 62%, rgba(255,255,255,0.94) 100%)",
      },
      fontFamily: {
        sans: ["Manrope", "sans-serif"],
        display: ["Fraunces", "serif"],
      },
      keyframes: {
        "fade-up": {
          "0%": {
            opacity: "0",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },
      animation: {
        "fade-up": "fade-up 0.55s ease-out both",
      },
    },
  },
  plugins: [],
};
