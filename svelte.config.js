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
			// Pas de base path nécessaire avec domaine personnalisé
			base: ''
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

