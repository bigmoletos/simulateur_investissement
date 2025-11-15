# Tasks: Simulateur de Placement

**Input**: Design documents from `/specs/simulateur-placement/`
**Prerequisites**: plan.md ✓, research.md ✓, data-model.md ✓, contracts/ ✓

**Tests**: Tests obligatoires selon Constitution (Principe VI - Test-First). Couverture minimale 90% pour les calculs financiers.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `src/`, `tests/` at repository root
- Paths based on plan.md structure: `src/lib/`, `src/routes/`, `src-tauri/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create project structure per implementation plan (src/, src-tauri/, tests/)
- [X] T002 Initialize SvelteKit project with TypeScript and Vite
- [X] T003 Initialize Tauri project with Rust backend
- [ ] T004 [P] Configure ESLint and Prettier for TypeScript
- [ ] T005 [P] Configure Rust formatter (rustfmt) and clippy
- [ ] T006 [P] Setup Vitest configuration in vitest.config.ts
- [ ] T007 [P] Setup Playwright for E2E tests
- [ ] T008 Configure Tauri build settings in tauri.conf.json
- [ ] T009 [P] Setup path aliases (@/lib, @/components) in vite.config.ts

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T010 Create base TypeScript types in src/lib/types/index.ts
- [ ] T011 [P] Create Zod schemas for validation in src/lib/validators/schemas.ts
- [ ] T012 [P] Setup IndexedDB storage service in src/lib/storage/db.ts
- [ ] T013 Configure error handling infrastructure in src/lib/utils/errors.ts
- [ ] T014 [P] Setup logging infrastructure (console + structured logging)
- [ ] T015 Create base Svelte stores structure in src/lib/stores/
- [ ] T016 Setup Tauri commands structure in src-tauri/src/commands.rs
- [ ] T017 Create base layout component in src/routes/+layout.svelte

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Moteur de Calcul Financier (Priority: P1) 🎯 MVP

**Goal**: Implémenter le moteur de calcul financier isolé et testable avec tous les calculs de base (frais, impôts, rentabilité)

**Independent Test**: Créer une simulation avec des paramètres connus et vérifier que les résultats correspondent aux calculs manuels attendus.

### Tests for User Story 1 ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T018 [P] [US1] Unit test for Investment model validation in tests/unit/lib/models/Investment.test.ts
- [ ] T019 [P] [US1] Unit test for PlatformFees service in tests/unit/lib/services/PlatformFees.test.ts
- [ ] T020 [P] [US1] Unit test for TaxCalculator service in tests/unit/lib/services/TaxCalculator.test.ts
- [ ] T021 [P] [US1] Unit test for SimulationEngine service in tests/unit/lib/services/SimulationEngine.test.ts
- [ ] T022 [P] [US1] Contract test for PlatformFees in tests/contract/PlatformFees.contract.test.ts
- [ ] T023 [P] [US1] Contract test for TaxCalculator in tests/contract/TaxCalculator.contract.test.ts

### Implementation for User Story 1

- [ ] T024 [P] [US1] Create Investment model in src/lib/models/Investment.ts
- [ ] T025 [P] [US1] Create PlatformConfig model in src/lib/models/PlatformConfig.ts
- [ ] T026 [P] [US1] Create SimulationResult model in src/lib/models/SimulationResult.ts
- [ ] T027 [P] [US1] Create UserSettings model in src/lib/models/UserSettings.ts
- [ ] T028 [US1] Implement PlatformFees service in src/lib/services/PlatformFees.ts (depends on T025)
- [ ] T029 [US1] Implement TaxCalculator service in src/lib/services/TaxCalculator.ts
- [ ] T030 [US1] Implement SimulationEngine service in src/lib/services/SimulationEngine.ts (depends on T024, T028, T029)
- [ ] T031 [US1] Add validation schemas with Zod in src/lib/validators/schemas.ts (depends on T024-T027)
- [ ] T032 [US1] Add error handling and logging for all services
- [ ] T033 [US1] Document all financial formulas with sources in code comments

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently. All tests should pass with 90%+ coverage.

---

## Phase 4: User Story 2 - Interface Utilisateur Type Excel (Priority: P1) 🎯 MVP

**Goal**: Créer l'interface utilisateur principale avec des cellules modifiables type Excel et des contrôles interactifs pour ajuster les paramètres

**Independent Test**: Ouvrir l'application, modifier les paramètres via l'interface et vérifier que les valeurs sont correctement saisies et affichées.

### Tests for User Story 2 ⚠️

- [ ] T034 [P] [US2] E2E test for parameter input in tests/e2e/parameter-input.spec.ts
- [ ] T035 [P] [US2] Unit test for ExcelCell component in tests/unit/components/ExcelCell.test.ts
- [ ] T036 [P] [US2] Unit test for SimulationSheet component in tests/unit/components/SimulationSheet.test.ts

### Implementation for User Story 2

- [ ] T037 [P] [US2] Create ExcelCell component in src/lib/components/ExcelCell.svelte
- [ ] T038 [US2] Create SimulationSheet component in src/lib/components/SimulationSheet.svelte (depends on T037)
- [ ] T039 [US2] Create simulation store in src/lib/stores/simulation.ts (depends on T030)
- [ ] T040 [US2] Create settings store in src/lib/stores/settings.ts (depends on T027)
- [ ] T041 [US2] Implement main page in src/routes/+page.svelte (depends on T038, T039, T040)
- [ ] T042 [US2] Add real-time validation for user inputs
- [ ] T043 [US2] Add visual feedback for invalid inputs
- [ ] T044 [US2] Style interface to resemble Excel with grid layout

**Checkpoint**: At this point, User Story 2 should be fully functional. Users can input parameters and see them reflected in the UI.

---

## Phase 5: User Story 3 - Affichage Résultats Multi-Périodes (Priority: P1) 🎯 MVP

**Goal**: Afficher les résultats de simulation pour toutes les périodes (jour, semaine, mois, année) avec calculs cohérents

**Independent Test**: Créer une simulation et vérifier que les résultats sont affichés correctement pour toutes les périodes avec cohérence entre elles.

### Tests for User Story 3 ⚠️

- [ ] T045 [P] [US3] Integration test for multi-period calculation in tests/integration/multi-period.test.ts
- [ ] T046 [P] [US3] Unit test for ResultCard component in tests/unit/components/ResultCard.test.ts
- [ ] T047 [P] [US3] E2E test for results display in tests/e2e/results-display.spec.ts

### Implementation for User Story 3

- [ ] T048 [US3] Integrate SimulationEngine with UI in SimulationSheet component (depends on T030, T038)
- [ ] T049 [P] [US3] Create ResultCard component in src/lib/components/ResultCard.svelte
- [ ] T050 [US3] Implement multi-period calculation trigger in simulation store (depends on T039, T030)
- [ ] T051 [US3] Display results for all periods (daily, weekly, monthly, yearly) in +page.svelte
- [ ] T052 [US3] Add formatting for currency and percentages (€, %)
- [ ] T053 [US3] Add visual indicators for positive/negative gains
- [ ] T054 [US3] Verify consistency between periods (e.g., yearly = 12x monthly)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work together. Users can input parameters, see calculations, and view results for all periods.

---

## Phase 6: User Story 4 - Gestion Stop Loss et Alertes (Priority: P2)

**Goal**: Implémenter la gestion du stop loss avec validation (minimum 5%) et affichage des risques

**Independent Test**: Configurer un stop loss et vérifier que les alertes s'affichent correctement et que les calculs de perte potentielle sont corrects.

### Tests for User Story 4 ⚠️

- [ ] T055 [P] [US4] Unit test for stop loss validation in tests/unit/lib/services/SimulationEngine.test.ts
- [ ] T056 [P] [US4] Unit test for stop loss calculation in tests/unit/lib/services/SimulationEngine.test.ts
- [ ] T057 [P] [US4] E2E test for stop loss alerts in tests/e2e/stop-loss.spec.ts

### Implementation for User Story 4

- [ ] T058 [US4] Add stop loss validation (minimum 5%) in Investment model (depends on T024)
- [ ] T059 [US4] Calculate stop loss amount and potential loss in SimulationEngine (depends on T030)
- [ ] T060 [P] [US4] Create RiskAlert component in src/lib/components/RiskAlert.svelte
- [ ] T061 [US4] Display stop loss information in ResultCard component (depends on T049, T059)
- [ ] T062 [US4] Add visual warnings for high leverage (>5x) in SimulationSheet
- [ ] T063 [US4] Add risk indicators and color coding for different risk levels

**Checkpoint**: Stop loss is fully functional with validation and visual feedback.

---

## Phase 7: User Story 5 - Réinvestissement des Bénéfices (Priority: P2)

**Goal**: Implémenter le calcul et l'affichage du réinvestissement selon la fréquence configurée

**Independent Test**: Configurer différentes fréquences de réinvestissement et vérifier que les calculs sont corrects pour chaque période.

### Tests for User Story 5 ⚠️

- [ ] T064 [P] [US5] Unit test for reinvestment calculation in tests/unit/lib/services/SimulationEngine.test.ts
- [ ] T065 [P] [US5] Integration test for reinvestment frequency in tests/integration/reinvestment.test.ts

### Implementation for User Story 5

- [ ] T066 [US5] Implement reinvestment logic in SimulationEngine (depends on T030)
- [ ] T067 [US5] Calculate new capital after reinvestment in SimulationEngine
- [ ] T068 [US5] Display reinvestment amount in ResultCard component (depends on T049)
- [ ] T069 [US5] Add reinvestment badge/indicator when applicable
- [ ] T070 [US5] Add option to toggle reinvestment visualization

**Checkpoint**: Réinvestissement fonctionnel avec calculs corrects selon la fréquence.

---

## Phase 8: User Story 6 - Optimisation et Recommandations (Priority: P3)

**Goal**: Implémenter l'algorithme d'optimisation et afficher des recommandations pour l'utilisateur

**Independent Test**: Lancer l'optimisation et vérifier que les recommandations sont cohérentes et documentées.

### Tests for User Story 6 ⚠️

- [ ] T071 [P] [US6] Unit test for optimization algorithm in tests/unit/lib/services/SimulationEngine.test.ts
- [ ] T072 [P] [US6] Integration test for recommendations in tests/integration/optimization.test.ts

### Implementation for User Story 6

- [ ] T073 [US6] Implement optimize method in SimulationEngine (depends on T030)
- [ ] T074 [P] [US6] Create OptimizationPanel component in src/lib/components/OptimizationPanel.svelte
- [ ] T075 [US6] Display recommendations in OptimizationPanel (depends on T073, T074)
- [ ] T076 [US6] Add documentation for optimization algorithm in code comments
- [ ] T077 [US6] Add option to apply recommendations to current simulation

**Checkpoint**: Optimisation fonctionnelle avec recommandations affichées.

---

## Phase 9: User Story 7 - Persistance des Simulations (Priority: P3)

**Goal**: Sauvegarder et restaurer les simulations dans IndexedDB

**Independent Test**: Créer une simulation, fermer l'application, rouvrir et vérifier que la simulation est restaurée.

### Tests for User Story 7 ⚠️

- [ ] T078 [P] [US7] Unit test for IndexedDB storage in tests/unit/lib/storage/db.test.ts
- [ ] T079 [P] [US7] Integration test for simulation persistence in tests/integration/persistence.test.ts
- [ ] T080 [P] [US7] E2E test for save/load simulation in tests/e2e/persistence.spec.ts

### Implementation for User Story 7

- [ ] T081 [US7] Implement IndexedDB schema and migrations in src/lib/storage/db.ts (depends on T012)
- [ ] T082 [US7] Add save simulation method in storage service
- [ ] T083 [US7] Add load simulation method in storage service
- [ ] T084 [US7] Add list simulations method in storage service
- [ ] T085 [US7] Create SimulationHistory model in src/lib/models/SimulationHistory.ts
- [ ] T086 [US7] Add save/load UI in SimulationSheet component (depends on T038)
- [ ] T087 [US7] Add simulation history list view in new route src/routes/history/+page.svelte
- [ ] T088 [US7] Add delete simulation functionality

**Checkpoint**: Persistance fonctionnelle avec sauvegarde et restauration des simulations.

---

## Phase 10: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T089 [P] Update documentation in README.md with setup and usage instructions
- [ ] T090 [P] Add JSDoc comments to all public APIs
- [ ] T091 Code cleanup and refactoring across all components
- [ ] T092 [P] Performance optimization: verify < 50ms for calculations, < 16ms for UI updates
- [ ] T093 [P] Add additional unit tests to reach 90%+ coverage for financial calculations
- [ ] T094 Security review: validate all user inputs, sanitize data
- [ ] T095 Run quickstart.md validation scenarios
- [ ] T096 [P] Add error boundaries and graceful error handling in UI
- [ ] T097 [P] Add loading states and progress indicators
- [ ] T098 Accessibility: add ARIA labels, keyboard navigation
- [ ] T099 [P] Add dark mode support (if not already implemented)
- [ ] T100 Verify Tauri build produces binary < 15MB

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - **BLOCKS all user stories**
- **User Stories (Phase 3-9)**: All depend on Foundational phase completion
  - User stories can proceed in priority order (P1 → P2 → P3)
  - US1, US2, US3 (P1) can be worked on in parallel after Foundational
  - US4, US5 (P2) can start after US1-3 are complete
  - US6, US7 (P3) can start after US4-5 are complete
- **Polish (Phase 10)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 for integration
- **User Story 3 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 and US2
- **User Story 4 (P2)**: Depends on US1 and US3
- **User Story 5 (P2)**: Depends on US1 and US3
- **User Story 6 (P3)**: Depends on US1
- **User Story 7 (P3)**: Depends on US1, US2, US3

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before UI components
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - US1 models (T024-T027) can run in parallel
  - US1 services (T028-T030) can run in parallel after models
  - US2 components (T037-T038) can run in parallel
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members (with coordination)

---

## Parallel Example: User Story 1

```bash
# Launch all models for User Story 1 together:
Task: "Create Investment model in src/lib/models/Investment.ts"
Task: "Create PlatformConfig model in src/lib/models/PlatformConfig.ts"
Task: "Create SimulationResult model in src/lib/models/SimulationResult.ts"
Task: "Create UserSettings model in src/lib/models/UserSettings.ts"

