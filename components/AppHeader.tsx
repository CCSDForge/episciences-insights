'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
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
    },
    {
      href: `/${locale}/journals`,
      slug: 'journals',
      label: t.tabs.journals,
      title: locale === 'fr' ? "Statistiques à l'usage des revues" : locale === 'es' ? 'Estadísticas de revistas' : 'Journal statistics',
    },
    {
      href: `/${locale}/institutions`,
      slug: 'institutions',
      label: t.tabs.institutions,
      title: locale === 'fr' ? "Statistiques à l'usage des institutions" : locale === 'es' ? 'Estadísticas por institución' : 'Institution statistics',
    },
    {
      href: `/${locale}/platform`,
      slug: 'platform',
      label: t.tabs.platform,
      title: locale === 'fr' ? "Données de la plateforme Episciences" : locale === 'es' ? 'Datos de la plataforma' : 'Platform data & global impact',
    },
  ];

  const checkIsActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.slug === 'home') {
      return pathname === `/${locale}` || pathname === `/${locale}/`;
    }
    return pathname === item.href || pathname?.startsWith(item.href);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 shadow-md backdrop-blur-md bg-[linear-gradient(to_right,#4da6b2_0%,#307599_35%,#1d4680_70%,#02015f_100%)] supports-[background:linear-gradient(to_right_in_oklab,red,blue)]:bg-[linear-gradient(to_right_in_oklab,#4da6b2_0%,#307599_35%,#1d4680_70%,#02015f_100%)] transition-colors">
      <div className="mx-auto max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 lg:gap-6">
          {/* Logo & Brand */}
          <Link
            href={`/${locale}/`}
            className="flex items-center shrink-0 focus-visible:outline-2 focus-visible:outline-[var(--primary-focus)] rounded-xl py-1 transition-opacity hover:opacity-90"
            aria-label="Episciences Insights Home"
          >
            <Image
              src="/episciences-insights-white.svg"
              alt="Episciences Insights"
              width={120}
              height={42}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
            <span className="sr-only">Episciences Insights - {t.header.diamondDashboard}</span>
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
                  className={`flex items-center rounded-full px-3 lg:px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap focus-visible:outline-2 focus-visible:outline-[var(--primary-focus)] ${
                    isActive
                      ? 'bg-white text-[#003b73] shadow-sm font-black'
                      : 'text-white/85 hover:text-white hover:bg-white/15'
                  }`}
                >
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
              className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-all ${
                isNetworkPage
                  ? 'bg-white text-[#00005f] shadow-sm'
                  : 'bg-white/15 text-white hover:bg-white/25 ring-1 ring-white/20'
              }`}
            >
              <span>{t.header.networkExplorerBtn}</span>
            </Link>

            <LanguageSwitcher />
            <ThemeSwitcher />
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <nav
          aria-label={locale === 'fr' ? 'Sections du tableau de bord (mobile)' : locale === 'es' ? 'Secciones del panel (móvil)' : 'Dashboard sections (mobile)'}
          className="flex md:hidden items-center gap-1.5 overflow-x-auto scrollbar-hide py-2 border-t border-white/15"
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
                    ? 'bg-white text-[#003b73] shadow-sm font-black'
                    : 'text-white/85 hover:text-white hover:bg-white/15'
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
