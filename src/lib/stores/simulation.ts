/**
 * Store Svelte pour la gestion des simulations
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

import { writable } from 'svelte/store';
import type { Investment, SimulationResult, Period } from '../types/index.js';

export const currentInvestment = writable<Investment | null>(null);
export const simulationResults = writable<Record<Period, SimulationResult> | null>(null);
export const isCalculating = writable<boolean>(false);
export const calculationError = writable<string | null>(null);

