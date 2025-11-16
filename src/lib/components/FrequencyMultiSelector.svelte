<script lang="ts">
	import type { ReinvestFrequency, FrequencySelection } from '../types/index.js';

	export let value: FrequencySelection;
	export let onChange: (selection: FrequencySelection) => void;
	export let allowNone: boolean = true; // Permet d'afficher l'option "aucun"/"aucune"
	export let noneLabel: string = 'Aucun'; // Label pour l'option "aucun"
	export let name: string = 'frequency-selector'; // Nom unique pour le groupe de radio buttons

	const frequencies: { value: ReinvestFrequency; label: string }[] = [
		{ value: 'daily', label: 'Quotidien' },
		{ value: 'weekly', label: 'Hebdomadaire' },
		{ value: 'monthly', label: 'Mensuel' },
		{ value: 'yearly', label: 'Annuel' }
	];

	// Convertir la valeur pour déterminer quelle radio button est sélectionnée
	function getSelectedValue(): string {
		// Si "none" est sélectionné, retourner "none" et ignorer toute autre valeur
		if (value === 'none') return 'none';
		// Si value contient "none" dans un tableau, retourner "none"
		if (Array.isArray(value) && value.includes('none' as any)) return 'none';
		if (Array.isArray(value) && value.length > 0) {
			// Prendre la première fréquence du tableau (rétrocompatibilité)
			return value[0];
		}
		if (typeof value === 'string') {
			return value; // Rétrocompatibilité: une seule fréquence
		}
		return ''; // Aucune sélection
	}

	function handleChange(selectedValue: string) {
		if (selectedValue === 'none') {
			// Lorsque "none" est sélectionné, s'assurer que toutes les autres options sont désélectionnées
			onChange('none');
		} else {
			// Si une autre option est sélectionnée, s'assurer que "none" n'est pas dans la sélection
			// Convertir en tableau pour la compatibilité avec le type, mais avec un seul élément
			onChange([selectedValue as ReinvestFrequency]);
		}
	}

	$: selectedValue = getSelectedValue();
</script>

<div class="frequency-selector">
	{#if allowNone}
		<label class="frequency-option none-option">
			<input
				type="radio"
				name={name}
				value="none"
				checked={selectedValue === 'none'}
				on:change={() => handleChange('none')}
			/>
			<span class="frequency-label">{noneLabel}</span>
		</label>
	{/if}

	{#each frequencies as freq}
		<label class="frequency-option">
			<input
				type="radio"
				name={name}
				value={freq.value}
				checked={selectedValue === freq.value}
				on:change={() => handleChange(freq.value)}
			/>
			<span class="frequency-label">{freq.label}</span>
		</label>
	{/each}
</div>

<style>
	.frequency-selector {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.frequency-option {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		cursor: pointer;
		padding: 0.5rem 1rem;
		border: 2px solid var(--border-color, #e0e0e0);
		border-radius: 6px;
		transition: all 0.2s;
		user-select: none;
		background: var(--bg-primary, white);
	}

	.frequency-option.none-option {
		border-color: #dc3545;
	}

	.frequency-option.none-option:has(input:checked) {
		border-color: #dc3545;
		background-color: #fff5f5;
	}

	:global(:root.dark) .frequency-option {
		background: var(--bg-primary);
		border-color: var(--border-color);
	}

	:global(:root.dark) .frequency-option.none-option:has(input:checked) {
		background-color: rgba(220, 53, 69, 0.1);
	}

	.frequency-option:hover:not(:has(input:disabled)) {
		border-color: #d4af37;
		background-color: var(--bg-secondary, #f8f9ff);
	}

	:global(:root.dark) .frequency-option:hover:not(:has(input:disabled)) {
		background-color: var(--bg-secondary);
	}

	.frequency-option input[type="radio"] {
		cursor: pointer;
		accent-color: #d4af37;
	}

	.frequency-option.none-option input[type="radio"] {
		accent-color: #dc3545;
	}

	.frequency-option input[type="radio"]:checked + .frequency-label {
		font-weight: 600;
		color: #d4af37;
	}

	.frequency-option.none-option input[type="radio"]:checked + .frequency-label {
		color: #dc3545;
	}

	.frequency-option:has(input:checked) {
		border-color: #d4af37;
		background-color: var(--bg-secondary, #f8f9ff);
	}

	:global(:root.dark) .frequency-option:has(input:checked) {
		background-color: var(--bg-secondary);
	}

	.frequency-label {
		cursor: pointer;
		font-size: 0.9rem;
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .frequency-label {
		color: var(--text-primary);
	}
</style>

