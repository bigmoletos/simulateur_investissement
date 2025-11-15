<script lang="ts">
	import { onMount } from 'svelte';
	import { AssetSearchService, type AssetSearchResult } from '../services/AssetSearchService.js';

	export let value: string = '';
	export let onSelect: (asset: AssetSearchResult) => void = () => {};

	let searchInput: HTMLInputElement;
	let tickerInput: HTMLInputElement;
	let tickerValue: string = '';
	let suggestions: AssetSearchResult[] = [];
	let showSuggestions = false;
	let selectedIndex = -1;
	let isLoading = false;
	let searchTimeout: ReturnType<typeof setTimeout> | null = null;
	let selectedAsset: AssetSearchResult | null = null;
	let isUpdatingFromTicker = false;

	// Initialiser le ticker si la valeur par défaut correspond à un actif connu
	onMount(async () => {
		if (value && value.trim().length > 0) {
			// Chercher l'actif par nom pour obtenir le ticker
			const results = await AssetSearchService.search(value.trim(), 1);
			if (results.length > 0 && results[0].name === value.trim()) {
				selectedAsset = results[0];
				tickerValue = results[0].ticker || '';
				// Mettre à jour le champ ticker après un court délai pour s'assurer qu'il est monté
				setTimeout(() => {
					if (tickerInput) {
						tickerInput.value = tickerValue;
					}
				}, 100);
			}
		}
	});

	async function handleNameInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newValue = target.value;
		value = newValue;
		selectedIndex = -1;
		selectedAsset = null; // Réinitialiser l'actif sélectionné

		// Si on met à jour depuis le ticker, ne pas déclencher la recherche
		if (isUpdatingFromTicker) {
			isUpdatingFromTicker = false;
			return;
		}

		// Annuler la recherche précédente
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Délai pour éviter trop de requêtes
		searchTimeout = setTimeout(async () => {
			if (value.trim().length >= 2) {
				isLoading = true;
				suggestions = await AssetSearchService.search(value.trim(), 10);
				showSuggestions = suggestions.length > 0;
				isLoading = false;
			} else {
				suggestions = [];
				showSuggestions = false;
			}
		}, 300);
	}

	async function handleTickerInput(event: Event) {
		const target = event.target as HTMLInputElement;
		const newTickerValue = target.value.toUpperCase();
		tickerValue = newTickerValue;
		selectedIndex = -1;
		selectedAsset = null; // Réinitialiser l'actif sélectionné

		// Annuler la recherche précédente
		if (searchTimeout) {
			clearTimeout(searchTimeout);
		}

		// Délai pour éviter trop de requêtes
		searchTimeout = setTimeout(async () => {
			if (tickerValue.trim().length >= 1) {
				isLoading = true;
				// Rechercher par ticker
				const asset = await AssetSearchService.findByTicker(tickerValue.trim());
				if (asset) {
					// Mettre à jour le champ nom avec le nom complet
					isUpdatingFromTicker = true;
					value = asset.name;
					selectedAsset = asset;
					onSelect(asset);
					suggestions = [];
					showSuggestions = false;
				} else {
					// Recherche générale avec le ticker
					suggestions = await AssetSearchService.search(tickerValue.trim(), 10);
					showSuggestions = suggestions.length > 0;
				}
				isLoading = false;
			} else {
				suggestions = [];
				showSuggestions = false;
			}
		}, 300);
	}

	// Réactif pour mettre à jour les inputs si la valeur change de l'extérieur
	$: if (searchInput && searchInput.value !== value && !isUpdatingFromTicker) {
		searchInput.value = value;
	}
	$: if (tickerInput && tickerInput.value !== tickerValue) {
		tickerInput.value = tickerValue;
	}

	// Réactivité pour mettre à jour le ticker quand selectedAsset change
	$: if (selectedAsset && selectedAsset.ticker) {
		tickerValue = selectedAsset.ticker;
	}

	function selectAsset(asset: AssetSearchResult) {
		value = asset.name;
		tickerValue = asset.ticker || '';
		selectedAsset = asset;
		showSuggestions = false;
		suggestions = [];
		// Forcer la mise à jour du champ ticker
		if (tickerInput) {
			tickerInput.value = tickerValue;
		}
		onSelect(asset);
	}

	function handleKeyDown(event: KeyboardEvent) {
		if (!showSuggestions || suggestions.length === 0) return;

		if (event.key === 'ArrowDown') {
			event.preventDefault();
			selectedIndex = Math.min(selectedIndex + 1, suggestions.length - 1);
		} else if (event.key === 'ArrowUp') {
			event.preventDefault();
			selectedIndex = Math.max(selectedIndex - 1, -1);
		} else if (event.key === 'Enter' && selectedIndex >= 0) {
			event.preventDefault();
			selectAsset(suggestions[selectedIndex]);
		} else if (event.key === 'Escape') {
			showSuggestions = false;
		}
	}

	function handleBlur() {
		// Délai pour permettre le clic sur une suggestion
		setTimeout(() => {
			showSuggestions = false;
		}, 200);
	}
</script>

