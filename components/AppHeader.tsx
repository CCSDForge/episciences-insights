'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, BarChart3, Map as MapIcon, Library, FlaskConical, Search, Network } from 'lucide-react';
import { useTranslation } from '@/lib/i18n/LanguageContext';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import ThemeSwitcher from '@/components/ThemeSwitcher';

export default function AppHeader() {
  const { t, locale } = useTranslation();
  const pathname = usePathname();

  const getNavLabel = (slug: string) => {
    if (locale === 'fr') {
      switch (slug) {
        case 'home': return 'Accueil';
        case 'usage': return 'Statistiques';
        case 'reach': return 'Rayonnement';
        case 'topics': return 'Thématiques';
        case 'funders': return 'Financeurs';
        case 'open-science': return 'Science Ouverte';
        default: return slug;
      }
    }
    if (locale === 'es') {
      switch (slug) {
        case 'home': return 'Inicio';
        case 'usage': return 'Estadísticas';
        case 'reach': return 'Alcance';
        case 'topics': return 'Temas';
        case 'funders': return 'Financiadores';
        case 'open-science': return 'Ciencia Abierta';
        default: return slug;
      }
    }
    switch (slug) {
      case 'home': return 'Home';
      case 'usage': return 'Usage';
      case 'reach': return 'Global Reach';
      case 'topics': return 'Topics';
      case 'funders': return 'Funders';
      case 'open-science': return 'Open Science';
      default: return slug;
    }
  };

  const NAV_ITEMS = [
    {
      href: `/${locale}`,
      slug: 'home',
      label: getNavLabel('home'),
      title: locale === 'fr' ? 'Page d\'accueil et synthèse' : locale === 'es' ? 'Inicio y resumen' : 'Home & overview',
      icon: <Home size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/usage`,
      slug: 'usage',
      label: getNavLabel('usage'),
      title: t.tabs.usage,
      icon: <BarChart3 size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/reach`,
      slug: 'reach',
      label: getNavLabel('reach'),
      title: t.tabs.reach,
      icon: <MapIcon size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/topics`,
      slug: 'topics',
      label: getNavLabel('topics'),
      title: t.tabs.topics,
      icon: <Library size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/funders`,
      slug: 'funders',
      label: getNavLabel('funders'),
      title: t.tabs.funders,
      icon: <FlaskConical size={15} aria-hidden="true" />,
    },
    {
      href: `/${locale}/open-science`,
      slug: 'open-science',
      label: getNavLabel('open-science'),
      title: t.tabs.lineage,
      icon: <Search size={15} aria-hidden="true" />,
    },
  ];

  const isNetworkPage = pathname?.includes(`/${locale}/network`);

  const checkIsActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.slug === 'home') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === item.href || (pathname?.startsWith(item.href) && !isNetworkPage);
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
            role="navigation"
            aria-label="Sections du tableau de bord"
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
          role="navigation"
          aria-label="Sections du tableau de bord (mobile)"
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
