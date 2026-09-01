// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
	site: 'https://lenardgiller.com',
	devToolbar: { enabled: false },
	integrations: [
		sitemap({
			filter: (page) => !page.includes('/admin'),
		}),
	],
});
