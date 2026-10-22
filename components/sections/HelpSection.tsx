import React from 'react';
import Link from 'next/link';
import { ArrowLeft, BookOpen, Layers } from 'lucide-react';
import type { HelpPageData } from '@/lib/help';
import type { Locale } from '@/lib/i18n/translations';

interface HelpSectionProps {
  locale: Locale;
  data: HelpPageData;
}

export default function HelpSection({ locale, data }: HelpSectionProps) {
  const { frontmatter, html } = data;

  return (
    <article className="space-y-12 pb-16 animate-in fade-in duration-300">
      {/* Navigation retour */}
      <div>
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-600 hover:text-[var(--episciences-cyan-04)] dark:text-zinc-400 dark:hover:text-[var(--episciences-cyan-00)] transition-colors group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" aria-hidden="true" />
          <span>{frontmatter.backToDashboard}</span>
        </Link>
      </div>

      {/* Header académique */}
      <header className="rounded-2xl bg-gradient-to-br from-white via-zinc-50 to-[var(--episciences-cyan-00)]/10 p-8 sm:p-10 shadow-xs ring-1 ring-zinc-200 dark:from-zinc-900 dark:via-zinc-900 dark:to-[var(--episciences-cyan-00)]/10 dark:ring-zinc-800">
        <div className="space-y-4 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[var(--episciences-cyan-00)]/20 text-[var(--episciences-cyan-04)] dark:text-[var(--episciences-cyan-00)] border border-[var(--episciences-cyan-01)]/30">
            <BookOpen size={13} aria-hidden="true" />
            <span>{frontmatter.badge}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 font-heading leading-tight">
            {frontmatter.title}
          </h1>

          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 leading-relaxed">
            {frontmatter.subtitle}
          </p>

          <div className="pt-4 border-t border-zinc-200/60 dark:border-zinc-800 flex flex-wrap items-center gap-y-2 gap-x-6 text-xs text-zinc-500 dark:text-zinc-400">
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Affiliation : </span>
              {frontmatter.institution}
            </div>
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Auteurs : </span>
              {frontmatter.author}
            </div>
            <div>
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">Date : </span>
              {frontmatter.date}
            </div>
          </div>
        </div>
      </header>

      {/* Sommaire interactif */}
      {frontmatter.tocItems && frontmatter.tocItems.length > 0 && (
        <nav
          aria-label={frontmatter.tocTitle}
          className="rounded-2xl bg-white p-6 shadow-xs ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-zinc-800"
        >
          <h2 className="text-xs font-black uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-4 flex items-center gap-2">
            <Layers size={14} aria-hidden="true" />
            <span>{frontmatter.tocTitle}</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 text-xs font-semibold">
            {frontmatter.tocItems.map((item) => (
              <a
                key={item.id}
                href={`#${item.id}`}
                className="p-2.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 hover:text-[var(--episciences-cyan-04)] dark:hover:text-[var(--episciences-cyan-00)] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      )}

      {/* Corps du document Markdown */}
      <div
        className="help-markdown-content space-y-8"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </article>
  );
}
