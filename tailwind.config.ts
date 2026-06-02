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
          gold: "#C99C45",
          goldSoft: "#F4E9CD",
          cream: "#F4E9CD",
          beige: "#FFF7E2",
          sand: "#D8C896",
          ink: "#031926",
          muted: "#5E706F",
          line: "#D8C896",
          glass: "rgba(244,233,205,0.82)",
          panel: "rgba(255, 247, 226, 0.94)"
        }
      },
      boxShadow: {
        glowGold: "0 0 0 1px rgba(201, 156, 69, 0.2), 0 18px 48px rgba(201, 156, 69, 0.18)",
        glowEmerald: "0 0 0 1px rgba(119, 172, 162, 0.28), 0 18px 48px rgba(70, 129, 137, 0.22)",
        panel: "0 24px 60px rgba(3, 25, 38, 0.12)"
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
          "radial-gradient(circle at 18% 18%, rgba(244, 233, 205, 0.72), transparent 28%), radial-gradient(circle at 84% 12%, rgba(119, 172, 162, 0.42), transparent 24%), linear-gradient(135deg, rgba(255, 247, 226, 0.94), rgba(157, 190, 187, 0.28))"
      }
    }
  },
  plugins: []
};

export default config;
