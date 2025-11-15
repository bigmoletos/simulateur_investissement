<script lang="ts">
	import { onMount } from 'svelte';
	import { Investment } from '../models/Investment.js';
	import { SimulationEngine } from '../services/SimulationEngine.js';
	import { currentInvestment, simulationResults, isCalculating, calculationError } from '../stores/simulation.js';
	import { settings } from '../stores/settings.js';
	import type { Period } from '../types/index.js';
	import ExcelCell from './ExcelCell.svelte';
	import ResultCard from './ResultCard.svelte';
	import OptimizationPanel from './OptimizationPanel.svelte';
	import PerformanceChart from './PerformanceChart.svelte';
	import ReturnChart from './ReturnChart.svelte';
	import FinancialIndicators from './FinancialIndicators.svelte';
	import ReinvestFrequencySelector from './ReinvestFrequencySelector.svelte';
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
		platform: 'xtb',
		leverage: 5,
		stopLoss: 5,
		expectedReturn: 10,
		reinvestFrequency: 'monthly',
		monthlyCapitalAddition: 350
	});

	let annualIncome = 30000;
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
		rows.push('Période,Montant initial,Montant avec levier,Gain brut,Frais entrée,Frais swap,Frais totaux,Prélèvements sociaux,Impôt revenu,Impôts totaux,Gain net,Rentabilité nette (%),Nouveau capital,Stop Loss (%),Réinvestissement');

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
					result.grossGain.toFixed(2),
					result.fees.entry.toFixed(2),
					result.fees.swap.toFixed(2),
					result.fees.total.toFixed(2),
					result.taxes.socialCharges.toFixed(2),
					result.taxes.incomeTax.toFixed(2),
					result.taxes.total.toFixed(2),
					result.netGain.toFixed(2),
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

			<div class="excel-cell">
				<AssetSearch
					bind:value={assetSearchInput}
					onSelect={handleAssetSelect}
				/>
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
						on:input={updateSimulation}
						class="lever-slider"
					/>
					<div class="lever-display">
						<span class="lever-value">{investment.leverage.toFixed(1)}x</span>
						<span class="lever-amount">
							Montant exposé au marché: {formatCurrency(investment.amount * investment.leverage)}
							<br><small style="color: #666;">(Montant réellement investi: {formatCurrency(investment.amount)})</small>
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
				label="Rendement attendu annuel (%)"
				type="number"
				value={investment.expectedReturn}
				min={-100}
				max={100}
				step={0.1}
				error={validationErrors.expectedReturn}
				on:change={(e) => updateField('expectedReturn', Number(e.detail))}
			/>

			<div class="excel-cell">
				<div class="excel-cell-label">Fréquence de réinvestissement</div>
				<div class="excel-cell-input">
					<ReinvestFrequencySelector
						value={investment.reinvestFrequency}
						onChange={(freq) => updateField('reinvestFrequency', freq)}
					/>
				</div>
			</div>

			<ExcelCell
				label="Capital mensuel supplémentaire (€)"
				type="number"
				value={investment.monthlyCapitalAddition || 0}
				min={0}
				step={50}
				on:change={(e) => updateField('monthlyCapitalAddition', Number(e.detail))}
			/>

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
			<h2>Résultats de simulation</h2>
			{#if $isCalculating}
				<div class="loading">Calcul en cours...</div>
			{:else if $calculationError}
				<div class="error-banner">{$calculationError}</div>
			{:else}
				<!-- Bouton d'export CSV -->
				<div class="export-section">
					<button class="export-btn" on:click={exportToCSV}>
						📥 Exporter les données en CSV
					</button>
				</div>

				<!-- Indicateurs financiers -->
				<FinancialIndicators results={$simulationResults} {investment} />

				<!-- Graphique de rendement historique -->
				<HistoricalReturnsChart assetName={selectedAsset} />

				<!-- Détail des calculs -->
				<CalculationDetails {investment} results={$simulationResults} {annualIncome} />

				<!-- Sources officielles -->
				<SourcesPanel platform={investment.platform} />

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

	<!-- Comparaison des plateformes -->
	<div class="comparison-section">
		<PlatformComparison baseInvestment={investment} />
	</div>

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
		gap: 2rem;
		padding: 2rem;
	}

	.parameters-section,
	.results-section,
	.optimization-section {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h2 {
		margin: 0 0 1.5rem 0;
		color: #333;
		font-size: 1.5rem;
		border-bottom: 2px solid #667eea;
		padding-bottom: 0.5rem;
	}

	.excel-grid {
		display: flex;
		flex-direction: column;
		gap: 0;
	}

	.excel-cell {
		display: grid;
		grid-template-columns: 200px 1fr;
		gap: 0.75rem;
		align-items: center;
		padding: 0.5rem 0;
		min-width: 0; /* Permet au contenu de dépasser si nécessaire */
	}

	.excel-cell:has(.asset-search-container) {
		grid-template-columns: 200px 1fr;
		min-width: 0;
	}

	.excel-cell-label {
		font-weight: 600;
		color: #555;
		font-size: 0.9rem;
	}

	.excel-cell-input {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.lever-slider {
		width: 100%;
		max-width: 300px;
		cursor: pointer;
	}

	.lever-display {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.lever-value {
		font-weight: 700;
		color: #667eea;
		font-size: 1.25rem;
	}

	.lever-amount {
		font-size: 0.85rem;
		color: #666;
	}

	.charts-section {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
		gap: 2rem;
		margin: 2rem 0;
	}

	.chart-wrapper {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.results-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1rem;
		margin-top: 2rem;
	}

	.loading {
		padding: 2rem;
		text-align: center;
		color: #667eea;
		font-weight: 600;
	}

	.error-banner {
		padding: 1rem;
		background: #fee;
		border-left: 4px solid #ef4444;
		border-radius: 4px;
		color: #c33;
	}

	.export-section {
		margin-bottom: 1.5rem;
		display: flex;
		justify-content: flex-end;
	}

	.export-btn {
		padding: 0.75rem 1.5rem;
		background: #667eea;
		color: white;
		border: none;
		border-radius: 6px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: background 0.2s;
	}

	.export-btn:hover {
		background: #5568d3;
	}

	.export-btn:active {
		background: #4c5bc4;
	}
</style>
