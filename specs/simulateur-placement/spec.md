# Feature Specification: Simulateur de Placement

**Branch**: `simulateur-placement` | **Date**: 2025-11-16 | **Version**: 2.0.0

**Input**: Application de simulation d'investissement avec calculs précis de rentabilité nette, supportant desktop (Tauri) et web (PWA)

## Overview

Application complète de simulation d'investissement permettant de calculer précisément la rentabilité nette d'un investissement en prenant en compte tous les frais (spreads, commissions, swap overnight, frais de sortie/réachat, frais de retrait) et impôts selon la réglementation française. L'application est disponible en tant qu'application desktop (Tauri) et Progressive Web App (PWA) installable sur PC et smartphones.

## Context

### Problème Résolu

Les investisseurs ont besoin d'un outil pour simuler précisément la rentabilité nette de leurs investissements en tenant compte de tous les frais et impôts, avec une interface intuitive permettant d'ajuster les paramètres en temps réel et de visualiser les résultats sous différentes périodes.

### Solution

Application légère et réactive offrant :
- Calculs financiers précis avec prise en compte de tous les frais et impôts
- Interface type Excel avec cellules modifiables et mise à jour en temps réel
- Visualisations graphiques interactives avec Chart.js
- Support multi-plateformes (XTB, eToro)
- Mode hors ligne complet (PWA)
- Installation native sur desktop et mobile

## User Scenarios & Testing

### Scenario 1: Simulation Basique
**Acteur**: Investisseur débutant
**Objectif**: Calculer la rentabilité nette d'un investissement simple
**Prérequis**: Aucun
**Étapes**:
1. Ouvrir l'application
2. Saisir le montant investi (ex: 2000€)
3. Sélectionner la plateforme (XTB ou eToro)
4. Configurer le bras de levier (1x à 10x)
5. Définir le rendement attendu annuel (ex: 15%)
6. Consulter les résultats pour toutes les périodes (jour, semaine, mois, année)

**Résultat attendu**: Affichage des gains nets et bruts avec décomposition des frais et impôts pour chaque période

**Tests**:
- E2E: Créer une simulation avec paramètres connus et vérifier les résultats
- Unit: Vérifier les calculs de frais et impôts avec valeurs de référence

### Scenario 2: Simulation avec Réinvestissement
**Acteur**: Investisseur expérimenté
**Objectif**: Simuler un investissement avec réinvestissement périodique des gains
**Prérequis**: Compréhension des concepts de réinvestissement
**Étapes**:
1. Configurer une simulation de base
2. Définir la fréquence de réinvestissement des gains (quotidien, hebdomadaire, mensuel, annuel, ou aucun)
3. Définir le montant à réinvestir périodiquement (capital additionnel)
4. Configurer la fréquence de sortie/réachat pour stabilisation (optionnel)
5. Consulter l'évolution du capital total sur les graphiques

**Résultat attendu**: Calculs corrects des gains avec réinvestissement, affichage de l'évolution du capital sur les graphiques

**Tests**:
- Integration: Vérifier la cohérence des calculs avec réinvestissement sur plusieurs périodes
- Unit: Tester les différentes fréquences de réinvestissement

### Scenario 3: Optimisation de Configuration
**Acteur**: Investisseur cherchant à optimiser
**Objectif**: Trouver la configuration optimale pour maximiser la rentabilité nette
**Prérequis**: Simulation configurée
**Étapes**:
1. Configurer une simulation initiale
2. Consulter le panneau d'optimisation
3. Appliquer les recommandations suggérées
4. Comparer les résultats avant/après optimisation

**Résultat attendu**: Recommandations pertinentes avec amélioration mesurable de la rentabilité

**Tests**:
- Unit: Vérifier l'algorithme d'optimisation avec différents scénarios
- Integration: Valider les recommandations sur des cas réels

