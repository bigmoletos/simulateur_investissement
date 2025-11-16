<script lang="ts">
	import type { SimulationResult, Period } from '../types/index.js';
	import { Investment } from '../models/Investment.js';
	import { PlatformFees } from '../services/PlatformFees.js';
	import { TaxCalculator } from '../services/TaxCalculator.js';
	import { SimulationEngine } from '../services/SimulationEngine.js';

	export let investment: Investment;
	export let results: Record<Period, SimulationResult>;
	export let annualIncome: number = 15000;

	let expandedPeriod: Period | null = null;

	function togglePeriod(period: Period) {
		expandedPeriod = expandedPeriod === period ? null : period;
	}

	// Fonction helper pour obtenir les données d'une période
	function getPeriodData(period: string) {
		const periodKey = period as Period;
		const breakdown = getCalculationBreakdown(periodKey);
		const result = results[periodKey];
		return { periodKey, breakdown, result };
	}

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 2,
			maximumFractionDigits: 2
		}).format(value);
	}

	function formatPercentage(value: number): string {
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}

	function formatNumber(value: number, decimals: number = 2): string {
		return new Intl.NumberFormat('fr-FR', {
			minimumFractionDigits: decimals,
			maximumFractionDigits: decimals
		}).format(value);
	}

	// Calculs détaillés pour une période
	function getCalculationBreakdown(period: Period) {
		const result = results[period];
		if (!result) return null;

		const daysInPeriod = SimulationEngine.getDaysInPeriod(period);
		const daysInYear = 365;
		const periodReturn = (investment.expectedReturn / 100) * (daysInPeriod / daysInYear);
		// IMPORTANT: Le bras de levier multiplie uniquement le gain/perte, pas le montant investi
		const leveragedAmount = investment.amount * investment.leverage; // Montant exposé au marché (pour info)
		// Le levier multiplie uniquement le gain, pas le montant investi
		const grossGain = investment.amount * periodReturn * investment.leverage;

		const entryFees = PlatformFees.calculate(
			investment.platform,
			investment.amount,
			investment.assetType,
			investment.leverage,
			0 // monthlyVolume
		);

		// Calcul des frais de swap
		// Les frais de swap sont calculés sur le montant exposé au marché (montant investi × levier)
		let swapFees = 0;
		if (investment.leverage > 1) {
			const fees = PlatformFees.calculate(
				investment.platform,
				leveragedAmount, // Montant exposé au marché pour calcul des frais de swap
				investment.assetType,
				investment.leverage,
				0 // monthlyVolume
			);
			const dailySwapRate = fees.swapRate || 0;
			swapFees = leveragedAmount * dailySwapRate * daysInPeriod;
		}

		// Calcul des frais de sortie si on vend pour réinvestir/stabiliser
		const shouldSellForStabilization = SimulationEngine.shouldSellForStabilization(investment, period);
		const sellStrategy = investment.sellStrategy || 'reinvest';
		let exitFees = 0;
		let reentryFees = 0;
		let withdrawalFees = 0;

		if (shouldSellForStabilization) {
			const sellAmount = investment.amount + grossGain;
			const exitFeeBreakdown = PlatformFees.calculate(
				investment.platform,
				sellAmount,
				investment.assetType,
				investment.leverage,
				0
			);
			exitFees = exitFeeBreakdown.spread || exitFeeBreakdown.entry;

			// Frais de réentrée si stratégie = réinvestir
			if (sellStrategy === 'reinvest') {
				// Capital disponible après vente = capital initial + gain brut - frais d'entrée initiaux - frais de swap - frais de sortie
				const newCapitalAfterSale = investment.amount + grossGain - entryFees.total - swapFees - exitFees;
				const reentryFeeBreakdown = PlatformFees.calculate(
					investment.platform,
					newCapitalAfterSale,
					investment.assetType,
					investment.leverage,
					0
				);
				reentryFees = reentryFeeBreakdown.entry;
			}

			// Frais de retrait si stratégie = retirer
			if (sellStrategy === 'withdraw') {
				// Estimation préliminaire des frais de retrait
				const estimatedGainAfterFees = grossGain - entryFees.total - exitFees - swapFees;
				const estimatedTaxes = TaxCalculator.calculate(estimatedGainAfterFees, annualIncome);
				const estimatedWithdrawalAmount = estimatedGainAfterFees - estimatedTaxes.total;
				if (estimatedWithdrawalAmount > 0) {
					const withdrawalFeeBreakdown = PlatformFees.calculate(
						investment.platform,
						estimatedWithdrawalAmount,
						investment.assetType,
						investment.leverage,
						0
					);
					withdrawalFees = withdrawalFeeBreakdown.withdrawalFee || 0;
				}
			}
		}

		const gainAfterFees = grossGain - entryFees.total - exitFees - reentryFees - swapFees - withdrawalFees;
		const taxes = TaxCalculator.calculate(gainAfterFees, annualIncome);
		const netGain = gainAfterFees - taxes.total;
		const netReturn = (netGain / investment.amount) * 100;

		return {
			daysInPeriod,
			daysInYear,
			periodReturn,
			leveragedAmount,
			grossGain,
			entryFees,
			exitFees,
			reentryFees,
			withdrawalFees,
			swapFees,
			gainAfterFees,
			taxes,
			netGain,
			netReturn,
			shouldSellAndReinvest: shouldSellForStabilization
		};
	}
