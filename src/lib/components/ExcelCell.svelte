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
	}

	function handleBlur() {
		isEditing = false;
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
		grid-template-columns: 200px 1fr;
		gap: 0.75rem;
		align-items: center;
		padding: 0.5rem 0;
		border-bottom: 1px solid #e0e0e0;
	}

	.excel-cell.has-error {
		border-bottom-color: #ef4444;
	}

	.excel-cell-label {
		font-weight: 600;
		color: #555;
		font-size: 0.9rem;
	}

	.excel-cell-input {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	input,
	select {
		padding: 0.5rem;
		border: 1px solid #ddd;
		border-radius: 4px;
		font-size: 1rem;
		width: 100%;
		max-width: 300px;
		transition: border-color 0.2s, box-shadow 0.2s;
	}

	input:focus,
	select:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	input.editing {
		border-color: #667eea;
		background-color: #f8f9ff;
	}

	input.error,
	select.error {
		border-color: #ef4444;
	}

	input:disabled,
	select:disabled {
		background-color: #f5f5f5;
		cursor: not-allowed;
	}

	.error-message {
		font-size: 0.75rem;
		color: #ef4444;
		margin-top: 0.25rem;
	}
</style>
