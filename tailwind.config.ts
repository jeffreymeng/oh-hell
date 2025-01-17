import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}', './node_modules/layerchart/**/*.{svelte,js}'],

  theme: {
    extend: {}
  },

  plugins: [typography, forms],

  future: {
    // fixes sticky hover on ios
    hoverOnlyWhenSupported: true,
  },
  safelist: ['grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6', 'grid-cols-7', 'grid-cols-8'],
} satisfies Config;
