'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootRedirect({ targetPath = '' }: { targetPath?: string }) {
  const router = useRouter();

  useEffect(() => {
    try {
      const saved = localStorage.getItem('episciences-locale');
      let targetLocale = 'en';
      if (saved === 'fr' || saved === 'es' || saved === 'en') {
        targetLocale = saved;
      } else if (typeof navigator !== 'undefined') {
        const lang = (navigator.language || '').toLowerCase();
        if (lang.startsWith('fr')) targetLocale = 'fr';
        else if (lang.startsWith('es')) targetLocale = 'es';
      }

      const destination = targetPath ? `/${targetLocale}/${targetPath}/` : `/${targetLocale}/`;
      router.replace(destination);
    } catch {
      router.replace(targetPath ? `/en/${targetPath}/` : '/en/');
    }
  }, [router, targetPath]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-6 text-center">
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=${targetPath ? `/en/${targetPath}/` : '/en/'}`} />
        <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
          Redirecting... <a href={targetPath ? `/en/${targetPath}/` : '/en/'} className="text-teal-600 underline font-bold">Click here if you are not redirected</a>.
        </p>
      </noscript>
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Loading Episciences Insights...</p>
      </div>
    </div>
  );
}
