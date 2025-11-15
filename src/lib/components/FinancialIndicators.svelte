<script lang="ts">
	import type { SimulationResult, Period } from '../types/index.js';
	import { Investment } from '../models/Investment.js';

	export let results: Record<Period, SimulationResult>;
	export let investment: Investment;

	// Calcul des indicateurs financiers
	$: yearlyResult = results?.yearly;
	$: monthlyResult = results?.monthly;

	$: roi = yearlyResult && yearlyResult.initialAmount > 0
		? ((yearlyResult.netGain / yearlyResult.initialAmount) * 100).toFixed(2)
		: '0.00';

	$: annualizedReturn = yearlyResult
		? yearlyResult.netReturn.toFixed(2)
		: '0.00';

	// Sharpe Ratio simplifié (sans volatilité pour l'instant)
	$: sharpeRatio = yearlyResult && yearlyResult.netReturn > 0
		? (yearlyResult.netReturn / Math.max(yearlyResult.netReturn * 0.1, 1)).toFixed(2)
		: '0.00';

	// Taux de réinvestissement effectif
	$: reinvestmentRate = yearlyResult && yearlyResult.netGain > 0
		? ((yearlyResult.reinvestment / yearlyResult.netGain) * 100).toFixed(1)
		: '0.0';

	// Efficacité fiscale (ratio gain net / gain brut)
	$: taxEfficiency = yearlyResult && yearlyResult.grossGain > 0
		? ((yearlyResult.netGain / yearlyResult.grossGain) * 100).toFixed(1)
		: '0.0';

	// Ratio frais / gain brut
	$: feeRatio = yearlyResult && yearlyResult.grossGain > 0
		? ((yearlyResult.fees.total / yearlyResult.grossGain) * 100).toFixed(2)
		: '0.00';

	// Gain moyen mensuel
	$: avgMonthlyGain = monthlyResult?.netGain || 0;

	// Projection sur 1 an avec réinvestissement
	$: projectedAnnualGain = monthlyResult
		? monthlyResult.netGain * 12
		: 0;

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function getIndicatorColor(value: number | null, threshold: number = 0): string {
		if (value === null || value === undefined) return '#999';
		if (value > threshold * 1.5) return '#10b981'; // Vert foncé - excellent
		if (value > threshold) return '#22c55e'; // Vert - bon
		if (value > threshold * 0.5) return '#eab308'; // Jaune - moyen
		return '#ef4444'; // Rouge - faible
	}
</script>

<div class="indicators-grid">
	<div class="indicator-card">
		<div class="indicator-label">ROI Annuel</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(roi) || 0, 10)}"
		>
			{roi}%
		</div>
		<div class="indicator-desc">Return on Investment</div>
	</div>

	<div class="indicator-card">
		<div class="indicator-label">Rentabilité Annualisée</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(annualizedReturn) || 0, 10)}"
		>
			{annualizedReturn}%
		</div>
		<div class="indicator-desc">Après frais et impôts</div>
	</div>

	<div class="indicator-card">
		<div class="indicator-label">Sharpe Ratio</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(sharpeRatio) || 0, 1)}"
		>
			{sharpeRatio}
		</div>
		<div class="indicator-desc">Ratio risque/rendement</div>
	</div>

	<div class="indicator-card">
		<div class="indicator-label">Efficacité Fiscale</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(parseFloat(taxEfficiency) || 0, 70)}"
		>
			{taxEfficiency}%
		</div>
		<div class="indicator-desc">Gain net / Gain brut</div>
	</div>

	<div class="indicator-card">
		<div class="indicator-label">Ratio Frais</div>
		<div
			class="indicator-value"
			style="color: {getIndicatorColor(100 - (parseFloat(feeRatio) || 0), 95)}"
		>
			{feeRatio}%
		</div>
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

<style>
	.indicators-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
		margin-top: 1rem;
	}

	.indicator-card {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		padding: 1.5rem;
		text-align: center;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.indicator-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
	}

	.indicator-label {
		font-size: 0.85rem;
		color: #666;
		margin-bottom: 0.5rem;
		font-weight: 600;
	}

	.indicator-value {
		font-size: 1.75rem;
		font-weight: 700;
		margin-bottom: 0.25rem;
	}

	.indicator-desc {
		font-size: 0.75rem;
		color: #999;
	}
</style>
