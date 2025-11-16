<script lang="ts">
	import type { SimulationResult, Period } from '../types/index.js';

	export let results: Record<Period, SimulationResult>;

	let showModal: string | null = null;

	// Calcul des indicateurs financiers
	$: yearlyResult = results?.yearly;
	$: monthlyResult = results?.monthly;
	$: dailyResult = results?.daily;
	$: weeklyResult = results?.weekly;

	// ROI (Return on Investment) : Gain net total / Capital initial investi
	// C'est le rendement brut de l'investissement sur une année
	$: roi = yearlyResult && yearlyResult.initialAmount > 0
		? yearlyResult.netReturn.toFixed(2)
		: '0.00';

	// Rentabilité Annualisée : ROI annualisé basé sur la performance mensuelle
	// Permet de comparer des investissements avec des périodes différentes
	$: annualizedReturn = monthlyResult && monthlyResult.initialAmount > 0
		? ((Math.pow(1 + (monthlyResult.netReturn / 100), 12) - 1) * 100).toFixed(2)
		: yearlyResult
			? yearlyResult.netReturn.toFixed(2)
			: '0.00';

	// Ratio de Sharpe amélioré : (Rendement - Taux sans risque) / Volatilité
	// Pour une simulation, on utilise une volatilité estimée basée sur le stop loss
	// Taux sans risque approximatif : 2% (livret A)
	$: riskFreeRate = 2.0; // Taux sans risque annuel (%)
	$: estimatedVolatility = yearlyResult && yearlyResult.stopLoss
		? yearlyResult.stopLoss.percentage * 0.5 // Estimation de la volatilité basée sur le stop loss
		: 10.0; // Valeur par défaut
	$: sharpeRatio = yearlyResult && yearlyResult.netReturn > riskFreeRate && estimatedVolatility > 0
		? ((yearlyResult.netReturn - riskFreeRate) / estimatedVolatility).toFixed(2)
		: '0.00';

	// Taux de réinvestissement effectif (sur capital initial uniquement)
	$: reinvestmentRate = yearlyResult && (yearlyResult.initialCapitalNetGain ?? yearlyResult.netGain) > 0
		? ((yearlyResult.reinvestment / (yearlyResult.initialCapitalNetGain ?? yearlyResult.netGain)) * 100).toFixed(1)
		: '0.0';

	// Efficacité fiscale (ratio gain net / gain brut) sur capital initial uniquement
	$: initialGain = yearlyResult?.initialCapitalGain ?? yearlyResult?.grossGain ?? 0;
	$: initialNetGain = yearlyResult?.initialCapitalNetGain ?? yearlyResult?.netGain ?? 0;
	$: taxEfficiency = yearlyResult && initialGain > 0
		? ((initialNetGain / initialGain) * 100).toFixed(1)
		: '0.0';

	// Ratio frais / gain brut sur capital initial uniquement
	$: feeRatio = yearlyResult && initialGain > 0
		? ((yearlyResult.fees.total / initialGain) * 100).toFixed(2)
		: '0.00';

	// Gain moyen mensuel sur capital initial uniquement
	$: avgMonthlyGain = monthlyResult?.initialCapitalNetGain ?? monthlyResult?.netGain ?? 0;

	// Projection sur 1 an avec réinvestissement (sur capital initial uniquement)
	$: projectedAnnualGain = monthlyResult
		? (monthlyResult.initialCapitalNetGain ?? monthlyResult.netGain) * 12
		: 0;

	// Montants en euros pour chaque indicateur
	$: initialCapital = yearlyResult?.initialAmount ?? 0;
	// Le montant affiché pour le ROI doit refléter le gain net total (capital initial + capital additionnel)
	// pour montrer le montant réellement gagné, même si le ROI % est calculé uniquement sur le capital initial
	$: totalNetGain = yearlyResult?.netGain ?? 0; // Gain net total incluant capital initial + capital additionnel
	$: monthlyTotalNetGain = monthlyResult?.netGain ?? 0; // Gain net total mensuel incluant capital additionnel
	$: roiAmount = totalNetGain; // Afficher le gain total réellement gagné
	// Rentabilité annualisée : utiliser le gain net total mensuel pour projeter sur 1 an
	// Le pourcentage est calculé sur le capital initial, mais le montant inclut les gains sur capital additionnel
	$: annualizedReturnAmount = monthlyResult && monthlyTotalNetGain > 0
		? (Math.pow(1 + (monthlyResult.netReturn / 100), 12) - 1) * monthlyResult.initialAmount + (monthlyTotalNetGain * 12)
		: totalNetGain; // Fallback sur le gain annuel total
	$: taxEfficiencyAmount = totalNetGain; // Gain net total correspondant à l'efficacité fiscale
	$: feeRatioAmount = yearlyResult?.fees?.total ?? 0; // Montant des frais

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function closeModal() {
		showModal = null;
	}

	function openModal(indicator: string) {
		showModal = indicator;
	}

	// Définitions détaillées des indicateurs (réactif pour mettre à jour les calculs)
	$: indicatorDefinitions = {
		roi: {
			title: 'ROI Annuel (Return on Investment)',
			description: 'Le ROI mesure le rendement net de votre investissement sur une période d\'un an. Le pourcentage est calculé uniquement sur le capital initial investi, mais le montant affiché inclut tous les gains (capital initial + capital additionnel).',
			formula: 'ROI = (Gain net sur capital initial / Capital initial) × 100',
			interpretation: 'Un ROI de 10% signifie que pour chaque 100€ investis initialement, vous gagnez 10€ net par an après frais et impôts. Le montant affiché montre le gain total réellement gagné, incluant les gains sur le capital additionnel mensuel.',
			goodValue: '> 10%',
			calculation: `Gain net (capital initial): ${formatCurrency(initialNetGain)}\nGain net (capital additionnel): ${formatCurrency((yearlyResult?.additionalCapitalNetGain ?? 0))}\nGain net total: ${formatCurrency(totalNetGain)}\nCapital initial: ${formatCurrency(initialCapital)}\nCapital additionnel: ${formatCurrency(yearlyResult?.additionalCapitalAmount ?? 0)}\nROI (sur capital initial): ${roi}%`
		},
		annualized: {
			title: 'Rentabilité Annualisée',
			description: 'La rentabilité annualisée projette la performance mensuelle sur une année complète en utilisant la capitalisation composée. Le pourcentage est calculé sur le capital initial, mais le montant affiché inclut tous les gains (capital initial + capital additionnel).',
			formula: 'Rentabilité annualisée = ((1 + Rendement mensuel)¹² - 1) × 100',
			interpretation: 'Cet indicateur montre ce que vous obtiendriez si la performance mensuelle se maintenait pendant un an avec réinvestissement des gains. Le montant affiché montre le gain total projeté incluant les gains sur le capital additionnel mensuel.',
			goodValue: '> 10%',
			calculation: `Rendement mensuel: ${monthlyResult?.netReturn?.toFixed(2) || '0.00'}%\nGain mensuel (capital initial): ${formatCurrency(monthlyResult?.initialCapitalNetGain ?? monthlyResult?.netGain ?? 0)}\nGain mensuel (capital additionnel): ${formatCurrency((monthlyResult?.additionalCapitalNetGain ?? 0))}\nGain mensuel total: ${formatCurrency(monthlyTotalNetGain)}\nRentabilité annualisée: ${annualizedReturn}%\nGain total projeté sur 1 an: ${formatCurrency(annualizedReturnAmount)}\nDifférence avec ROI: ${(parseFloat(annualizedReturn) - parseFloat(roi)).toFixed(2)}%`
		},
		sharpe: {
			title: 'Ratio de Sharpe',
			description: 'Le ratio de Sharpe mesure le rendement excédentaire par unité de risque. Il compare votre rendement au taux sans risque (livret A) et le divise par la volatilité estimée.',
			formula: 'Sharpe = (Rendement - Taux sans risque) / Volatilité',
			interpretation: 'Un ratio > 1 est considéré comme bon, > 2 comme excellent, > 3 comme exceptionnel. Un ratio faible (< 1) indique un risque élevé pour le rendement obtenu. La volatilité est estimée à partir de votre stop loss.',
			goodValue: '> 1.0',
			calculation: `Rendement: ${yearlyResult?.netReturn?.toFixed(2) || '0.00'}%\nTaux sans risque: ${riskFreeRate}%\nVolatilité estimée: ${estimatedVolatility.toFixed(2)}%\nRatio de Sharpe: ${sharpeRatio}`
		},
		taxEfficiency: {
			title: 'Efficacité Fiscale',
			description: 'L\'efficacité fiscale mesure la part du gain brut conservée après impôts et prélèvements sociaux. Le pourcentage est calculé sur le capital initial, mais le montant affiché inclut tous les gains.',
			formula: 'Efficacité fiscale = (Gain net / Gain brut) × 100',
			interpretation: 'Une efficacité de 70% signifie que vous conservez 70% de votre gain brut après impôts. Le montant affiché montre le gain net total réellement conservé incluant les gains sur le capital additionnel.',
			goodValue: '> 70%',
			calculation: `Gain brut (capital initial): ${formatCurrency(initialGain)}\nGain brut (capital additionnel): ${formatCurrency((yearlyResult?.additionalCapitalGain ?? 0))}\nGain brut total: ${formatCurrency(yearlyResult?.grossGain ?? 0)}\nGain net (capital initial): ${formatCurrency(initialNetGain)}\nGain net (capital additionnel): ${formatCurrency((yearlyResult?.additionalCapitalNetGain ?? 0))}\nGain net total: ${formatCurrency(totalNetGain)}\nImpôts totaux: ${formatCurrency(yearlyResult?.taxes?.total || 0)}\nEfficacité (sur capital initial): ${taxEfficiency}%`
		},
		feeRatio: {
			title: 'Ratio Frais',
			description: 'Le ratio frais montre la proportion des frais (spread, commissions, swap) par rapport au gain brut. Plus il est faible, plus l\'investissement est efficace.',
			formula: 'Ratio frais = (Frais totaux / Gain brut) × 100',
			interpretation: 'Un ratio de 5% signifie que les frais représentent 5% de votre gain brut. Idéalement, ce ratio devrait être < 10%. Un ratio élevé peut réduire significativement votre rentabilité nette.',
			goodValue: '< 10%',
			calculation: `Frais totaux: ${formatCurrency(feeRatioAmount)}\nGain brut: ${formatCurrency(initialGain)}\nRatio: ${feeRatio}%`
		}
	};

	function getIndicatorColor(value: number | null, threshold: number = 0): string {
		if (value === null || value === undefined) return '#999';
		if (value > threshold * 1.5) return '#10b981'; // Vert foncé - excellent
		if (value > threshold) return '#22c55e'; // Vert - bon
		if (value > threshold * 0.5) return '#eab308'; // Jaune - moyen
		return '#ef4444'; // Rouge - faible
	}
