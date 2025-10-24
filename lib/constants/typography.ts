// Typography system for Tailwind config
export const typography = {
  fontFamily: {
    sans: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'Segoe UI', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'],
  },
  fontSize: {
    display: ['3.5rem', { lineHeight: '1.1', fontWeight: '700' }] as [string, { lineHeight: string; fontWeight: string }],
    h1: ['2.5rem', { lineHeight: '1.2', fontWeight: '700' }] as [string, { lineHeight: string; fontWeight: string }],
    h2: ['2rem', { lineHeight: '1.3', fontWeight: '600' }] as [string, { lineHeight: string; fontWeight: string }],
    h3: ['1.5rem', { lineHeight: '1.4', fontWeight: '600' }] as [string, { lineHeight: string; fontWeight: string }],
    title: ['1.25rem', { lineHeight: '1.5', fontWeight: '600' }] as [string, { lineHeight: string; fontWeight: string }],
    body: ['1rem', { lineHeight: '1.5', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    callout: ['1rem', { lineHeight: '1.5', fontWeight: '500' }] as [string, { lineHeight: string; fontWeight: string }],
    subheadline: ['0.9375rem', { lineHeight: '1.5', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    footnote: ['0.8125rem', { lineHeight: '1.5', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
    caption: ['0.75rem', { lineHeight: '1.5', fontWeight: '400' }] as [string, { lineHeight: string; fontWeight: string }],
  },
  fontWeight: {
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
  },
  lineHeight: {
    tight: '1.2',
    normal: '1.5',
    relaxed: '1.75',
  },
  letterSpacing: {
    tight: '-0.025em',
    normal: '0',
    wide: '0.025em',
  },
};
