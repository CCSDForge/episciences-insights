'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';

interface NetworkTeaserProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: 'teal' | 'blue';
}

const COLOR_CLASSES = {
  teal: {
    iconBg: 'bg-teal-600 shadow-teal-600/20',
    ring: 'ring-teal-100 dark:ring-teal-900/30',
    bg: 'bg-teal-50/30 dark:bg-teal-900/10',
    cta: 'text-teal-700 dark:text-teal-400 hover:text-teal-800 dark:hover:text-teal-300',
  },
  blue: {
    iconBg: 'bg-blue-600 shadow-blue-600/20',
    ring: 'ring-blue-100 dark:ring-blue-900/30',
    bg: 'bg-blue-50/30 dark:bg-blue-900/10',
    cta: 'text-blue-700 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300',
  },
};

/**
 * Compact placeholder shown inline where a dense network graph used to
 * render at full size. With enough nodes those graphs turn into an
 * unreadable "hairball" no matter the layout — this points to the
 * dedicated /network page instead, which has the room a graph or matrix
 * actually needs.
 */
export default function NetworkTeaser({ icon, title, description, color }: NetworkTeaserProps) {
  const { t } = useTranslation();
  const classes = COLOR_CLASSES[color];

  return (
    <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-6 rounded-3xl ${classes.bg} ring-1 ${classes.ring} p-8`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 text-white rounded-2xl shadow-lg shrink-0 ${classes.iconBg}`}>
          {icon}
        </div>
        <div>
          <h4 className="text-lg font-black text-zinc-900 dark:text-zinc-50">{title}</h4>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md">{description}</p>
        </div>
      </div>
      <Link
        href="/network"
        className={`inline-flex items-center gap-1.5 text-xs font-black uppercase tracking-widest shrink-0 ${classes.cta}`}
      >
        {t.common.openNetworkExplorer}
        <ArrowUpRight size={14} />
      </Link>
    </div>
  );
}
