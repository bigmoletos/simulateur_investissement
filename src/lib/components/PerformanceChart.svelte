<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';
	import type { SimulationResult, Period } from '../types/index.js';

	export let results: Record<Period, SimulationResult>;

	let Chart: any = null;
	let chartCanvas: HTMLCanvasElement;
	let chartInstance: any = null;
	let chartLoaded = false;

	const periods = ['daily', 'weekly', 'monthly', 'yearly'] as const;
	const periodLabels = {
		daily: 'Quotidien',
		weekly: 'Hebdomadaire',
		monthly: 'Mensuel',
		yearly: 'Annuel'
	};

	$: if (browser && chartLoaded && chartCanvas && results) {
		// Attendre un peu pour s'assurer que le canvas est bien monté
		setTimeout(() => {
			updateChart();
		}, 100);
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

	function updateChart() {
		if (!browser || !Chart || !chartCanvas || !results) {
			console.log('PerformanceChart update skipped: missing browser, Chart, canvas or results', { chartCanvas: !!chartCanvas, results: !!results });
			return;
		}

		// Vérifier que tous les résultats sont disponibles
		if (!results.daily || !results.weekly || !results.monthly || !results.yearly) {
			console.log('PerformanceChart update skipped: missing period results', results);
			return;
		}

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) {
			console.log('PerformanceChart update skipped: no 2d context');
			return;
		}

		const labels = periods.map((p) => periodLabels[p]);
		const netGains = periods.map((p) => results[p]?.netGain || 0);
		const grossGains = periods.map((p) => results[p]?.grossGain || 0);

		// Calcul de la moyenne
		const avgNetGain = netGains.reduce((a, b) => a + b, 0) / netGains.length;

		console.log('Updating PerformanceChart', { labels, netGains, grossGains, avgNetGain });

		// Détruire l'instance précédente si elle existe
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		chartInstance = new Chart(ctx, {
			type: 'line',
			data: {
				labels,
				datasets: [
					{
						label: 'Gain brut',
						data: grossGains,
						borderColor: 'rgb(102, 126, 234)',
						backgroundColor: 'rgba(102, 126, 234, 0.1)',
						tension: 0.4,
						fill: true
					},
					{
						label: 'Gain net',
						data: netGains,
						borderColor: 'rgb(16, 185, 129)',
						backgroundColor: 'rgba(16, 185, 129, 0.1)',
						tension: 0.4,
						fill: true
					},
					{
						label: 'Moyenne gain net',
						data: Array(4).fill(avgNetGain),
						borderColor: 'rgb(239, 68, 68)',
						borderDash: [5, 5],
						pointRadius: 0,
						tension: 0
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: {
						position: 'top'
					},
					title: {
						display: true,
						text: 'Évolution des gains par période'
					},
					tooltip: {
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
					y: {
						beginAtZero: false,
						ticks: {
							callback: function (value) {
								return formatCurrency(Number(value));
							}
						}
					}
				}
			}
		});
	}

	onMount(async () => {
		if (!browser) return;

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
				if (chartCanvas && results) {
					updateChart();
				}
			}, 200);
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

<div class="chart-container">
	<canvas bind:this={chartCanvas}></canvas>
</div>

<style>
	.chart-container {
		position: relative;
		height: 400px;
		width: 100%;
		margin-top: 1rem;
	}
</style>
