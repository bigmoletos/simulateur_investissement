/**
 * Tests unitaires pour SimulationEngine
 *
 * Conformité Constitution: Principe VI - Test-First
 */

import { describe, it, expect } from 'vitest'
import { SimulationEngine } from '../SimulationEngine.js'
import { Investment } from '../../models/Investment.js'

describe('SimulationEngine', () => {
  describe('simulate', () => {
    it('devrait calculer correctement une simulation annuelle', () => {
      const investment = new Investment({
        amount: 1000,
        assetType: 'action',
        platform: 'xtb',
        leverage: 1,
        stopLoss: 5,
        expectedReturn: 10
      })

      const result = SimulationEngine.simulate(investment, 'yearly')

      expect(result).toHaveProperty('period', 'yearly')
      expect(result).toHaveProperty('initialAmount', 1000)
      expect(result).toHaveProperty('leveragedAmount', 1000)
      expect(result).toHaveProperty('grossGain')
      expect(result).toHaveProperty('fees')
      expect(result).toHaveProperty('taxes')
      expect(result).toHaveProperty('netGain')
      expect(result.stopLoss.percentage).toBe(5)
    })

    it('devrait calculer correctement avec un levier', () => {
      const investment = new Investment({
        amount: 1000,
        leverage: 3,
        expectedReturn: 10
      })

      const result = SimulationEngine.simulate(investment, 'yearly')

      expect(result.leveragedAmount).toBe(3000)
      expect(result.grossGain).toBeGreaterThan(0)
    })

    it('devrait rejeter un investissement invalide', () => {
      const investment = new Investment({
        amount: -100, // Montant invalide
        leverage: 15 // Levier invalide
      })

      expect(() => {
        SimulationEngine.simulate(investment, 'yearly')
      }).toThrow()
    })
  })

  describe('simulateAllPeriods', () => {
    it('devrait calculer pour toutes les périodes', () => {
      const investment = new Investment({
        amount: 1000,
        expectedReturn: 10
      })

      const results = SimulationEngine.simulateAllPeriods(investment)

      expect(results).toHaveProperty('daily')
      expect(results).toHaveProperty('weekly')
      expect(results).toHaveProperty('monthly')
      expect(results).toHaveProperty('yearly')

      // Vérifier la cohérence entre les périodes
      expect(results.yearly.netGain).toBeGreaterThan(results.monthly.netGain)
      expect(results.monthly.netGain).toBeGreaterThan(results.weekly.netGain)
      expect(results.weekly.netGain).toBeGreaterThan(results.daily.netGain)
    })
  })

  describe('getDaysInPeriod', () => {
    it('devrait retourner le bon nombre de jours pour chaque période', () => {
      expect(SimulationEngine.getDaysInPeriod('daily')).toBe(1)
      expect(SimulationEngine.getDaysInPeriod('weekly')).toBe(7)
      expect(SimulationEngine.getDaysInPeriod('monthly')).toBe(30)
      expect(SimulationEngine.getDaysInPeriod('yearly')).toBe(365)
    })
  })
})

