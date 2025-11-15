<template>
  <div class="optimization-panel">
    <div class="recommendations">
      <h3>💡 Recommandations</h3>
      <div class="recommendation-item">
        <span class="rec-label">Montant optimal:</span>
        <span class="rec-value">{{ formatCurrency(recommendations.amount) }}</span>
      </div>
      <div class="recommendation-item">
        <span class="rec-label">Bras de levier suggéré:</span>
        <span class="rec-value">{{ recommendations.leverage }}x</span>
      </div>
      <div class="recommendation-item">
        <span class="rec-label">Fréquence de réinvestissement:</span>
        <span class="rec-value">{{ getFrequencyLabel(recommendations.reinvestFrequency) }}</span>
      </div>
      <div class="recommendation-item">
        <span class="rec-label">Stop Loss recommandé:</span>
        <span class="rec-value">{{ recommendations.stopLoss }}%</span>
      </div>
    </div>

    <div class="risk-warning" v-if="investment.leverage > 5">
      <strong>⚠️ Attention:</strong> Un bras de levier élevé (>5x) augmente significativement les risques.
      Assurez-vous de bien comprendre les mécanismes avant d'investir.
    </div>

    <div class="info-box">
      <p><strong>Note:</strong> Ces recommandations sont basées sur des algorithmes d'optimisation simplifiés.
      Consultez un conseiller financier pour des recommandations personnalisées.</p>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { SimulationEngine } from '../core/services/SimulationEngine.js'

const props = defineProps({
  investment: {
    type: Object,
    required: true
  }
})

const recommendations = computed(() => {
  return SimulationEngine.optimize({
    maxAmount: props.investment.amount * 2,
    maxRisk: Math.min(props.investment.leverage + 1, 10)
  })
})

function formatCurrency(value) {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value)
}

function getFrequencyLabel(freq) {
  const labels = {
    daily: 'Quotidien',
    weekly: 'Hebdomadaire',
    monthly: 'Mensuel',
    yearly: 'Annuel'
  }
  return labels[freq] || freq
}
</script>

<style scoped>
.optimization-panel {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.recommendations {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.recommendation-item {
  display: flex;
  flex-direction: column;
  padding: 1rem;
  background: #f8f9ff;
  border-left: 4px solid #667eea;
  border-radius: 4px;
}

.rec-label {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 0.25rem;
}

.rec-value {
  font-size: 1.25rem;
  font-weight: 600;
  color: #667eea;
}

.risk-warning {
  padding: 1rem;
  background: #fef3c7;
  border-left: 4px solid #f59e0b;
  border-radius: 4px;
  color: #92400e;
}

.info-box {
  padding: 1rem;
  background: #f0f9ff;
  border-left: 4px solid #0ea5e9;
  border-radius: 4px;
  color: #0c4a6e;
  font-size: 0.9rem;
}
</style>

