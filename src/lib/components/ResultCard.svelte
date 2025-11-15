<script lang="ts">
	import type { SimulationResult, Period } from '../types/index.js';

	export let period: Period;
	export let result: SimulationResult;

	const periodLabels: Record<Period, string> = {
		daily: 'Quotidien',
		weekly: 'Hebdomadaire',
		monthly: 'Mensuel',
		yearly: 'Annuel'
	};

	$: periodLabel = periodLabels[period] || period;

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value);
	}

	function formatPercentage(value: number): string {
		// Support pour des valeurs très élevées (100%, 1000%, etc.)
		if (Math.abs(value) >= 1000) {
			return `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`;
		} else if (Math.abs(value) >= 100) {
			return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
		}
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}
</script>

<div class="result-card">
	<div class="card-header">
		<h3>{periodLabel}</h3>
		<span class="period-badge">{result.daysInPeriod} jour(s)</span>
	</div>

	<div class="card-body">
		<div class="metric">
			<span class="metric-label">Gain brut</span>
			<span class="metric-value" class:positive={result.grossGain >= 0} class:negative={result.grossGain < 0}>
				{formatCurrency(result.grossGain)}
			</span>
		</div>

		<div class="metric">
			<span class="metric-label">Frais totaux</span>
			<span class="metric-value negative">-{formatCurrency(result.fees.total)}</span>
		</div>

		<div class="metric">
			<span class="metric-label">Impôts</span>
			<span class="metric-value negative">-{formatCurrency(result.taxes.total)}</span>
		</div>

		<div class="metric highlight">
			<span class="metric-label">Gain net</span>
			<span class="metric-value" class:positive={result.netGain >= 0} class:negative={result.netGain < 0}>
				{formatCurrency(result.netGain)}
			</span>
		</div>

		<div class="metric">
			<span class="metric-label">Rentabilité nette</span>
			<span class="metric-value" class:positive={result.netReturn >= 0} class:negative={result.netReturn < 0}>
				{formatPercentage(result.netReturn)}
			</span>
		</div>

		<div class="metric">
			<span class="metric-label">Nouveau capital</span>
			<span class="metric-value">{formatCurrency(result.newCapital)}</span>
		</div>

		{#if result.reinvestment > 0}
			<div class="reinvestment-badge">
				💰 Réinvestissement: {formatCurrency(result.reinvestment)}
			</div>
		{/if}
	</div>

	<div class="card-footer">
		<div class="stop-loss-info">
			<span>Stop Loss: {formatPercentage(result.stopLoss.percentage)}</span>
			<span class="risk-amount">Risque: {formatCurrency(result.stopLoss.potentialLoss)}</span>
		</div>
	</div>
</div>

<style>
	.result-card {
		background: white;
		border: 1px solid #e0e0e0;
		border-radius: 8px;
		overflow: hidden;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	.result-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.card-header {
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		padding: 1rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
	}

	.card-header h3 {
		margin: 0;
		font-size: 1.1rem;
	}

	.period-badge {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-size: 0.85rem;
	}

	.card-body {
		padding: 1rem;
	}

	.metric {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid #f0f0f0;
	}

	.metric:last-child {
		border-bottom: none;
	}

	.metric.highlight {
		background: #f8f9ff;
		margin: 0.5rem -1rem;
		padding-left: 1rem;
		padding-right: 1rem;
		border-top: 2px solid #667eea;
		border-bottom: 2px solid #667eea;
	}

	.metric-label {
		color: #666;
		font-size: 0.9rem;
	}

	.metric-value {
		font-weight: 600;
		font-size: 1rem;
	}

	.metric-value.positive {
		color: #10b981;
	}

	.metric-value.negative {
		color: #ef4444;
	}

	.reinvestment-badge {
		margin-top: 1rem;
		padding: 0.75rem;
		background: #fef3c7;
		border-left: 4px solid #f59e0b;
		border-radius: 4px;
		font-weight: 600;
		color: #92400e;
		text-align: center;
	}

	.card-footer {
		background: #f9fafb;
		padding: 0.75rem 1rem;
		border-top: 1px solid #e0e0e0;
	}

	.stop-loss-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.85rem;
		color: #666;
	}

	.risk-amount {
		color: #ef4444;
		font-weight: 600;
	}
</style>
