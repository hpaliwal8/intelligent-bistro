/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        bistro: {
          bg: "#0E0B08",
          surface: "#1A1612",
          card: "#241E18",
          border: "#3A3128",
          text: "#F5EFE6",
          muted: "#9C8E7C",
          accent: "#E07A3B", // warm terracotta
          accentSoft: "#F2A878",
          success: "#7BB46A",
          danger: "#D26464",
        },
      },
      fontFamily: {
        display: ["InterDisplay", "Inter", "System"],
        body: ["Inter", "System"],
      },
    },
  },
  plugins: [],
};
