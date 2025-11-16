/**
 * Script pour générer les icônes PWA à partir d'une image source
 *
 * Usage: node scripts/generate-icons.js [chemin-vers-image-source.png]
 *
 * Nécessite: sharp (npm install --save-dev sharp)
 */

import sharp from 'sharp';
import { existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
const outputDir = join(process.cwd(), 'static', 'icons');

async function generateIcons(sourceImage) {
	if (!existsSync(sourceImage)) {
		console.error(`❌ Image source introuvable: ${sourceImage}`);
		console.log('\n💡 Créez une image source de 512x512px minimum et exécutez:');
		console.log(`   node scripts/generate-icons.js ${sourceImage}`);
		return;
	}

	// Créer le dossier de sortie s'il n'existe pas
	if (!existsSync(outputDir)) {
		mkdirSync(outputDir, { recursive: true });
	}

	console.log(`📦 Génération des icônes PWA depuis: ${sourceImage}\n`);

	for (const size of sizes) {
		const outputPath = join(outputDir, `icon-${size}x${size}.png`);
		try {
			await sharp(sourceImage)
				.resize(size, size, {
					fit: 'contain',
					background: { r: 26, g: 26, b: 46, alpha: 1 } // Couleur de fond #1a1a2e
				})
				.png()
				.toFile(outputPath);
			console.log(`✅ Généré: icon-${size}x${size}.png`);
		} catch (error) {
			console.error(`❌ Erreur lors de la génération de icon-${size}x${size}.png:`, error.message);
		}
	}

	console.log(`\n✨ Toutes les icônes ont été générées dans: ${outputDir}`);
	console.log('\n📝 Note: Si vous n\'avez pas d\'image source, vous pouvez:');
	console.log('   1. Créer une image 512x512px avec votre logo');
	console.log('   2. Ou utiliser un générateur en ligne comme: https://realfavicongenerator.net/');
}

const sourceImage = process.argv[2] || join(process.cwd(), 'static', 'icon-source.png');
generateIcons(sourceImage).catch(console.error);

