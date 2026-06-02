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
          gold: "#D6A842",
          goldSoft: "#F4E9CD",
          cream: "#F6FBF9",
          beige: "#EEF6F3",
          sand: "#D6E7E3",
          ink: "#031926",
          muted: "#58706C",
          line: "rgba(70, 129, 137, 0.28)",
          glass: "rgba(246, 251, 249, 0.86)",
          panel: "rgba(255, 255, 255, 0.9)"
        }
      },
      boxShadow: {
        glowGold: "0 0 0 1px rgba(214, 168, 66, 0.22), 0 18px 48px rgba(214, 168, 66, 0.2)",
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
          "radial-gradient(circle at 18% 18%, rgba(119, 172, 162, 0.34), transparent 28%), radial-gradient(circle at 84% 12%, rgba(70, 129, 137, 0.28), transparent 24%), linear-gradient(135deg, rgba(255, 255, 255, 0.96), rgba(246, 251, 249, 0.86), rgba(244, 233, 205, 0.36))"
      }
    }
  },
  plugins: []
};

export default config;
