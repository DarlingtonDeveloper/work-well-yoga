import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Nav } from "@/components/nav";
import { FloatingContact, MiniFoot } from "@/components/footer";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
  axes: ["opsz"],
  style: ["normal", "italic"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Nine2Rise — yoga for the whole of you",
  description:
    "A yoga practice that meets you in the middle of your Tuesday — not at a retreat you'll never book.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
      <body>
        <Nav />
        {children}
        <MiniFoot />
        <FloatingContact />
      </body>
    </html>
  );
}
