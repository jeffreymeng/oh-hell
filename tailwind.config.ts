import forms from '@tailwindcss/forms';
import typography from '@tailwindcss/typography';
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {}
  },

  plugins: [typography, forms],

  future: {
    // fixes sticky hover on ios
    hoverOnlyWhenSupported: true,
  },
} satisfies Config;
