/**
 * Infrastructure de gestion des erreurs
 *
 * Conformité Constitution: Gestion des erreurs avec messages clairs
 *
 * @author Simulateur de Placement
 * @version 1.0.0
 * @date 2025-11-15
 */

/**
 * Classe d'erreur personnalisée pour les erreurs de validation
 */
export class ValidationError extends Error {
	constructor(message: string, public readonly errors: string[] = []) {
		super(message);
		this.name = 'ValidationError';
		Object.setPrototypeOf(this, ValidationError.prototype);
	}
}

/**
 * Classe d'erreur personnalisée pour les erreurs de calcul financier
 */
export class CalculationError extends Error {
	constructor(message: string, public readonly cause?: Error) {
		super(message);
		this.name = 'CalculationError';
		Object.setPrototypeOf(this, CalculationError.prototype);
	}
}

/**
 * Classe d'erreur personnalisée pour les erreurs de stockage
 */
export class StorageError extends Error {
	constructor(message: string, public readonly cause?: Error) {
		super(message);
		this.name = 'StorageError';
		Object.setPrototypeOf(this, StorageError.prototype);
	}
}

/**
 * Gère les erreurs et retourne un message utilisateur approprié
 */
export function handleError(error: unknown): string {
	if (error instanceof ValidationError) {
		return `Erreur de validation: ${error.message}${error.errors.length > 0 ? '\n' + error.errors.join('\n') : ''}`;
	}

	if (error instanceof CalculationError) {
		return `Erreur de calcul: ${error.message}`;
	}

	if (error instanceof StorageError) {
		return `Erreur de stockage: ${error.message}`;
	}

	if (error instanceof Error) {
		return `Erreur: ${error.message}`;
	}

	return 'Une erreur inconnue est survenue';
}

/**
 * Wrapper pour les fonctions async avec gestion d'erreur
 */
export async function safeAsync<T>(
	fn: () => Promise<T>,
	errorMessage: string
): Promise<{ data: T | null; error: string | null }> {
	try {
		const data = await fn();
		return { data, error: null };
	} catch (error) {
		return { data: null, error: handleError(error) };
	}
}