### Scenario 4: Installation PWA sur Mobile
**Acteur**: Utilisateur mobile
**Objectif**: Installer l'application sur smartphone pour usage hors ligne
**Prérequis**: Navigateur mobile (Chrome/Edge sur Android, Safari sur iOS)
**Étapes**:
1. Ouvrir l'application dans le navigateur mobile
2. Suivre les instructions d'installation PWA
3. Lancer l'application depuis l'écran d'accueil
4. Utiliser l'application en mode hors ligne

**Résultat attendu**: Application installée et fonctionnelle hors ligne avec toutes les fonctionnalités disponibles

**Tests**:
- E2E: Tester l'installation PWA sur différents appareils
- Integration: Vérifier le fonctionnement hors ligne avec cache

## Functional Requirements

### FR1: Calculs Financiers Précis
**Priorité**: P1 (MVP)
**Description**: Le système doit calculer précisément la rentabilité nette en tenant compte de tous les frais et impôts.

**Détails**:
- Calcul des frais d'entrée (spread, commission)
- Calcul des frais récurrents (swap overnight pour levier)
- Calcul des frais de sortie/réachat lors de la stabilisation
- Calcul des frais de retrait (eToro)
- Calcul des impôts français (prélèvements sociaux 17.2% + impôt sur le revenu selon tranche)
- Calcul de la rentabilité nette par période (jour, semaine, mois, année)

**Critères de succès**:
- Tous les calculs sont documentés avec sources officielles
- Couverture de tests ≥ 90% pour les calculs financiers
- Précision des calculs vérifiée avec valeurs de référence
- Temps de calcul < 50ms pour une simulation complète multi-périodes

**Tests**:
- Unit tests pour chaque service de calcul (PlatformFees, TaxCalculator, SimulationEngine)
- Contract tests pour valider les formules financières
- Integration tests pour vérifier la cohérence entre périodes

### FR2: Interface Utilisateur Type Excel
**Priorité**: P1 (MVP)
**Description**: Interface avec cellules modifiables type Excel permettant la saisie et modification des paramètres.

**Détails**:
- Cellules modifiables pour tous les paramètres d'investissement
- Validation en temps réel des saisies
- Feedback visuel pour valeurs invalides
- Mise à jour automatique des calculs lors des modifications
- Layout responsive adapté mobile/desktop

**Critères de succès**:
- Toutes les cellules sont modifiables et validées
- Mise à jour des calculs < 16ms (60 FPS)
- Interface intuitive sans formation requise
- Support clavier complet (navigation, édition)

**Tests**:
- E2E tests pour la saisie de paramètres
- Unit tests pour les composants de saisie
- Accessibility tests (ARIA, navigation clavier)

### FR3: Affichage Résultats Multi-Périodes
**Priorité**: P1 (MVP)
**Description**: Affichage des résultats de simulation pour toutes les périodes avec cohérence entre elles.

**Détails**:
- Résultats pour période quotidienne, hebdomadaire, mensuelle, annuelle
- Cartes de résultats par période avec métriques clés
- Indicateurs financiers (ROI, Rentabilité Annualisée, Sharpe Ratio, Efficacité Fiscale, Ratio de Frais, Gain Mensuel Moyen)
- Graphiques interactifs (évolution des gains, rentabilité par période)
- Graphique de rendement historique avec données réelles d'actifs

**Critères de succès**:
- Cohérence entre périodes (ex: annuel = 12x mensuel)
- Affichage correct de toutes les métriques
- Graphiques lisibles avec couleurs adaptées au thème
- Performance: rendu des graphiques < 100ms

**Tests**:
- Integration tests pour vérifier la cohérence multi-périodes
- Unit tests pour les composants d'affichage
- Visual regression tests pour les graphiques

### FR4: Gestion Stop Loss
**Priorité**: P2
**Description**: Configuration et affichage du stop loss avec validation et alertes.

**Détails**:
- Configuration du stop loss (minimum 5%)
- Calcul de la perte potentielle
- Affichage des alertes visuelles pour risques élevés
- Validation automatique des valeurs

