<template>
  <div class="simulation-sheet">
    <!-- Zone de paramètres (type Excel) -->
    <div class="parameters-section">
      <h2>Paramètres d'investissement</h2>
      <div class="excel-grid">
        <div class="excel-row">
          <div class="excel-cell label">Montant investi (€)</div>
          <div class="excel-cell input">
            <input
              type="number"
              v-model.number="investment.amount"
              @input="updateSimulation"
              min="0"
              step="100"
            />
          </div>
        </div>

        <div class="excel-row">
          <div class="excel-cell label">Type d'actif</div>
          <div class="excel-cell input">
            <select v-model="investment.assetType" @change="updateSimulation">
              <option value="action">Action</option>
              <option value="fonds">Fonds</option>
              <option value="etf">ETF</option>
            </select>
          </div>
        </div>

        <div class="excel-row">
          <div class="excel-cell label">Plateforme</div>
          <div class="excel-cell input">
            <select v-model="investment.platform" @change="updateSimulation">
              <option value="xtb">XTB</option>
              <option value="etoro">eToro</option>
            </select>
          </div>
        </div>

        <div class="excel-row">
          <div class="excel-cell label">Bras de levier</div>
          <div class="excel-cell input">
            <input
              type="range"
              v-model.number="investment.leverage"
              @input="updateSimulation"
              min="1"
              max="10"
            />
            <span class="lever-value">{{ investment.leverage }}x</span>
          </div>
        </div>

        <div class="excel-row">
          <div class="excel-cell label">Stop Loss (%)</div>
          <div class="excel-cell input">
            <input
              type="number"
              v-model.number="investment.stopLoss"
              @input="updateSimulation"
              min="5"
              max="50"
              step="0.5"
            />
          </div>
        </div>

        <div class="excel-row">
          <div class="excel-cell label">Rendement attendu annuel (%)</div>
          <div class="excel-cell input">
            <input
              type="number"
              v-model.number="investment.expectedReturn"
              @input="updateSimulation"
              min="-100"
              max="100"
              step="0.1"
            />
          </div>
        </div>

        <div class="excel-row">
          <div class="excel-cell label">Fréquence de réinvestissement</div>
          <div class="excel-cell input">
            <select v-model="investment.reinvestFrequency" @change="updateSimulation">
              <option value="daily">Quotidien</option>
              <option value="weekly">Hebdomadaire</option>
              <option value="monthly">Mensuel</option>
              <option value="yearly">Annuel</option>
            </select>
          </div>
        </div>

        <div class="excel-row">
          <div class="excel-cell label">Revenu annuel (€)</div>
          <div class="excel-cell input">
            <input
              type="number"
              v-model.number="annualIncome"
              @input="updateSimulation"
              min="0"
              step="1000"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Résultats de simulation -->
    <div class="results-section">
      <h2>Résultats de simulation</h2>
      <div class="results-grid">
        <ResultCard
          v-for="(result, period) in results"
          :key="period"
          :period="period"
          :result="result"
        />
      </div>
    </div>

    <!-- Optimisation -->
    <div class="optimization-section">
      <h2>Recommandations d'optimisation</h2>
      <OptimizationPanel :investment="investment" />
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { SimulationEngine } from '../core/services/SimulationEngine.js'
import { Investment } from '../core/models/Investment.js'
import ResultCard from './ResultCard.vue'
import OptimizationPanel from './OptimizationPanel.vue'

const investment = reactive(new Investment({
  amount: 1000,
  assetType: 'action',
  platform: 'xtb',
  leverage: 1,
  stopLoss: 5,
  expectedReturn: 10,
  reinvestFrequency: 'monthly'
}))

const annualIncome = ref(30000)
const results = ref({})

function updateSimulation() {
  try {
    const inv = new Investment(investment)
    results.value = SimulationEngine.simulateAllPeriods(inv, annualIncome.value)
  } catch (error) {
    console.error('Erreur de simulation:', error)
  }
}

onMounted(() => {
  updateSimulation()
})
</script>

<style scoped>
.simulation-sheet {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.parameters-section,
.results-section,
.optimization-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

h2 {
  margin: 0 0 1.5rem 0;
  color: #333;
  font-size: 1.5rem;
  border-bottom: 2px solid #667eea;
  padding-bottom: 0.5rem;
}

.excel-grid {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.excel-row {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1rem;
  align-items: center;
}

.excel-cell.label {
  font-weight: 600;
  color: #555;
}

.excel-cell.input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.excel-cell input[type="number"],
.excel-cell select {
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  width: 100%;
  max-width: 300px;
}

.excel-cell input[type="range"] {
  flex: 1;
  max-width: 200px;
}

.lever-value {
  font-weight: 600;
  color: #667eea;
  min-width: 40px;
}

.results-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;
}
</style>

