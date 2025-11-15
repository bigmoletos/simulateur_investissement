<script lang="ts">
	import type { ReinvestFrequency } from '../types/index.js';

	export let value: ReinvestFrequency;
	export let onChange: (freq: ReinvestFrequency) => void;

	const frequencies: { value: ReinvestFrequency; label: string }[] = [
		{ value: 'daily', label: 'Quotidien' },
		{ value: 'weekly', label: 'Hebdomadaire' },
		{ value: 'monthly', label: 'Mensuel' },
		{ value: 'yearly', label: 'Annuel' }
	];

	function handleChange(freq: ReinvestFrequency) {
		onChange(freq);
	}
</script>

<div class="frequency-selector">
	{#each frequencies as freq}
		<label class="frequency-option">
			<input
				type="radio"
				name="reinvest-frequency"
				value={freq.value}
				checked={value === freq.value}
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
		border: 2px solid #e0e0e0;
		border-radius: 6px;
		transition: all 0.2s;
		user-select: none;
	}

	.frequency-option:hover {
		border-color: #667eea;
		background-color: #f8f9ff;
	}

	.frequency-option input[type="radio"] {
		cursor: pointer;
		accent-color: #667eea;
	}

	.frequency-option input[type="radio"]:checked + .frequency-label {
		font-weight: 600;
		color: #667eea;
	}

	.frequency-option:has(input:checked) {
		border-color: #667eea;
		background-color: #f8f9ff;
	}

	.frequency-label {
		cursor: pointer;
		font-size: 0.9rem;
	}
</style>
