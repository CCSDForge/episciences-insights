// A handful of source values need normalization before they're fit to
// display as a license: OpenAIRE sometimes represents the same arXiv
// license as either a plain label or its full URL, and "Elsevier
// Non-Commercial" is a known source-side extraction defect (not a real
// license Elsevier issues) rather than a legitimate distinct value.
const LICENSE_ALIASES: Record<string, string> = {
  'https://arxiv.org/licenses/nonexclusive-distrib/1.0': 'arXiv Non-Exclusive Distribution',
};
const INVALID_LICENSES = new Set(['Elsevier Non-Commercial', 'Springer TDM']);

export function normalizeLicense(raw: string): string {
  const aliased = LICENSE_ALIASES[raw] || raw;
  return INVALID_LICENSES.has(aliased) ? 'Other' : aliased;
}
