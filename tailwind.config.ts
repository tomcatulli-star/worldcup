import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./lib/**/*.{ts,tsx}"
  ],
  theme: {
    extend: {
      colors: {
        pitch: {
          950: "#07110d",
          900: "#0b1913",
          800: "#10261d",
          700: "#153625"
        },
        limeflash: "#9cff58",
        goldline: "#f6c453",
        dangerline: "#ff6b6b"
      },
      boxShadow: {
        glow: "0 18px 60px rgba(156, 255, 88, 0.12)"
      }
    }
  },
  plugins: []
};

export default config;
