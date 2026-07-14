import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import tailwindcss from '@tailwindcss/vite';
import icon from 'astro-icon';

export default defineConfig({
  output: 'static',
  adapter: vercel(),
  integrations: [icon()],
  vite: {
    plugins: [tailwindcss()],
  },
});