</script>

<div class="indicators-grid">
	<div class="indicator-card" role="button" tabindex="0" on:click={() => openModal('roi')} on:keydown={(e) => e.key === 'Enter' && openModal('roi')}>
		<div class="indicator-label">
			ROI Annuel
			<span class="info-icon">ℹ️</span>
		</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(roi) || 0, 10)}"
		>
			{roi}%
		</div>
		<div class="indicator-amount">{formatCurrency(roiAmount)}</div>
		<div class="indicator-desc">Return on Investment</div>
	</div>

	<div class="indicator-card" role="button" tabindex="0" on:click={() => openModal('annualized')} on:keydown={(e) => e.key === 'Enter' && openModal('annualized')}>
		<div class="indicator-label">
			Rentabilité Annualisée
			<span class="info-icon">ℹ️</span>
		</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(annualizedReturn) || 0, 10)}"
		>
			{annualizedReturn}%
		</div>
		<div class="indicator-amount">{formatCurrency(annualizedReturnAmount)}</div>
		<div class="indicator-desc">Projection sur 1 an</div>
	</div>

	<div class="indicator-card" role="button" tabindex="0" on:click={() => openModal('sharpe')} on:keydown={(e) => e.key === 'Enter' && openModal('sharpe')}>
		<div class="indicator-label">
			Sharpe Ratio
			<span class="info-icon">ℹ️</span>
		</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(sharpeRatio) || 0, 1)}"
		>
			{sharpeRatio}
		</div>
		<div class="indicator-desc">Ratio risque/rendement</div>
	</div>

	<div class="indicator-card" role="button" tabindex="0" on:click={() => openModal('taxEfficiency')} on:keydown={(e) => e.key === 'Enter' && openModal('taxEfficiency')}>
		<div class="indicator-label">
			Efficacité Fiscale
			<span class="info-icon">ℹ️</span>
		</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(taxEfficiency) || 0, 70)}"
		>
			{taxEfficiency}%
		</div>
		<div class="indicator-amount">{formatCurrency(taxEfficiencyAmount)}</div>
		<div class="indicator-desc">Gain net / Gain brut</div>
	</div>

	<div class="indicator-card" role="button" tabindex="0" on:click={() => openModal('feeRatio')} on:keydown={(e) => e.key === 'Enter' && openModal('feeRatio')}>
		<div class="indicator-label">
			Ratio Frais
			<span class="info-icon">ℹ️</span>
		</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(100 - (parseFloat(feeRatio) || 0), 95)}"
		>
			{feeRatio}%
		</div>
		<div class="indicator-amount">{formatCurrency(feeRatioAmount)}</div>
		<div class="indicator-desc">Frais / Gain brut</div>
	</div>

	<div class="indicator-card">
		<div class="indicator-label">Gain Mensuel Moyen</div>
		<div class="indicator-value" style="color: {getIndicatorColor(avgMonthlyGain || 0, 100)}">
			{formatCurrency(avgMonthlyGain)}
		</div>
		<div class="indicator-desc">Projection: {formatCurrency(projectedAnnualGain)}/an</div>
	</div>
