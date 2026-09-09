import type { Metadata } from "next";
import { Rajdhani, JetBrains_Mono, Inter } from "next/font/google";
import "./globals.css";

const rajdhani = Rajdhani({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-rajdhani",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-jetbrains",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FURIA DE DRAGONES // TACTICAL OPS",
  description: "Terminal de Operaciones Tácticas y Builds - Albion Online",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="es"
      className={`dark ${rajdhani.variable} ${jetbrainsMono.variable} ${inter.variable}`}
    >
      <body className="h-screen w-screen overflow-hidden bg-dragon-bg text-zinc-200 antialiased font-sans select-none">
        {children}
      </body>
    </html>
  );
}
