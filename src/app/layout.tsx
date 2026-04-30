import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import SessionProviderWrapper from "@/components/auth/SessionProviderWrapper";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Sistem Paket Warga",
  description: "Manajemen Distribusi Paket Perumahan",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <SessionProviderWrapper>
          {children}
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
