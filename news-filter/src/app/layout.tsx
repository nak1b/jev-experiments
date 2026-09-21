import type { Metadata } from "next";
import { Overpass } from "next/font/google";
import "./globals.css";

/* Overpass descends from Highway Gothic, the typeface on US road signs. */
const overpass = Overpass({
  variable: "--font-overpass",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "News filter",
  description: "Filter the Hacker News front page with a rule in plain words.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${overpass.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col font-sans">{children}</body>
    </html>
  );
}
