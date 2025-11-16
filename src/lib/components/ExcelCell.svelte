<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	export let label: string;
	export let value: string | number;
	export let type: 'text' | 'number' | 'select' = 'text';
	export let options: string[] = [];
	export let min: number | undefined = undefined;
	export let max: number | undefined = undefined;
	export let step: number | undefined = undefined;
	export let disabled: boolean = false;
	export let error: string | undefined = undefined;

	const dispatch = createEventDispatcher<{ change: string | number }>();

	let inputValue: string | number = value;
	let isEditing = false;

	$: inputValue = value;

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement | HTMLSelectElement;
		if (type === 'number') {
			inputValue = parseFloat(target.value) || 0;
		} else {
			inputValue = target.value;
		}
		// Déclencher l'événement change aussi lors de l'input pour mise à jour en temps réel
		dispatch('change', inputValue);
	}

	function handleBlur() {
		isEditing = false;
		// Déclencher aussi au blur pour s'assurer que la valeur finale est bien prise en compte
		dispatch('change', inputValue);
	}

	function handleFocus() {
		isEditing = true;
	}
</script>

<div class="excel-cell" class:has-error={error}>
	<div class="excel-cell-label">{label}</div>
	<div class="excel-cell-input">
		{#if type === 'select' && options.length > 0}
			<select
				value={String(inputValue)}
				on:input={handleInput}
				on:blur={handleBlur}
				disabled={disabled}
				class:error={error}
			>
				{#each options as option}
					<option value={option}>{option}</option>
				{/each}
			</select>
		{:else if type === 'number'}
			<input
				type="number"
				bind:value={inputValue}
				on:input={handleInput}
				on:blur={handleBlur}
				on:focus={handleFocus}
				{min}
				{max}
				{step}
				{disabled}
				class:error={error}
				class:editing={isEditing}
			/>
		{:else}
			<input
				type="text"
				bind:value={inputValue}
				on:input={handleInput}
				on:blur={handleBlur}
				on:focus={handleFocus}
				{disabled}
				class:error={error}
				class:editing={isEditing}
			/>
		{/if}
		{#if error}
			<span class="error-message">{error}</span>
		{/if}
	</div>
</div>

<style>
	.excel-cell {
		display: grid;
		grid-template-columns: 180px 1fr;
		gap: 0.35rem;
		align-items: center;
		padding: 0.3rem 0;
		border-bottom: 1px solid var(--border-color, #e0e0e0);
	}

	.excel-cell.has-error {
		border-bottom-color: #ef4444;
	}

	.excel-cell-label {
		font-weight: 600;
		color: var(--text-primary, #555);
		font-size: 0.75rem;
	}

	:global(:root.dark) .excel-cell {
		border-bottom-color: var(--border-color);
	}

	:global(:root.dark) .excel-cell-label {
		color: var(--text-primary);
	}

	.excel-cell-input {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	input,
	select {
		padding: 0.35rem;
		border: 1px solid var(--border-color, #ddd);
		border-radius: 4px;
		font-size: 0.85rem;
		width: 100%;
		max-width: 250px;
		transition: border-color 0.2s, box-shadow 0.2s;
		background: var(--bg-primary, white);
		color: var(--text-primary, #333);
	}

	:global(:root.dark) input,
	:global(:root.dark) select {
		background: var(--bg-primary);
		color: var(--text-primary);
		border-color: var(--border-color);
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #d4af37;
		box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.15);
	}

	input.editing {
		border-color: #d4af37;
		background-color: var(--bg-secondary, #f8f9ff);
	}

	:global(:root.dark) input.editing {
		background-color: var(--bg-secondary);
	}

	input.error,
	select.error {
		border-color: #ef4444;
	}

	input:disabled,
	select:disabled {
		background-color: var(--bg-secondary, #f5f5f5);
		cursor: not-allowed;
		color: var(--text-secondary, #999);
	}

	:global(:root.dark) input:disabled,
	:global(:root.dark) select:disabled {
		background-color: var(--bg-secondary);
		color: var(--text-secondary);
	}

	.error-message {
		font-size: 0.65rem;
		color: #ef4444;
		margin-top: 0.15rem;
	}
</style>
