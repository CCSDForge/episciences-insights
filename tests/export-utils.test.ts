import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  downloadBlob,
  exportCsv,
  exportJson,
  exportPng,
  exportSvg,
  findSvgElement,
  getThemeBackgroundColor,
} from '@/lib/exportUtils';

interface MockAnchor {
  href: string;
  download: string;
  click: ReturnType<typeof vi.fn>;
}

function makeFakeSvg(opts: {
  width: number;
  height: number;
  classes?: string[];
  attrs?: Record<string, string>;
  children?: Array<{ tagName: string; attrs?: Record<string, string>; style?: Record<string, string> }>;
}) {
  const attrs = new Map<string, string>(Object.entries(opts.attrs || {}));
  const classSet = new Set(opts.classes || []);
  const childNodes = (opts.children || []).map((c) => {
    const cAttrs = new Map<string, string>(Object.entries(c.attrs || {}));
    return {
      tagName: c.tagName,
      style: { ...(c.style || {}) } as Record<string, string>,
      getAttribute: (k: string) => cAttrs.get(k) ?? null,
    };
  });

  const makeNode = (): Record<string, unknown> => {
    const clonedAttrs = new Map(attrs);
    const clonedChildren = childNodes.map((c) => ({ ...c, style: { ...c.style } }));
    const inserted: unknown[] = [];
    return {
      classList: { contains: (c: string) => classSet.has(c) },
      getAttribute: (k: string) => clonedAttrs.get(k) ?? null,
      setAttribute: (k: string, v: string) => {
        clonedAttrs.set(k, v);
      },
      getBoundingClientRect: () => ({ width: opts.width, height: opts.height }),
      querySelectorAll: () => clonedChildren,
      cloneNode: () => makeNode(),
      firstChild: clonedChildren[0] ?? null,
      insertBefore: (el: unknown) => {
        inserted.unshift(el);
      },
      appendChild: (el: unknown) => {
        inserted.push(el);
      },
      _attrs: clonedAttrs,
      _inserted: inserted,
    };
  };

  return makeNode();
}

