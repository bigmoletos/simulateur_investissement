# Simulateur de Placement

Application de simulation d'investissement permettant de calculer précisément la rentabilité nette d'un investissement en prenant en compte tous les frais et impôts.

## Fonctionnalités

- ✅ Simulation d'investissement sur actions, fonds et ETF
- ✅ Support des plateformes XTB et eToro
- ✅ Bras de levier de 1 à 10
- ✅ Calcul précis des frais (spreads, commissions, swap overnight)
- ✅ Calcul des impôts selon la réglementation française
- ✅ Rentabilité nette par période (jour, semaine, mois, année)
- ✅ Stop loss configurable (minimum 5%)
- ✅ Réinvestissement des bénéfices avec différentes fréquences
- ✅ Recommandations d'optimisation

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en mode développement
npm run electron:dev

# Build pour production
npm run electron:build
```

## Structure du projet

```
simulateur_placement/
├── src/
│   ├── core/              # Moteur de calcul financier (logique métier)
│   │   ├── models/        # Modèles de données
│   │   └── services/      # Services de calcul
│   ├── components/         # Composants Vue.js
│   ├── App.vue            # Composant principal
│   └── main.js            # Point d'entrée
├── electron/              # Configuration Electron
├── .specify/              # Spécifications et constitution
└── package.json
```

## Constitution

Le projet suit une constitution stricte définie dans `.specify/memory/constitution.md` qui garantit :
- Précision financière avec sources documentées
- Tests obligatoires avant implémentation
- Séparation stricte logique métier / interface
- Calculs vérifiables et testables

## Technologies

- **Frontend**: Vue.js 3 + Vite
- **Desktop**: Electron
- **State Management**: Pinia
- **Tests**: Vitest

## Développement

### Prérequis

- Node.js 18+
- npm ou yarn

### Commandes

- `npm run dev` - Lance Vite en mode développement
- `npm run electron:dev` - Lance l'application Electron en développement
- `npm run build` - Build pour production
- `npm test` - Lance les tests
- `npm run test:coverage` - Tests avec couverture

## Notes importantes

⚠️ **Avertissement**: Cette application est un outil de simulation. Les calculs sont basés sur des estimations et peuvent ne pas refléter exactement les frais réels des plateformes. Consultez toujours les conditions réelles avant d'investir.

Les formules de calcul des frais et impôts doivent être vérifiées et mises à jour régulièrement selon les évolutions réglementaires.

## Licence

MIT

