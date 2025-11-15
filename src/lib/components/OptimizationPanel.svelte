<script lang="ts">
	import { Investment } from '../models/Investment.js';
	import { SimulationEngine } from '../services/SimulationEngine.js';
	import { settings } from '../stores/settings.js';

	export let investment: Investment;

	$: annualIncome = $settings?.annualIncome || 30000;

	$: optimizationResult = SimulationEngine.optimize(
		{
			maxAmount: investment.amount * 2,
			maxRisk: Math.min(investment.leverage + 1, 10)
		},
		investment,
		annualIncome
	);

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function getFrequencyLabel(freq: string): string {
		const labels: Record<string, string> = {
			daily: 'Quotidien',
			weekly: 'Hebdomadaire',
			monthly: 'Mensuel',
			yearly: 'Annuel'
		};
		return labels[freq] || freq;
	}
</script>

<div class="optimization-panel">
	<div class="panel-header">
		<h3>💡 Recommandations d'Optimisation</h3>
		{#if optimizationResult.comparison.improvement > 0}
			<div class="improvement-badge positive">
				+{optimizationResult.comparison.improvement.toFixed(2)}% de rentabilité nette supplémentaire
			</div>
		{:else if optimizationResult.comparison.improvement < 0}
			<div class="improvement-badge negative">
				{optimizationResult.comparison.improvement.toFixed(2)}% de rentabilité nette
			</div>
		{/if}
	</div>

	<div class="recommendations-grid">
		<div class="recommendation-card">
			<div class="rec-header">
				<span class="rec-icon">💰</span>
				<div>
					<span class="rec-label">Montant optimal</span>
					<span class="rec-value">{formatCurrency(optimizationResult.amount)}</span>
				</div>
			</div>
			<div class="rec-justification">
				{optimizationResult.justifications.amount}
			</div>
		</div>

		<div class="recommendation-card">
			<div class="rec-header">
				<span class="rec-icon">⚖️</span>
				<div>
					<span class="rec-label">Bras de levier suggéré</span>
					<span class="rec-value">{optimizationResult.leverage}x</span>
				</div>
			</div>
			<div class="rec-justification">
				{optimizationResult.justifications.leverage}
			</div>
		</div>

		<div class="recommendation-card">
			<div class="rec-header">
				<span class="rec-icon">🔄</span>
				<div>
					<span class="rec-label">Fréquence de réinvestissement</span>
					<span class="rec-value">{getFrequencyLabel(optimizationResult.reinvestFrequency)}</span>
				</div>
			</div>
			<div class="rec-justification">
				{optimizationResult.justifications.reinvestFrequency}
			</div>
		</div>

		<div class="recommendation-card">
			<div class="rec-header">
				<span class="rec-icon">🛡️</span>
				<div>
					<span class="rec-label">Stop Loss recommandé</span>
					<span class="rec-value">{optimizationResult.stopLoss}%</span>
				</div>
			</div>
			<div class="rec-justification">
				{optimizationResult.justifications.stopLoss}
			</div>
		</div>
	</div>

	{#if optimizationResult.leverage > 5}
		<div class="risk-warning">
			<strong>⚠️ Attention:</strong> Un bras de levier élevé (>5x) augmente significativement les risques.
			Assurez-vous de bien comprendre les mécanismes avant d'investir.
		</div>
	{/if}

	<div class="comparison-box">
		<h4>📊 Comparaison avec votre configuration actuelle</h4>
		<div class="comparison-grid">
			<div class="comparison-item">
				<span class="comparison-label">Rentabilité nette actuelle:</span>
				<span class="comparison-value">{optimizationResult.comparison.currentNetReturn.toFixed(2)}%</span>
			</div>
			<div class="comparison-item">
				<span class="comparison-label">Rentabilité nette optimisée:</span>
				<span class="comparison-value optimized">{optimizationResult.comparison.optimizedNetReturn.toFixed(2)}%</span>
			</div>
			<div class="comparison-item highlight">
				<span class="comparison-label">Amélioration potentielle:</span>
				<span class="comparison-value {optimizationResult.comparison.improvement >= 0 ? 'positive' : 'negative'}">
					{optimizationResult.comparison.improvement >= 0 ? '+' : ''}{optimizationResult.comparison.improvement.toFixed(2)}%
				</span>
			</div>
		</div>
	</div>

	<div class="info-box">
		<p>
			<strong>ℹ️ Méthodologie:</strong> Ces recommandations sont calculées en comparant différents scénarios d'investissement
			en tenant compte des frais réels des plateformes (spread, commission, swap), des impôts français (PFU 30%),
			et en optimisant le ratio rentabilité/risque. Les calculs sont basés sur vos paramètres actuels et les contraintes que vous avez définies.
		</p>
		<p style="margin-top: 0.5rem;">
			<strong>⚠️ Avertissement:</strong> Ces recommandations sont indicatives et ne constituent pas un conseil en investissement.
			Consultez un conseiller financier pour des recommandations personnalisées adaptées à votre situation.
		</p>
	</div>
</div>

<style>
	.optimization-panel {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.panel-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.panel-header h3 {
		margin: 0;
		font-size: 1.5rem;
		color: #111827;
	}

	.improvement-badge {
		padding: 0.5rem 1rem;
		border-radius: 6px;
		font-weight: 600;
		font-size: 0.9rem;
	}

	.improvement-badge.positive {
		background: #d1fae5;
		color: #065f46;
	}

	.improvement-badge.negative {
		background: #fee2e2;
		color: #991b1b;
	}

	.recommendations-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
		gap: 1.5rem;
	}

	.recommendation-card {
		display: flex;
		flex-direction: column;
		padding: 1.25rem;
		background: #f8f9ff;
		border: 1px solid #e5e7eb;
		border-left: 4px solid #667eea;
		border-radius: 6px;
		transition: box-shadow 0.2s;
	}

	.recommendation-card:hover {
		box-shadow: 0 4px 12px rgba(102, 126, 234, 0.15);
	}

	.rec-header {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1rem;
	}

	.rec-icon {
		font-size: 2rem;
		line-height: 1;
	}

	.rec-header > div {
		display: flex;
		flex-direction: column;
		flex: 1;
	}

	.rec-label {
		font-size: 0.85rem;
		color: #6b7280;
		margin-bottom: 0.25rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.rec-value {
		font-size: 1.5rem;
		font-weight: 700;
		color: #667eea;
	}

	.rec-justification {
		font-size: 0.9rem;
		color: #374151;
		line-height: 1.6;
		padding-top: 0.75rem;
		border-top: 1px solid #e5e7eb;
	}

	.risk-warning {
		padding: 1rem;
		background: #fef3c7;
		border-left: 4px solid #f59e0b;
		border-radius: 6px;
		color: #92400e;
		font-size: 0.9rem;
	}

	.comparison-box {
		padding: 1.25rem;
		background: #f9fafb;
		border: 1px solid #e5e7eb;
		border-radius: 6px;
	}

	.comparison-box h4 {
		margin: 0 0 1rem 0;
		font-size: 1.1rem;
		color: #111827;
	}

	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
		gap: 1rem;
	}

	.comparison-item {
		display: flex;
		flex-direction: column;
		padding: 0.75rem;
		background: white;
		border-radius: 4px;
	}

	.comparison-item.highlight {
		background: #eff6ff;
		border: 2px solid #3b82f6;
	}

	.comparison-label {
		font-size: 0.85rem;
		color: #6b7280;
		margin-bottom: 0.5rem;
	}

	.comparison-value {
		font-size: 1.25rem;
		font-weight: 700;
		color: #111827;
	}

	.comparison-value.optimized {
		color: #667eea;
	}

	.comparison-value.positive {
		color: #10b981;
	}

	.comparison-value.negative {
		color: #ef4444;
	}

	.info-box {
		padding: 1rem;
		background: #f0f9ff;
		border-left: 4px solid #0ea5e9;
		border-radius: 6px;
		color: #0c4a6e;
		font-size: 0.85rem;
		line-height: 1.6;
	}

	.info-box p {
		margin: 0;
	}

	.info-box p + p {
		margin-top: 0.5rem;
	}
</style>