describe('lib/exportUtils.ts', () => {
  let createdBlobs: Blob[];
  let anchors: MockAnchor[];
  let isDark: boolean;

  beforeEach(() => {
    vi.useFakeTimers();
    createdBlobs = [];
    anchors = [];
    isDark = false;

    class FakeSVGSVGElement {}
    vi.stubGlobal('SVGSVGElement', FakeSVGSVGElement);

    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => {
      createdBlobs.push(blob as Blob);
      return `blob:mock-${createdBlobs.length}`;
    });
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const body = {
      appendChild: vi.fn(),
      removeChild: vi.fn(),
    };

    const fakeDoc = {
      documentElement: {
        classList: { contains: (c: string) => c === 'dark' && isDark },
      },
      body,
      createElement: vi.fn((tag: string) => {
        if (tag === 'a') {
          const anchor: MockAnchor = { href: '', download: '', click: vi.fn() };
          anchors.push(anchor);
          return anchor;
        }
        if (tag === 'canvas') {
          const ctx = {
            fillStyle: '',
            fillRect: vi.fn(),
            scale: vi.fn(),
            drawImage: vi.fn(),
          };
          return {
            width: 0,
            height: 0,
            getContext: vi.fn(() => ctx),
            toBlob: vi.fn((cb: (b: Blob | null) => void) => cb(new Blob(['png'], { type: 'image/png' }))),
          };
        }
        return {};
      }),
      createElementNS: vi.fn(() => {
        const a = new Map<string, string>();
        return {
          setAttribute: (k: string, v: string) => a.set(k, v),
          getAttribute: (k: string) => a.get(k) ?? null,
        };
      }),
    };

    vi.stubGlobal('document', fakeDoc);
    vi.stubGlobal('window', {
      getComputedStyle: vi.fn(() => ({
        fontFamily: 'Inter',
        fontSize: '12px',
        fontWeight: '400',
        fill: '#111111',
        stroke: '#222222',
        letterSpacing: '0px',
      })),
    });
    vi.stubGlobal(
      'XMLSerializer',
      class {
        serializeToString() {
          return '<svg><rect/></svg>';
        }
      }
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('resolves theme background color in SSR, light, and dark modes', () => {
    expect(getThemeBackgroundColor()).toBe('#ffffff');
    isDark = true;
    expect(getThemeBackgroundColor()).toBe('#18181b');

    vi.stubGlobal('document', undefined);
    expect(getThemeBackgroundColor()).toBe('#ffffff');
  });

  it('finds the largest chart SVG while ignoring Lucide icons and tiny SVGs', () => {
    expect(findSvgElement(null)).toBeNull();

    const directSvg = new SVGSVGElement();
    expect(findSvgElement(directSvg)).toBe(directSvg);

    const lucideIcon = makeFakeSvg({ width: 100, height: 100, classes: ['lucide'] });
    const smallChart = makeFakeSvg({ width: 200, height: 150 });
    const largeChart = makeFakeSvg({ width: 600, height: 400 });
    const container = {
      querySelectorAll: () => [lucideIcon, smallChart, largeChart],
    } as unknown as HTMLElement;
    expect(findSvgElement(container)).toBe(largeChart);

    // Fallback when no SVG exceeds 60x60: ignores <= 48x48, returns > 48x48
    const tinyIcon = makeFakeSvg({ width: 24, height: 24 });
    expect(findSvgElement({ querySelectorAll: () => [tinyIcon] } as unknown as HTMLElement)).toBeNull();

    const mediumSvg = makeFakeSvg({ width: 55, height: 55 });
    expect(findSvgElement({ querySelectorAll: () => [tinyIcon, mediumSvg] } as unknown as HTMLElement)).toBe(mediumSvg);
    expect(findSvgElement({ querySelectorAll: () => [] } as unknown as HTMLElement)).toBeNull();
  });

  it('downloads blobs and revokes object URLs after timeout', () => {
    const blob = new Blob(['hello'], { type: 'text/plain' });
    downloadBlob(blob, 'test.txt');

    expect(anchors).toHaveLength(1);
    expect(anchors[0].download).toBe('test.txt');
    expect(anchors[0].click).toHaveBeenCalledTimes(1);

    vi.advanceTimersByTime(150);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:mock-1');
  });

  it('exports SVG with injected xmlns and background', async () => {
    expect(exportSvg(null)).toBe(false);

    const svg = makeFakeSvg({
      width: 400,
      height: 300,
      children: [{ tagName: 'text' }, { tagName: 'path' }],
    });
    const container = { querySelectorAll: () => [svg] } as unknown as HTMLElement;

    expect(exportSvg(container, 'chart')).toBe(true);
    expect(anchors[0].download).toBe('chart.svg');
    const text = await createdBlobs[0].text();
    expect(text).toContain('xmlns="http://www.w3.org/2000/svg"');
  });

  it('exports PNG via Image + Canvas and handles image load error', async () => {
    expect(await exportPng(null)).toBe(false);

    class SuccessImage {
      onload: (() => void) | null = null;
      onerror: ((err: unknown) => void) | null = null;
      set src(_val: string) {
        queueMicrotask(() => this.onload?.());
      }
    }
    vi.stubGlobal('Image', SuccessImage);

    const svg = makeFakeSvg({ width: 300, height: 200 });
    const container = { querySelectorAll: () => [svg] } as unknown as HTMLElement;

    expect(await exportPng(container, 'chart')).toBe(true);
    expect(anchors[0].download).toBe('chart.png');

    class FailingImage {
      onload: (() => void) | null = null;
      onerror: ((err: unknown) => void) | null = null;
      set src(_val: string) {
        queueMicrotask(() => this.onerror?.(new Error('decode failed')));
      }
    }
    vi.stubGlobal('Image', FailingImage);
    vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(await exportPng(container, 'chart.png')).toBe(false);
  });

  it('exports CSV with UTF-8 BOM, escaping, inferred keys, and custom formatters', async () => {
    expect(exportCsv([])).toBe(false);

    const rows = [
      { name: 'Alice, "PhD"', count: 12, note: null },
      { name: 'Bob; Jr', count: 5, note: 'line1\nline2' },
    ];
    expect(exportCsv(rows, 'metrics')).toBe(true);
    expect(anchors[0].download).toBe('metrics.csv');

    const csvBytes = new Uint8Array(await createdBlobs[0].arrayBuffer());
    expect(csvBytes.slice(0, 3)).toEqual(new Uint8Array([0xef, 0xbb, 0xbf]));
    const csvText = await createdBlobs[0].text();
    expect(csvText).toContain('name,count,note');
    expect(csvText).toContain('"Alice, ""PhD""",12,');
    expect(csvText).toContain('"Bob; Jr",5,"line1\nline2"');

    // Custom columns + formatter
    expect(
      exportCsv(rows, 'custom.csv', [
        { key: 'name', header: 'Author' },
        { key: 'count', header: 'Total', formatter: (v) => `${v} papers` },
      ])
    ).toBe(true);
    expect(anchors[1].download).toBe('custom.csv');
    expect(await createdBlobs[1].text()).toContain('Author,Total\r\n"Alice, ""PhD""",12 papers');
  });

  it('exports formatted JSON and rejects undefined input', async () => {
    expect(exportJson(undefined)).toBe(false);
    expect(exportJson({ ok: true, n: 3 }, 'report')).toBe(true);
    expect(anchors[0].download).toBe('report.json');
    expect(JSON.parse(await createdBlobs[0].text())).toEqual({ ok: true, n: 3 });
  });
});
