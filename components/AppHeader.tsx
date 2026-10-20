'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, BookOpen, Building2, Globe, Network } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function AppHeader() {
  const { t, locale } = useTranslation();
  const pathname = usePathname();
  const isNetworkPage = pathname?.includes(`/${locale}/network`);

  const NAV_ITEMS = [
    {
      href: `/${locale}`,
      slug: 'home',
      label: locale === 'fr' ? 'Accueil' : locale === 'es' ? 'Inicio' : 'Home',
      title: locale === 'fr' ? "Page d'accueil et présentation" : locale === 'es' ? 'Inicio y resumen' : 'Home & overview',
      icon: <Home size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/journals`,
      slug: 'journals',
      label: t.tabs.journals,
      title: locale === 'fr' ? "Statistiques à l'usage des revues" : locale === 'es' ? 'Estadísticas de revistas' : 'Journal statistics',
      icon: <BookOpen size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/institutions`,
      slug: 'institutions',
      label: t.tabs.institutions,
      title: locale === 'fr' ? "Statistiques à l'usage des institutions" : locale === 'es' ? 'Estadísticas por institución' : 'Institution statistics',
      icon: <Building2 size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/platform`,
      slug: 'platform',
      label: t.tabs.platform,
      title: locale === 'fr' ? "Données globales de la plateforme Episciences" : locale === 'es' ? 'Datos globales de la plataforma' : 'Platform data & global impact',
      icon: <Globe size={15} aria-hidden="true" />,
    },
  ];

  const checkIsActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.slug === 'home') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === item.href || pathname?.startsWith(item.href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md shadow-xs transition-colors">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 lg:gap-6">
          {/* Logo & Brand */}
          <Link
            href={`/${locale}/`}
            className="flex items-center gap-2.5 shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--primary-focus)] rounded-xl"
            aria-label="Episciences Insights Home"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-900 ring-1 ring-zinc-200 dark:ring-zinc-800 p-1.5 transition-transform hover:scale-105">
              <Image
                src="/episciences.svg"
                alt="Episciences Logo"
                width={28}
                height={28}
                className="h-full w-full object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-base sm:text-lg font-black tracking-tight text-zinc-900 dark:text-zinc-50 leading-tight">
                Episciences{' '}
                <span className="bg-gradient-to-r from-[var(--episciences-cyan-03)] to-[var(--episciences-cyan-01)] dark:from-[var(--episciences-cyan-00)] dark:to-[var(--episciences-cyan-02)] bg-clip-text text-transparent">
                  Insights
                </span>
              </span>
              <span className="hidden xl:inline text-[9px] font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                {t.header.diamondDashboard}
              </span>
            </div>
          </Link>

          {/* Navigation Links (Desktop) */}
          <nav
            aria-label={locale === 'fr' ? 'Sections du tableau de bord' : locale === 'es' ? 'Secciones del panel' : 'Dashboard sections'}
            className="hidden md:flex items-center gap-1 lg:gap-1.5 overflow-x-auto scrollbar-hide py-1"
          >
            {NAV_ITEMS.map((item) => {
              const isActive = checkIsActive(item);

              return (
                <Link
                  key={item.slug}
                  href={item.href}
                  title={item.title}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 lg:gap-2 rounded-full px-3 lg:px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--primary-focus)] ${
                    isActive
                      ? 'bg-[var(--episciences-cyan-03)] text-white shadow-sm dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)] dark:font-black'
                      : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  <span className="shrink-0">{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Controls: Network Explorer + Collapsible Lang + Collapsible Theme */}
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={`/${locale}/network`}
              title={t.header.networkExplorerBtn}
              aria-label={t.header.networkExplorerBtn}
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 sm:px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                isNetworkPage
                  ? 'bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)]'
                  : 'bg-zinc-100 text-zinc-700 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 ring-1 ring-zinc-200 dark:ring-zinc-800'
              }`}
            >
              <Network size={14} aria-hidden="true" />
              <span className="hidden xl:inline">{t.header.networkExplorerBtn}</span>
            </Link>

            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <nav
          aria-label={locale === 'fr' ? 'Sections du tableau de bord (mobile)' : locale === 'es' ? 'Secciones del panel (móvil)' : 'Dashboard sections (mobile)'}
          className="flex md:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide py-2 border-t border-zinc-100 dark:border-zinc-800"
        >
          {NAV_ITEMS.map((item) => {
            const isActive = checkIsActive(item);

            return (
              <Link
                key={item.slug}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[var(--episciences-cyan-03)] text-white dark:bg-[var(--episciences-cyan-00)] dark:text-[var(--ccsd-bleu-00)] dark:font-black'
                    : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:hover:text-white'
                }`}
              >
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
