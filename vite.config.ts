import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	// Pas de base path nécessaire avec domaine personnalisé
	base: '/',
	resolve: {
		alias: {
			'@': path.resolve(__dirname, './src/lib')
		}
	},
	test: {
		include: ['src/**/*.{test,spec}.{js,ts}'],
		globals: true,
		environment: 'jsdom',
		coverage: {
			provider: 'v8',
			reporter: ['text', 'json', 'html'],
			exclude: [
				'node_modules/',
				'src-tauri/',
				'**/*.config.{js,ts}',
				'**/*.d.ts'
			]
		}
	},
	clearScreen: false,
	server: {
		port: 5173,
		strictPort: false,
		watch: {
			ignored: ['**/src-tauri/**']
		}
	}
});

