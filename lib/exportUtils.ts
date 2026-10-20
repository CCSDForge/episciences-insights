/**
 * Utility functions for exporting visualizations (PNG, SVG)
 * and data (CSV, JSON) on the client side.
 */

export interface ExportImageOptions {
  filename?: string;
  backgroundColor?: string;
  scale?: number;
}

export interface CsvColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  header: string;
  formatter?: (value: unknown, row: T) => string | number;
}

/**
 * Resolves current theme background color (light or dark).
 */
export function getThemeBackgroundColor(): string {
  if (typeof document === 'undefined') return '#ffffff';
  const isDark = document.documentElement.classList.contains('dark');
  return isDark ? '#18181b' : '#ffffff'; // zinc-900 or white
}

/**
 * Finds the primary SVG element within a container, or returns the element itself if it is an SVG.
 */
export function findSvgElement(container: HTMLElement | SVGSVGElement | null): SVGSVGElement | null {
  if (!container) return null;
  if (container instanceof SVGSVGElement) return container;
  return container.querySelector('svg');
}

/**
 * Clones an SVG element, inlines computed text and shape styles,
 * sets explicit dimensions/viewBox, and injects a solid background rect.
 */
function prepareSvgForExport(
  svg: SVGSVGElement,
  backgroundColor: string = getThemeBackgroundColor()
): { svgString: string; width: number; height: number } {
  const rect = svg.getBoundingClientRect();
  const width = Math.round(rect.width) || 800;
  const height = Math.round(rect.height) || 600;

  const clone = svg.cloneNode(true) as SVGSVGElement;

  // Set standard namespaces
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  clone.setAttribute('width', String(width));
  clone.setAttribute('height', String(height));
  if (!clone.getAttribute('viewBox')) {
    clone.setAttribute('viewBox', `0 0 ${width} ${height}`);
  }

  // Inline computed styles for fonts and fills on critical elements
  // so the SVG renders identical styling outside the dashboard CSS context
  const originalElements = svg.querySelectorAll<SVGElement>('*');
  const clonedElements = clone.querySelectorAll<SVGElement>('*');

  for (let i = 0; i < originalElements.length && i < clonedElements.length; i++) {
    const orig = originalElements[i];
    const target = clonedElements[i];

    try {
      const computed = window.getComputedStyle(orig);
      const tag = orig.tagName.toLowerCase();

      if (tag === 'text' || tag === 'tspan') {
        target.style.fontFamily = computed.fontFamily;
        target.style.fontSize = computed.fontSize;
        target.style.fontWeight = computed.fontWeight;
        target.style.fill = computed.fill;
        if (computed.letterSpacing) target.style.letterSpacing = computed.letterSpacing;
      } else if (tag === 'path' || tag === 'rect' || tag === 'circle' || tag === 'line') {
        if (!target.getAttribute('fill') && computed.fill && computed.fill !== 'none') {
          target.style.fill = computed.fill;
        }
        if (!target.getAttribute('stroke') && computed.stroke && computed.stroke !== 'none') {
          target.style.stroke = computed.stroke;
        }
      }
    } catch {
      // Continue if computed style lookup fails on an element
    }
  }

  // Prepend solid background rectangle
  const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  bgRect.setAttribute('x', '0');
  bgRect.setAttribute('y', '0');
  bgRect.setAttribute('width', '100%');
  bgRect.setAttribute('height', '100%');
  bgRect.setAttribute('fill', backgroundColor);

  if (clone.firstChild) {
    clone.insertBefore(bgRect, clone.firstChild);
  } else {
    clone.appendChild(bgRect);
  }

  const serializer = new XMLSerializer();
  let svgString = serializer.serializeToString(clone);

  // Fix XML self-closing tag issues if any
  if (!svgString.match(/^<svg[^>]+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/)) {
    svgString = svgString.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }

  return { svgString, width, height };
}

/**
 * Triggers a browser download of a given Blob.
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 150);
}

/**
 * Export SVG chart as a standalone .svg vector file.
 */
export function exportSvg(
  container: HTMLElement | SVGSVGElement | null,
  filename: string = 'episciences-visualization',
  options: ExportImageOptions = {}
): boolean {
  const svg = findSvgElement(container);
  if (!svg) return false;

  const bg = options.backgroundColor || getThemeBackgroundColor();
  const { svgString } = prepareSvgForExport(svg, bg);

  const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
  const finalFilename = filename.endsWith('.svg') ? filename : `${filename}.svg`;
  downloadBlob(blob, finalFilename);
  return true;
}

/**
 * Export SVG chart as a high-resolution PNG image (retina 2x by default).
 */
export async function exportPng(
  container: HTMLElement | SVGSVGElement | null,
  filename: string = 'episciences-visualization',
  options: ExportImageOptions = {}
): Promise<boolean> {
  const svg = findSvgElement(container);
  if (!svg) return false;

  const scale = options.scale ?? 2; // 2x retina by default
  const bg = options.backgroundColor || getThemeBackgroundColor();
  const { svgString, width, height } = prepareSvgForExport(svg, bg);

  return new Promise((resolve) => {
    const img = new Image();
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(false);
          return;
        }

        // Fill background
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Scale and draw
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            const finalFilename = filename.endsWith('.png') ? filename : `${filename}.png`;
            downloadBlob(blob, finalFilename);
            resolve(true);
          } else {
            resolve(false);
          }
        }, 'image/png');
      } catch (err) {
        console.error('Failed to export PNG:', err);
        URL.revokeObjectURL(url);
        resolve(false);
      }
    };

    img.onerror = (err) => {
      console.error('Failed to load SVG into Image for PNG conversion:', err);
      URL.revokeObjectURL(url);
      resolve(false);
    };

    img.src = url;
  });
}

/**
 * Export data array to CSV format.
 * Includes UTF-8 BOM (\uFEFF) for immediate compatibility with Microsoft Excel & LibreOffice.
 */
export function exportCsv<T extends Record<string, unknown>>(
  data: T[],
  filename: string = 'episciences-data',
  columns?: CsvColumn<T>[]
): boolean {
  if (!data || data.length === 0) return false;

  // Determine columns
  const cols: { key: string; header: string; formatter?: (v: unknown, row: T) => string | number }[] = [];

  if (columns && columns.length > 0) {
    columns.forEach((col) => {
      cols.push({
        key: String(col.key),
        header: col.header,
        formatter: col.formatter,
      });
    });
  } else {
    // Inferred keys from first item
    const first = data[0];
    Object.keys(first).forEach((key) => {
      cols.push({
        key,
        header: key,
      });
    });
  }

  const escapeCsv = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes('"') || str.includes(',') || str.includes(';') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const headerRow = cols.map((c) => escapeCsv(c.header)).join(',');
  const rows: string[] = [headerRow];

  for (const row of data) {
    const rowVals = cols.map((col) => {
      const rawVal = (row as Record<string, unknown>)[col.key];
      const formatted = col.formatter ? col.formatter(rawVal, row) : rawVal;
      return escapeCsv(formatted);
    });
    rows.push(rowVals.join(','));
  }

  // UTF-8 BOM + CSV string
  const csvContent = '\uFEFF' + rows.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadBlob(blob, finalFilename);
  return true;
}

/**
 * Export data to formatted JSON format.
 */
export function exportJson(
  data: unknown,
  filename: string = 'episciences-data'
): boolean {
  if (data === undefined) return false;

  const jsonContent = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
  const finalFilename = filename.endsWith('.json') ? filename : `${filename}.json`;
  downloadBlob(blob, finalFilename);
  return true;
}
