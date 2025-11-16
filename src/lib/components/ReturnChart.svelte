<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { SimulationResult, Period } from '../types/index.js';
	import { SimulationEngine } from '../services/SimulationEngine.js';
	import { currentInvestment } from '../stores/simulation.js';
	import { settings } from '../stores/settings.js';

	export let results: Record<Period, SimulationResult>;

	let Chart: any = null;
	let chartCanvas: HTMLCanvasElement;
	let chartInstance: any = null;
	let chartLoaded = false;
	let selectedPeriod: Period = 'monthly';

	const periods = ['daily', 'weekly', 'monthly', 'yearly'] as const;
	const periodLabels = {
		daily: 'Quotidien',
		weekly: 'Hebdomadaire',
		monthly: 'Mensuel',
		yearly: 'Annuel'
	};

	// Nombre de périodes à afficher selon la période sélectionnée
	const periodsToShow: Record<Period, number> = {
		daily: 30, // 30 jours
		weekly: 52, // 52 semaines (1 an)
		monthly: 12, // 12 mois (1 an)
		yearly: 5 // 5 ans
	};

	// Données calculées pour la période sélectionnée
	// Réactif à $currentInvestment, $settings, et selectedPeriod
	$: consecutiveResults = (() => {
		if (!browser || !$currentInvestment || !$settings) return [];
		try {
			return SimulationEngine.simulateConsecutivePeriods(
				$currentInvestment,
				selectedPeriod,
				periodsToShow[selectedPeriod],
				$settings.annualIncome
			);
		} catch (error) {
			console.error('Erreur lors du calcul des périodes consécutives', error);
			return [];
		}
	})();

	// Réactivité unifiée pour mettre à jour le graphique
	// Se déclenche quand : $currentInvestment, $settings, selectedPeriod, ou consecutiveResults changent
	$: if (browser && chartLoaded && chartCanvas && consecutiveResults.length > 0 && $currentInvestment && $settings) {
		// Utiliser requestAnimationFrame pour s'assurer que le DOM est prêt
		requestAnimationFrame(() => {
			setTimeout(() => {
				updateChart();
			}, 50);
		});
	}

	function formatPercentage(value: number): string {
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}

	// Génère des dates réelles basées sur la période sélectionnée
	function generateDateLabels(): string[] {
		const startDate = new Date();
		const labels: string[] = [];

		for (let i = 0; i < consecutiveResults.length; i++) {
			const date = new Date(startDate);

			switch (selectedPeriod) {
				case 'daily':
					date.setDate(startDate.getDate() + i);
					labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
					break;
				case 'weekly':
					date.setDate(startDate.getDate() + (i * 7));
					labels.push(date.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }));
					break;
				case 'monthly':
					date.setMonth(startDate.getMonth() + i);
					labels.push(date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }));
					break;
				case 'yearly':
					date.setFullYear(startDate.getFullYear() + i);
					labels.push(date.toLocaleDateString('fr-FR', { year: 'numeric' }));
					break;
				default:
					labels.push(`Période ${i + 1}`);
			}
		}

		return labels;
	}

	function updateChart() {
		if (!browser || !Chart || !chartCanvas || !consecutiveResults || consecutiveResults.length === 0) {
			console.log('ReturnChart update skipped: missing browser, Chart, canvas or results', { chartCanvas: !!chartCanvas, results: consecutiveResults?.length });
			return;
		}

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) {
			console.log('ReturnChart update skipped: no 2d context');
			return;
		}

		// Générer les labels avec des dates réelles
		const labels = generateDateLabels();

		const netReturns = consecutiveResults.map((result) => {
			return result?.netReturn || 0; // Déjà calculé sur capital initial uniquement
		});

		const grossReturns = consecutiveResults.map((result) => {
			if (!result || !result.initialAmount || result.initialAmount === 0) return 0;
			// Utiliser initialCapitalGain pour la rentabilité brute sur capital initial uniquement
			// Fallback sur grossGain si initialCapitalGain n'existe pas (rétrocompatibilité)
			const initialGain = result.initialCapitalGain ?? result.grossGain;
			return (initialGain / result.initialAmount) * 100;
		});

		// Calcul de la moyenne
		const avgNetReturn = netReturns.reduce((a, b) => a + b, 0) / netReturns.length;

		console.log('Updating ReturnChart', { labels, netReturns, grossReturns, avgNetReturn, selectedPeriod });

		// Détruire l'instance précédente si elle existe
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		// Détecter le thème actuel
		const isDark = document.documentElement.classList.contains('dark');
		const textColor = isDark ? '#f5f5f5' : '#1a1a2e';
		const gridColor = isDark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';

		chartInstance = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Rentabilité brute (%)',
						data: grossReturns,
						backgroundColor: 'rgba(59, 130, 246, 0.7)', // Bleu plus foncé et contrasté
						borderColor: '#3b82f6',
						borderWidth: 2
					},
					{
						label: 'Rentabilité nette (%)',
						data: netReturns,
						backgroundColor: 'rgba(16, 185, 129, 0.7)', // Vert émeraude plus foncé
						borderColor: '#10b981',
						borderWidth: 2
					},
					{
						label: 'Moyenne rentabilité nette',
						data: Array(consecutiveResults.length).fill(avgNetReturn),
						type: 'line',
						borderColor: '#ef4444', // Rouge plus foncé
						borderDash: [5, 5],
						borderWidth: 2,
						pointRadius: 0,
						fill: false
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top',
						labels: {
							color: textColor,
							font: {
								size: 12,
								weight: '600'
							},
							padding: 12,
							usePointStyle: true
						}
					},
					title: {
						display: true,
						text: `Rentabilité nette par période (${periodLabels[selectedPeriod]}) (%)`,
						color: textColor,
						font: {
							size: 16,
							weight: '700'
						},
						padding: {
							top: 10,
							bottom: 20
						}
					},
					tooltip: {
						backgroundColor: isDark ? 'rgba(26, 26, 46, 0.95)' : 'rgba(255, 255, 255, 0.95)',
						titleColor: textColor,
						bodyColor: textColor,
						borderColor: '#d4af37',
						borderWidth: 1,
						padding: 12,
						callbacks: {
							label: function (context) {
								const value = context.parsed.y;
								if (value === null || value === undefined) return `${context.dataset.label}: N/A`;
								return `${context.dataset.label}: ${formatPercentage(Number(value))}`;
							}
						}
					}
				},
				scales: {
					x: {
						ticks: {
							color: textColor,
							font: {
								size: 11,
								weight: '500'
							}
						},
						grid: {
							color: gridColor
						}
					},
					y: {
						beginAtZero: false,
						ticks: {
							color: textColor,
							font: {
								size: 11,
								weight: '500'
							},
							callback: function (value) {
								return formatPercentage(Number(value));
							}
						},
						grid: {
							color: gridColor
						},
						title: {
							display: true,
							text: 'Rentabilité (%)',
							color: textColor,
							font: {
								size: 12,
								weight: '600'
							}
						}
					}
				}
			}
		});
	}

	onMount(async () => {
		if (!browser) return;

		// Charger les paramètres si nécessaire
		if (!$settings) {
			await settings.load();
		}

		// Charger Chart.js uniquement côté client
		try {
			const chartJs = await import('chart.js');
			Chart = chartJs.Chart;
			const {
				CategoryScale,
				LinearScale,
				PointElement,
				LineElement,
				LineController,
				BarElement,
				BarController,
				Title,
				Tooltip,
				Legend
			} = chartJs;

			Chart.register(
				CategoryScale,
				LinearScale,
				PointElement,
				LineElement,
				LineController,
				BarElement,
				BarController,
				Title,
				Tooltip,
				Legend
			);

			chartLoaded = true;

			setTimeout(() => {
				if (chartCanvas && $currentInvestment && consecutiveResults.length > 0) {
					updateChart();
				}
			}, 300);
		} catch (error) {
			console.error('Erreur lors du chargement de Chart.js', error);
		}
	});

	onDestroy(() => {
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}
	});
