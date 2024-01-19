/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        brand: {
          green: {
            primary: "#009254",
            hover: "#33A467",
            focused: "#009254",
            pressed: "#006F37",
            shd: "#CAEAD499",
            ttr: "#F4FBF6",
            shade0: "#000000",
            shade10: "#052011",
            shade20: "#003A1B",
            shade40: "#005427",
            shade50: "#00894C",
            shade70: "#64BD87",
            shade80: "#96D4AB",
            shade90: "#CAEAD4",
            shade95: "#E6F5EA",
          },
          red: {
            primary: "#FF2E2E",
            hover: "#FF5C5C",
            focused: "#FF2E2E",
            pressed: "#FF2E2E",
          },
          success: {
            primary: "#06C270",
            hover: "#39D98A",
            focused: "#06C270",
            pressed: "#06C270",
          },
          disabled: "#E1E3E2",
          disabled2: "#C4C7C6",
        },
        white: {
          100: "#fff",
          105: "#f6f8fb",
          200: "#ccc",
          300: "#ebebebb6",
          400: "#777",
          500: "rgba(0,0,0,.1)",
          600: "rgba(255,255,255,0.08)",
        },
        dark: {
          100: "#1a1b1f",
          102: "#24272b",
          103: "#18141d",
          105: "#000",
          200: "#16181d",
          300: "#312c3b",
          400: "#3e3749",
          500: "rgba(0,0,0,.4)",
        },
        gray: {
          100: "#736c7e",
        },
        red: {
          100: "rgb(255, 0, 0, .4)",
          200: "#ff0000",
          300: "#cc0000",
          305: "#ff4741",
          400: "#990000",
          500: "#660000",
          600: "#330000",
          700: "#000000",
        },
        orange: {
          100: "#FF8A65",
          200: "rgba(255, 138, 101, 0.3)",
          300: "#f99d52",
          301: "rgba(51, 30, 20, 1)",
        },
        blue: {
          100: "#3770fe",
          101: "#6b77f1",
          200: "rgba(59, 130, 246, 0.3)",
          201: "#f4fbfe",
        },
        green: {
          100: "#22C55E",
          105: "#228637",
          200: "rgba(34, 197, 94, 0.3)",
        },
        pink: {
          100: "#E4295D",
          200: "rgba(228, 41, 93, 0.3)",
        },
        purple: {
          100: "#8f63f3",
          105: "rgb(143, 99, 243,.3)",
        },
        teal: {
          100: "#21B6A2",
          200: "rgba(33, 182, 162, 0.3)",
        },
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
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: 0 },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: 0 },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        enter: "enter 200ms ease-out",
        "slide-in": "slide-in 1.2s cubic-bezier(.41,.73,.51,1.02)",
        leave: "leave 150ms ease-in forwards",
      },
      fontFamily: {
        ppReg: ["var(--font-ppReg)"],
        ppB: ["var(--font-ppB)"],
        ppEB: ["var(--font-ppEB)"],
        ppSB: ["var(--font-ppSB)"],
        ppL: ["var(--font-ppL)"],
        blEB: ["var(--font-blEB)"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
