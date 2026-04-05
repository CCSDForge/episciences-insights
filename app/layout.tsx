import type { Metadata } from "next";
import { Manrope, Noto_Sans } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin"],
  display: "swap",
});

const notoSans = Noto_Sans({
  variable: "--font-noto-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Episciences Insights",
  description: "Visualizing scientific impact data from OpenAlex for Episciences publications",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body
        className={`${manrope.variable} ${notoSans.variable} font-sans antialiased h-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100`}
      >
        {children}
      </body>
    </html>
  );
}
