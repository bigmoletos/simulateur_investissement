<script lang="ts">
	import { onMount } from 'svelte';
	import { Investment } from '../models/Investment.js';
	import { SimulationEngine } from '../services/SimulationEngine.js';
	import { currentInvestment, simulationResults, isCalculating, calculationError } from '../stores/simulation.js';
	import { settings } from '../stores/settings.js';
	import type { Period, FrequencySelection, ReinvestFrequency } from '../types/index.js';
	import ExcelCell from './ExcelCell.svelte';
	import ResultCard from './ResultCard.svelte';
	import OptimizationPanel from './OptimizationPanel.svelte';
	import PerformanceChart from './PerformanceChart.svelte';
	import ReturnChart from './ReturnChart.svelte';
	import FinancialIndicators from './FinancialIndicators.svelte';
	import ReinvestFrequencySelector from './ReinvestFrequencySelector.svelte';
	import FrequencyMultiSelector from './FrequencyMultiSelector.svelte';
	import PlatformComparison from './PlatformComparison.svelte';
	import CalculationDetails from './CalculationDetails.svelte';
	import SourcesPanel from './SourcesPanel.svelte';
	import HistoricalReturnsChart from './HistoricalReturnsChart.svelte';
	import AssetSearch from './AssetSearch.svelte';
	import FeesExplanation from './FeesExplanation.svelte';
	import type { AssetSearchResult } from '../services/AssetSearchService.js';
	import { logger } from '../utils/logger.js';
	import { handleError } from '../utils/errors.js';

	let investment = new Investment({
		amount: 2000,
		assetType: 'etf',
		platform: 'etoro',
		leverage: 5,
		stopLoss: 5,
		takeProfit: 100,
		expectedReturn: 10,
		reinvestFrequency: 'monthly',
		monthlyCapitalAddition: 350
	});

	let annualIncome = 15000;
	let selectedAsset: string = 'iShares USD Treasury Bond 0-1yr UCITS ETF (Acc)';
	let assetSearchInput: string = 'iShares USD Treasury Bond 0-1yr UCITS ETF (Acc)';
	let validationErrors: Record<string, string> = {};

	function handleAssetSelect(asset: AssetSearchResult) {
		selectedAsset = asset.name;
		assetSearchInput = asset.name;
		// Mettre à jour le type d'actif selon le résultat
		if (asset.type === 'etf') {
			updateField('assetType', 'etf');
		} else if (asset.type === 'stock') {
			updateField('assetType', 'action');
		}
		// Stocker le ticker ou ISIN pour référence dans le nom de l'investissement
		if (asset.ticker) {
			investment.update({ name: `${asset.name} (${asset.ticker})` });
		}
		// Déclencher la mise à jour de la simulation après sélection d'actif
		// Note: updateField() déclenche déjà updateSimulation(), donc pas besoin de le faire ici
		// sauf si on modifie directement investment.update()
		if (asset.ticker) {
			updateSimulation();
		}
	}

	// Réactif aux changements - désactivé pour éviter les boucles infinies
	// La simulation sera déclenchée manuellement via updateField()

	function updateSimulation() {
		const validation = investment.validate();
		if (!validation.valid) {
			validationErrors = {};
			validation.errors.forEach((error) => {
				// Extraire le champ de l'erreur
				const match = error.match(/^(\w+):/);
				if (match) {
					validationErrors[match[1]] = error;
				}
			});
			calculationError.set('Erreurs de validation');
			return;
		}

		validationErrors = {};
		isCalculating.set(true);
		calculationError.set(null);

		try {
			currentInvestment.set(investment);
			const results = SimulationEngine.simulateAllPeriods(investment, annualIncome);
			simulationResults.set(results);
			logger.info('Simulation mise à jour', { investmentId: investment.id });
		} catch (error) {
			const errorMessage = handleError(error);
			calculationError.set(errorMessage);
			logger.error('Erreur lors de la simulation', { error });
		} finally {
			isCalculating.set(false);
		}
	}

	function updateField(field: keyof Investment, value: any) {
		investment.update({ [field]: value });
		updateSimulation();
	}

	function handleAssetTypeChange(e: CustomEvent<string | number>) {
		const value = String(e.detail) as 'action' | 'fonds' | 'etf';
		updateField('assetType', value);
	}

	function handlePlatformChange(e: CustomEvent<string | number>) {
		const value = String(e.detail) as 'xtb' | 'etoro';
		updateField('platform', value);
	}

	function handleReinvestFrequencyChange(e: CustomEvent<string | number>) {
		const value = String(e.detail) as 'daily' | 'weekly' | 'monthly' | 'yearly';
		updateField('reinvestFrequency', value);
	}

	// Fonctions helper pour convertir les valeurs de fréquence
	function normalizeFrequencyValue(value: ReinvestFrequency | FrequencySelection): FrequencySelection {
		if (value === 'none' || Array.isArray(value)) {
			return value;
		}
		// Rétrocompatibilité: convertir une seule fréquence en tableau
		return [value];
	}

	function normalizeSellFrequencyValue(value: ReinvestFrequency | FrequencySelection | undefined, defaultReinvest: ReinvestFrequency | FrequencySelection): FrequencySelection {
		if (!value) {
			// Si non défini, utiliser la fréquence de réinvestissement
			return normalizeFrequencyValue(defaultReinvest);
		}
		return normalizeFrequencyValue(value);
	}

	// Helper pour valider et convertir une fréquence en ReinvestFrequency
	function validateReinvestFrequency(freq: string): ReinvestFrequency | null {
		if (freq !== 'none' && ['daily', 'weekly', 'monthly', 'yearly'].includes(freq)) {
			return freq as ReinvestFrequency;
		}
		return null;
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function exportToCSV() {
		if (!$simulationResults) {
			alert('Aucune donnée à exporter');
			return;
		}

		// Créer les lignes CSV
		const rows: string[] = [];

		// En-tête
		rows.push('Période,Montant initial,Montant avec levier,Gain brut (capital initial),Gain brut (capital additionnel),Gain net (capital initial),Gain net (capital additionnel),Gain net total,Frais entrée,Frais swap,Frais totaux,Prélèvements sociaux,Impôt revenu,Impôts totaux,Rentabilité nette (%) - Capital initial uniquement,Nouveau capital,Stop Loss (%),Réinvestissement');

		// Données pour chaque période
		const periods: Period[] = ['daily', 'weekly', 'monthly', 'yearly'];
		const periodLabels = {
			daily: 'Quotidien',
			weekly: 'Hebdomadaire',
			monthly: 'Mensuel',
			yearly: 'Annuel'
		};

		for (const period of periods) {
			const result = $simulationResults[period];
			if (result) {
				const row = [
					periodLabels[period],
					result.initialAmount.toFixed(2),
					result.leveragedAmount.toFixed(2),
					result.initialCapitalGain.toFixed(2),
					(result.additionalCapitalGain ?? 0).toFixed(2),
					result.initialCapitalNetGain.toFixed(2),
					(result.additionalCapitalGain ? ((result.additionalCapitalGain ?? 0) - (result.fees.total - (result.fees.total - (result.additionalCapitalGain ?? 0) * 0.3))) : 0).toFixed(2), // Approximation
					result.netGain.toFixed(2),
					result.fees.entry.toFixed(2),
					result.fees.swap.toFixed(2),
					result.fees.total.toFixed(2),
					result.taxes.socialCharges.toFixed(2),
					result.taxes.incomeTax.toFixed(2),
					result.taxes.total.toFixed(2),
					result.netReturn.toFixed(2),
					result.newCapital.toFixed(2),
					result.stopLoss.percentage.toFixed(2),
					result.reinvestment.toFixed(2)
				];
				rows.push(row.join(','));
			}
		}

		// Ajouter une ligne vide
		rows.push('');

		// Ajouter les paramètres d'investissement
		rows.push('Paramètres d\'investissement');
		rows.push('Montant investi,' + investment.amount.toFixed(2));
		rows.push('Type d\'actif,' + investment.assetType);
		rows.push('Plateforme,' + investment.platform);
		rows.push('Bras de levier,' + investment.leverage.toFixed(1));
		rows.push('Stop Loss (%),' + investment.stopLoss.toFixed(2));
		rows.push('Take Profit (%),' + (investment.takeProfit ? investment.takeProfit.toFixed(2) : 'Non défini'));
		rows.push('Rendement attendu annuel (%),' + investment.expectedReturn.toFixed(2));
		rows.push('Fréquence de réinvestissement,' + investment.reinvestFrequency);
		rows.push('Capital mensuel supplémentaire,' + (investment.monthlyCapitalAddition || 0).toFixed(2));
		rows.push('Revenu annuel,' + annualIncome.toFixed(2));

		// Créer le contenu CSV
		const csvContent = rows.join('\n');

		// Créer un blob et télécharger
		const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' }); // BOM pour Excel
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = `simulation_investissement_${new Date().toISOString().split('T')[0]}.csv`;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);

		logger.info('Export CSV effectué', { investmentId: investment.id });
	}

	onMount(() => {
		// Charger les paramètres par défaut depuis les settings
		settings.load();
		updateSimulation();
	});

	// Réactif aux changements - désactivé pour éviter les boucles infinies
	// La simulation sera déclenchée manuellement via updateField()
