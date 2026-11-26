import { describe, expect, it } from 'vitest';
import { cleanDoi } from '@/lib/data';
import { normalizeLicense } from '@/lib/licenses';
import { getMscClass } from '@/lib/mscClasses';
import { COLOR_RAMPS, rampStep } from '@/lib/colorRamps';
import { getCountryName } from '@/lib/countryNames';
import { getDomainColor } from '@/lib/domainColors';
import { getHelpPageData } from '@/lib/help';

describe('cleanDoi', () => {
  it('strips doi.org prefix, trims leading/trailing whitespace, and lowercases', () => {
    expect(cleanDoi('https://doi.org/10.46298/DMTCS.1234')).toBe('10.46298/dmtcs.1234');
    expect(cleanDoi('  http://DOI.ORG/10.46298/LMCS-1(1)  ')).toBe('10.46298/lmcs-1(1)');
    expect(cleanDoi('10.46298/epiga.2024')).toBe('10.46298/epiga.2024');
    expect(cleanDoi('')).toBe('');
  });
});

describe('normalizeLicense', () => {
  it('aliases arXiv URL to human-readable label', () => {
    expect(normalizeLicense('https://arxiv.org/licenses/nonexclusive-distrib/1.0')).toBe(
      'arXiv Non-Exclusive Distribution'
    );
  });

  it('maps invalid source licenses to Other', () => {
    expect(normalizeLicense('Elsevier Non-Commercial')).toBe('Other');
    expect(normalizeLicense('Springer TDM')).toBe('Other');
  });

  it('keeps valid licenses unchanged', () => {
    expect(normalizeLicense('CC BY 4.0')).toBe('CC BY 4.0');
  });
});

describe('getMscClass', () => {
  it('resolves known MSC 2020 2-digit prefix', () => {
    expect(getMscClass('68Q10')).toEqual({ id: '68', name: '68 - Computer science' });
    expect(getMscClass('05C15')).toEqual({ id: '05', name: '05 - Combinatorics' });
  });

  it('falls back to raw prefix for unassigned MSC gaps', () => {
    expect(getMscClass('04A05')).toEqual({ id: '04', name: '04' });
  });
});

describe('rampStep', () => {
  it('returns the lightest shade when value or max is zero', () => {
    expect(rampStep(0, 100, COLOR_RAMPS.teal)).toBe(COLOR_RAMPS.teal[0]);
    expect(rampStep(5, 0, COLOR_RAMPS.teal)).toBe(COLOR_RAMPS.teal[0]);
  });

  it('returns the darkest shade at max and stays within ramp bounds', () => {
    const ramp = COLOR_RAMPS.blue;
    expect(rampStep(100, 100, ramp)).toBe(ramp[ramp.length - 1]);
    expect(rampStep(1, 100, ramp)).toBe(ramp[1]);
  });
});

describe('getCountryName', () => {
  it('resolves ISO2 codes case-insensitively and falls back to uppercase code', () => {
    expect(getCountryName('fr')).toBe('France');
    expect(getCountryName('HK')).toBe('Hong Kong');
    expect(getCountryName('zz')).toBe('ZZ');
  });
});

describe('getDomainColor', () => {
  it('returns a deterministic hex color from the domain palette', () => {
    const color = getDomainColor('Physical Sciences');
    expect(color).toMatch(/^#[0-9a-f]{6}$/i);
    expect(getDomainColor('Physical Sciences')).toBe(color);
    expect(getDomainColor('')).toMatch(/^#[0-9a-f]{6}$/i);
  });
});

describe('getHelpPageData', () => {
  it.each(['fr', 'en', 'es'] as const)(
    'loads and renders help markdown for locale "%s" with stats placeholders replaced',
    (locale) => {
      const data = getHelpPageData(locale, { totalPublications: 12345, totalHostedJournals: 52 });
      expect(data.frontmatter.title).toBeTruthy();
      expect(data.frontmatter.tocItems.length).toBeGreaterThan(0);
      expect(data.html).not.toContain('{publicationsCount}');
      expect(data.html).not.toContain('{journalsCount}');
      expect(data.html).toContain('52');
      expect(data.html).toContain('class="help-section-card"');
      expect(data.html).toContain('rel="noopener noreferrer"');
    }
  );
});
