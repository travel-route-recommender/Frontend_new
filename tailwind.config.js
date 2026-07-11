/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        duri: {
          bg: "#F7F8F5",
          surface: "#FFFFFF",
          ink: "#17211C",
          muted: "#68746E",
          line: "#E5E9E2",
          green: "#1F8A77",
          "green-dark": "#12685C",
          mint: "#DFF3EA",
          blue: "#30758A",
          sand: "#F1E8D7",
          yellow: "#F7C873",
        },
      },
      boxShadow: {
        card: "0 10px 30px rgba(25, 38, 32, 0.07)",
        dock: "0 -12px 28px rgba(25, 38, 32, 0.08)",
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "Apple SD Gothic Neo",
          "Noto Sans KR",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
