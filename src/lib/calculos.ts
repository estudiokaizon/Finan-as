import { somarMeses } from './mes'
import type {
  Assinatura,
  CategoriaDiaADia,
  GastoFixo,
  Lancamento,
  Parcela,
  Receita,
  ResumoMes,
  Separacao,
} from './types'

export function calcularReceitas(receitas: Receita[]): number {
  return receitas.reduce((soma, r) => soma + r.valor, 0)
}

export function calcularPercentualSeparacao(separacoes: Separacao[]): number {
  return separacoes.reduce((soma, s) => soma + s.percentual, 0)
}

export function calcularSeparado(receitas: Receita[], separacoes: Separacao[]): number {
  return calcularReceitas(receitas) * calcularPercentualSeparacao(separacoes)
}

export function calcularLimiteGastos(receitas: Receita[], separacoes: Separacao[]): number {
  return calcularReceitas(receitas) - calcularSeparado(receitas, separacoes)
}

export function calcularFixos(gastosFixos: GastoFixo[]): number {
  return gastosFixos.filter((g) => g.ativo).reduce((soma, g) => soma + g.valor, 0)
}

export function calcularAssinaturasAtivas(assinaturas: Assinatura[]): number {
  return assinaturas
    .filter((a) => a.status === 'Ativa')
    .reduce((soma, a) => soma + a.valor, 0)
}

export function calcularEconomiaAssinaturas(assinaturas: Assinatura[]): number {
  return assinaturas
    .filter((a) => a.status === 'Cancelada')
    .reduce((soma, a) => soma + a.valor, 0)
}

/** Quantas parcelas faltam pagar. `undefined` (total a confirmar) resulta em "?" e a parcela continua contando. */
export function faltamParcela(parcela: Parcela): number | '?' {
  if (parcela.totalParcelas === undefined) return '?'
  return parcela.totalParcelas - parcela.pagas
}

export function calcularParcelasDoMes(parcelas: Parcela[]): number {
  return parcelas
    .filter((p) => {
      const faltam = faltamParcela(p)
      return faltam === '?' || faltam > 0
    })
    .reduce((soma, p) => soma + p.valorParcela, 0)
}

/** A parcela ainda está sendo paga `offset` meses à frente do mês atual (0 = mês atual)? */
function parcelaAtivaNoOffset(parcela: Parcela, offset: number): boolean {
  const faltam = faltamParcela(parcela)
  return faltam === '?' || faltam > offset
}

/** Último mês em que a parcela ainda é cobrada, ou `null` se o total ainda está "a confirmar". */
export function calcularMesTermino(mesAtualId: string, parcela: Parcela): string | null {
  const faltam = faltamParcela(parcela)
  if (faltam === '?') return null
  if (faltam <= 0) return null
  return somarMeses(mesAtualId, faltam - 1)
}

/** Projeta, para os próximos `quantidadeMeses` (incluindo o atual), quanto de parcelas cai em cada mês. */
export function calcularLinhaDoTempoParcelas(
  parcelas: Parcela[],
  mesAtualId: string,
  quantidadeMeses = 6,
): Array<{ mesId: string; total: number }> {
  return Array.from({ length: quantidadeMeses }, (_, offset) => ({
    mesId: somarMeses(mesAtualId, offset),
    total: parcelas
      .filter((p) => parcelaAtivaNoOffset(p, offset))
      .reduce((soma, p) => soma + p.valorParcela, 0),
  }))
}

export function calcularSaldoParcelas(parcelas: Parcela[]): number {
  return parcelas.reduce((soma, p) => {
    const faltam = faltamParcela(p)
    if (faltam === '?') return soma
    return soma + p.valorParcela * faltam
  }, 0)
}

export function calcularTetoDiaADia(
  receitas: Receita[],
  separacoes: Separacao[],
  gastosFixos: GastoFixo[],
  assinaturas: Assinatura[],
  parcelas: Parcela[],
): number {
  const limiteGastos = calcularLimiteGastos(receitas, separacoes)
  const fixos = calcularFixos(gastosFixos)
  const assinaturasAtivas = calcularAssinaturasAtivas(assinaturas)
  const parcelasDoMes = calcularParcelasDoMes(parcelas)
  return limiteGastos - fixos - assinaturasAtivas - parcelasDoMes
}

export function calcularOrcamentoTotalDiaADia(categorias: CategoriaDiaADia[]): number {
  return categorias.reduce((soma, c) => soma + c.orcamentoMensal, 0)
}

export function calcularGastoCategoria(lancamentos: Lancamento[], categoriaId: string): number {
  return lancamentos
    .filter((l) => l.categoriaId === categoriaId)
    .reduce((soma, l) => soma + l.valor, 0)
}

export function calcularGastoDiaADiaReal(lancamentos: Lancamento[]): number {
  return lancamentos.reduce((soma, l) => soma + l.valor, 0)
}

