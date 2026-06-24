import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SimulationProvider } from "@/hooks/useSimulation";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FIFA World Cup 2026 Simulator",
  description:
    "Simulate the 2026 FIFA World Cup — live standings and pick winners for remaining matches.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-zinc-950">
        <SimulationProvider>{children}</SimulationProvider>
      </body>
    </html>
  );
}
