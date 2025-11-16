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
		{#if result.takeProfit}
			<div class="take-profit-info">
				<span>Take Profit: {formatPercentage(result.takeProfit.percentage)}</span>
				<span class="profit-amount">Gain potentiel: {formatCurrency(result.takeProfit.potentialGain)}</span>
			</div>
		{/if}
	</div>
</div>

<style>
	.result-card {
		background: var(--bg-primary, white);
		border: 1px solid var(--border-color, #e0e0e0);
		border-radius: 6px;
		overflow: hidden;
		transition: transform 0.2s, box-shadow 0.2s;
	}

	:global(:root.dark) .result-card {
		background: var(--bg-primary);
		border-color: var(--border-color);
	}

	.result-card:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
	}

	.card-header {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		background-image: 
			radial-gradient(circle at 30% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 60%);
		color: #f5f5f5;
		padding: 0.5rem;
		display: flex;
		justify-content: space-between;
		align-items: center;
		border-bottom: 1px solid rgba(255, 215, 0, 0.15);
	}

	.card-header h3 {
		margin: 0;
		font-size: 0.85rem;
	}

	.period-badge {
		background: rgba(255, 255, 255, 0.2);
		padding: 0.15rem 0.35rem;
		border-radius: 3px;
		font-size: 0.7rem;
	}

	.card-body {
		padding: 0.5rem;
		background: var(--bg-primary, white);
	}

	:global(:root.dark) .card-body {
		background: var(--bg-primary);
	}

	.metric {
		display: flex;
		justify-content: space-between;
		padding: 0.35rem 0;
		border-bottom: 1px solid var(--border-color, #f0f0f0);
	}

	:global(:root.dark) .metric {
		border-bottom-color: var(--border-color);
	}

	.metric:last-child {
		border-bottom: none;
	}

	.metric.highlight {
		background: var(--bg-secondary, #f8f9ff);
		margin: 0.25rem -0.5rem;
		padding-left: 0.5rem;
		padding-right: 0.5rem;
		border-top: 2px solid #d4af37;
		border-bottom: 2px solid #d4af37;
	}

	:global(:root.dark) .metric.highlight {
		background: var(--bg-secondary);
	}

	.metric-label {
		color: var(--text-secondary, #666);
		font-size: 0.75rem;
	}

	:global(:root.dark) .metric-label {
		color: var(--text-secondary);
	}

	.metric-value {
		font-weight: 600;
		font-size: 0.85rem;
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .metric-value {
		color: var(--text-primary);
	}

	.metric-value.positive {
		color: #10b981;
	}

	.metric-value.negative {
		color: #ef4444;
	}

	.reinvestment-badge {
		margin-top: 0.5rem;
		padding: 0.4rem;
		background: #fef3c7;
		border-left: 3px solid #f59e0b;
		border-radius: 3px;
		font-weight: 600;
		color: #92400e;
		text-align: center;
		font-size: 0.7rem;
	}

	.card-footer {
		background: var(--bg-secondary, #f9fafb);
		padding: 0.4rem 0.5rem;
		border-top: 1px solid var(--border-color, #e0e0e0);
	}

	:global(:root.dark) .card-footer {
		background: var(--bg-secondary);
		border-top-color: var(--border-color);
	}

	.stop-loss-info,
	.take-profit-info {
		display: flex;
		justify-content: space-between;
		font-size: 0.7rem;
		color: var(--text-secondary, #666);
		margin-top: 0.25rem;
	}

	:global(:root.dark) .stop-loss-info,
	:global(:root.dark) .take-profit-info {
		color: var(--text-secondary);
	}

	.take-profit-info {
		color: #10b981;
	}

	:global(:root.dark) .take-profit-info {
		color: #22c55e;
	}

	.profit-amount {
		font-weight: 600;
		color: #10b981;
	}

	:global(:root.dark) .profit-amount {
		color: #22c55e;
	}

	.risk-amount {
		color: #ef4444;
		font-weight: 600;
	}
</style>