</div>

{#if showModal}
	<div class="modal-overlay" on:click={closeModal} on:keydown={(e) => e.key === 'Escape' && closeModal()}>
		<div class="modal-content" on:click|stopPropagation>
			<div class="modal-header">
				<h2>{indicatorDefinitions[showModal]?.title}</h2>
				<button class="close-button" on:click={closeModal}>×</button>
			</div>
			<div class="modal-body">
				<div class="definition-section">
					<h3>Description</h3>
					<p>{indicatorDefinitions[showModal]?.description}</p>
				</div>
				<div class="formula-section">
					<h3>Formule</h3>
					<code>{indicatorDefinitions[showModal]?.formula}</code>
				</div>
				<div class="interpretation-section">
					<h3>Interprétation</h3>
					<p>{indicatorDefinitions[showModal]?.interpretation}</p>
				</div>
				<div class="value-section">
					<h3>Valeur de référence</h3>
					<p>Une valeur <strong>{indicatorDefinitions[showModal]?.goodValue}</strong> est considérée comme bonne.</p>
				</div>
				<div class="calculation-section">
					<h3>Calcul détaillé</h3>
					<pre>{indicatorDefinitions[showModal]?.calculation}</pre>
				</div>
			</div>
		</div>
	</div>
{/if}

<style>
	.indicators-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(110px, 1fr));
		gap: 0.35rem;
		margin-top: 0.25rem;
	}

	.indicator-card {
		background: var(--bg-primary, white);
		border: 1px solid var(--border-color, #e0e0e0);
		border-radius: 4px;
		padding: 0.5rem;
		text-align: center;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	:global(:root.dark) .indicator-card {
		background: var(--bg-primary);
		border-color: var(--border-color);
	}

	.indicator-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.indicator-label {
		font-size: 0.6rem;
		color: var(--text-secondary, #666);
		margin-bottom: 0.15rem;
		font-weight: 600;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.15rem;
	}

	.info-icon {
		font-size: 0.55rem;
		cursor: pointer;
		opacity: 0.6;
		transition: opacity 0.2s;
	}

	.indicator-card:hover .info-icon {
		opacity: 1;
	}

	.indicator-card {
		cursor: pointer;
	}

	.indicator-value {
		font-size: 1rem;
		font-weight: 700;
		margin-bottom: 0.1rem;
		line-height: 1.1;
	}

	.indicator-amount {
		font-size: 0.7rem;
		font-weight: 600;
		color: var(--text-primary, #333);
		margin-bottom: 0.15rem;
		opacity: 0.8;
	}

	:global(:root.dark) .indicator-amount {
		color: var(--text-primary);
	}

	.indicator-desc {
		font-size: 0.55rem;
		color: var(--text-secondary, #999);
		line-height: 1.1;
	}

	.modal-overlay {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		bottom: 0;
		background: rgba(0, 0, 0, 0.5);
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1000;
		padding: 1rem;
	}

	.modal-content {
		background: var(--bg-primary, white);
		border-radius: 12px;
		max-width: 600px;
		width: 100%;
		max-height: 90vh;
		overflow-y: auto;
		box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	}

	:global(:root.dark) .modal-content {
		background: var(--bg-primary);
	}

	.modal-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.5rem;
		border-bottom: 1px solid var(--border-color, #e0e0e0);
	}

	.modal-header h2 {
		margin: 0;
		font-size: 1.5rem;
		color: var(--text-primary, #111827);
	}

	:global(:root.dark) .modal-header h2 {
		color: var(--text-primary);
	}

	.close-button {
		background: none;
		border: none;
		font-size: 2rem;
		cursor: pointer;
		color: var(--text-secondary, #666);
		line-height: 1;
		padding: 0;
		width: 32px;
		height: 32px;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.close-button:hover {
		background-color: var(--bg-secondary, #f3f4f6);
	}

	.modal-body {
		padding: 1.5rem;
	}

	.definition-section,
	.formula-section,
	.interpretation-section,
	.value-section,
	.calculation-section {
		margin-bottom: 1.5rem;
	}

	.definition-section h3,
	.formula-section h3,
	.interpretation-section h3,
	.value-section h3,
	.calculation-section h3 {
		font-size: 1rem;
		font-weight: 600;
		color: var(--text-primary, #111827);
		margin-bottom: 0.5rem;
	}

	:global(:root.dark) .definition-section h3,
	:global(:root.dark) .formula-section h3,
	:global(:root.dark) .interpretation-section h3,
	:global(:root.dark) .value-section h3,
	:global(:root.dark) .calculation-section h3 {
		color: var(--text-primary);
	}

	.definition-section p,
	.interpretation-section p,
	.value-section p {
		color: var(--text-primary, #374151);
		line-height: 1.6;
		margin: 0;
	}

	:global(:root.dark) .definition-section p,
	:global(:root.dark) .interpretation-section p,
	:global(:root.dark) .value-section p {
		color: var(--text-primary);
	}

	.formula-section code {
		display: block;
		background: var(--bg-secondary, #f3f4f6);
		padding: 1rem;
		border-radius: 6px;
		font-family: 'Courier New', monospace;
		font-size: 0.9rem;
		color: var(--text-primary, #111827);
		border: 1px solid var(--border-color, #e0e0e0);
	}

	:global(:root.dark) .formula-section code {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border-color: var(--border-color);
	}

	.calculation-section pre {
		background: var(--bg-secondary, #f3f4f6);
		padding: 1rem;
		border-radius: 6px;
		font-family: 'Courier New', monospace;
		font-size: 0.85rem;
		color: var(--text-primary, #111827);
		border: 1px solid var(--border-color, #e0e0e0);
		white-space: pre-wrap;
		margin: 0;
	}

	:global(:root.dark) .calculation-section pre {
		background: var(--bg-secondary);
		color: var(--text-primary);
		border-color: var(--border-color);
	}
</style>
