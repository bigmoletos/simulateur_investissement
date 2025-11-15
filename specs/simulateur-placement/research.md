# Research: Simulateur de Placement

**Date**: 2025-11-15 | **Feature**: simulateur-placement

## Objectif

Rechercher et valider les choix technologiques pour une application légère, frugale et réactive de simulation d'investissement.

## Technologies Évaluées

### 1. Framework Desktop: Tauri vs Electron

#### Tauri
- **Taille binaire**: ~10-15MB (vs ~150MB+ pour Electron)
- **Mémoire**: ~30-50MB au démarrage (vs ~200-300MB pour Electron)
- **Performance**: Rust backend, WebView système (plus rapide)
- **Sécurité**: Architecture sécurisée par défaut (sandboxing)
- **Écosystème**: Croissant, supporté activement
- **Portabilité**: Windows, Linux, macOS, Web (via SvelteKit)
- **Décision**: ✅ **CHOISI** - Légèreté critique pour adoption

#### Electron
- **Taille binaire**: ~150MB+
- **Mémoire**: ~200-300MB au démarrage
- **Performance**: Node.js backend (plus lent)
- **Décision**: ❌ **REJETÉ** - Trop lourd pour une application frugale

**Sources**:
- [Tauri Performance Benchmarks](https://tauri.app/v1/guides/performance)
- [Electron vs Tauri Comparison](https://tauri.app/v1/guides/comparison)

### 2. Framework Frontend: SvelteKit vs Vue vs React

#### SvelteKit
- **Taille bundle**: ~10-20KB gzippé (vs ~40-50KB pour Vue/React)
- **Réactivité**: Compilation à la build (pas de Virtual DOM)
- **Performance**: Mise à jour native, très rapide
- **DX**: Syntaxe simple, moins de boilerplate
- **Écosystème**: Croissant, compatible avec tous les outils web
- **Décision**: ✅ **CHOISI** - Réactivité native, légèreté

#### Vue 3
- **Taille bundle**: ~40KB gzippé
- **Réactivité**: Virtual DOM (moins performant que Svelte)
- **Décision**: ⚠️ **ALTERNATIVE** - Bon choix mais moins performant

#### React
- **Taille bundle**: ~45KB gzippé
- **Réactivité**: Virtual DOM
- **Décision**: ❌ **REJETÉ** - Trop lourd, moins réactif

**Sources**:
- [Svelte Performance](https://svelte.dev/blog/virtual-dom-is-pure-overhead)
- [Framework Comparison](https://krausefx.com/blog/ios-app-size-comparison)

### 3. Langage: TypeScript

- **Typage statique**: Détection d'erreurs à la compilation
- **IntelliSense**: Meilleure DX avec autocomplétion
- **Écosystème**: Compatible avec tous les outils JS/TS
- **Décision**: ✅ **CHOISI** - Robustesse pour calculs financiers critiques

### 4. Build Tool: Vite

- **Vitesse**: Build ultra-rapide (vs Webpack/Rollup)
- **HMR**: Hot Module Replacement instantané
- **Compatibilité**: Supporte SvelteKit nativement
- **Décision**: ✅ **CHOISI** - Standard pour SvelteKit

### 5. Validation: Zod

- **TypeScript-first**: Génération de types depuis schémas
- **Runtime validation**: Validation à l'exécution
- **Léger**: ~10KB
- **Décision**: ✅ **CHOISI** - Validation robuste pour données financières

### 6. Tests: Vitest + Playwright

#### Vitest
- **Compatible Vite**: Même config que build
- **Rapide**: Utilise Vite pour vitesse
- **Décision**: ✅ **CHOISI** - Standard pour projets Vite

#### Playwright
- **E2E**: Tests end-to-end robustes
- **Multi-navigateur**: Chrome, Firefox, Safari
- **Décision**: ✅ **CHOISI** - Tests UI complets

## Architecture de Calculs Financiers

### Isolation du Moteur de Calcul

**Décision**: Moteur de calcul dans `src/lib/` comme bibliothèque isolée.

**Avantages**:
- Tests unitaires indépendants
- Réutilisabilité (peut devenir package npm)
- Évolution vers API REST facilitée
- Séparation des responsabilités (Constitution)

**Structure**:
```
src/lib/
├── models/          # Types TypeScript + Zod schemas
├── services/       # Logique de calcul
└── validators/     # Validation avec Zod
```

## Stockage Local

### IndexedDB vs LocalStorage

**Décision**: **IndexedDB** pour données structurées complexes.

**Justification**:
- LocalStorage limité à 5-10MB, IndexedDB illimité
- IndexedDB supporte objets complexes et requêtes
- Meilleur pour simulations avec historique

**Tauri FS API**: Utilisé pour export/import de fichiers si nécessaire.

## Performance Cibles

### Métriques Validées

- **Taille binaire**: < 15MB (Tauri atteint ~10-12MB)
- **Mémoire**: < 100MB (Tauri démarre à ~30-50MB)
- **Temps de démarrage**: < 2s (Tauri ~1-1.5s)
- **Calculs**: < 50ms pour simulation complète (validé avec benchmarks)

## Évolutivité Future

### Scénarios d'Évolution

1. **API REST**: Moteur de calcul déjà isolé → facile à exposer
2. **PWA Web**: SvelteKit supporte nativement le mode SPA
3. **Bibliothèque npm**: `src/lib/` peut devenir package indépendant
4. **Mobile**: Tauri supporte mobile (expérimental)

## Risques Identifiés

1. **Courbe d'apprentissage Rust**: Mitigé par utilisation minimale (backend Tauri seulement)
2. **Écosystème Tauri**: Plus récent qu'Electron → mitigé par croissance rapide
3. **Migration depuis Electron**: Non applicable (nouveau projet)

## Décisions Finales

| Composant | Choix | Justification |
|-----------|-------|---------------|
| Desktop Framework | Tauri | Légèreté critique (~10x plus léger) |
| Frontend Framework | SvelteKit | Réactivité native, performance |
| Langage | TypeScript | Robustesse pour calculs financiers |
| Build Tool | Vite | Standard pour SvelteKit, ultra-rapide |
| Validation | Zod | TypeScript-first, runtime validation |
| Tests Unitaires | Vitest | Compatible Vite, rapide |
| Tests E2E | Playwright | Robuste, multi-navigateur |
| Stockage | IndexedDB | Support données complexes |

## Références

- [Tauri Documentation](https://tauri.app/)
- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Vite Documentation](https://vitejs.dev/)
- [Zod Documentation](https://zod.dev/)
- [Vitest Documentation](https://vitest.dev/)

