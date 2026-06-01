import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Manrope, Space_Grotesk } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { DemoSessionProvider } from "@/components/providers/demo-session-provider";

const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space-grotesk", display: "swap" });

export const metadata: Metadata = {
  title: "Jahir Alvarez CRM Político",
  description: "Plataforma premium para gestión política, territorial y electoral."
};

export default function RootLayout({
  children
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={`${manrope.variable} ${spaceGrotesk.variable} app-light bg-brand-cream text-brand-ink antialiased`}>
        <DemoSessionProvider>{children}</DemoSessionProvider>
      </body>
    </html>
  );
}
