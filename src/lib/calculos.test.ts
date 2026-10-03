import { describe, expect, it } from 'vitest'
import {
  seedCategorias,
  seedGastosFixos,
  seedAssinaturas,
  seedParcelas,
  seedReceitas,
  seedSeparacoes,
} from '../data/seed'
import {
  calcularAssinaturasAtivas,
  calcularEconomiaAssinaturas,
  calcularFixos,
  calcularGastosTotais,
  calcularLinhaDoTempoParcelas,
  calcularMesTermino,
  calcularParcelasDoMes,
  calcularPercentualGastos,
  calcularTetoDiaADia,
} from './calculos'

describe('cálculos do mês de outubro/2026 (seed)', () => {
  it('fixos = 2.637,39', () => {
    expect(calcularFixos(seedGastosFixos)).toBeCloseTo(2637.39, 2)
  })

  it('assinaturas ativas = 175,79', () => {
    expect(calcularAssinaturasAtivas(seedAssinaturas)).toBeCloseTo(175.79, 2)
  })

  it('economia com cancelamentos = 184,75', () => {
    expect(calcularEconomiaAssinaturas(seedAssinaturas)).toBeCloseTo(184.75, 2)
  })

  it('parcelas do mês = 455,40', () => {
    expect(calcularParcelasDoMes(seedParcelas)).toBeCloseTo(455.4, 2)
  })

  it('teto do dia a dia = 116,28', () => {
    expect(
      calcularTetoDiaADia(seedReceitas, seedSeparacoes, seedGastosFixos, seedAssinaturas, seedParcelas),
    ).toBeCloseTo(116.28, 2)
  })

  it('gastos totais = 3.808,58', () => {
    expect(
      calcularGastosTotais(seedGastosFixos, seedAssinaturas, seedParcelas, seedCategorias),
    ).toBeCloseTo(3808.58, 2)
  })

  it('% em gastos = 90,0%', () => {
    const percentual = calcularPercentualGastos(
      seedReceitas,
      seedGastosFixos,
      seedAssinaturas,
      seedParcelas,
      seedCategorias,
    )
    expect(percentual * 100).toBeCloseTo(90.0, 1)
  })
})

describe('parcelas — término e linha do tempo', () => {
  it('parcela com total a confirmar não tem mês de término', () => {
    const curso = seedParcelas.find((p) => p.id === 'parcela-curso')!
    expect(calcularMesTermino('2026-10', curso)).toBeNull()
  })

  it('Havan (2 parcelas, 0 pagas) termina em novembro/2026', () => {
    const havan = seedParcelas.find((p) => p.id === 'parcela-havan')!
    expect(calcularMesTermino('2026-10', havan)).toBe('2026-11')
  })

  it('Havan app (1 parcela, 0 pagas) termina no próprio mês', () => {
    const havanApp = seedParcelas.find((p) => p.id === 'parcela-havan-app')!
    expect(calcularMesTermino('2026-10', havanApp)).toBe('2026-10')
  })

  it('linha do tempo de 6 meses soma corretamente e cai com o tempo', () => {
    const linha = calcularLinhaDoTempoParcelas(seedParcelas, '2026-10', 6)
    expect(linha).toHaveLength(6)
    // out/2026: todas as 4 parcelas ativas
    expect(linha[0]).toEqual({ mesId: '2026-10', total: 455.4 })
    // nov/2026: Havan app já terminou em outubro
    expect(linha[1].total).toBeCloseTo(245.0 + 81.06 + 64.34, 2)
    // dez/2026: Havan também terminou (2 de 2)
    expect(linha[2].total).toBeCloseTo(245.0 + 64.34, 2)
    // jan/2027: só o curso (a confirmar) continua, pois não tem fim definido
    expect(linha[3].mesId).toBe('2027-01')
    expect(linha[3].total).toBeCloseTo(245.0, 2)
  })
})
