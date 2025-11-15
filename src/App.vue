<template>
  <div id="app" class="app-container">
    <header class="app-header">
      <h1>📊 Simulateur de Placement</h1>
      <p class="subtitle">Simulation précise d'investissement avec calculs de rentabilité nette</p>
    </header>

    <main class="app-main">
      <SimulationSheet />
    </main>
  </div>
</template>

<script setup>
import SimulationSheet from './components/SimulationSheet.vue'
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  background: #f5f5f5;
}

.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.app-header h1 {
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 600;
}

.subtitle {
  margin: 0;
  opacity: 0.9;
  font-size: 1rem;
}

.app-main {
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
}
</style>