</script>

<div class="simulation-sheet">
	<!-- Zone de paramètres (type Excel) -->
	<div class="parameters-section">
		<h2>Paramètres d'investissement</h2>
		<div class="excel-grid">
			<ExcelCell
				label="Montant investi (€)"
				type="number"
				value={investment.amount}
				min={0}
				step={100}
				error={validationErrors.amount}
				on:change={(e) => updateField('amount', Number(e.detail))}
			/>

			<div class="excel-cell asset-search-cell">
				<div class="excel-cell-label">Rechercher un actif/ETF</div>
				<div class="excel-cell-input">
					<AssetSearch
						bind:value={assetSearchInput}
						onSelect={handleAssetSelect}
					/>
				</div>
			</div>

			<ExcelCell
				label="Plateforme"
				type="select"
				value={investment.platform}
				options={['xtb', 'etoro']}
				error={validationErrors.platform}
				on:change={handlePlatformChange}
			/>

			<div class="excel-cell">
				<div class="excel-cell-label">Bras de levier</div>
				<div class="excel-cell-input">
					<input
						type="range"
						min="1"
						max="10"
						step="0.1"
						bind:value={investment.leverage}
						on:input={(e) => updateField('leverage', Number(e.target.value))}
						class="lever-slider"
					/>
					<div class="lever-display">
						<span class="lever-value">{investment.leverage.toFixed(1)}x</span>
						<span class="lever-amount">
							Exposé: {formatCurrency(investment.amount * investment.leverage)}
							<small class="lever-note"> (Investi: {formatCurrency(investment.amount)})</small>
						</span>
					</div>
				</div>
			</div>

			<ExcelCell
				label="Stop Loss (%)"
				type="number"
				value={investment.stopLoss}
				min={5}
				max={50}
				step={0.5}
				error={validationErrors.stopLoss}
				on:change={(e) => updateField('stopLoss', Number(e.detail))}
			/>

			<ExcelCell
				label="Take Profit (%)"
				type="number"
				value={investment.takeProfit ?? 100}
				min={0}
				max={1000}
				step={0.5}
				error={validationErrors.takeProfit}
				on:change={(e) => {
					const value = e.detail;
					if (value === '' || value === null || value === undefined) {
						updateField('takeProfit', 100); // Valeur par défaut si vide
					} else {
						updateField('takeProfit', Number(value));
					}
				}}
			/>

			<ExcelCell
				label="Rendement attendu annuel (%)"
				type="number"
				value={investment.expectedReturn}
				min={-100}
				max={100}
				step={0.1}
				error={validationErrors.expectedReturn}
				on:change={(e) => updateField('expectedReturn', Number(e.detail))}
			/>

			<div class="excel-cell reinvest-row">
				<div class="excel-cell-label">Fréquence de réinvestissement des gains</div>
				<div class="excel-cell-input reinvest-input-group">
					<div class="reinvest-amount-group">
						<label class="reinvest-amount-label">Montant à réinvestir (€)</label>
						<input
							type="number"
							min={0}
							step={50}
							value={investment.capitalAdditionAmount || investment.monthlyCapitalAddition || 0}
							on:input={(e) => {
								const value = Number(e.target.value) || 0;
								// Mettre à jour capitalAdditionAmount
								updateField('capitalAdditionAmount', value);
								// Utiliser la fréquence de réinvestissement des gains pour le capital additionnel
								const reinvestFreq = Array.isArray(investment.reinvestFrequency)
									? investment.reinvestFrequency[0]
									: investment.reinvestFrequency;
								if (value > 0 && reinvestFreq && reinvestFreq !== 'none') {
									const validFreq = validateReinvestFrequency(reinvestFreq);
									if (validFreq) {
										updateField('capitalAdditionFrequency', validFreq);
										// Rétrocompatibilité : mettre à jour monthlyCapitalAddition si mensuel
										if (reinvestFreq === 'monthly') {
											updateField('monthlyCapitalAddition', value);
										} else {
											updateField('monthlyCapitalAddition', 0);
										}
									}
								} else if (value === 0) {
									updateField('capitalAdditionFrequency', undefined);
									updateField('monthlyCapitalAddition', 0);
								}
							}}
							class="reinvest-amount-input"
						/>
					</div>
					<FrequencyMultiSelector
						name="reinvest-frequency"
						value={normalizeFrequencyValue(investment.reinvestFrequency)}
						onChange={(selection) => updateField('reinvestFrequency', selection)}
						allowNone={true}
						noneLabel="Aucun"
					/>
					<small class="lever-note">Fréquence à laquelle les gains générés sont réinvestis dans la position.</small>
				</div>
			</div>

			<div class="excel-cell" style="grid-column: 1 / -1;">
				<div class="excel-cell-label">Fréquence de sortie/réachat (stabilisation)</div>
				<div class="excel-cell-input">
					<FrequencyMultiSelector
						name="sell-frequency"
						value={normalizeSellFrequencyValue(investment.sellFrequency, investment.reinvestFrequency)}
						onChange={(selection) => updateField('sellFrequency', selection)}
						allowNone={true}
						noneLabel="Aucune"
					/>
					<small class="lever-note">Fréquence de vente/réachat pour stabiliser les gains. Si non défini, utilise la fréquence de réinvestissement.</small>
				</div>
			</div>

			<ExcelCell
				label="Revenu annuel (€)"
				type="number"
				value={annualIncome}
				min={0}
				step={1000}
				on:change={(e) => {
					annualIncome = Number(e.detail);
					updateSimulation();
				}}
			/>
		</div>
	</div>

	<!-- Résultats de simulation -->
	{#if $simulationResults}
		<div class="results-section">
			<div class="results-header">
				<h2>Résultats de simulation</h2>
				{#if !$isCalculating && !$calculationError}
					<button class="export-btn" on:click={exportToCSV}>
						📥 Exporter les données en CSV
					</button>
				{/if}
			</div>

			<!-- Comparaison des plateformes -->
			<div class="comparison-section">
				<PlatformComparison baseInvestment={investment} />
			</div>

			{#if $isCalculating}
				<div class="loading">Calcul en cours...</div>
			{:else if $calculationError}
				<div class="error-banner">{$calculationError}</div>
			{:else}

				<!-- Indicateurs financiers -->
				<FinancialIndicators results={$simulationResults} />

				<!-- Graphique de rendement historique -->
				<HistoricalReturnsChart assetName={selectedAsset} />

				<!-- Détail des calculs et Sources officielles -->
				<div class="details-sources-row">
					<CalculationDetails {investment} results={$simulationResults} {annualIncome} />
					<SourcesPanel platform={investment.platform} />
				</div>

				<!-- Explication des frais -->
				<FeesExplanation platform={investment.platform} />

				<!-- Graphiques -->
				<div class="charts-section">
					<div class="chart-wrapper">
						<PerformanceChart results={$simulationResults} />
					</div>
					<div class="chart-wrapper">
						<ReturnChart results={$simulationResults} />
					</div>
				</div>

				<!-- Cartes de résultats par période -->
				<div class="results-grid">
					{#if $simulationResults.daily}
						<ResultCard period="daily" result={$simulationResults.daily} />
					{/if}
					{#if $simulationResults.weekly}
						<ResultCard period="weekly" result={$simulationResults.weekly} />
					{/if}
					{#if $simulationResults.monthly}
						<ResultCard period="monthly" result={$simulationResults.monthly} />
					{/if}
					{#if $simulationResults.yearly}
						<ResultCard period="yearly" result={$simulationResults.yearly} />
					{/if}
				</div>
			{/if}
		</div>
	{/if}

	<!-- Optimisation -->
	<div class="optimization-section">
		<h2>Recommandations d'optimisation</h2>
		<OptimizationPanel {investment} />
	</div>
</div>

<style>
	.simulation-sheet {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		padding: 0.5rem;
	}

	.parameters-section,
	.results-section,
	.optimization-section {
		background: var(--bg-primary, white);
		border-radius: 6px;
		padding: 0.75rem;
		box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.1));
		border: 1px solid var(--border-color, #e0e0e0);
	}

	:global(:root.dark) .parameters-section,
	:global(:root.dark) .results-section,
	:global(:root.dark) .optimization-section {
		background: var(--bg-primary);
		border-color: var(--border-color);
	}

	.results-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-bottom: 0.5rem;
		gap: 1rem;
	}

	h2 {
		margin: 0;
		color: var(--text-primary, #333);
		font-size: 1rem;
		border-bottom: 2px solid #d4af37;
		padding-bottom: 0.2rem;
		flex: 1;
	}

	.excel-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 0.5rem;
		align-items: start;
	}

	.excel-cell {
		display: grid;
		grid-template-columns: 140px 1fr;
		gap: 0.3rem;
		align-items: center;
		padding: 0.25rem;
		min-width: 0; /* Permet au contenu de dépasser si nécessaire */
		border: 1px solid var(--border-color, #e0e0e0);
		border-radius: 4px;
		background: var(--bg-primary, white);
	}

	.excel-cell.asset-search-cell {
		grid-template-columns: 80px 1fr;
		min-width: 0;
		grid-column: 1 / -1; /* Prend toute la largeur */
		align-items: start;
		padding: 0.3rem;
		gap: 0.4rem;
	}

	.asset-search-cell .excel-cell-input {
		width: 100%;
		min-width: 0;
	}

	.excel-cell.reinvest-row {
		grid-template-columns: 120px 1fr;
		grid-column: 1 / -1; /* Prend toute la largeur */
	}

	.reinvest-input-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.reinvest-amount-group {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		margin-bottom: 0.5rem;
		justify-content: flex-start;
		width: fit-content;
	}

	.reinvest-amount-label {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-primary, #555);
		white-space: nowrap;
		min-width: fit-content;
	}

	.reinvest-amount-input {
		flex: 0 0 150px;
		padding: 0.35rem 0.5rem;
		border: 1px solid var(--border-color, #ddd);
		border-radius: 4px;
		font-size: 0.85rem;
		max-width: 150px;
	}

	.excel-cell-label {
		font-weight: 600;
		color: var(--text-primary, #555);
		font-size: 0.7rem;
		line-height: 1.2;
	}

	:global(:root.dark) .excel-cell-label {
		color: var(--text-primary);
	}

	.excel-cell-input {
		display: flex;
		flex-direction: column;
		gap: 0.15rem;
	}

	.lever-slider {
		width: 100%;
		max-width: 200px;
		cursor: pointer;
	}

	.lever-display {
		display: flex;
		flex-direction: column;
		gap: 0.1rem;
	}

	.lever-value {
		font-weight: 700;
		color: #d4af37;
		font-size: 0.9rem;
	}

	.lever-amount {
		font-size: 0.65rem;
		color: var(--text-secondary, #666);
		line-height: 1.2;
	}

	:global(:root.dark) .lever-amount {
		color: var(--text-secondary);
	}

	.lever-note {
		color: var(--text-secondary, #666);
		font-size: 0.6rem;
		line-height: 1.2;
	}

	:global(:root.dark) .lever-amount small,
	:global(:root.dark) .lever-note {
		color: var(--text-secondary);
	}

	.details-sources-row {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 0.5rem;
		margin: 0.5rem 0;
		align-items: start;
	}

	@media (max-width: 1200px) {
		.details-sources-row {
			grid-template-columns: 1fr;
		}
	}

	.charts-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
		gap: 0.5rem;
		margin: 0.5rem 0;
	}

	.chart-wrapper {
		background: var(--bg-primary, white);
		border-radius: 6px;
		padding: 0.75rem;
		box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.1));
		border: 1px solid var(--border-color, #e0e0e0);
	}

	:global(:root.dark) .chart-wrapper {
		background: var(--bg-primary);
		border-color: var(--border-color);
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.loading {
		padding: 1rem;
		text-align: center;
		color: #d4af37;
		font-weight: 600;
	}

	.error-banner {
		padding: 1rem;
		background: #fee;
		border-left: 4px solid #ef4444;
		border-radius: 4px;
		color: #c33;
	}

	.export-btn {
		padding: 0.35rem 0.7rem;
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		color: #f5f5f5;
		border: 1px solid rgba(212, 175, 55, 0.3);
		border-radius: 4px;
		font-size: 0.75rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		white-space: nowrap;
		flex-shrink: 0;
	}

	.export-btn:hover {
		background: linear-gradient(135deg, #16213e 0%, #0f3460 100%);
		border-color: rgba(212, 175, 55, 0.5);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
	}

	.export-btn:active {
		background: #4c5bc4;
	}
</style>