export function calcularGastosTotais(
  gastosFixos: GastoFixo[],
  assinaturas: Assinatura[],
  parcelas: Parcela[],
  categorias: CategoriaDiaADia[],
): number {
  return (
    calcularFixos(gastosFixos) +
    calcularAssinaturasAtivas(assinaturas) +
    calcularParcelasDoMes(parcelas) +
    calcularOrcamentoTotalDiaADia(categorias)
  )
}

export function calcularPercentualGastos(
  receitas: Receita[],
  gastosFixos: GastoFixo[],
  assinaturas: Assinatura[],
  parcelas: Parcela[],
  categorias: CategoriaDiaADia[],
): number {
  const receitaTotal = calcularReceitas(receitas)
  if (receitaTotal === 0) return 0
  return calcularGastosTotais(gastosFixos, assinaturas, parcelas, categorias) / receitaTotal
}

export function calcularSobraLivre(
  receitas: Receita[],
  separacoes: Separacao[],
  gastosFixos: GastoFixo[],
  assinaturas: Assinatura[],
  parcelas: Parcela[],
  categorias: CategoriaDiaADia[],
): number {
  const receitaTotal = calcularReceitas(receitas)
  const gastosTotais = calcularGastosTotais(gastosFixos, assinaturas, parcelas, categorias)
  const separado = calcularSeparado(receitas, separacoes)
  return receitaTotal - gastosTotais - separado
}

export function calcularAlvoReserva(
  gastosFixos: GastoFixo[],
  assinaturas: Assinatura[],
  parcelas: Parcela[],
  categorias: CategoriaDiaADia[],
  mesesReservaMeta: number,
): number {
  return calcularGastosTotais(gastosFixos, assinaturas, parcelas, categorias) * mesesReservaMeta
}

export type DadosMes = {
  receitas: Receita[]
  separacoes: Separacao[]
  gastosFixos: GastoFixo[]
  assinaturas: Assinatura[]
  parcelas: Parcela[]
  categorias: CategoriaDiaADia[]
  mesesReservaMeta: number
}

export function calcularResumoMes(dados: DadosMes): ResumoMes {
  const { receitas, separacoes, gastosFixos, assinaturas, parcelas, categorias, mesesReservaMeta } = dados
  return {
    receitas: calcularReceitas(receitas),
    separado: calcularSeparado(receitas, separacoes),
    limiteGastos: calcularLimiteGastos(receitas, separacoes),
    fixos: calcularFixos(gastosFixos),
    assinaturas: calcularAssinaturasAtivas(assinaturas),
    economiaAssinaturas: calcularEconomiaAssinaturas(assinaturas),
    parcelasDoMes: calcularParcelasDoMes(parcelas),
    saldoParcelas: calcularSaldoParcelas(parcelas),
    tetoDiaADia: calcularTetoDiaADia(receitas, separacoes, gastosFixos, assinaturas, parcelas),
    gastosTotais: calcularGastosTotais(gastosFixos, assinaturas, parcelas, categorias),
    percentualGastos: calcularPercentualGastos(receitas, gastosFixos, assinaturas, parcelas, categorias),
    sobraLivre: calcularSobraLivre(receitas, separacoes, gastosFixos, assinaturas, parcelas, categorias),
    alvoReserva: calcularAlvoReserva(gastosFixos, assinaturas, parcelas, categorias, mesesReservaMeta),
  }
}

// Alertas automáticos (seção 5)
export type Alerta = {
  tipo: 'acima-meta' | 'dia-a-dia-acima-teto' | 'categoria-estourada' | 'sobra-negativa'
  mensagem: string
}

export function calcularAlertas(
  resumo: ResumoMes,
  metaGastos: number,
  categorias: CategoriaDiaADia[],
  lancamentos: Lancamento[],
): Alerta[] {
  const alertas: Alerta[] = []

  if (resumo.percentualGastos > metaGastos) {
    const excedente = resumo.gastosTotais - resumo.receitas * metaGastos
    alertas.push({
      tipo: 'acima-meta',
      mensagem: `Acima da meta em R$ ${excedente.toFixed(2).replace('.', ',')}`,
    })
  }

  const orcamentoDiaADia = calcularOrcamentoTotalDiaADia(categorias)
  if (orcamentoDiaADia > resumo.tetoDiaADia) {
    alertas.push({
      tipo: 'dia-a-dia-acima-teto',
      mensagem: 'O orçamento do dia a dia está acima do teto disponível neste mês.',
    })
  }

  for (const categoria of categorias) {
    const gasto = calcularGastoCategoria(lancamentos, categoria.id)
    if (categoria.orcamentoMensal > 0 && gasto > categoria.orcamentoMensal) {
      alertas.push({
        tipo: 'categoria-estourada',
        mensagem: `${categoria.nome} estourou o orçamento.`,
      })
    }
  }

  if (resumo.sobraLivre < 0) {
    alertas.push({
      tipo: 'sobra-negativa',
      mensagem: `Falta R$ ${Math.abs(resumo.sobraLivre).toFixed(2).replace('.', ',')} para fechar o mês`,
    })
  }

  return alertas
}
