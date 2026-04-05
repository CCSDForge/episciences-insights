import fs from 'node:fs';
import path from 'node:path';
import Image from 'next/image';
import { Publication } from '@/lib/types';
import Dashboard from '@/components/Dashboard';
import { Globe, Wallet, BookOpen } from 'lucide-react';

async function getPublications(): Promise<Publication[]> {
  const filePath = path.join(process.cwd(), 'public/data/publications.json');
  if (!fs.existsSync(filePath)) return [];
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (e) {
    console.error("Failed to parse publications.json", e);
    return [];
  }
}

export default async function Page() {
  const publications = await getPublications();

  const totalPubs = publications.length;
  const totalSdgs = new Set(publications.flatMap(p => p.sdgs.map(s => s.id))).size;
  const totalFunders = new Set(publications.flatMap(p => p.awards.map(a => a.funder))).size;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <header className="relative mb-16 overflow-hidden rounded-[2.5rem] bg-white p-8 shadow-2xl ring-1 ring-zinc-200 dark:bg-zinc-900 dark:ring-white/10 lg:p-12">
          {/* Background Decorative Elements */}
          <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-blue-500/5 blur-3xl dark:bg-blue-500/10" />
          <div className="absolute -left-24 -bottom-24 h-96 w-96 rounded-full bg-teal-500/5 blur-3xl dark:bg-teal-500/10" />
          
          <div className="relative flex flex-col items-center gap-10 lg:flex-row-reverse lg:gap-16">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-white p-2 shadow-2xl ring-2 ring-zinc-50 transition-transform hover:scale-110 lg:h-40 lg:w-40">
              <Image 
                src="/episciences.svg" 
                alt="Episciences - Open Access Publishing Platform" 
                width={140} 
                height={140}
                className="h-auto w-[85%]"
                priority
              />
            </div>
            
            <div className="text-center lg:text-left flex-1">
              <h1 className="font-heading text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl lg:text-6xl">
                Episciences <span className="bg-gradient-to-r from-blue-600 to-teal-500 bg-clip-text text-transparent">Insights</span>
              </h1>
              <p className="mt-4 max-w-2xl text-lg font-medium text-zinc-600 dark:text-zinc-400 sm:text-xl font-sans">
                Global analysis of scientific impact for Episciences Journals
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-700 ring-1 ring-inset ring-blue-700/10 dark:bg-blue-500/10 dark:text-blue-400">
                  Overlay journals
                </span>
                <span className="inline-flex items-center rounded-full bg-teal-50 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-teal-700 ring-1 ring-inset ring-teal-700/10 dark:bg-teal-500/10 dark:text-teal-400">
                  Diamond Open Access Dashboard
                </span>
              </div>
            </div>
          </div>
        </header>

        <main id="main-content">
          <Dashboard initialData={publications} />
          
          {/* Data Disclaimer */}
          <section className="mt-16 rounded-3xl bg-zinc-100/50 p-8 dark:bg-zinc-900/50 ring-1 ring-zinc-200 dark:ring-zinc-800">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="rounded-2xl bg-white dark:bg-zinc-800 p-3 shadow-sm shrink-0">
                <Globe className="h-6 w-6 text-zinc-400" />
              </div>
              <div className="space-y-4">
                <h4 className="text-sm font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-50">Data Accuracy & Source Disclaimer</h4>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                    The scientific metrics and connections visualized in this dashboard are powered by the <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="text-blue-600 dark:text-blue-400 hover:underline font-bold">OpenAlex API</a>. 
                    Please note that this dataset may not represent the exhaustive catalog of Episciences publications, and indexing latencies may occur.
                  </p>
                  <p className="text-sm leading-relaxed text-zinc-600 dark:text-zinc-400 font-medium">
                    Certain metadata—including research topics, SDG alignment, and related works—are generated using OpenAlex automated algorithms. 
                    Episciences is engaged in a permanent effort to refine, verify, and enrich these datasets to provide an increasingly accurate representation of our research impact.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>

        <footer className="mt-20 border-t border-zinc-200 py-12 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
          <p className="font-semibold">CC-BY 2026 Episciences Insights - Open Source (GPL v3)</p>
          <p className="mt-2">Data automatically aggregated from OpenAlex API</p>
        </footer>
      </div>
    </div>
  );
}
