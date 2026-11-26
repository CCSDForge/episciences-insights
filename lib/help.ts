import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';
import { Marked } from 'marked';
import type { Locale } from '@/lib/i18n/translations';

export interface HelpTocItem {
  id: string;
  label: string;
}

export interface HelpFrontmatter {
  title: string;
  subtitle: string;
  badge: string;
  institution: string;
  author: string;
  date: string;
  backToDashboard: string;
  tocTitle: string;
  tocItems: HelpTocItem[];
}

export interface HelpPageData {
  frontmatter: HelpFrontmatter;
  html: string;
}

export function getHelpPageData(
  locale: Locale,
  stats?: { totalPublications?: number; totalHostedJournals?: number }
): HelpPageData {
  const filePath = path.join(process.cwd(), 'content', 'help', `${locale}.md`);
  const rawFile = fs.readFileSync(filePath, 'utf-8');
  const { data, content } = matter(rawFile);

  const totalPubsFormatted = (stats?.totalPublications ?? 8062).toLocaleString(
    locale === 'fr' ? 'fr-FR' : locale === 'es' ? 'es-ES' : 'en-US'
  );
  const totalJournals = String(stats?.totalHostedJournals ?? 47);

  const resolvedContent = content
    .replaceAll('{publicationsCount}', totalPubsFormatted)
    .replaceAll('{journalsCount}', totalJournals);

  // Use an isolated Marked instance to avoid mutating the global singleton on every call
  const markedInstance = new Marked({
    renderer: {
      heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        if (depth === 2) {
          const match = text.match(/^(\d+)\./);
          const id = match ? `sec${match[1]}` : '';
          return `</section><section id="${id}" class="help-section-card"><h2 class="help-section-title">${text}</h2>`;
        }
        return false;
      },
      link({ href, tokens }) {
        const text = this.parser.parseInline(tokens);
        const isExternal = href.startsWith('http://') || href.startsWith('https://');
        const extAttrs = isExternal
          ? ' target="_blank" rel="noopener noreferrer"'
          : '';
        return `<a href="${href}"${extAttrs}>${text}</a>`;
      },
    },
  });

  let html = markedInstance.parse(resolvedContent) as string;
  if (html.startsWith('</section>')) {
    html = html.replace('</section>', '') + '</section>';
  }

  return {
    frontmatter: data as HelpFrontmatter,
    html,
  };
}
