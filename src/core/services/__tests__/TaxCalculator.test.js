/**
 * Tests unitaires pour TaxCalculator
 */

import { describe, it, expect } from 'vitest'
import { TaxCalculator } from '../TaxCalculator.js'

describe('TaxCalculator', () => {
  describe('calculate', () => {
    it('devrait calculer les prélèvements sociaux', () => {
      const gain = 1000
      const result = TaxCalculator.calculate(gain)

      expect(result.socialCharges).toBe(gain * 0.172)
      expect(result.total).toBeGreaterThan(0)
    })

    it('devrait calculer le gain net', () => {
      const gain = 1000
      const result = TaxCalculator.calculate(gain)

      expect(result.netGain).toBeLessThan(gain)
      expect(result.netGain).toBe(gain - result.total)
    })

    it('devrait prendre en compte le revenu annuel pour l\'impôt', () => {
      const gain = 10000
      const lowIncome = TaxCalculator.calculate(gain, 20000)
      const highIncome = TaxCalculator.calculate(gain, 100000)

      // Un revenu plus élevé devrait payer plus d'impôts
      expect(highIncome.incomeTax).toBeGreaterThanOrEqual(lowIncome.incomeTax)
    })
  })

  describe('calculateNetGain', () => {
    it('devrait retourner le gain net après impôts', () => {
      const grossGain = 1000
      const netGain = TaxCalculator.calculateNetGain(grossGain)

      expect(netGain).toBeLessThan(grossGain)
      expect(netGain).toBeGreaterThan(0)
    })
  })
})

