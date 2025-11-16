import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			fallback: 'index.html', // Nécessaire pour la PWA (SPA)
			precompress: false,
			strict: true
		}),
		paths: {
			base: process.env.NODE_ENV === 'production' ? '/simulateur_investissement' : ''
		},
		alias: {
			'@': './src/lib'
		},
		serviceWorker: {
			register: false // On gère manuellement le service worker
		}
	}
};

export default config;

