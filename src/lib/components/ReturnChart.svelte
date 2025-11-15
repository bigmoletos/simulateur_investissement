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

	function formatPercentage(value: number): string {
		return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
	}

	function updateChart() {
		if (!browser || !Chart || !chartCanvas || !results) {
			console.log('ReturnChart update skipped: missing browser, Chart, canvas or results', { chartCanvas: !!chartCanvas, results: !!results });
			return;
		}

		// Vérifier que tous les résultats sont disponibles
		if (!results.daily || !results.weekly || !results.monthly || !results.yearly) {
			console.log('ReturnChart update skipped: missing period results', results);
			return;
		}

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) {
			console.log('ReturnChart update skipped: no 2d context');
			return;
		}

		const labels = periods.map((p) => periodLabels[p]);
		const netReturns = periods.map((p) => results[p]?.netReturn || 0);
		const grossReturns = periods.map((p) => {
			const result = results[p];
			if (!result || !result.initialAmount || result.initialAmount === 0) return 0;
			return (result.grossGain / result.initialAmount) * 100;
		});

		// Calcul de la moyenne
		const avgNetReturn = netReturns.reduce((a, b) => a + b, 0) / netReturns.length;

		console.log('Updating ReturnChart', { labels, netReturns, grossReturns, avgNetReturn });

		// Détruire l'instance précédente si elle existe
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		chartInstance = new Chart(ctx, {
			type: 'bar',
			data: {
				labels,
				datasets: [
					{
						label: 'Rentabilité brute (%)',
						data: grossReturns,
						backgroundColor: 'rgba(102, 126, 234, 0.6)',
						borderColor: 'rgb(102, 126, 234)',
						borderWidth: 1
					},
					{
						label: 'Rentabilité nette (%)',
						data: netReturns,
						backgroundColor: 'rgba(16, 185, 129, 0.6)',
						borderColor: 'rgb(16, 185, 129)',
						borderWidth: 1
					},
					{
						label: 'Moyenne rentabilité nette',
						data: Array(4).fill(avgNetReturn),
						type: 'line',
						borderColor: 'rgb(239, 68, 68)',
						borderDash: [5, 5],
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
						position: 'top'
					},
					title: {
						display: true,
						text: 'Rentabilité nette par période (%)'
					},
					tooltip: {
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
					y: {
						beginAtZero: false,
						ticks: {
							callback: function (value) {
								return formatPercentage(Number(value));
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
