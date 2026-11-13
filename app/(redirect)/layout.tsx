import React from 'react';
import type { Metadata } from 'next';
import '../globals.css';
import HtmlDocument from '@/components/HtmlDocument';
import { baseMetadata } from '@/lib/metadata';

export const metadata: Metadata = baseMetadata;

export default function RedirectRootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <HtmlDocument lang="en">{children}</HtmlDocument>;
}