**Critères de succès**:
- Stop loss configurable entre 5% et 50%
- Calculs corrects de la perte potentielle
- Alertes visuelles pour levier > 5x

**Tests**:
- Unit tests pour la validation et les calculs de stop loss
- E2E tests pour l'affichage des alertes

### FR5: Réinvestissement des Bénéfices
**Priorité**: P2
**Description**: Calcul et affichage du réinvestissement selon la fréquence configurée.

**Détails**:
- Fréquence de réinvestissement des gains (quotidien, hebdomadaire, mensuel, annuel, aucun)
- Montant de capital additionnel à réinvestir périodiquement
- Fréquence de sortie/réachat pour stabilisation (optionnel)
- Calculs corrects avec prise en compte des frais de sortie/réachat
- Affichage de l'évolution du capital total sur les graphiques

**Critères de succès**:
- Toutes les fréquences fonctionnent correctement
- Calculs corrects avec frais de sortie/réachat
- Graphiques affichent l'évolution du capital total

**Tests**:
- Unit tests pour les calculs de réinvestissement
- Integration tests pour les différentes fréquences

### FR6: Optimisation et Recommandations
**Priorité**: P3
**Description**: Algorithme d'optimisation et affichage de recommandations.

**Détails**:
- Analyse de la configuration actuelle
- Suggestions d'optimisation (plateforme, levier, stop loss)
- Comparaison avant/après optimisation
- Documentation de l'algorithme

**Critères de succès**:
- Recommandations pertinentes et documentées
- Amélioration mesurable de la rentabilité
- Algorithme testable et vérifiable

**Tests**:
- Unit tests pour l'algorithme d'optimisation
- Integration tests pour les recommandations

### FR7: Recherche d'Actifs/ETF
**Priorité**: P2
**Description**: Recherche et sélection d'actifs/ETF avec données réelles.

**Détails**:
- Recherche par nom complet ou ticker
- Affichage des informations de l'actif (ticker, ISIN)
- Intégration avec données historiques pour graphiques
- Support des ETF et actions

**Critères de succès**:
- Recherche fonctionnelle avec autocomplétion
- Données correctes affichées
- Graphiques historiques mis à jour automatiquement

**Tests**:
- Integration tests pour la recherche d'actifs
- Unit tests pour le service de recherche

### FR8: Progressive Web App (PWA)
**Priorité**: P2
**Description**: Application installable sur PC et smartphones avec mode hors ligne.

**Détails**:
- Manifest PWA avec métadonnées complètes
- Service Worker pour cache offline
- Installation sur Android, iOS, Windows, macOS
- Mode hors ligne fonctionnel
- Mises à jour automatiques en arrière-plan

**Critères de succès**:
- Installation réussie sur tous les plateformes supportées
- Fonctionnement hors ligne avec cache
- Mises à jour transparentes

**Tests**:
- E2E tests pour l'installation PWA
- Integration tests pour le service worker
- Tests de cache offline

### FR9: Thème Clair/Sombre
**Priorité**: P2
**Description**: Support du mode clair et sombre avec détection automatique.

**Détails**:
- Toggle manuel du thème
- Détection automatique des préférences système
- Persistance du choix utilisateur
- Adaptation des couleurs des graphiques au thème

**Critères de succès**:
- Basculement fluide entre thèmes
- Couleurs adaptées pour lisibilité optimale
- Préférence sauvegardée

**Tests**:
- Unit tests pour le store de thème
- Visual tests pour les deux thèmes

### FR10: Export des Données
**Priorité**: P3
**Description**: Export des résultats de simulation en CSV.

**Détails**:
- Export des données de simulation en format CSV
- Inclusion de toutes les métriques par période
- Format compatible Excel/LibreOffice

**Critères de succès**:
- Export fonctionnel avec toutes les données
- Format CSV valide et lisible

**Tests**:
- Unit tests pour la génération CSV
- Integration tests pour l'export complet

## Non-Functional Requirements

