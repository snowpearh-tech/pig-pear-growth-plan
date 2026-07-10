import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        surface: {
          rose: "#ffe1e7",
          cream: "#fff8f2",
          peach: "#ffd7bf",
          sage: "#dcefdc",
          gold: "#f7d78b",
          ink: "#5f4438",
        },
      },
      fontFamily: {
        sans: ['"Outfit"', '"Noto Sans SC"', "sans-serif"],
        display: ['"ZCOOL KuaiLe"', '"Outfit"', "sans-serif"],
      },
      boxShadow: {
        float: "0 20px 45px rgba(190, 134, 113, 0.18)",
        soft: "0 10px 25px rgba(145, 104, 86, 0.12)",
      },
      backgroundImage: {
        halo:
          "radial-gradient(circle at top left, rgba(255, 203, 213, 0.75), transparent 45%), radial-gradient(circle at bottom right, rgba(255, 223, 192, 0.65), transparent 42%)",
        grain:
          "linear-gradient(120deg, rgba(255,255,255,0.22), rgba(255,255,255,0.04))",
      },
      keyframes: {
        floaty: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-6px)" },
        },
        glow: {
          "0%, 100%": { boxShadow: "0 0 0 rgba(250, 171, 182, 0)" },
          "50%": { boxShadow: "0 0 26px rgba(250, 171, 182, 0.3)" },
        },
      },
      animation: {
        floaty: "floaty 5s ease-in-out infinite",
        glow: "glow 2.8s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
