// Shared palette so every view coloring by research domain (treemap, topic
// cards, legends, ...) picks the same color for the same domain name.
const DOMAIN_COLORS = [
  '#4f46e5', // Indigo
  '#0d9488', // Teal
  '#7c3aed', // Violet
  '#0891b2', // Cyan
  '#2563eb', // Blue
  '#db2777', // Pink
  '#ea580c', // Orange
];

export function getDomainColor(domain: string): string {
  let hash = 0;
  for (let i = 0; i < domain.length; i++) {
    hash = domain.charCodeAt(i) + ((hash << 5) - hash);
  }
  return DOMAIN_COLORS[Math.abs(hash) % DOMAIN_COLORS.length];
}