### NFR1: Performance
- **Temps de calcul**: < 50ms pour simulation complète multi-périodes
- **Réactivité UI**: < 16ms pour mises à jour (60 FPS)
- **Temps de démarrage**: < 2 secondes
- **Taille binaire**: < 15MB (Tauri desktop)
- **Mémoire**: < 100MB au démarrage

### NFR2: Fiabilité
- **Couverture de tests**: ≥ 90% pour calculs financiers
- **Précision**: Calculs vérifiables avec sources documentées
- **Robustesse**: Gestion d'erreurs complète avec messages clairs

### NFR3: Utilisabilité
- **Interface intuitive**: Aucune formation requise
- **Accessibilité**: Support ARIA, navigation clavier
- **Responsive**: Adaptation mobile/desktop
- **Lisibilité**: Couleurs adaptées au thème, polices lisibles

### NFR4: Maintenabilité
- **Architecture modulaire**: Séparation claire des responsabilités
- **Documentation**: Code documenté avec JSDoc
- **Tests**: Tests unitaires, intégration, E2E
- **Standards**: Respect des conventions TypeScript/Svelte

### NFR5: Portabilité
- **Desktop**: Windows, Linux, macOS (via Tauri)
- **Web**: PWA installable sur tous navigateurs modernes
- **Mobile**: Android, iOS (via PWA)

## Key Entities

Voir `data-model.md` pour les détails complets des entités.

### Entités Principales

1. **Investment**: Paramètres d'investissement (montant, plateforme, levier, stop loss, etc.)
2. **SimulationResult**: Résultats de simulation par période avec décomposition complète
3. **PlatformConfig**: Configuration des frais par plateforme et type d'actif
4. **UserSettings**: Paramètres utilisateur (revenu annuel, préférences, thème)
5. **FeeBreakdown**: Détail des frais (entrée, sortie, réachat, retrait, swap)
6. **TaxBreakdown**: Détail des impôts (prélèvements sociaux, impôt sur le revenu)

## Technical Architecture

### Stack Technologique

- **Frontend**: SvelteKit 2.0+ avec TypeScript 5.3+
- **Desktop**: Tauri 2.0+ (Rust backend)
- **Build**: Vite 5.0+
- **Graphiques**: Chart.js 4.5+ avec adaptateur date-fns
- **Validation**: Zod 3.22+
- **Tests**: Vitest (unit/integration), Playwright (E2E)
- **Stockage**: IndexedDB pour persistance locale

### Architecture Modulaire

```
src/lib/                    # Moteur de calcul isolé (réutilisable)
├── models/                 # Modèles de données TypeScript
├── services/              # Services de calcul (PlatformFees, TaxCalculator, SimulationEngine)
├── components/            # Composants Svelte réutilisables
├── stores/                # Stores Svelte (state management)
├── storage/               # IndexedDB pour persistance
├── validators/            # Validation Zod
└── utils/                 # Utilitaires (logger, errors)

src/routes/                 # Routes SvelteKit (pages)
├── +page.svelte          # Page principale
├── +layout.svelte        # Layout global avec PWA registration
└── +error.svelte         # Page d'erreur

static/                    # Assets statiques
├── manifest.json         # Manifest PWA
├── service-worker.js     # Service Worker pour cache offline
└── icons/                # Icônes PWA (72x72 à 512x512)
```

### Composants Principaux

1. **SimulationSheet**: Interface principale avec paramètres et résultats
2. **ExcelCell**: Composant cellule modifiable type Excel
3. **FinancialIndicators**: Affichage des indicateurs financiers avec modals explicatifs
4. **PerformanceChart**: Graphique d'évolution des gains et capital total
5. **ReturnChart**: Graphique de rentabilité par période
6. **HistoricalReturnsChart**: Graphique de rendement historique avec données réelles
7. **ResultCard**: Carte de résultats par période
8. **OptimizationPanel**: Panneau de recommandations d'optimisation
9. **PlatformComparison**: Comparaison avec configuration actuelle
10. **CalculationDetails**: Détail des calculs étape par étape
11. **FeesExplanation**: Explication des frais par plateforme
12. **SourcesPanel**: Sources officielles des données
13. **AssetSearch**: Recherche d'actifs/ETF
14. **FrequencyMultiSelector**: Sélecteur de fréquence avec option "aucun"

