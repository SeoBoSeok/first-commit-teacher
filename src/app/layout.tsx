import type { Metadata } from "next";
import { Bagel_Fat_One, Space_Grotesk, Space_Mono } from "next/font/google";
import "./globals.css";

const bagel = Bagel_Fat_One({
  variable: "--font-bagel",
  subsets: ["latin"],
  weight: "400",
  display: "swap",
});

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const spaceMono = Space_Mono({
  variable: "--font-spacemono",
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "SPACEKKABBI — Space Dokkaebi Universe",
  description:
    "Ten dokkaebi, three factions, one long broadcast nobody quite remembers turning on. A space-folk universe of Korean spirits at the edge of the belt.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${bagel.variable} ${grotesk.variable} ${spaceMono.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
