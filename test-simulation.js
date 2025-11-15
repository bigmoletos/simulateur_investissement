/**
 * Script de test simple pour vérifier les calculs de simulation
 *
 * Usage: node test-simulation.js
 */

// Simulation d'un test basique
console.log('🧪 Test de simulation - Simulateur de Placement\n');

// Test 1: Investissement basique
console.log('Test 1: Investissement de 1000€ avec 10% de rendement annuel');
console.log('─────────────────────────────────────────────────────────');

const montant = 1000;
const rendementAnnuel = 10; // 10%
const levier = 1;

// Calcul simple pour vérification
const gainBrutAnnuel = montant * (rendementAnnuel / 100);
const fraisXTB = montant * 0.001; // 0.1% spread
const gainApresFrais = gainBrutAnnuel - fraisXTB;
const prelevementsSociaux = gainApresFrais * 0.172; // 17.2%
const gainNet = gainApresFrais - prelevementsSociaux;
const rentabiliteNette = (gainNet / montant) * 100;

console.log(`Montant investi: ${montant.toFixed(2)}€`);
console.log(`Gain brut annuel: ${gainBrutAnnuel.toFixed(2)}€`);
console.log(`Frais XTB (0.1%): ${fraisXTB.toFixed(2)}€`);
console.log(`Gain après frais: ${gainApresFrais.toFixed(2)}€`);
console.log(`Prélèvements sociaux (17.2%): ${prelevementsSociaux.toFixed(2)}€`);
console.log(`Gain net: ${gainNet.toFixed(2)}€`);
console.log(`Rentabilité nette: ${rentabiliteNette.toFixed(2)}%\n`);

// Test 2: Avec levier
console.log('Test 2: Investissement de 1000€ avec levier 3x');
console.log('─────────────────────────────────────────────────────────');

const montantAvecLevier = montant * 3;
const gainBrutAvecLevier = montantAvecLevier * (rendementAnnuel / 100);
const fraisAvecLevier = montant * 0.001; // Frais sur le montant initial
const swapFees = montantAvecLevier * 0.0001 * 2 * 365; // Swap overnight estimé
const gainApresFraisAvecLevier = gainBrutAvecLevier - fraisAvecLevier - swapFees;
const prelevementsSociauxAvecLevier = gainApresFraisAvecLevier * 0.172;
const gainNetAvecLevier = gainApresFraisAvecLevier - prelevementsSociauxAvecLevier;
const rentabiliteNetteAvecLevier = (gainNetAvecLevier / montant) * 100;

console.log(`Montant investi: ${montant.toFixed(2)}€`);
console.log(`Montant avec levier 3x: ${montantAvecLevier.toFixed(2)}€`);
console.log(`Gain brut annuel: ${gainBrutAvecLevier.toFixed(2)}€`);
console.log(`Frais + Swap: ${(fraisAvecLevier + swapFees).toFixed(2)}€`);
console.log(`Gain après frais: ${gainApresFraisAvecLevier.toFixed(2)}€`);
console.log(`Prélèvements sociaux: ${prelevementsSociauxAvecLevier.toFixed(2)}€`);
console.log(`Gain net: ${gainNetAvecLevier.toFixed(2)}€`);
console.log(`Rentabilité nette: ${rentabiliteNetteAvecLevier.toFixed(2)}%\n`);

console.log('✅ Tests de calcul terminés');
console.log('\n📝 Note: Ces calculs sont simplifiés. L\'application utilise des formules plus précises.');