<div class="asset-search-container">
	<label class="search-label">Rechercher un actif/ETF</label>
	<div class="search-fields">
		<div class="search-field-group">
			<label class="field-label">Nom complet</label>
			<div class="search-wrapper">
				<input
					bind:this={searchInput}
					type="text"
					bind:value={value}
					placeholder="Ex: iShares USD Treasury Bond..."
					on:input={handleNameInput}
					on:keydown={handleKeyDown}
					on:blur={handleBlur}
					class="search-input"
				/>
				{#if isLoading}
					<span class="loading-indicator">🔍</span>
				{/if}
			</div>
		</div>
		<div class="search-field-group">
			<label class="field-label">Ticker</label>
			<div class="search-wrapper">
				<input
					bind:this={tickerInput}
					type="text"
					bind:value={tickerValue}
					placeholder="Ex: IBC1"
					on:input={handleTickerInput}
					on:keydown={handleKeyDown}
					on:blur={handleBlur}
					class="search-input ticker-input"
				/>
			</div>
		</div>
	</div>

	{#if selectedAsset}
		<div class="selected-asset-info">
			<div class="info-label">Ticker sélectionné:</div>
			<div class="ticker-display">
				<span class="ticker-symbol">{selectedAsset.ticker}</span>
				{#if selectedAsset.isin}
					<span class="isin-display">ISIN: {selectedAsset.isin}</span>
				{/if}
			</div>
		</div>
	{/if}

	{#if showSuggestions && suggestions.length > 0}
		<div class="suggestions-dropdown">
			{#each suggestions as suggestion, index}
				<button
					type="button"
					class="suggestion-item"
					class:selected={index === selectedIndex}
					on:click={() => selectAsset(suggestion)}
					on:mousedown={(e) => e.preventDefault()}
				>
					<div class="suggestion-header">
						<span class="suggestion-name">{suggestion.name}</span>
						<span class="suggestion-type">{suggestion.type.toUpperCase()}</span>
					</div>
					<div class="suggestion-details">
						{#if suggestion.ticker}
							<span class="suggestion-ticker">Ticker: {suggestion.ticker}</span>
						{/if}
						{#if suggestion.isin}
							<span class="suggestion-isin">ISIN: {suggestion.isin}</span>
						{/if}
					</div>
				</button>
			{/each}
		</div>
	{/if}

	{#if (value || tickerValue) && !showSuggestions && (value.length >= 2 || tickerValue.length >= 1) && !isLoading && !selectedAsset}
		<div class="no-results">
			<small>Aucun résultat trouvé. Vérifiez le nom ou le ticker saisi.</small>
		</div>
	{/if}
</div>

<style>
	.asset-search-container {
		position: relative;
		width: 100%;
	}

	.search-label {
		display: block;
		margin-bottom: 0.75rem;
		font-weight: 600;
		color: #374151;
		font-size: 0.9rem;
	}

	.search-fields {
		display: grid;
		grid-template-columns: 3fr 1fr;
		gap: 1rem;
	}

	.search-field-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.field-label {
		font-size: 0.85rem;
		font-weight: 600;
		color: #6b7280;
	}

	.search-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}

	.search-input {
		width: 100%;
		min-width: 600px;
		padding: 0.75rem 1rem;
		border: 2px solid #e5e7eb;
		border-radius: 6px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}

	.ticker-input {
		font-family: 'Courier New', monospace;
		font-weight: 600;
		text-transform: uppercase;
		text-align: center;
	}

	.search-input:focus {
		outline: none;
		border-color: #667eea;
		box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
	}

	.loading-indicator {
		position: absolute;
		right: 1rem;
		font-size: 1.2rem;
		animation: pulse 1.5s ease-in-out infinite;
	}

	@keyframes pulse {
		0%, 100% {
			opacity: 1;
		}
		50% {
			opacity: 0.5;
		}
	}

	.suggestions-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		right: 0;
		background: white;
		border: 2px solid #e5e7eb;
		border-top: none;
		border-radius: 0 0 6px 6px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
		max-height: 400px;
		overflow-y: auto;
		z-index: 1000;
		margin-top: -2px;
	}

	.suggestion-item {
		width: 100%;
		padding: 1rem;
		text-align: left;
		background: white;
		border: none;
		border-bottom: 1px solid #f3f4f6;
		cursor: pointer;
		transition: background-color 0.15s;
	}

	.suggestion-item:last-child {
		border-bottom: none;
	}

	.suggestion-item:hover,
	.suggestion-item.selected {
		background: #f8f9ff;
	}

	.suggestion-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 0.5rem;
		gap: 1rem;
	}

	.suggestion-name {
		font-weight: 600;
		color: #111827;
		font-size: 0.95rem;
		flex: 1;
	}

	.suggestion-type {
		font-size: 0.75rem;
		padding: 0.25rem 0.5rem;
		background: #667eea;
		color: white;
		border-radius: 4px;
		font-weight: 600;
		text-transform: uppercase;
	}

	.suggestion-details {
		display: flex;
		gap: 1rem;
		flex-wrap: wrap;
		font-size: 0.85rem;
		color: #6b7280;
	}

	.suggestion-ticker,
	.suggestion-isin {
		font-family: 'Courier New', monospace;
	}

	.no-results {
		margin-top: 0.5rem;
		padding: 0.75rem;
		background: #fef3c7;
		border-left: 3px solid #f59e0b;
		border-radius: 4px;
		color: #92400e;
		font-size: 0.85rem;
	}

	.selected-asset-info {
		margin-top: 1rem;
		padding: 1rem;
		background: #f0fdf4;
		border: 2px solid #10b981;
		border-radius: 6px;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.info-label {
		font-size: 0.85rem;
		color: #065f46;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.ticker-display {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	.ticker-symbol {
		font-size: 1.5rem;
		font-weight: 700;
		color: #059669;
		font-family: 'Courier New', monospace;
		background: white;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 2px solid #10b981;
		box-shadow: 0 2px 4px rgba(16, 185, 129, 0.2);
	}

	.isin-display {
		font-size: 0.9rem;
		color: #047857;
		font-family: 'Courier New', monospace;
		background: white;
		padding: 0.5rem 1rem;
		border-radius: 6px;
		border: 1px solid #10b981;
	}
</style>

