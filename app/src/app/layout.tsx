import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Laferlins — Agenda TakeUp",
  description: "Plataforma de acompanhamento de HVI e TakeUp de contratos de algodão",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className={`${inter.className} h-full`}>{children}</body>
    </html>
  );
}
