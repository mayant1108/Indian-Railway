/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: "#0f4c81",
          blue: "#1d74bd",
          mist: "#e7f3ff",
          gold: "#f59e0b",
          ink: "#10213a",
          cream: "#fff9f1",
        },
      },
      boxShadow: {
        soft: "0 20px 50px -24px rgba(15, 76, 129, 0.35)",
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
