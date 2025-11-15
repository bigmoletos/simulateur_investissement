<script lang="ts">
	import type { Platform } from '../types/index.js';

	export let platform: Platform = 'xtb';
</script>

<div class="fees-explanation">
	<h2>💰 Explication des Frais</h2>
	<p class="subtitle">
		Comprendre tous les frais qui impactent votre rentabilité nette
	</p>

	<div class="fees-list">
		<!-- Spread -->
		<div class="fee-item">
			<div class="fee-header">
				<h3>📊 Spread</h3>
				<span class="fee-badge">Frais d'entrée</span>
			</div>
			<div class="fee-content">
				<p>
					<strong>Définition:</strong> Le spread est la différence entre le prix d'achat (ask) et le prix de vente (bid) d'un actif.
					C'est le coût caché de chaque transaction.
				</p>
				<p>
					<strong>Comment ça fonctionne:</strong> Quand vous achetez un actif, vous payez le prix d'achat (légèrement plus élevé).
					Quand vous vendez, vous recevez le prix de vente (légèrement plus bas). La différence est le spread.
				</p>
				<p>
					<strong>Exemple:</strong> Si un ETF a un spread de 0.02% et que vous investissez 2000€, vous payez 0.40€ de spread à l'achat.
				</p>
				<p>
					<strong>Impact:</strong> Le spread est payé immédiatement lors de l'achat. Il réduit votre capital investi dès le départ.
				</p>
				<div class="fee-example">
					<strong>Valeurs moyennes {platform.toUpperCase()}:</strong>
					<ul>
						<li>ETF: {platform === 'xtb' ? '0.02%' : '0.08%'} (très serré)</li>
						<li>Actions: {platform === 'xtb' ? '0.05%' : '0.10%'} (variable selon l'actif)</li>
						<li>Fonds: {platform === 'xtb' ? '0.10%' : '0.15%'}</li>
					</ul>
				</div>
			</div>
		</div>

		<!-- Commission -->
		<div class="fee-item">
			<div class="fee-header">
				<h3>💳 Commission</h3>
				<span class="fee-badge">Frais d'entrée</span>
			</div>
			<div class="fee-content">
				<p>
					<strong>Définition:</strong> La commission est un frais fixe ou variable prélevé par la plateforme pour exécuter votre transaction.
				</p>
				<p>
					<strong>Comment ça fonctionne:</strong> Certaines plateformes facturent une commission en plus du spread, généralement en pourcentage du montant investi.
				</p>
				<p>
					<strong>XTB:</strong> Commission de 0% sur actions/ETF jusqu'à 100 000€ par mois, puis 0.2% au-delà (minimum 10€ par transaction).
				</p>
				<p>
					<strong>eToro:</strong> Commission de 0% sur actions/ETF sans limite de volume.
				</p>
				<p>
					<strong>Impact:</strong> Pour la plupart des investisseurs, la commission est de 0% grâce aux seuils élevés. Elle devient significative uniquement pour des volumes très importants.
				</p>
				<div class="fee-example">
					<strong>Exemple:</strong> Investir 150 000€ sur XTB en un mois → Commission de 0.2% × 150 000€ = 300€ (sur la partie au-delà de 100k€).
				</div>
			</div>
		</div>

		<!-- Swap Overnight -->
		<div class="fee-item">
			<div class="fee-header">
				<h3>🌙 Swap Overnight</h3>
				<span class="fee-badge">Frais récurrents</span>
			</div>
			<div class="fee-content">
				<p>
					<strong>Définition:</strong> Le swap overnight (ou frais de financement) est un coût quotidien appliqué aux positions avec levier (effet de levier > 1).
				</p>
				<p>
					<strong>Comment ça fonctionne:</strong> Quand vous utilisez un levier, la plateforme vous prête de l'argent pour augmenter votre exposition au marché.
					Le swap est l'intérêt que vous payez pour cet emprunt, calculé chaque jour où vous gardez la position ouverte.
				</p>
				<p>
					<strong>Calcul:</strong> Swap quotidien = Montant exposé au marché (montant investi × levier) × Taux de swap quotidien
				</p>
				<p>
					<strong>Impact:</strong> Les frais de swap s'accumulent chaque jour. Avec un levier élevé, ils peuvent rapidement réduire votre rentabilité.
				</p>
				<div class="fee-example">
					<strong>Exemple:</strong> Investir 2000€ avec un levier 5x sur un ETF:
					<ul>
						<li>Montant exposé: 2000€ × 5 = 10 000€</li>
						<li>Taux swap quotidien: ~0.01% (varie selon l'actif)</li>
						<li>Swap par jour: 10 000€ × 0.01% = 1€/jour</li>
						<li>Swap mensuel (30 jours): ~30€</li>
						<li>Swap annuel: ~365€ (soit 18.25% du capital investi!)</li>
					</ul>
					<strong>⚠️ Attention:</strong> Les frais de swap peuvent être très élevés avec un levier important!
				</div>
			</div>
		</div>

		<!-- Frais de retrait -->
		<div class="fee-item">
			<div class="fee-header">
				<h3>💸 Frais de Retrait</h3>
				<span class="fee-badge">Frais ponctuels</span>
			</div>
			<div class="fee-content">
				<p>
					<strong>Définition:</strong> Les frais de retrait sont des coûts appliqués lorsque vous retirez de l'argent de votre compte de trading vers votre compte bancaire.
				</p>
				<p>
					<strong>XTB:</strong> Gratuit pour les virements SEPA et retraits bancaires (sans limite).
				</p>
				<p>
					<strong>eToro:</strong> 5$ (environ 4.50€) par retrait, quel que soit le montant.
				</p>
				<p>
					<strong>Impact:</strong> Les frais de retrait sont ponctuels et n'affectent pas directement les calculs de rentabilité périodique.
					Ils sont cependant importants à prendre en compte pour optimiser la fréquence de vos retraits.
				</p>
				<div class="fee-example">
					<strong>Conseil:</strong> Sur eToro, regroupez vos retraits pour minimiser les frais (1 retrait de 1000€ coûte 5$, mais 10 retraits de 100€ coûtent 50$).
				</div>
			</div>
		</div>

		<!-- Frais de gestion ETF (TER) -->
		<div class="fee-item">
			<div class="fee-header">
				<h3>📈 Frais de Gestion ETF (TER)</h3>
				<span class="fee-badge">Frais intégrés</span>
			</div>
			<div class="fee-content">
				<p>
					<strong>Définition:</strong> Le TER (Total Expense Ratio) est un frais annuel prélevé directement sur la valeur de l'ETF par le gestionnaire du fonds.
					Il couvre les frais de gestion, d'administration et d'exploitation du fonds.
				</p>
				<p>
					<strong>Comment ça fonctionne:</strong> Le TER est automatiquement déduit de la valeur de l'ETF chaque jour.
					Vous ne le voyez pas directement, mais il réduit la performance de l'ETF.
				</p>
				<p>
					<strong>Valeurs typiques:</strong>
				</p>
				<ul>
					<li>ETF indiciels (tracking): 0.05% à 0.30% par an</li>
					<li>ETF thématiques: 0.30% à 0.80% par an</li>
					<li>ETF actifs: 0.50% à 1.50% par an</li>
				</ul>
				<p>
					<strong>Impact:</strong> Le TER est déjà intégré dans le rendement de l'ETF. Si un ETF affiche un rendement de 10%,
					le rendement réel avant frais de gestion était légèrement supérieur (par exemple 10.15% avec un TER de 0.15%).
				</p>
				<div class="fee-example">
					<strong>Exemple:</strong> Investir 2000€ dans un ETF avec un TER de 0.15%:
					<ul>
						<li>Frais annuels: 2000€ × 0.15% = 3€/an</li>
						<li>Frais mensuels: ~0.25€/mois</li>
					</ul>
					<strong>ℹ️ Note:</strong> Ces frais sont déjà inclus dans le rendement attendu que vous saisissez.
					Ils ne sont pas déduits séparément dans nos calculs car ils impactent déjà la performance de l'ETF.
				</div>
			</div>
		</div>

		<!-- Frais de garde -->
		<div class="fee-item">
			<div class="fee-header">
				<h3>🏦 Frais de Garde</h3>
				<span class="fee-badge">Non applicable</span>
			</div>
			<div class="fee-content">
				<p>
					<strong>Définition:</strong> Les frais de garde sont des coûts annuels facturés par certains intermédiaires financiers pour la conservation de vos titres.
				</p>
				<p>
					<strong>XTB et eToro:</strong> Aucun frais de garde pour les actions et ETF. Les plateformes de trading en ligne ne facturent généralement pas de frais de garde.
				</p>
				<p>
					<strong>Impact:</strong> Aucun impact sur vos calculs avec XTB ou eToro.
				</p>
				<div class="fee-example">
					<strong>Note:</strong> Les frais de garde sont plutôt associés aux comptes titres traditionnels chez les banques classiques (généralement 0.1% à 0.3% par an).
				</div>
			</div>
		</div>

		<!-- Commission sur transaction -->
		<div class="fee-item">
			<div class="fee-header">
				<h3>🔄 Commission sur Transaction</h3>
				<span class="fee-badge">Déjà inclus</span>
			</div>
			<div class="fee-content">
				<p>
					<strong>Définition:</strong> La commission sur transaction est un frais prélevé à chaque achat ou vente d'actif.
				</p>
				<p>
					<strong>Dans notre simulateur:</strong> La commission sur transaction est déjà incluse dans les frais d'entrée (spread + commission).
				</p>
				<p>
					<strong>Frais de sortie (vente):</strong> Si votre stratégie de réinvestissement correspond à la période calculée (quotidien, hebdomadaire, mensuel ou annuel),
					vous vendez votre position à la fin de chaque période pour encaisser les gains et stabiliser la position.
					Les frais de sortie (spread à la vente) sont alors calculés et déduits de votre gain.
				</p>
				<p>
					<strong>Stratégie de réinvestissement:</strong> Après la vente, vous rachetez immédiatement avec le nouveau capital (capital initial + gain net).
					Les frais d'entrée du rachat sont également inclus dans le calcul total des frais.
				</p>
				<div class="fee-example">
					<strong>Exemple avec réinvestissement mensuel:</strong>
					<ul>
						<li>Vous investissez 2000€ le 1er janvier</li>
						<li>Le 31 janvier, vous avez un gain brut de 100€</li>
						<li>Vous vendez votre position → frais de sortie (spread) déduits</li>
						<li>Vous rachetez immédiatement avec le nouveau capital → frais d'entrée (spread) déduits</li>
						<li>Les frais de sortie ET d'entrée sont inclus dans le calcul de votre rentabilité nette</li>
					</ul>
					<strong>💡 Impact:</strong> Les frais de sortie peuvent réduire significativement votre rentabilité si vous réinvestissez fréquemment (quotidien ou hebdomadaire).
				</div>
			</div>
		</div>
	</div>

	<div class="summary-box">
		<h3>📋 Résumé des Frais dans le Simulateur</h3>
		<table class="summary-table">
			<thead>
				<tr>
					<th>Type de frais</th>
					<th>Quand est-il prélevé?</th>
					<th>Inclus dans le simulateur?</th>
				</tr>
			</thead>
			<tbody>
				<tr>
					<td><strong>Spread</strong></td>
					<td>À l'achat (immédiat)</td>
					<td>✅ Oui</td>
				</tr>
				<tr>
					<td><strong>Commission</strong></td>
					<td>À l'achat (si applicable)</td>
					<td>✅ Oui</td>
				</tr>
				<tr>
					<td><strong>Swap overnight</strong></td>
					<td>Chaque jour (si levier > 1)</td>
					<td>✅ Oui</td>
				</tr>
				<tr>
					<td><strong>Frais de retrait</strong></td>
					<td>Lors du retrait</td>
					<td>⚠️ Affiché mais non déduit des calculs périodiques</td>
				</tr>
				<tr>
					<td><strong>Frais de gestion ETF (TER)</strong></td>
					<td>Intégré dans la valeur de l'ETF</td>
					<td>ℹ️ Déjà inclus dans le rendement attendu</td>
				</tr>
				<tr>
					<td><strong>Frais de garde</strong></td>
					<td>Annuellement (si applicable)</td>
					<td>❌ Non applicable (XTB/eToro)</td>
				</tr>
				<tr>
					<td><strong>Commission à la vente</strong></td>
					<td>À la vente</td>
					<td>❌ Non inclus (simulation sans vente)</td>
				</tr>
			</tbody>
		</table>
	</div>

	<div class="info-box">
		<h3>💡 Conseils pour Minimiser les Frais</h3>
		<ul>
			<li>
				<strong>Choisissez des ETF avec des spreads serrés:</strong> Les ETF très liquides ont généralement des spreads plus faibles.
			</li>
			<li>
				<strong>Limitez l'utilisation du levier:</strong> Les frais de swap peuvent rapidement réduire votre rentabilité avec un levier élevé.
			</li>
			<li>
				<strong>Regroupez vos transactions:</strong> Sur XTB, restez sous 100 000€/mois pour éviter les commissions.
			</li>
			<li>
				<strong>Optimisez vos retraits:</strong> Sur eToro, regroupez vos retraits pour minimiser les frais.
			</li>
			<li>
				<strong>Vérifiez le TER de vos ETF:</strong> Un TER élevé réduit votre rentabilité à long terme.
			</li>
		</ul>
	</div>
</div>

<style>
	.fees-explanation {
		background: white;
		border-radius: 8px;
		padding: 2rem;
		margin-top: 2rem;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
	}

	.fees-explanation h2 {
		margin-top: 0;
		color: #111827;
		font-size: 1.75rem;
	}

	.subtitle {
		color: #6b7280;
		font-size: 1rem;
		margin-bottom: 2rem;
	}

	.fees-list {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.fee-item {
		border: 1px solid #e5e7eb;
		border-radius: 8px;
		overflow: hidden;
		background: #f9fafb;
	}

	.fee-header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1rem 1.5rem;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
	}

	.fee-header h3 {
		margin: 0;
		font-size: 1.25rem;
	}

	.fee-badge {
		font-size: 0.75rem;
		padding: 0.25rem 0.75rem;
		background: rgba(255, 255, 255, 0.2);
		border-radius: 12px;
		font-weight: 600;
	}

	.fee-content {
		padding: 1.5rem;
	}

	.fee-content p {
		margin-bottom: 1rem;
		line-height: 1.6;
		color: #374151;
	}

	.fee-content strong {
		color: #111827;
	}

	.fee-example {
		margin-top: 1rem;
		padding: 1rem;
		background: #eff6ff;
		border-left: 4px solid #3b82f6;
		border-radius: 4px;
	}

	.fee-example ul {
		margin: 0.5rem 0 0 1.5rem;
	}

	.fee-example li {
		margin-bottom: 0.5rem;
	}

	.summary-box {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #f0fdf4;
		border: 2px solid #10b981;
		border-radius: 8px;
	}

	.summary-box h3 {
		margin-top: 0;
		color: #065f46;
	}

	.summary-table {
		width: 100%;
		border-collapse: collapse;
		margin-top: 1rem;
	}

	.summary-table th,
	.summary-table td {
		padding: 0.75rem;
		text-align: left;
		border-bottom: 1px solid #d1d5db;
	}

	.summary-table th {
		background: #10b981;
		color: white;
		font-weight: 600;
	}

	.summary-table td {
		background: white;
	}

	.info-box {
		margin-top: 2rem;
		padding: 1.5rem;
		background: #fef3c7;
		border-left: 4px solid #f59e0b;
		border-radius: 4px;
	}

	.info-box h3 {
		margin-top: 0;
		color: #92400e;
	}

	.info-box ul {
		margin: 0.5rem 0 0 1.5rem;
	}

	.info-box li {
		margin-bottom: 0.75rem;
		color: #78350f;
		line-height: 1.6;
	}
</style>

