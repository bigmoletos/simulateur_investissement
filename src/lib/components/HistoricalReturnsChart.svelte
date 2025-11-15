<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { browser } from '$app/environment';

	export let assetName: string = 'iShare IB01.l';
	export let selectedPeriod: '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' = '1Y';

	let Chart: any = null;
	let chartCanvas: HTMLCanvasElement;
	let chartInstance: any = null;
	let chartLoaded = false;

	// Fonction pour générer des données historiques basées sur le nom de l'actif
	function generateHistoricalData(assetName: string, period: string): number[] {
		// Simulation de données différentes selon l'actif
		const baseReturn = assetName.toLowerCase().includes('ishare') || assetName.toLowerCase().includes('ib01')
			? 4.5 // ETF iShare IB01.l - rendement plus stable
			: assetName.toLowerCase().includes('aapl')
			? 8.2 // Apple - rendement plus volatil
			: assetName.toLowerCase().includes('tsla')
			? 12.5 // Tesla - rendement très volatil
			: 6.0; // Par défaut

		const volatility = assetName.toLowerCase().includes('ishare') || assetName.toLowerCase().includes('ib01')
			? 0.3 // ETF - faible volatilité
			: assetName.toLowerCase().includes('aapl')
			? 1.2 // Apple - volatilité modérée
			: assetName.toLowerCase().includes('tsla')
			? 2.5 // Tesla - haute volatilité
			: 1.0; // Par défaut

		const count = period === '1M' ? 30 : period === '3M' ? 90 : period === '6M' ? 180 : period === '1Y' ? 365 : period === '3Y' ? 1095 : 1825;

		// Convertir le rendement annuel en rendement pour la période sélectionnée
		const yearsInPeriod = period === '1M' ? 1/12 :
		                      period === '3M' ? 3/12 :
		                      period === '6M' ? 6/12 :
		                      period === '1Y' ? 1 :
		                      period === '3Y' ? 3 : 5;
		const periodReturn = baseReturn * yearsInPeriod;

		return Array.from({ length: count }, (_, i) => {
			// Progression linéaire vers le rendement total attendu pour la période
			const progress = i / count;
			const trend = progress * periodReturn;
			const noise = (Math.random() - 0.5) * volatility * Math.sqrt(yearsInPeriod);
			return Math.max(0, trend + noise);
		});
	}

	// Données historiques générées dynamiquement
	$: historicalData = generateHistoricalData(assetName, selectedPeriod);

	// Fonction pour générer des dates réelles selon la période
	function generateDateLabels(period: string): Date[] {
		const count = historicalData?.length || 0;
		const dates: Date[] = [];
		const now = new Date();

		// Calculer la date de début selon la période
		let startDate: Date;
		if (period === '1M') {
			startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
		} else if (period === '3M') {
			startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
		} else if (period === '6M') {
			startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
		} else if (period === '1Y') {
			startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
		} else if (period === '3Y') {
			startDate = new Date(now.getFullYear() - 3, now.getMonth(), now.getDate());
		} else {
			startDate = new Date(now.getFullYear() - 5, now.getMonth(), now.getDate());
		}

		// Générer les dates
		for (let i = 0; i < count; i++) {
			const date = new Date(startDate);
			if (period === '1M') {
				date.setDate(startDate.getDate() + i);
			} else if (period === '3M' || period === '6M') {
				date.setDate(startDate.getDate() + i);
			} else if (period === '1Y') {
				date.setDate(startDate.getDate() + i);
			} else {
				date.setDate(startDate.getDate() + i * (period === '3Y' ? 3 : 2));
			}
			dates.push(date);
		}

		return dates;
	}

	// Calcul de la rentabilité moyenne sur la période sélectionnée
	// La rentabilité moyenne correspond au rendement total sur la période divisé par le nombre d'années
	$: averageReturn = historicalData && historicalData.length > 0
		? (() => {
			// Calculer le rendement total sur la période
			const firstValue = historicalData[0] || 0;
			const lastValue = historicalData[historicalData.length - 1] || 0;
			const totalReturn = lastValue - firstValue;

			// Convertir la période en nombre d'années pour annualiser
			const yearsInPeriod = selectedPeriod === '1M' ? 1/12 :
			                     selectedPeriod === '3M' ? 3/12 :
			                     selectedPeriod === '6M' ? 6/12 :
			                     selectedPeriod === '1Y' ? 1 :
			                     selectedPeriod === '3Y' ? 3 : 5;

			// Rentabilité moyenne annualisée sur la période
			return yearsInPeriod > 0 ? totalReturn / yearsInPeriod : totalReturn;
		})()
		: 0;

	// Fonction pour générer le lien vers le site officiel selon le type d'actif
	function getOfficialLink(assetName: string): { url: string; label: string } {
		const nameLower = assetName.toLowerCase().trim();
		const nameUpper = assetName.trim().toUpperCase();

		const searchTerm = encodeURIComponent(assetName.trim());

		// Pour les actions américaines (ticker court comme AAPL, TSLA, MSFT)
		// Yahoo Finance est gratuit et très fiable
		if (/^[A-Z]{1,5}$/.test(nameUpper)) {
			return {
				url: `https://finance.yahoo.com/quote/${nameUpper}`,
				label: 'Vérifier sur Yahoo Finance (gratuit)'
			};
		}

		// Pour les ETF iShares et autres ETF européens
		// justETF est gratuit et spécialisé dans les ETF européens
		if (nameLower.includes('ishare') || nameLower.includes('ib01') || nameLower.includes('etf')) {
			return {
				url: `https://www.justetf.com/fr/find-etf.html?query=${searchTerm}`,
				label: 'Vérifier sur justETF (gratuit)'
			};
		}

		// Par défaut: Yahoo Finance (gratuit et fiable)
		return {
			url: `https://finance.yahoo.com/quote/${searchTerm}`,
			label: 'Vérifier sur Yahoo Finance (gratuit)'
		};
	}

	$: officialLink = getOfficialLink(assetName);

	$: if (browser && chartLoaded && chartCanvas && selectedPeriod && assetName && historicalData) {
		setTimeout(() => {
			updateChart();
		}, 100);
	}

	function updateChart() {
		if (!browser || !Chart || !chartCanvas || !selectedPeriod || !historicalData) {
			console.log('HistoricalReturnsChart update skipped: missing browser, Chart, canvas, period or data');
			return;
		}

		const ctx = chartCanvas.getContext('2d');
		if (!ctx) {
			console.log('HistoricalReturnsChart update skipped: no 2d context');
			return;
		}

		const data = historicalData || [];
		const dates = generateDateLabels(selectedPeriod);

		// Préparer les données avec les dates
		const dataWithDates = dates.map((date, i) => ({
			x: date,
			y: data[i] || 0
		}));

		// Calcul de la moyenne mobile sur 7 périodes
		const movingAverage = data.map((_, i) => {
			const window = data.slice(Math.max(0, i - 6), i + 1);
			return window.reduce((a, b) => a + b, 0) / window.length;
		});

		const movingAverageWithDates = dates.map((date, i) => ({
			x: date,
			y: movingAverage[i] || 0
		}));

		// Calcul de la rentabilité moyenne
		const avgReturn = data.length > 0 ? data.reduce((a, b) => a + b, 0) / data.length : 0;

		console.log('Updating HistoricalReturnsChart', { period: selectedPeriod, dataLength: data.length, avgReturn });

		// Détruire l'instance précédente si elle existe
		if (chartInstance) {
			chartInstance.destroy();
			chartInstance = null;
		}

		// Attendre un peu pour s'assurer que le canvas est libéré
		setTimeout(() => {
			if (!ctx) return;
			chartInstance = new Chart(ctx, {
				type: 'line',
				data: {
					datasets: [
						{
							label: `Rendement ${assetName}`,
							data: dataWithDates,
							borderColor: 'rgb(102, 126, 234)',
							backgroundColor: 'rgba(102, 126, 234, 0.1)',
							tension: 0.4,
							fill: true
						},
						{
							label: 'Moyenne mobile (7 périodes)',
							data: movingAverageWithDates,
							borderColor: 'rgb(239, 68, 68)',
							borderDash: [5, 5],
							pointRadius: 0,
							tension: 0.3
						},
						{
							label: `Rentabilité moyenne (${avgReturn.toFixed(2)}%)`,
							data: dates.map(date => ({ x: date, y: avgReturn })),
							borderColor: 'rgb(16, 185, 129)',
							borderDash: [3, 3],
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
							text: `Rendement historique - ${assetName} (${selectedPeriod})`
						},
						tooltip: {
							callbacks: {
								label: function (context) {
									return `${context.dataset.label}: ${context.parsed.y.toFixed(2)}%`;
								}
							}
						}
					},
					scales: {
						x: {
							type: 'time',
							time: {
								unit: selectedPeriod === '1M' ? 'day' : selectedPeriod === '3M' || selectedPeriod === '6M' ? 'week' : selectedPeriod === '1Y' ? 'month' : 'month',
								displayFormats: {
									day: 'dd/MM',
									week: 'dd/MM',
									month: 'MMM yyyy'
								}
							},
							title: {
								display: true,
								text: 'Date'
							}
						},
						y: {
							beginAtZero: false,
							title: {
								display: true,
								text: 'Rendement (%)'
							},
							ticks: {
								callback: function (value) {
									return `${Number(value).toFixed(1)}%`;
								}
							}
						}
					}
				}
			});
		}, 50);
	}

	onMount(async () => {
		if (!browser) return;

		// Charger Chart.js uniquement côté client
		try {
			// Importer l'adaptateur date-fns en premier
			await import('chartjs-adapter-date-fns');

			const chartJs = await import('chart.js');
			Chart = chartJs.Chart;
			const {
				CategoryScale,
				LinearScale,
				PointElement,
				LineElement,
				LineController,
				TimeScale,
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
				TimeScale,
				Title,
				Tooltip,
				Legend,
				Filler
			);

			chartLoaded = true;

			setTimeout(() => {
				if (chartCanvas && selectedPeriod) {
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
		}
	});
</script>

<div class="historical-chart-section">
	<div class="chart-header">
		<div class="header-left">
			<h3>📈 Rendement historique - {assetName}</h3>
			<a
				href={officialLink.url}
				target="_blank"
				rel="noopener noreferrer"
				class="official-link"
				title="Vérifier l'historique réel de {assetName} sur {officialLink.label}"
			>
				🔗 {officialLink.label}
			</a>
		</div>
		<div class="chart-stats">
			<div class="stat-item">
				<span class="stat-label">Rentabilité moyenne ({selectedPeriod}):</span>
				<span class="stat-value {averageReturn >= 0 ? 'positive' : 'negative'}">
					{averageReturn >= 0 ? '+' : ''}{averageReturn.toFixed(2)}%
				</span>
			</div>
		</div>
	</div>
	<div class="chart-controls">
		<label>
			<span>Période:</span>
			<select bind:value={selectedPeriod}>
				<option value="1M">1 Mois</option>
				<option value="3M">3 Mois</option>
				<option value="6M">6 Mois</option>
				<option value="1Y">1 An</option>
				<option value="3Y">3 Ans</option>
				<option value="5Y">5 Ans</option>
			</select>
		</label>
	</div>
	<div class="chart-container">
		<canvas bind:this={chartCanvas}></canvas>
	</div>
</div>

<style>
	.historical-chart-section {
		background: white;
		border-radius: 8px;
		padding: 1.5rem;
		margin-top: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.chart-controls {
		display: flex;
		align-items: center;
		gap: 1rem;
	}

	.chart-controls label {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		font-weight: 600;
		color: #555;
	}

	.chart-controls select {
		padding: 0.5rem 1rem;
		border: 2px solid #e0e0e0;
		border-radius: 6px;
		font-size: 0.9rem;
		cursor: pointer;
		transition: border-color 0.2s;
	}

	.chart-controls select:hover {
		border-color: #667eea;
	}

	.chart-container {
		position: relative;
		height: 400px;
		width: 100%;
		margin-top: 1rem;
	}

	.chart-header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 1rem;
		flex-wrap: wrap;
		gap: 1rem;
	}

	.header-left {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	.chart-header h3 {
		margin: 0;
		color: #333;
		font-size: 1.25rem;
	}

	.official-link {
		display: inline-flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #eff6ff;
		border: 1px solid #3b82f6;
		border-radius: 6px;
		color: #1e40af;
		text-decoration: none;
		font-size: 0.85rem;
		font-weight: 600;
		transition: all 0.2s;
		width: fit-content;
	}

	.official-link:hover {
		background: #dbeafe;
		border-color: #2563eb;
		color: #1e3a8a;
		transform: translateY(-1px);
		box-shadow: 0 2px 4px rgba(59, 130, 246, 0.2);
	}

	.chart-stats {
		display: flex;
		gap: 1.5rem;
		align-items: center;
	}

	.stat-item {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		background: #f9fafb;
		border-radius: 6px;
		border: 1px solid #e5e7eb;
	}

	.stat-label {
		font-size: 0.9rem;
		color: #6b7280;
		font-weight: 500;
	}

	.stat-value {
		font-size: 1rem;
		font-weight: 700;
	}

	.stat-value.positive {
		color: #10b981;
	}

	.stat-value.negative {
		color: #ef4444;
	}
</style>

