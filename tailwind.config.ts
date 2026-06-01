import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          night: "#273241",
          navy: "#2f4858",
          navySoft: "#5f7c83",
          emerald: "#4f8f73",
          emeraldSoft: "#83b99c",
          gold: "#c99c45",
          goldSoft: "#ead4a2",
          cream: "#fffaf0",
          beige: "#f3ead8",
          sand: "#e7d7bd",
          ink: "#273241",
          muted: "#6f746f",
          line: "#decfaf",
          glass: "rgba(255,250,240,0.78)",
          panel: "rgba(255, 250, 240, 0.92)"
        }
      },
      boxShadow: {
        glowGold: "0 0 0 1px rgba(201, 156, 69, 0.18), 0 18px 48px rgba(201, 156, 69, 0.18)",
        glowEmerald: "0 0 0 1px rgba(79, 143, 115, 0.18), 0 18px 48px rgba(79, 143, 115, 0.18)",
        panel: "0 24px 60px rgba(61, 49, 29, 0.12)"
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-14px)" }
        },
        pulseSoft: {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.03)" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "100% 50%" }
        }
      },
      animation: {
        float: "float 8s ease-in-out infinite",
        pulseSoft: "pulseSoft 6s ease-in-out infinite",
        shimmer: "shimmer 12s linear infinite"
      },
      backgroundImage: {
        "brand-mesh":
          "radial-gradient(circle at 18% 18%, rgba(234, 212, 162, 0.58), transparent 28%), radial-gradient(circle at 84% 12%, rgba(131, 185, 156, 0.38), transparent 24%), linear-gradient(135deg, rgba(255, 250, 240, 0.92), rgba(243, 234, 216, 0.78))"
      }
    }
  },
  plugins: []
};

export default config;
