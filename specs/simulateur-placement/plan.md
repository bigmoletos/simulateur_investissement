# Implementation Plan: Simulateur de Placement

**Branch**: `simulateur-placement` | **Date**: 2025-11-15 | **Spec**: Application de simulation d'investissement

**Input**: Application de bureau Win11 ou Chrome permettant de simuler un investissement avec calculs précis de rentabilité nette

## Summary

Création d'une application de simulation d'investissement légère, frugale et réactive permettant de calculer précisément la rentabilité nette d'un investissement en prenant en compte tous les frais et impôts. L'application doit offrir une interface type Excel avec des cellules modifiables et des contrôles interactifs pour ajuster les paramètres en temps réel.

**Approche technique**: Utilisation de **Tauri** (au lieu d'Electron) pour une application desktop ultra-légère (~10MB vs ~100MB+), combiné avec **SvelteKit** pour une interface réactive et performante. Le moteur de calcul financier sera isolé et testable indépendamment, permettant une évolution future vers une API ou une bibliothèque réutilisable.

## Technical Context

**Language/Version**:
- **Frontend**: TypeScript 5.3+ avec SvelteKit 2.0+
- **Backend (Tauri)**: Rust 1.75+
- **Build**: Vite 5.0+

**Primary Dependencies**:
- **Tauri** 2.0+ : Framework pour applications desktop légères (Rust backend + WebView)
- **SvelteKit** : Framework réactif ultra-léger avec compilation optimisée
- **TypeScript** : Typage statique pour la robustesse
- **Vite** : Build tool ultra-rapide
- **Vitest** : Framework de tests (compatible Vite)
- **Zod** : Validation de schémas TypeScript
- **Chart.js** ou **Recharts** : Graphiques interactifs légers

**Storage**:
- **LocalStorage** / **IndexedDB** pour la persistance des simulations et paramètres utilisateur
- **Tauri FS API** pour sauvegarde de fichiers locaux si nécessaire
- Pas de base de données externe requise (application offline-first)

**Testing**:
- **Vitest** : Tests unitaires et d'intégration
- **Playwright** : Tests E2E pour l'interface utilisateur
- **Coverage**: Minimum 90% pour les calculs financiers (conformité Constitution)

**Target Platform**:
- **Windows 11** (prioritaire)
- **Linux** (compatibilité via Tauri)
- **macOS** (compatibilité via Tauri)
- **Web/PWA** (option future via SvelteKit)

**Project Type**: Single project (application desktop avec possibilité d'évolution vers web)

**Performance Goals**:
- **Taille binaire**: < 15MB (vs ~150MB pour Electron)
- **Mémoire**: < 100MB au démarrage
- **Temps de démarrage**: < 2 secondes
- **Réactivité UI**: < 16ms pour les mises à jour (60 FPS)
- **Calculs financiers**: < 50ms pour une simulation complète multi-périodes

**Constraints**:
- **Légèreté**: Application frugale en ressources (critique pour adoption)
- **Offline-first**: Fonctionne sans connexion internet
- **Réactivité**: Mise à jour en temps réel des calculs lors des modifications
- **Précision**: Calculs financiers vérifiables et testables (Constitution)
- **Évolutivité**: Architecture modulaire permettant l'ajout de nouvelles plateformes/actifs

**Scale/Scope**:
- **Utilisateurs**: Application locale (pas de serveur)
- **Simulations**: Stockage local illimité
- **Complexité**: ~10-15 écrans/composants principaux
- **Évolution future**: Possibilité d'ajouter API REST, export Excel/PDF, synchronisation cloud

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### ✅ Principe I: Précision Financière
- **Status**: CONFORME
- **Justification**: Moteur de calcul isolé avec tests unitaires obligatoires. Toutes les formules documentées avec sources.

### ✅ Principe II: Interface Utilisateur Intuitive
- **Status**: CONFORME
- **Justification**: SvelteKit permet une réactivité native avec mise à jour automatique. Interface type Excel avec cellules modifiables.

### ✅ Principe III: Simulation Multi-Périodes
- **Status**: CONFORME
- **Justification**: Architecture modulaire permettant le calcul simultané de toutes les périodes.

### ✅ Principe IV: Gestion des Risques
- **Status**: CONFORME
- **Justification**: Stop loss intégré avec validation et alertes visuelles.

### ✅ Principe V: Optimisation
- **Status**: CONFORME
- **Justification**: Algorithme d'optimisation isolé et documenté, extensible pour améliorations futures.

### ✅ Principe VI: Test-First
- **Status**: CONFORME
- **Justification**: Vitest configuré avec couverture minimale de 90% pour les calculs financiers. Cycle Red-Green-Refactor obligatoire.

### ⚠️ Stack Technologique (Constitution)
- **Status**: ADAPTATION JUSTIFIÉE
- **Constitution originale**: Electron/PWA ou WinUI 3
- **Choix actuel**: Tauri + SvelteKit
- **Justification**:
  - **Légèreté**: Tauri produit des binaires ~10x plus légers qu'Electron
  - **Performance**: Rust backend pour calculs critiques, SvelteKit pour réactivité native
  - **Évolutivité**: Architecture modulaire permettant évolution vers API/web
  - **Robustesse**: TypeScript + Rust pour sécurité de types et performance
- **Alternative rejetée**: Electron (trop lourd), WinUI 3 (moins portable, courbe d'apprentissage)

## Project Structure

### Documentation (this feature)

```text
specs/simulateur-placement/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── lib/                      # Moteur de calcul financier (isolé et réutilisable)
│   ├── models/              # Modèles de données TypeScript
│   │   ├── Investment.ts
│   │   ├── Platform.ts
│   │   └── SimulationResult.ts
│   ├── services/            # Services de calcul
│   │   ├── PlatformFees.ts
│   │   ├── TaxCalculator.ts
│   │   └── SimulationEngine.ts
│   └── validators/          # Validation avec Zod
│       └── schemas.ts
│
├── routes/                  # Routes SvelteKit (pages)
│   ├── +page.svelte        # Page principale de simulation
│   └── +layout.svelte      # Layout global
│
├── lib/components/          # Composants Svelte réutilisables
│   ├── SimulationSheet.svelte
│   ├── ResultCard.svelte
│   ├── OptimizationPanel.svelte
│   └── ExcelCell.svelte    # Composant cellule type Excel
│
├── lib/stores/              # Stores Svelte (state management)
│   ├── simulation.ts
│   └── settings.ts
│
└── app.html                 # Template HTML principal

src-tauri/                   # Backend Rust (Tauri)
├── src/
│   ├── main.rs             # Point d'entrée Tauri
│   ├── commands.rs         # Commandes Rust exposées au frontend
│   └── lib.rs              # Bibliothèque de calculs critiques (optionnel)
├── tauri.conf.json         # Configuration Tauri
└── Cargo.toml              # Dépendances Rust

tests/
├── unit/                    # Tests unitaires (Vitest)
│   ├── lib/services/
│   │   ├── SimulationEngine.test.ts
│   │   ├── TaxCalculator.test.ts
│   │   └── PlatformFees.test.ts
│   └── lib/models/
│       └── Investment.test.ts
│
├── integration/            # Tests d'intégration
│   └── simulation-flow.test.ts
│
└── e2e/                    # Tests E2E (Playwright)
    └── simulation.spec.ts

static/                     # Assets statiques
├── icons/
└── fonts/
```

**Structure Decision**: Architecture monorepo avec séparation claire entre:
1. **`src/lib/`** : Moteur de calcul financier isolé (peut devenir package npm indépendant)
2. **`src/routes/` + `src/lib/components/`** : Interface utilisateur SvelteKit
3. **`src-tauri/`** : Backend Rust pour Tauri (calculs critiques optionnels)
4. **`tests/`** : Tests organisés par type (unit/integration/e2e)

Cette structure permet:
- Évolution vers bibliothèque npm réutilisable (`src/lib/`)
- Évolution vers API REST (moteur de calcul déjà isolé)
- Évolution vers PWA web (SvelteKit supporte nativement)
- Performance optimale (Rust pour calculs critiques si nécessaire)

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Tauri + SvelteKit au lieu d'Electron + Vue | Légèreté critique (<15MB vs ~150MB), performance native avec Rust, réactivité supérieure de SvelteKit | Electron trop lourd pour adoption, Vue moins réactif que SvelteKit |
| TypeScript + Rust (dual language) | TypeScript pour robustesse frontend, Rust pour performance backend Tauri | Single language insuffisant: JS/TS seul = pas de performance native, Rust seul = pas d'écosystème web moderne |
| Architecture modulaire (lib séparé) | Évolutivité vers API/bibliothèque réutilisable, tests isolés | Monolithe insuffisant pour évolution future et réutilisabilité |