</script>

<div class="chart-wrapper">
	<div class="chart-controls">
		<label for="return-period-select" class="period-label">Période d'affichage:</label>
		<select id="return-period-select" bind:value={selectedPeriod} class="period-select">
			{#each periods as period}
				<option value={period}>{periodLabels[period]}</option>
			{/each}
		</select>
	</div>
	<div class="chart-container">
		<canvas bind:this={chartCanvas}></canvas>
	</div>
</div>

<style>
	.chart-wrapper {
		margin-top: 1rem;
	}

	.chart-controls {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		margin-bottom: 1rem;
		padding: 0.75rem;
		background: var(--bg-secondary, #f9fafb);
		border-radius: 6px;
	}

	:global(:root.dark) .chart-controls {
		background: var(--bg-secondary);
	}

	.period-label {
		font-weight: 600;
		color: var(--text-primary, #111827);
		font-size: 0.875rem;
	}

	:global(:root.dark) .period-label {
		color: var(--text-primary);
	}

	.period-select {
		padding: 0.5rem 0.75rem;
		border: 1px solid var(--border-color, #d1d5db);
		border-radius: 6px;
		background: var(--bg-primary, white);
		color: var(--text-primary, #111827);
		font-size: 0.875rem;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	:global(:root.dark) .period-select {
		background: var(--bg-primary);
		color: var(--text-primary);
		border-color: var(--border-color);
	}

	.period-select:hover {
		border-color: var(--border-color-hover, #9ca3af);
	}

	.period-select:focus {
		outline: none;
		border-color: var(--accent-color, #3b82f6);
		box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
	}

	.chart-container {
		position: relative;
		height: 400px;
		width: 100%;
	}
</style>
