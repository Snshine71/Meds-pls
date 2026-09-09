import type { Config } from 'tailwindcss';

/**
 * Design tokens per SAND TABLE build spec §8.
 * Palette = field-map aesthetic: deep navy command surfaces, blueprint blues,
 * go-green status, signal-red accents. Dark mode lifts the same hues.
 *
 * Colors are exposed as CSS variables (defined in src/index.css) so dark mode
 * can swap them via a `data-theme` attribute / media query without rebuilding
 * the palette in two places.
 */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        ink: 'rgb(var(--ink) / <alpha-value>)',
        surface: 'rgb(var(--surface) / <alpha-value>)',
        panel: 'rgb(var(--panel) / <alpha-value>)',
        blueprint: {
          DEFAULT: 'rgb(var(--blueprint) / <alpha-value>)',
          2: 'rgb(var(--blueprint-2) / <alpha-value>)',
        },
        go: {
          DEFAULT: 'rgb(var(--go) / <alpha-value>)',
          soft: 'rgb(var(--go-soft) / <alpha-value>)',
        },
        signal: {
          DEFAULT: 'rgb(var(--signal) / <alpha-value>)',
          soft: 'rgb(var(--signal-soft) / <alpha-value>)',
        },
        brass: 'rgb(var(--brass) / <alpha-value>)',
      },
      fontFamily: {
        display: ['"Saira Semi Condensed"', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        DEFAULT: '8px',
        lg: '8px',
      },
      maxWidth: {
        manuscript: '68ch',
      },
      lineHeight: {
        manuscript: '1.7',
      },
    },
  },
  plugins: [],
} satisfies Config;