</script>

<div class="calculation-details">
	<h2>📊 Détail des Calculs</h2>
	<p class="subtitle">Cliquez sur une période pour voir le détail des calculs étape par étape (fermé par défaut)</p>

	<div class="periods-list">
		{#each ['daily', 'weekly', 'monthly', 'yearly'] as period}
			{#each [getPeriodData(period)] as periodData}
				{#if periodData.breakdown && periodData.result}
					<div class="period-card">
						<button
							class="period-header"
							class:expanded={expandedPeriod === periodData.periodKey}
							on:click={() => togglePeriod(periodData.periodKey)}
						>
						<span class="period-name">
							{periodData.periodKey === 'daily' ? 'Quotidien' : periodData.periodKey === 'weekly' ? 'Hebdomadaire' : periodData.periodKey === 'monthly' ? 'Mensuel' : 'Annuel'}
						</span>
						<span class="period-summary">
							Gain net: {formatCurrency(periodData.result.initialCapitalNetGain ?? periodData.result.netGain)} ({formatPercentage(periodData.result.netReturn)})
							{#if periodData.result.additionalCapitalAmount && periodData.result.additionalCapitalAmount > 0}
								<br><small class="calc-note">+ {formatCurrency(periodData.result.additionalCapitalAmount)} capital additionnel</small>
							{/if}
						</span>
						<span class="expand-icon">{expandedPeriod === periodData.periodKey ? '▼' : '▶'}</span>
					</button>

					{#if expandedPeriod === periodData.periodKey}
						<div class="calculation-breakdown">
							<!-- Étape 1: Paramètres de base -->
							<div class="calculation-step">
								<h3>1️⃣ Paramètres de base</h3>
								<table class="calc-table">
									<tr>
										<td>Montant investi</td>
										<td class="value">{formatCurrency(investment.amount)}</td>
									</tr>
									<tr>
										<td>Bras de levier</td>
										<td class="value">{formatNumber(investment.leverage, 1)}x</td>
									</tr>
									<tr>
										<td>Montant avec levier</td>
										<td class="value formula">
											{formatCurrency(investment.amount)} × {formatNumber(investment.leverage, 1)} = {formatCurrency(periodData.breakdown.leveragedAmount)}
										</td>
									</tr>
									<tr>
										<td>Rendement attendu annuel</td>
										<td class="value">{formatPercentage(investment.expectedReturn)}</td>
									</tr>
									<tr>
										<td>Nombre de jours dans la période</td>
										<td class="value">{periodData.breakdown.daysInPeriod} jour{periodData.breakdown.daysInPeriod > 1 ? 's' : ''}</td>
									</tr>
									<tr>
										<td>Nombre de jours dans l'année</td>
										<td class="value">{periodData.breakdown.daysInYear} jours</td>
									</tr>
								</table>
							</div>

							<!-- Étape 2: Calcul du rendement pour la période -->
							<div class="calculation-step">
								<h3>2️⃣ Rendement pour la période</h3>
								<table class="calc-table">
									<tr>
										<td>Rendement annuel</td>
										<td class="value">{formatPercentage(investment.expectedReturn)}</td>
									</tr>
									<tr>
										<td>Rendement pour la période</td>
										<td class="value formula">
											{formatPercentage(investment.expectedReturn)} × ({periodData.breakdown.daysInPeriod} / {periodData.breakdown.daysInYear}) = {formatPercentage(periodData.breakdown.periodReturn * 100)}
										</td>
									</tr>
								</table>
							</div>

							<!-- Étape 3: Gain brut -->
							<div class="calculation-step">
								<h3>3️⃣ Gain brut (avant frais et impôts)</h3>
								<table class="calc-table">
									<tr>
										<td>Montant avec levier</td>
										<td class="value">{formatCurrency(periodData.breakdown.leveragedAmount)}</td>
									</tr>
									<tr>
										<td>Rendement période</td>
										<td class="value">{formatPercentage(periodData.breakdown.periodReturn * 100)}</td>
									</tr>
									<tr>
										<td>Gain brut</td>
										<td class="value formula positive">
											{formatCurrency(investment.amount)} × {formatPercentage(periodData.breakdown.periodReturn * 100)} × {formatNumber(investment.leverage, 1)} = {formatCurrency(periodData.breakdown.grossGain)}
											<br><small class="calc-note">(Le levier multiplie uniquement le gain, pas le montant investi)</small>
										</td>
									</tr>
								</table>
							</div>

							<!-- Étape 4: Frais de transaction -->
							<div class="calculation-step">
								<h3>4️⃣ Frais de transaction ({investment.platform.toUpperCase()})</h3>
								<table class="calc-table">
									<tr>
										<td>Type d'actif</td>
										<td class="value">{investment.assetType === 'action' ? 'Action' : investment.assetType === 'etf' ? 'ETF' : 'Fonds'}</td>
									</tr>
									<tr>
										<td>Spread (taux: {formatPercentage((periodData.breakdown.entryFees.spreadRate || 0) * 100)})</td>
										<td class="value formula negative">
											{formatCurrency(investment.amount)} × {formatPercentage((periodData.breakdown.entryFees.spreadRate || 0) * 100)} = {formatCurrency(periodData.breakdown.entryFees.spread || 0)}
										</td>
									</tr>
									{#if periodData.breakdown.entryFees.commissionRate !== undefined && periodData.breakdown.entryFees.commissionRate > 0}
										<tr>
											<td>Commission (taux: {formatPercentage(periodData.breakdown.entryFees.commissionRate * 100)})</td>
											<td class="value formula negative">
												{formatCurrency(investment.amount)} × {formatPercentage(periodData.breakdown.entryFees.commissionRate * 100)} = {formatCurrency(periodData.breakdown.entryFees.commission || 0)}
											</td>
										</tr>
									{:else}
										<tr>
											<td>Commission</td>
											<td class="value formula">
												{investment.platform === 'xtb' ? '0% (gratuit jusqu\'à 100 000€/mois)' : '0% (gratuit sans limite)'}
											</td>
										</tr>
									{/if}
									<tr>
										<td>Frais d'entrée totaux</td>
										<td class="value formula negative">
											{formatCurrency(periodData.breakdown.entryFees.spread || 0)} + {formatCurrency(periodData.breakdown.entryFees.commission || 0)} = {formatCurrency(periodData.breakdown.entryFees.total)}
										</td>
									</tr>
								</table>
							</div>

							<!-- Étape 5: Frais de sortie (si réinvestissement) -->
							{#if periodData.breakdown.shouldSellAndReinvest}
								<div class="calculation-step">
									<h3>5️⃣ Frais de sortie (vente pour réinvestissement/retrait)</h3>
									<table class="calc-table">
										<tr>
											<td colspan="2" class="info-note">
												<small>💡 Stratégie: Vente à la fin de la période pour encaisser les gains et stabiliser la position</small>
											</td>
										</tr>
										<tr>
											<td>Montant vendu</td>
											<td class="value">{formatCurrency(investment.amount + periodData.breakdown.grossGain)}</td>
										</tr>
										<tr>
											<td>Spread à la vente (taux: {formatPercentage((periodData.breakdown.entryFees.spreadRate || 0) * 100)})</td>
											<td class="value formula negative">
												{formatCurrency(investment.amount + periodData.breakdown.grossGain)} × {formatPercentage((periodData.breakdown.entryFees.spreadRate || 0) * 100)} = {formatCurrency(periodData.breakdown.exitFees || 0)}
											</td>
										</tr>
										{#if periodData.breakdown.reentryFees}
											<tr>
												<td>Frais de réentrée (rachat)</td>
												<td class="value formula negative">
													{formatCurrency(investment.amount + periodData.breakdown.grossGain - periodData.breakdown.entryFees.total - periodData.breakdown.swapFees - (periodData.breakdown.exitFees || 0))} × {formatPercentage((periodData.breakdown.entryFees.spreadRate || 0) * 100)} = {formatCurrency(periodData.breakdown.reentryFees)}
												</td>
											</tr>
										{/if}
										{#if periodData.breakdown.withdrawalFees}
											<tr>
												<td>Frais de retrait</td>
												<td class="value formula negative">
													{formatCurrency(periodData.breakdown.withdrawalFees)}
													{#if investment.platform === 'etoro'}
														<small> (5$ par retrait sur eToro)</small>
													{:else}
														<small> (Gratuit sur XTB)</small>
													{/if}
												</td>
											</tr>
										{/if}
										<tr>
											<td colspan="2" class="info-note">
												<small>💡 {periodData.breakdown.reentryFees ? 'Après la vente, vous rachetez immédiatement avec le nouveau capital. Les frais de réentrée sont déduits du capital disponible.' : 'Après la vente, vous retirez les gains. Les frais de retrait sont déduits du montant retiré.'}</small>
											</td>
										</tr>
									</table>
								</div>
							{/if}

							<!-- Étape 6: Frais de swap (si levier > 1) -->
							{#if investment.leverage > 1}
								<div class="calculation-step">
									<h3>{periodData.breakdown.shouldSellAndReinvest ? '6️⃣' : '5️⃣'} Frais de swap overnight</h3>
									<table class="calc-table">
										<tr>
											<td>Montant exposé au marché</td>
											<td class="value">{formatCurrency(periodData.breakdown.leveragedAmount)}</td>
										</tr>
										<tr>
											<td>Taux de swap quotidien</td>
											<td class="value">{formatPercentage((periodData.breakdown.entryFees.swapRate || 0) * 100)}</td>
										</tr>
										<tr>
											<td>Nombre de jours</td>
											<td class="value">{periodData.breakdown.daysInPeriod} jour{periodData.breakdown.daysInPeriod > 1 ? 's' : ''}</td>
										</tr>
										<tr>
											<td>Frais de swap totaux</td>
											<td class="value formula negative">
												{formatCurrency(periodData.breakdown.leveragedAmount)} × {formatPercentage((periodData.breakdown.entryFees.swapRate || 0) * 100)} × {periodData.breakdown.daysInPeriod} = {formatCurrency(periodData.breakdown.swapFees)}
											</td>
										</tr>
										<tr>
											<td colspan="2" class="info-note">
												<small>💡 Les frais de swap sont calculés sur le montant exposé au marché (montant investi × levier)</small>
											</td>
										</tr>
									</table>
								</div>
							{/if}

							<!-- Étape 7: Gain après frais -->
							<div class="calculation-step">
								<h3>{investment.leverage > 1 ? (periodData.breakdown.shouldSellAndReinvest ? '7️⃣' : '6️⃣') : (periodData.breakdown.shouldSellAndReinvest ? '6️⃣' : '5️⃣')} Gain après frais</h3>
								<table class="calc-table">
									<tr>
										<td>Gain brut</td>
										<td class="value positive">{formatCurrency(periodData.breakdown.grossGain)}</td>
									</tr>
									<tr>
										<td>Frais d'entrée</td>
										<td class="value negative">-{formatCurrency(periodData.breakdown.entryFees.total)}</td>
									</tr>
									{#if periodData.breakdown.shouldSellAndReinvest && periodData.breakdown.exitFees}
										<tr>
											<td>Frais de sortie (vente)</td>
											<td class="value negative">-{formatCurrency(periodData.breakdown.exitFees)}</td>
										</tr>
									{/if}
									{#if periodData.breakdown.shouldSellAndReinvest && periodData.breakdown.reentryFees}
										<tr>
											<td>Frais de réentrée (rachat)</td>
											<td class="value negative">-{formatCurrency(periodData.breakdown.reentryFees)}</td>
										</tr>
									{/if}
									{#if periodData.breakdown.shouldSellAndReinvest && periodData.breakdown.withdrawalFees}
										<tr>
											<td>Frais de retrait</td>
											<td class="value negative">-{formatCurrency(periodData.breakdown.withdrawalFees)}</td>
										</tr>
									{/if}
									{#if investment.leverage > 1}
										<tr>
											<td>Frais de swap</td>
											<td class="value negative">-{formatCurrency(periodData.breakdown.swapFees)}</td>
										</tr>
									{/if}
									<tr>
										<td>Gain après frais</td>
										<td class="value formula {periodData.breakdown.gainAfterFees >= 0 ? 'positive' : 'negative'}">
											{formatCurrency(periodData.breakdown.grossGain)} - {formatCurrency(periodData.breakdown.entryFees.total + (periodData.breakdown.exitFees || 0) + (periodData.breakdown.reentryFees || 0) + (periodData.breakdown.withdrawalFees || 0) + periodData.breakdown.swapFees)} = {formatCurrency(periodData.breakdown.gainAfterFees)}
										</td>
									</tr>
								</table>
							</div>

							<!-- Étape 7: Impôts -->
							{#if periodData.breakdown.gainAfterFees > 0}
								<div class="calculation-step">
									<h3>{investment.leverage > 1 ? '7️⃣' : '6️⃣'} Impôts et prélèvements sociaux</h3>
									<table class="calc-table">
										<tr>
											<td>Gain après frais</td>
											<td class="value">{formatCurrency(periodData.breakdown.gainAfterFees)}</td>
										</tr>
										<tr>
											<td>Régime fiscal</td>
											<td class="value">
												{periodData.breakdown.taxes.taxRegime === 'PFU' ? 'PFU (Prélèvement Forfaitaire Unique)' : 'Barème Progressif (Option 2OP)'}
											</td>
										</tr>
										<tr>
											<td>Prélèvements sociaux (17.2%)</td>
											<td class="value formula negative">
												{formatCurrency(periodData.breakdown.gainAfterFees)} × 17.2% = {formatCurrency(periodData.breakdown.taxes.socialCharges)}
											</td>
										</tr>
										{#if periodData.breakdown.taxes.taxRegime === 'PFU'}
											<tr>
												<td>Impôt sur le revenu (PFU - 12.8%)</td>
												<td class="value formula negative">
													{formatCurrency(periodData.breakdown.gainAfterFees)} × 12.8% = {formatCurrency(periodData.breakdown.taxes.incomeTax)}
												</td>
											</tr>
										{:else if periodData.breakdown.taxes.taxBrackets && periodData.breakdown.taxes.taxBrackets.length > 0}
											<tr>
												<td colspan="2" class="brackets-header">
													<strong>Détail des tranches d'imposition:</strong>
												</td>
											</tr>
											{#each periodData.breakdown.taxes.taxBrackets as bracket}
												<tr>
													<td class="bracket-info">
														Tranche {formatCurrency(bracket.min)} - {bracket.max === 999999999 ? '∞' : formatCurrency(bracket.max)} ({formatPercentage(bracket.rate * 100)})
													</td>
													<td class="value formula negative">
														{formatCurrency(bracket.taxableAmount)} × {formatPercentage(bracket.rate * 100)} = {formatCurrency(bracket.taxAmount)}
													</td>
												</tr>
											{/each}
											<tr>
												<td>Impôt sur le revenu total (barème progressif)</td>
												<td class="value formula negative">
													{formatCurrency(periodData.breakdown.taxes.incomeTax)}
												</td>
											</tr>
										{:else if periodData.breakdown.taxes.incomeTax > 0}
											<tr>
												<td>Impôt sur le revenu</td>
												<td class="value formula negative">
													{formatCurrency(periodData.breakdown.taxes.incomeTax)}
												</td>
											</tr>
										{/if}
										<tr>
											<td>Total impôts</td>
											<td class="value formula negative large">
												{formatCurrency(periodData.breakdown.taxes.socialCharges)} + {formatCurrency(periodData.breakdown.taxes.incomeTax)} = {formatCurrency(periodData.breakdown.taxes.total)}
											</td>
										</tr>
									</table>
								</div>
							{/if}

							<!-- Étape 8: Gain net final -->
							<div class="calculation-step">
								<h3>{investment.leverage > 1 ? '8️⃣' : periodData.breakdown.gainAfterFees > 0 ? '7️⃣' : '6️⃣'} Gain net final</h3>
								<table class="calc-table">
									<tr>
										<td>Gain après frais</td>
										<td class="value">{formatCurrency(periodData.breakdown.gainAfterFees)}</td>
									</tr>
									{#if periodData.breakdown.gainAfterFees > 0}
										<tr>
											<td>Impôts totaux</td>
											<td class="value negative">-{formatCurrency(periodData.breakdown.taxes.total)}</td>
										</tr>
									{/if}
									<tr>
										<td>Gain net</td>
										<td class="value formula large {periodData.breakdown.netGain >= 0 ? 'positive' : 'negative'}">
											{formatCurrency(periodData.breakdown.gainAfterFees)} - {formatCurrency(periodData.breakdown.taxes.total)} = {formatCurrency(periodData.breakdown.netGain)}
										</td>
									</tr>
									<tr>
										<td>Rentabilité nette</td>
										<td class="value formula large {periodData.breakdown.netReturn >= 0 ? 'positive' : 'negative'}">
											({formatCurrency(periodData.breakdown.netGain)} / {formatCurrency(investment.amount)}) × 100 = {formatPercentage(periodData.breakdown.netReturn)}
										</td>
									</tr>
								</table>
							</div>

							<!-- Étape 9: Nouveau capital -->
							<div class="calculation-step">
								<h3>{investment.leverage > 1 ? '9️⃣' : periodData.breakdown.gainAfterFees > 0 ? '8️⃣' : '7️⃣'} Nouveau capital</h3>
								<table class="calc-table">
									<tr>
										<td>Capital initial</td>
										<td class="value">{formatCurrency(investment.amount)}</td>
									</tr>
									<tr>
										<td>Gain net (capital initial uniquement)</td>
										<td class="value {(periodData.result.initialCapitalNetGain ?? periodData.result.netGain) >= 0 ? 'positive' : 'negative'}">
											{(periodData.result.initialCapitalNetGain ?? periodData.result.netGain) >= 0 ? '+' : ''}{formatCurrency(periodData.result.initialCapitalNetGain ?? periodData.result.netGain)}
										</td>
									</tr>
									{#if periodData.result.additionalCapitalAmount && periodData.result.additionalCapitalAmount > 0}
										<tr>
											<td>Capital additionnel investi</td>
											<td class="value positive">
												+{formatCurrency(periodData.result.additionalCapitalAmount)}
											</td>
										</tr>
										<tr>
											<td>Gain net (capital additionnel)</td>
											<td class="value {periodData.result.additionalCapitalGain && periodData.result.additionalCapitalGain >= 0 ? 'positive' : 'negative'}">
												{periodData.result.additionalCapitalGain && periodData.result.additionalCapitalGain >= 0 ? '+' : ''}{formatCurrency(periodData.result.additionalCapitalGain ?? 0)}
											</td>
										</tr>
									{/if}
									<tr>
										<td>Gain net total</td>
										<td class="value {periodData.result.netGain >= 0 ? 'positive' : 'negative'}">
											{periodData.result.netGain >= 0 ? '+' : ''}{formatCurrency(periodData.result.netGain)}
										</td>
									</tr>
									<tr>
										<td>Nouveau capital</td>
										<td class="value formula large positive">
											{formatCurrency(investment.amount)} + {formatCurrency(periodData.result.initialCapitalNetGain ?? periodData.result.netGain)} + {formatCurrency(periodData.result.additionalCapitalAmount ?? 0)} = {formatCurrency(periodData.result.newCapital)}
										</td>
									</tr>
								</table>
							</div>
						</div>
					{/if}
					</div>
				{/if}
			{/each}
		{/each}
	</div>
</div>

<style>
	.calculation-details {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		margin-top: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	h2 {
		margin: 0 0 0.5rem 0;
		color: var(--text-primary, #333);
		font-size: 1.5rem;
		border-bottom: 2px solid #d4af37;
		padding-bottom: 0.5rem;
	}

	:global(:root.dark) h2 {
		color: var(--text-primary);
	}

	.subtitle {
		margin: 0.5rem 0 1.5rem 0;
		color: var(--text-secondary, #666);
		font-size: 0.9rem;
	}

	:global(:root.dark) .subtitle {
		color: var(--text-secondary);
	}

	.periods-list {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.period-card {
		border: 1px solid var(--border-color, #e0e0e0);
		border-radius: 8px;
		overflow: hidden;
		transition: box-shadow 0.2s;
		background: var(--bg-primary, white);
	}

	:global(:root.dark) .period-card {
		border-color: var(--border-color);
		background: var(--bg-primary);
	}

	.period-card:hover {
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.period-header {
		width: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1rem 1.5rem;
		background: var(--bg-secondary, #f8f9fa);
		border: none;
		cursor: pointer;
		text-align: left;
		font-size: 1rem;
		transition: background 0.2s;
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .period-header {
		background: var(--bg-secondary);
		color: var(--text-primary);
	}

	.period-header:hover {
		background: var(--bg-secondary, #e9ecef);
	}

	:global(:root.dark) .period-header:hover {
		background: var(--bg-secondary);
	}

	.period-header.expanded {
		background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
		color: white;
	}

	.period-name {
		font-weight: 700;
		flex: 0 0 150px;
	}

	.period-summary {
		flex: 1;
		margin: 0 1rem;
	}

	.expand-icon {
		flex: 0 0 30px;
		text-align: right;
		font-size: 0.8rem;
	}

	.calculation-breakdown {
		padding: 1.5rem;
		background: var(--bg-primary, white);
	}

	:global(:root.dark) .calculation-breakdown {
		background: var(--bg-primary);
	}

	.calculation-step {
		margin-bottom: 2rem;
		padding-bottom: 1.5rem;
		border-bottom: 1px dashed #e0e0e0;
	}

	.calculation-step:last-child {
		border-bottom: none;
		margin-bottom: 0;
		padding-bottom: 0;
	}

	.calculation-step h3 {
		margin: 0 0 1rem 0;
		color: var(--text-primary, #333);
		font-size: 1.1rem;
	}

	:global(:root.dark) .calculation-step h3 {
		color: var(--text-primary);
	}

	.calc-table {
		width: 100%;
		border-collapse: collapse;
	}

	.calc-table td {
		padding: 0.75rem;
		border-bottom: 1px solid var(--border-color, #f0f0f0);
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .calc-table td {
		border-bottom-color: var(--border-color);
		color: var(--text-primary);
	}

	.calc-table td:first-child {
		font-weight: 600;
		color: var(--text-primary, #555);
		width: 40%;
	}

	:global(:root.dark) .calc-table td:first-child {
		color: var(--text-primary);
	}

	.calc-table td.value {
		text-align: right;
		font-family: 'Courier New', monospace;
		color: var(--text-primary, #333);
	}

	:global(:root.dark) .calc-table td.value {
		color: var(--text-primary);
	}

	.calc-table td.formula {
		font-size: 0.9rem;
		color: var(--text-secondary, #666);
		font-style: italic;
	}

	:global(:root.dark) .calc-table td.formula {
		color: var(--text-secondary);
	}

	.calc-table td.positive {
		color: #10b981;
		font-weight: 600;
	}

	.calc-table td.negative {
		color: #ef4444;
		font-weight: 600;
	}

	.calc-table td.large {
		font-size: 1.1rem;
		font-weight: 700;
	}

	.calc-note {
		color: var(--text-secondary, #666);
		font-size: 0.85rem;
	}

	:global(:root.dark) .calc-note {
		color: var(--text-secondary);
	}
</style>

