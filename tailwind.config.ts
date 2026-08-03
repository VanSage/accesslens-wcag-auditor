import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#12213B", // deep chart-navy, near-black for text/frames
        paper: "#EEF1EF", // cool eye-chart paper (not cream — deliberate)
        paperDim: "#E2E6E2",
        line: "#C7CDC8", // hairline rule color
        focus: "#2F6FED", // interactive / focus-ring blue
        pass: "#3E7A5C", // sage — "can see clearly"
        warn: "#E8A33D", // amber — moderate
        critical: "#C0432E", // signal red — critical/serious
        muted: "#5B6572",
      },
      fontFamily: {
        chart: ["Newsreader", "Georgia", "serif"], // the "eye chart" display face
        sans: ["IBM Plex Sans", "system-ui", "sans-serif"],
        mono: ["IBM Plex Mono", "ui-monospace", "monospace"],
      },
      borderRadius: {
        none: "0px",
      },
      keyframes: {
        focusIn: {
          "0%": { filter: "blur(14px)", opacity: "0" },
          "100%": { filter: "blur(0px)", opacity: "1" },
        },
        scan: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
      },
      animation: {
        focusIn: "focusIn 900ms cubic-bezier(0.2,0.7,0.2,1) forwards",
        scan: "scan 1.6s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
