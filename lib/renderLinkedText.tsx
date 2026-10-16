import React from 'react';

/**
 * Parses markdown-style links [Label](URL) into accessible, styled React elements,
 * and foreign-language terms [[lang:term]] into italic elements carrying a `lang`
 * attribute (e.g. [[en:overlay journals]]) so screen readers switch pronunciation.
 */
export function renderLinkedText(text: string): React.ReactNode {
  if (!text) return null;
  const parts: React.ReactNode[] = [];
  const regex = /\[\[([a-z]{2,3}):([^\]]+)\]\]|\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    if (match[1]) {
      parts.push(
        <i key={`lang-${match.index}`} lang={match[1]}>
          {match[2]}
        </i>
      );
      lastIndex = regex.lastIndex;
      continue;
    }
    const label = match[3];
    const url = match[4];
    parts.push(
      <a
        key={`${url}-${match.index}`}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-[var(--episciences-cyan-03)] dark:text-[var(--episciences-cyan-00)] hover:underline font-semibold focus-visible:outline-2 focus-visible:outline-[var(--primary-focus)] rounded-xs"
      >
        {label}
      </a>
    );
    lastIndex = regex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }
  return parts.length > 0 ? parts : text;
}
