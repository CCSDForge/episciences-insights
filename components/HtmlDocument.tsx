import React from 'react';
import { Manrope, Noto_Sans } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  display: 'swap',
});

const notoSans = Noto_Sans({
  variable: '--font-noto-sans',
  subsets: ['latin'],
  display: 'swap',
});

const THEME_INIT_SCRIPT = `
  (function() {
    try {
      var saved = localStorage.getItem('episciences-theme');
      var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (saved === 'dark' || ((!saved || saved === 'system') && prefersDark)) {
        document.documentElement.classList.add('dark');
        document.documentElement.style.colorScheme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        document.documentElement.style.colorScheme = 'light';
      }
    } catch (e) {}
  })();
`;

export default function HtmlDocument({
  lang,
  children,
}: {
  lang: string;
  children: React.ReactNode;
}) {
  return (
    <html lang={lang} className="h-full" suppressHydrationWarning>
      {/* eslint-disable-next-line @next/next/no-head-element -- Shared root layout shell for route-group layouts */}
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body
        className={`${manrope.variable} ${notoSans.variable} font-sans antialiased h-full bg-zinc-50 dark:bg-black text-zinc-900 dark:text-zinc-100`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
