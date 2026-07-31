// src/app/layout.tsx
import type { Metadata } from "next";
import * as Sentry from "@sentry/nextjs";
import { Header } from "@/components/Header";
import { Inter, Merriweather } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const merriweather = Merriweather({
  weight: ["300", "400", "700"],
  subsets: ["latin"],
  variable: "--font-merriweather"
});

export const metadata: Metadata = {
  title: "Chronicle | Synchronous Reading",
  description: "A spoiler-free synchronous reading group platform.",
    other: {
      ...Sentry.getTraceData(),
    }
};

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode;
}>) {
  return (
      <html lang="en">
      <body className={`${inter.variable} ${merriweather.variable} font-sans bg-[#f4f4f0] text-[#1c1c1c] antialiased`}>
      <Header />
      {children}
      </body>
      </html>
  );
}