# Launch all tests for User Story 1 together:
Task: "Unit test for Investment model validation"
Task: "Unit test for PlatformFees service"
Task: "Unit test for TaxCalculator service"
Task: "Unit test for SimulationEngine service"
```

---

## Implementation Strategy

### MVP First (User Stories 1-3 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (**CRITICAL - blocks all stories**)
3. Complete Phase 3: User Story 1 (Moteur de calcul)
4. Complete Phase 4: User Story 2 (Interface Excel)
5. Complete Phase 5: User Story 3 (Résultats multi-périodes)
6. **STOP and VALIDATE**: Test all three stories together
7. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (Core engine)
3. Add User Story 2 → Test independently → Deploy/Demo (UI)
4. Add User Story 3 → Test independently → Deploy/Demo (Results - **MVP!**)
5. Add User Story 4 → Test independently → Deploy/Demo (Stop Loss)
6. Add User Story 5 → Test independently → Deploy/Demo (Réinvestissement)
7. Add User Story 6 → Test independently → Deploy/Demo (Optimisation)
8. Add User Story 7 → Test independently → Deploy/Demo (Persistance)
9. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Moteur de calcul)
   - Developer B: User Story 2 (Interface Excel) - can start after US1 models
   - Developer C: User Story 3 (Résultats) - can start after US1 and US2
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- **CRITICAL**: Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Constitution compliance**: All financial calculations must have 90%+ test coverage
- **Performance**: Verify calculations < 50ms, UI updates < 16ms
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

