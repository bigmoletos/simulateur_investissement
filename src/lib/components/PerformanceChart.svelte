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

	function formatCurrency(value: number): string {
		return new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'EUR',
			minimumFractionDigits: 0,
			maximumFractionDigits: 0
		}).format(value);
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
			console.log('PerformanceChart update skipped: missing browser, Chart, canvas or results', { chartCanvas: !!chartCanvas, results: consecutiveResults?.length });
			return;
		}

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) {
			console.log('PerformanceChart update skipped: no 2d context');
			return;
		}

		// Générer les labels avec des dates réelles
		const labels = generateDateLabels();

		// Utiliser netGain total (capital initial + capital additionnel) pour montrer les gains réels
		const netGains = consecutiveResults.map((result) => {
			return result?.netGain ?? 0; // Gain net total incluant capital additionnel
		});
		// Utiliser grossGain total (capital initial + capital additionnel) pour montrer les gains bruts réels
		const grossGains = consecutiveResults.map((result) => {
			return result?.grossGain ?? 0; // Gain brut total incluant capital additionnel
		});
		// Capital total = capital initial + capital additionnel + gains nets
		const totalCapital = consecutiveResults.map((result) => {
			if (!result) return 0;
			return result.newCapital; // Déjà calculé comme capital initial + gains nets + capital additionnel
		});

		// Calcul de la moyenne
		const avgNetGain = netGains.reduce((a, b) => a + b, 0) / netGains.length;

		console.log('Updating PerformanceChart', { labels, netGains, grossGains, totalCapital, avgNetGain, selectedPeriod });

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
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Gain brut total (capital initial + additionnel)',
						data: grossGains,
						borderColor: '#3b82f6', // Bleu plus foncé et contrasté
						backgroundColor: 'rgba(59, 130, 246, 0.15)',
						tension: 0.4,
						fill: true,
						borderWidth: 2,
						yAxisID: 'y'
					},
					{
						label: 'Gain net total (capital initial + additionnel)',
						data: netGains,
						borderColor: '#10b981', // Vert émeraude plus foncé
						backgroundColor: 'rgba(16, 185, 129, 0.15)',
						tension: 0.4,
						fill: true,
						borderWidth: 2,
						yAxisID: 'y'
					},
					{
						label: 'Capital total (investi + gains)',
						data: totalCapital,
						borderColor: '#d4af37', // Or pour le capital
						backgroundColor: 'rgba(212, 175, 55, 0.15)',
						tension: 0.4,
						fill: false,
						borderWidth: 3,
						yAxisID: 'y1'
					},
					{
						label: 'Moyenne gain net',
						data: Array(4).fill(avgNetGain),
						borderColor: '#ef4444', // Rouge plus foncé
						borderDash: [5, 5],
						borderWidth: 2,
						pointRadius: 0,
						tension: 0,
						yAxisID: 'y'
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
						text: `Évolution des gains et du capital total (${periodLabels[selectedPeriod]})`,
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
								return `${context.dataset.label}: ${formatCurrency(Number(value))}`;
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
						type: 'linear',
						position: 'left',
						beginAtZero: false,
						ticks: {
							color: textColor,
							font: {
								size: 11,
								weight: '500'
							},
							callback: function (value) {
								return formatCurrency(Number(value));
							}
						},
						grid: {
							color: gridColor
						},
						title: {
							display: true,
							text: 'Gains (€)',
							color: textColor,
							font: {
								size: 12,
								weight: '600'
							}
						}
					},
					y1: {
						type: 'linear',
						position: 'right',
						beginAtZero: false,
						ticks: {
							color: textColor,
							font: {
								size: 11,
								weight: '500'
							},
							callback: function (value) {
								return formatCurrency(Number(value));
							}
						},
						grid: {
							drawOnChartArea: false
						},
						title: {
							display: true,
							text: 'Capital total (€)',
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
				Legend,
				Filler
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
				Legend,
				Filler
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
		<label for="period-select" class="period-label">Période d'affichage:</label>
		<select id="period-select" bind:value={selectedPeriod} class="period-select">
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
