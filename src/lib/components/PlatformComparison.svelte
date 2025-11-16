<script lang="ts">
	import type { SimulationResult, Period } from '../types/index.js';
	import { Investment as InvestmentModel } from '../models/Investment.js';
	import { SimulationEngine } from '../services/SimulationEngine.js';
	import { PlatformFees } from '../services/PlatformFees.js';

	export let baseInvestment: InvestmentModel;

	let xtbInvestment: InvestmentModel;
	let etoroInvestment: InvestmentModel;
	let xtbResults: Record<Period, SimulationResult> | null = null;
	let etoroResults: Record<Period, SimulationResult> | null = null;

	$: if (baseInvestment) {
		// S'assurer que le montant est positif et que tous les champs sont valides
		const amount = baseInvestment.amount > 0 ? baseInvestment.amount : 1000;
		const leverage = baseInvestment.leverage >= 1 && baseInvestment.leverage <= 10
			? baseInvestment.leverage
			: Math.max(1, Math.min(10, baseInvestment.leverage || 1));

		// Créer des investissements valides avec tous les champs requis
		xtbInvestment = new InvestmentModel({
			amount,
			assetType: baseInvestment.assetType || 'action',
			platform: 'xtb',
			leverage,
			stopLoss: baseInvestment.stopLoss || 5,
			expectedReturn: baseInvestment.expectedReturn || 0,
			reinvestFrequency: baseInvestment.reinvestFrequency || 'monthly',
			monthlyCapitalAddition: baseInvestment.monthlyCapitalAddition || 0
		});

		etoroInvestment = new InvestmentModel({
			amount,
			assetType: baseInvestment.assetType || 'action',
			platform: 'etoro',
			leverage,
			stopLoss: baseInvestment.stopLoss || 5,
			expectedReturn: baseInvestment.expectedReturn || 0,
			reinvestFrequency: baseInvestment.reinvestFrequency || 'monthly',
			monthlyCapitalAddition: baseInvestment.monthlyCapitalAddition || 0
		});

		// Vérifier que les investissements sont valides avant de calculer
		const xtbValidation = xtbInvestment.validate();
		const etoroValidation = etoroInvestment.validate();

		if (xtbValidation.valid && etoroValidation.valid) {
			calculateComparison();
		} else {
			console.warn('Investissements invalides pour comparaison', {
				xtb: xtbValidation.errors,
				etoro: etoroValidation.errors,
				baseInvestment: {
					amount: baseInvestment.amount,
					leverage: baseInvestment.leverage,
					assetType: baseInvestment.assetType
				}
			});
		}
	}

	function calculateComparison() {
		if (!xtbInvestment || !etoroInvestment) {
			console.log('Comparaison annulée: investissements non initialisés');
			return;
		}

		try {
			const annualIncome = 15000; // Revenu annuel par défaut pour calcul des impôts
			xtbResults = SimulationEngine.simulateAllPeriods(xtbInvestment, annualIncome);
			etoroResults = SimulationEngine.simulateAllPeriods(etoroInvestment, annualIncome);
		} catch (error) {
			console.error('Erreur lors de la comparaison', error);
			if (error instanceof Error) {
				console.error('Détails de l\'erreur:', error.message, error.stack);
			}
		}
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
	}

	function formatPercentage(value: number): string {
		if (Math.abs(value) >= 1000) {
			return `${value >= 0 ? '+' : ''}${value.toFixed(0)}%`;
		} else if (Math.abs(value) >= 100) {
			return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`;
		}
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}

	// Calcul des frais détaillés
	$: xtbFees = baseInvestment ? PlatformFees.calculate('xtb', baseInvestment.amount, baseInvestment.assetType, baseInvestment.leverage, 0) : null;
	$: etoroFees = baseInvestment ? PlatformFees.calculate('etoro', baseInvestment.amount, baseInvestment.assetType, baseInvestment.leverage, 0) : null;

	// Comparaison annuelle
	$: xtbYearly = xtbResults?.yearly;
	$: etoroYearly = etoroResults?.yearly;
	$: difference = xtbYearly && etoroYearly ? xtbYearly.netGain - etoroYearly.netGain : 0;
	$: bestPlatform = difference > 0 ? 'XTB' : 'eToro';
</script>

<div class="platform-comparison">
	<h3>📊 Comparaison XTB vs eToro</h3>

	<!-- Comparaison des frais -->
	<div class="fees-comparison">
		<h4>Frais détaillés</h4>
		<div class="fees-grid">
			<div class="fee-card">
				<div class="fee-header xtb">XTB</div>
				<div class="fee-details">
					<div class="fee-item">
						<span class="fee-label">Spread (entrée)</span>
						<span class="fee-value">{formatCurrency(xtbFees.entry)}</span>
					</div>
					<div class="fee-item">
						<span class="fee-label">Swap/jour (levier {baseInvestment.leverage}x)</span>
						<span class="fee-value">{formatPercentage(xtbFees.swapRate * 100)}</span>
					</div>
					<div class="fee-item">
						<span class="fee-label">Frais de retrait</span>
						<span class="fee-value">{formatCurrency(xtbFees.withdrawalFee || 0)}</span>
					</div>
					<div class="fee-item total">
						<span class="fee-label">Total frais annuel (estimé)</span>
						<span class="fee-value">{formatCurrency((xtbFees.entry + (xtbFees.swapRate * baseInvestment.amount * baseInvestment.leverage * 365)))}</span>
					</div>
				</div>
			</div>

			<div class="fee-card">
				<div class="fee-header etoro">eToro</div>
				<div class="fee-details">
					<div class="fee-item">
						<span class="fee-label">Spread (entrée)</span>
						<span class="fee-value">{formatCurrency(etoroFees.entry)}</span>
					</div>
					<div class="fee-item">
						<span class="fee-label">Swap/jour (levier {baseInvestment.leverage}x)</span>
						<span class="fee-value">{formatPercentage(etoroFees.swapRate * 100)}</span>
					</div>
					<div class="fee-item">
						<span class="fee-label">Frais de retrait</span>
						<span class="fee-value">{formatCurrency(etoroFees.withdrawalFee || 0)}</span>
					</div>
					<div class="fee-item total">
						<span class="fee-label">Total frais annuel (estimé)</span>
						<span class="fee-value">{formatCurrency((etoroFees.entry + (etoroFees.swapRate * baseInvestment.amount * baseInvestment.leverage * 365)))}</span>
					</div>
				</div>
			</div>
		</div>
	</div>

	<!-- Comparaison des résultats -->
	{#if xtbYearly && etoroYearly}
		<div class="results-comparison">
			<h4>Résultats annuels comparés</h4>
			<div class="comparison-grid">
				<div class="comparison-card">
					<div class="comparison-header xtb">XTB</div>
					<div class="comparison-metrics">
						<div class="metric">
							<span class="metric-label">Gain net annuel</span>
							<span class="metric-value positive">{formatCurrency(xtbYearly.netGain)}</span>
						</div>
						<div class="metric">
							<span class="metric-label">Rentabilité nette</span>
							<span class="metric-value positive">{formatPercentage(xtbYearly.netReturn)}</span>
						</div>
						<div class="metric">
							<span class="metric-label">Frais totaux</span>
							<span class="metric-value negative">-{formatCurrency(xtbYearly.fees.total)}</span>
						</div>
					</div>
				</div>

				<div class="comparison-card">
					<div class="comparison-header etoro">eToro</div>
					<div class="comparison-metrics">
						<div class="metric">
							<span class="metric-label">Gain net annuel</span>
							<span class="metric-value positive">{formatCurrency(etoroYearly.netGain)}</span>
						</div>
						<div class="metric">
							<span class="metric-label">Rentabilité nette</span>
							<span class="metric-value positive">{formatPercentage(etoroYearly.netReturn)}</span>
						</div>
						<div class="metric">
							<span class="metric-label">Frais totaux</span>
							<span class="metric-value negative">-{formatCurrency(etoroYearly.fees.total)}</span>
						</div>
					</div>
				</div>
			</div>

			{#if xtbYearly && etoroYearly}
				<div class="winner-banner" class:xtb-winner={difference > 0} class:etoro-winner={difference < 0}>
					{#if Math.abs(difference) > 1}
						<strong>🏆 {bestPlatform} est plus rentable</strong>
						<span class="difference">
							Écart: {formatCurrency(Math.abs(difference))} ({formatPercentage((Math.abs(difference) / Math.max(Math.abs(xtbYearly.netGain), Math.abs(etoroYearly.netGain), 1)) * 100)})
						</span>
					{:else}
						<strong>⚖️ Les deux plateformes sont équivalentes</strong>
						<span class="difference">Écart négligeable</span>
					{/if}
				</div>
			{/if}
		</div>
	{/if}
</div>

<style>
	.platform-comparison {
		background: var(--bg-primary, white);
		border-radius: 8px;
		padding: 1.5rem;
		margin-top: 2rem;
		box-shadow: 0 2px 8px var(--shadow, rgba(0, 0, 0, 0.1));
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .platform-comparison {
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.platform-comparison h3 {
		margin: 0 0 1.5rem 0;
		color: var(--text-primary, #333);
		font-size: 1.5rem;
		border-bottom: 2px solid #d4af37;
		padding-bottom: 0.5rem;
	}

	:global(:root.dark) .platform-comparison h3 {
		color: var(--text-primary);
	}

	.platform-comparison h4 {
		margin: 1.5rem 0 1rem 0;
		color: var(--text-primary, #555);
		font-size: 1.1rem;
	}

	:global(:root.dark) .platform-comparison h4 {
		color: var(--text-primary);
	}

	.fees-grid,
	.comparison-grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
		gap: 1.5rem;
		margin-top: 1rem;
	}

	.fee-card,
	.comparison-card {
		border: 2px solid var(--border-color, #e0e0e0);
		border-radius: 8px;
		overflow: hidden;
		background: var(--bg-primary, white);
	}

	:global(:root.dark) .fee-card,
	:global(:root.dark) .comparison-card {
		border-color: var(--border-color);
		background: var(--bg-primary);
	}

	.fee-header,
	.comparison-header {
		padding: 1rem;
		font-weight: 700;
		font-size: 1.1rem;
		text-align: center;
		color: white;
	}

	.fee-header.xtb,
	.comparison-header.xtb {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		background-image: 
			radial-gradient(circle at 30% 50%, rgba(255, 215, 0, 0.1) 0%, transparent 60%);
	}

	.fee-header.etoro,
	.comparison-header.etoro {
		background: linear-gradient(135deg, #51cf66 0%, #40c057 100%);
	}

	.fee-details,
	.comparison-metrics {
		padding: 1rem;
		background: var(--bg-primary, white);
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .fee-details,
	:global(:root.dark) .comparison-metrics {
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.fee-item,
	.metric {
		display: flex;
		justify-content: space-between;
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--border-color, #f0f0f0);
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .fee-item,
	:global(:root.dark) .metric {
		border-bottom-color: var(--border-color);
		color: var(--text-primary);
	}

	.fee-item:last-child,
	.metric:last-child {
		border-bottom: none;
	}

	.fee-item.total {
		background: var(--bg-secondary, #f8f9ff);
		margin: 0.5rem -1rem;
		padding-left: 1rem;
		padding-right: 1rem;
		border-top: 2px solid #d4af37;
		font-weight: 600;
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .fee-item.total {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.fee-label,
	.metric-label {
		color: var(--text-secondary, #666);
		font-size: 0.9rem;
	}

	:global(:root.dark) .fee-label,
	:global(:root.dark) .metric-label {
		color: var(--text-secondary);
	}

	.fee-value,
	.metric-value {
		font-weight: 600;
		font-size: 1rem;
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .fee-value,
	:global(:root.dark) .metric-value {
		color: var(--text-primary);
	}

	.metric-value.positive {
		color: #10b981;
	}

	.metric-value.negative {
		color: #ef4444;
	}

	.winner-banner {
		margin-top: 1.5rem;
		padding: 1rem 1.5rem;
		border-radius: 8px;
		text-align: center;
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.winner-banner.xtb-winner {
		background: linear-gradient(135deg, rgba(26, 26, 46, 0.1) 0%, rgba(22, 33, 62, 0.1) 100%);
		border: 2px solid #d4af37;
	}

	.winner-banner.etoro-winner {
		background: linear-gradient(135deg, rgba(81, 207, 102, 0.1) 0%, rgba(64, 192, 87, 0.1) 100%);
		border: 2px solid #51cf66;
	}

	.winner-banner strong {
		font-size: 1.1rem;
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .winner-banner strong {
		color: var(--text-primary);
	}

	.difference {
		font-size: 0.9rem;
		color: var(--text-secondary, #666);
	}

	:global(:root.dark) .difference {
		color: var(--text-secondary);
	}
</style>

