import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}", "./src/app/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          night: "#031926",
          navy: "#031926",
          navySoft: "#468189",
          emerald: "#77ACA2",
          emeraldSoft: "#9DBEBB",
          gold: "#468189",
          goldSoft: "#77ACA2",
          cream: "#FFFFFF",
          beige: "#EDF7F4",
          sand: "#D6E7E3",
          ink: "#031926",
          muted: "#58706C",
          line: "rgba(70, 129, 137, 0.34)",
          glass: "rgba(255, 255, 255, 0.9)",
          panel: "rgba(255, 255, 255, 0.94)"
        }
      },
      boxShadow: {
        glowGold: "0 0 0 1px rgba(70, 129, 137, 0.24), 0 18px 48px rgba(70, 129, 137, 0.18)",
        glowEmerald: "0 0 0 1px rgba(119, 172, 162, 0.28), 0 18px 48px rgba(70, 129, 137, 0.22)",
        panel: "0 24px 60px rgba(3, 25, 38, 0.1)"
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
          "radial-gradient(circle at 18% 18%, rgba(119, 172, 162, 0.3), transparent 28%), radial-gradient(circle at 84% 12%, rgba(70, 129, 137, 0.26), transparent 24%), linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(237, 247, 244, 0.9), rgba(157, 190, 187, 0.22))"
      }
    }
  },
  plugins: []
};

export default config;
