"use client";
import "./lib/i18n/i18n";
import { LanguageProvider } from "./context/LanguageContext";
import LanguageSelector from "./components/LanguageSelector";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Font import
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Root layout component
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <LanguageProvider>
          <header className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-4 px-6 flex justify-between items-center">
            <h1 className="text-2xl font-bold">NYC Transit Hub</h1>
            <LanguageSelector />
          </header>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