### Services Principaux

1. **SimulationEngine**: Moteur de calcul principal avec support multi-périodes et réinvestissement
2. **PlatformFees**: Calcul des frais par plateforme (XTB, eToro)
3. **TaxCalculator**: Calcul des impôts français (prélèvements sociaux + IR)
4. **AssetSearchService**: Recherche d'actifs/ETF avec données historiques

## Success Criteria

### Critères Quantitatifs

1. **Précision**: Calculs vérifiés avec valeurs de référence (±0.01%)
2. **Performance**: Calculs < 50ms, UI updates < 16ms
3. **Couverture**: ≥ 90% pour calculs financiers
4. **Taille**: Binaire < 15MB (desktop)
5. **Mémoire**: < 100MB au démarrage

### Critères Qualitatifs

1. **Utilisabilité**: Interface intuitive sans formation
2. **Fiabilité**: Calculs précis avec sources documentées
3. **Maintenabilité**: Code modulaire et documenté
4. **Accessibilité**: Support ARIA et navigation clavier
5. **Portabilité**: Fonctionne sur desktop et mobile

## Assumptions

1. **Réglementation**: Calculs basés sur réglementation française actuelle (peut nécessiter mise à jour)
2. **Frais**: Frais des plateformes basés sur données publiques (peut varier)
3. **Données historiques**: Utilisation de données publiques pour graphiques historiques
4. **Navigateurs**: Support des navigateurs modernes (Chrome, Firefox, Safari, Edge)
5. **Hors ligne**: Mode hors ligne limité aux données déjà mises en cache

## Out of Scope

1. **API REST**: Pas d'API serveur (application offline-first)
2. **Synchronisation cloud**: Pas de synchronisation entre appareils
3. **Multi-utilisateurs**: Application locale uniquement
4. **Trading réel**: Pas d'intégration avec plateformes de trading
5. **Notifications push**: Pas de notifications (PWA basique)

## Evolution Future

### Court Terme
- Ajout de nouvelles plateformes (Interactive Brokers, Degiro, etc.)
- Export PDF des résultats
- Comparaison de plusieurs simulations

### Moyen Terme
- API REST pour utilisation en ligne de commande
- Synchronisation cloud optionnelle
- Application mobile native (React Native/Flutter)

### Long Terme
- Intégration avec plateformes de trading (API)
- Analyse de portefeuille multi-actifs
- Recommandations basées sur IA/ML

## Dependencies

### Externes
- SvelteKit 2.0+
- Tauri 2.0+
- Chart.js 4.5+
- Zod 3.22+
- date-fns 4.1+

### Internes
- Moteur de calcul isolé dans `src/lib/`
- Stores Svelte pour state management
- IndexedDB pour persistance locale

## Risks & Mitigations

1. **Risque**: Changements réglementaires fiscaux
   - **Mitigation**: Documentation des sources, architecture modulaire facilitant les mises à jour

2. **Risque**: Évolution des frais des plateformes
   - **Mitigation**: Configuration centralisée, documentation des sources

3. **Risque**: Performance sur appareils anciens
   - **Mitigation**: Optimisations de code, tests de performance

4. **Risque**: Compatibilité navigateurs
   - **Mitigation**: Tests sur navigateurs cibles, fallbacks si nécessaire

## References

- [SvelteKit Documentation](https://kit.svelte.dev/)
- [Tauri Documentation](https://tauri.app/)
- [Chart.js Documentation](https://www.chartjs.org/)
- [PWA Documentation](https://web.dev/progressive-web-apps/)
- [Réglementation fiscale française](https://www.impots.gouv.fr/)

