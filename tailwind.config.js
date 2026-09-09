/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-rajdhani)", "sans-serif"],
        mono: ["var(--font-jetbrains)", "monospace"],
        sans: ["var(--font-inter)", "sans-serif"],
      },
      colors: {
        dragon: {
          bg: "#09090b",       // Obsidiana pura (zinc-950)
          panel: "#121215",    // Superficie mate técnica
          hover: "#18181b",    // zinc-900 interactivo
          border: "#27272a",   // zinc-800 límite sutil
          crimson: "#dc2626",  // Rojo Carmesí mate
          crimsonDark: "#991b1b",
          ember: "#f97316",    // Naranja Brasa para foco/activo
          muted: "#71717a",    // zinc-500 para telemetría secundaria
        },
      },
      borderRadius: {
        DEFAULT: "2px",
        sm: "1px",
      },
      borderWidth: {
        hairline: "1px",
      },
      transitionDuration: {
        DEFAULT: "150ms",
      },
    },
  },
  plugins: [],
};
