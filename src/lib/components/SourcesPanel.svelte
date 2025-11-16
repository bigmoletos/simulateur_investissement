<script lang="ts">
	export let platform: 'xtb' | 'etoro' | 'all' = 'all';

	let expandedSections: Set<string> = new Set();

	function toggleSection(sectionId: string) {
		if (expandedSections.has(sectionId)) {
			expandedSections.delete(sectionId);
		} else {
			expandedSections.add(sectionId);
		}
		expandedSections = expandedSections; // Trigger reactivity
	}
</script>

<div class="sources-panel">
	<h2>📚 Sources Officielles</h2>
	<p class="subtitle">Cliquez sur une section pour voir les détails (fermé par défaut)</p>

	<div class="sources-list">
		{#if platform === 'all' || platform === 'xtb'}
			<div class="source-section">
				<button
					class="source-header"
					class:expanded={expandedSections.has('xtb')}
					on:click={() => toggleSection('xtb')}
				>
					<h3>🏦 XTB - Frais et Commissions</h3>
					<span class="expand-icon">{expandedSections.has('xtb') ? '▼' : '▶'}</span>
				</button>
				{#if expandedSections.has('xtb')}
					<div class="source-content">
				<ul>
					<li>
						<strong>Page officielle des frais:</strong>
						<a href="https://www.xtb.com/fr/frais-et-commissions" target="_blank" rel="noopener noreferrer">
							https://www.xtb.com/fr/frais-et-commissions
						</a>
					</li>
					<li>
						<strong>Commission:</strong> 0% sur actions/ETF jusqu'à 100 000€/mois, puis 0,2% au-delà (minimum 10€)
					</li>
					<li>
						<strong>Spread:</strong> Variable selon l'actif (0,02% - 0,10% en moyenne pour ETF, 0,05% - 0,15% pour actions)
					</li>
					<li>
						<strong>Swap overnight:</strong> Variable selon l'actif et le levier (généralement 0,01% - 0,05% par jour)
					</li>
					<li>
						<strong>Frais de retrait:</strong> Gratuit pour virement SEPA et retrait bancaire
					</li>
					</ul>
					</div>
				{/if}
			</div>
		{/if}

		{#if platform === 'all' || platform === 'etoro'}
			<div class="source-section">
				<button
					class="source-header"
					class:expanded={expandedSections.has('etoro')}
					on:click={() => toggleSection('etoro')}
				>
					<h3>🏦 eToro - Commissions et Frais</h3>
					<span class="expand-icon">{expandedSections.has('etoro') ? '▼' : '▶'}</span>
				</button>
				{#if expandedSections.has('etoro')}
					<div class="source-content">
				<ul>
					<li>
						<strong>Page officielle des frais:</strong>
						<a href="https://www.etoro.com/fr/help/91/3600/commissions-et-frais" target="_blank" rel="noopener noreferrer">
							https://www.etoro.com/fr/help/91/3600/commissions-et-frais
						</a>
					</li>
					<li>
						<strong>Commission:</strong> 0% sur actions/ETF sans limite de volume
					</li>
					<li>
						<strong>Spread:</strong> Variable selon l'actif (généralement 0,08% - 0,15% pour ETF, 0,10% - 0,20% pour actions)
					</li>
					<li>
						<strong>Swap overnight:</strong> Variable selon l'actif et le levier (généralement 0,01% - 0,04% par jour)
					</li>
					<li>
						<strong>Frais de retrait:</strong> 5$ par retrait (en USD, converti approximativement en EUR)
					</li>
					</ul>
					</div>
				{/if}
			</div>
		{/if}

		<div class="source-section">
			<button
				class="source-header"
				class:expanded={expandedSections.has('impots')}
				on:click={() => toggleSection('impots')}
			>
				<h3>🇫🇷 Impôts en France - Plus-values Mobilières</h3>
				<span class="expand-icon">{expandedSections.has('impots') ? '▼' : '▶'}</span>
			</button>
			{#if expandedSections.has('impots')}
				<div class="source-content">
			<ul>
				<li>
					<strong>Service Public - Barème d'imposition 2025:</strong>
					<a href="https://www.service-public.fr/particuliers/vosdroits/F1352" target="_blank" rel="noopener noreferrer">
						https://www.service-public.fr/particuliers/vosdroits/F1352
					</a>
				</li>
				<li>
					<strong>Prélèvement Forfaitaire Unique (PFU) - Régime par défaut:</strong>
					<ul>
						<li>30% au total (12,8% impôt sur le revenu + 17,2% prélèvements sociaux)</li>
						<li>Applicable automatiquement sauf option pour le barème progressif</li>
					</ul>
				</li>
				<li>
					<strong>Barème Progressif (Option 2OP):</strong>
					<ul>
						<li>Jusqu'à 11 294€: 0%</li>
						<li>De 11 294€ à 28 797€: 11%</li>
						<li>De 28 797€ à 82 341€: 30%</li>
						<li>De 82 341€ à 177 106€: 41%</li>
						<li>Au-delà de 177 106€: 45%</li>
						<li>+ 17,2% de prélèvements sociaux (toujours appliqués)</li>
					</ul>
				</li>
				<li>
					<strong>Note:</strong> Les prélèvements sociaux (17,2%) sont toujours appliqués, même avec le barème progressif
				</li>
				</ul>
				</div>
			{/if}
		</div>

		<div class="source-section">
			<button
				class="source-header"
				class:expanded={expandedSections.has('methodologie')}
				on:click={() => toggleSection('methodologie')}
			>
				<h3>📊 Méthodologie de Calcul</h3>
				<span class="expand-icon">{expandedSections.has('methodologie') ? '▼' : '▶'}</span>
			</button>
			{#if expandedSections.has('methodologie')}
				<div class="source-content">
			<ul>
				<li>
					<strong>Bras de levier:</strong> Multiplie uniquement le gain/perte, pas le montant investi
					<ul>
						<li>Gain brut = Montant investi × Rendement × Levier</li>
						<li>Les frais de swap sont calculés sur le montant exposé au marché (montant investi × levier)</li>
					</ul>
				</li>
				<li>
					<strong>Stop Loss:</strong> S'applique sur le montant investi, mais la perte est multipliée par le levier
					<ul>
						<li>Perte potentielle = Montant investi × Stop Loss % × Levier</li>
					</ul>
				</li>
				<li>
					<strong>Frais de transaction:</strong> Calculés sur le montant investi réel (sans levier)
				</li>
				<li>
					<strong>Frais de swap:</strong> Calculés sur le montant exposé au marché (avec levier)
				</li>
				</ul>
				</div>
			{/if}
		</div>

		<div class="source-section">
			<button
				class="source-header"
				class:expanded={expandedSections.has('avertissements')}
				on:click={() => toggleSection('avertissements')}
			>
				<h3>⚠️ Avertissements</h3>
				<span class="expand-icon">{expandedSections.has('avertissements') ? '▼' : '▶'}</span>
			</button>
			{#if expandedSections.has('avertissements')}
				<div class="source-content">
			<ul>
				<li>
					<strong>Les spreads et taux de swap sont variables:</strong> Les valeurs utilisées sont des moyennes indicatives.
					Les taux réels peuvent varier selon l'actif spécifique, les conditions de marché et la plateforme.
				</li>
				<li>
					<strong>Les frais de retrait eToro:</strong> Sont en USD (5$). La conversion en EUR est approximative.
				</li>
				<li>
					<strong>Les tranches d'imposition:</strong> Sont celles de 2025. Elles peuvent changer chaque année.
				</li>
				<li>
					<strong>Le barème progressif:</strong> Nécessite de cocher la case 2OP sur la déclaration de revenus.
				</li>
				</ul>
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
	.sources-panel {
		background: var(--bg-primary, #f9fafb);
		border: 1px solid var(--border-color, #e5e7eb);
		border-radius: 8px;
		padding: 24px;
		margin-top: 24px;
		color: var(--text-primary, #111827);
	}

	:global(:root.dark) .sources-panel {
		background: var(--bg-primary);
		border-color: var(--border-color);
		color: var(--text-primary);
	}

	.sources-panel h2 {
		margin: 0 0 8px 0;
		font-size: 1.5rem;
		color: var(--text-primary, #111827);
	}

	:global(:root.dark) .sources-panel h2 {
		color: var(--text-primary);
	}

	.subtitle {
		color: var(--text-secondary, #6b7280);
		margin: 0 0 24px 0;
		font-size: 0.9rem;
		text-align: center;
	}

	:global(:root.dark) .subtitle {
		color: var(--text-secondary);
	}

	.sources-list {
		display: flex;
		flex-direction: column;
		gap: 24px;
	}

	.source-section {
		background: var(--bg-primary, white);
		border: 1px solid var(--border-color, #e5e7eb);
		border-radius: 6px;
		overflow: hidden;
	}

	:global(:root.dark) .source-section {
		background: var(--bg-primary);
		border-color: var(--border-color);
	}

	.source-header {
		width: 100%;
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px;
		background: transparent;
		border: none;
		cursor: pointer;
		text-align: left;
		transition: background-color 0.2s;
		color: var(--text-primary, #111827);
	}

	:global(:root.dark) .source-header {
		color: var(--text-primary);
	}

	.source-header:hover {
		background-color: var(--bg-secondary, #f9fafb);
	}

	:global(:root.dark) .source-header:hover {
		background-color: var(--bg-secondary);
	}

	.source-header h3 {
		margin: 0;
		font-size: 1.1rem;
		color: var(--text-primary, #111827);
	}

	:global(:root.dark) .source-header h3 {
		color: var(--text-primary);
	}

	.expand-icon {
		font-size: 0.9rem;
		color: var(--text-secondary, #6b7280);
		margin-left: 1rem;
		flex-shrink: 0;
	}

	:global(:root.dark) .expand-icon {
		color: var(--text-secondary);
	}

	.source-content {
		padding: 0 16px 16px 16px;
		background: var(--bg-primary, white);
	}

	:global(:root.dark) .source-section {
		background: var(--bg-primary);
		border-color: var(--border-color);
	}

	:global(:root.dark) .source-header {
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	:global(:root.dark) .source-header:hover {
		background: var(--bg-secondary);
	}

	:global(:root.dark) .source-content {
		background: var(--bg-primary);
		color: var(--text-primary);
	}

	.source-section ul {
		margin: 0;
		padding-left: 20px;
		color: var(--text-primary, #374151);
		line-height: 1.6;
	}

	:global(:root.dark) .source-section ul {
		color: var(--text-primary);
	}

	.source-section ul ul {
		margin-top: 8px;
		margin-bottom: 8px;
	}

	.source-section li {
		margin-bottom: 8px;
		color: var(--text-primary, #374151);
	}

	:global(:root.dark) .source-section li {
		color: var(--text-primary);
	}

	.source-section a {
		color: #2563eb;
		text-decoration: none;
		word-break: break-all;
	}

	:global(:root.dark) .source-section a {
		color: #60a5fa;
	}

	.source-section a:hover {
		text-decoration: underline;
	}

	.source-section strong {
		color: var(--text-primary, #111827);
		font-weight: 600;
	}

	:global(:root.dark) .source-section strong {
		color: var(--text-primary);
	}
</style>

