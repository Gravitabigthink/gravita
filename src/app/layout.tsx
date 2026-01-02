import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { AIChatWidget } from "@/components/crm/AIChatWidget";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Sniper CRM - Gravita OS",
  description: "CRM inteligente con IA para gestión de ventas y leads",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" data-theme="dark" suppressHydrationWarning>
      <body className={`${inter.variable}`} suppressHydrationWarning>
        <ThemeProvider>
          {children}
          <AIChatWidget />
        </ThemeProvider>
      </body>
    </html>
  );
}
