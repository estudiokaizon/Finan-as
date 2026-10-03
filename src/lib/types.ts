export type ResumoMes = {
  receitas: number
  separado: number
  limiteGastos: number
  fixos: number
  assinaturas: number
  economiaAssinaturas: number
  parcelasDoMes: number
  saldoParcelas: number
  tetoDiaADia: number
  gastosTotais: number
  percentualGastos: number
  sobraLivre: number
  alvoReserva: number
}

export type Mes = {
  id: string // "2026-10"
  fechado: boolean
  snapshot?: ResumoMes
}

// Escopados por mês
export type Receita = {
  id: string
  mesId: string
  fonte: string
  valor: number
  tipo: 'Recorrente' | 'Extra'
  obs?: string
}

export type Lancamento = {
  id: string
  mesId: string
  data: string
  descricao: string
  categoriaId: string
  valor: number
  forma: 'Pix' | 'Cartão de crédito' | 'Débito' | 'Dinheiro'
}

// Globais / persistentes (editados em Orçamento ou Ajustes; o snapshot do mês
// congela os totais calculados no momento do fechamento)
export type Separacao = {
  id: string
  nome: 'Reserva de emergência' | 'Investimentos' | 'Dízimo'
  percentual: number // 0.10
}

export type GastoFixo = {
  id: string
  nome: string
  valor: number
  diaVencimento?: number
  formaPagamento?: string
  obs?: string
  ativo: boolean
}

export type Assinatura = {
  id: string
  nome: string
  valor: number
  status: 'Ativa' | 'Cancelada'
  ondeCobra: string
  dataCancelamento?: string
  obs?: string
}

export type Parcela = {
  id: string
  compra: string
  ondePaga: string
  noCartao: boolean
  valorParcela: number
  totalParcelas?: number // undefined = a confirmar
  pagas: number
}

export type CategoriaDiaADia = {
  id: string
  nome: string
  orcamentoMensal: number
  ordem: number
}

export type ItemPatrimonio = {
  id: string
  tipo: 'tenho' | 'devo'
  nome: string
  valor: number
  obs?: string
}

export type ObjetivoInvestimento = {
  id: string
  nome: string
  saldoAtual: number
  meta?: number
  prazo?: string
  obs?: string
}

export type Config = {
  id: 'config'
  metaGastos: number // 0.80
  mesesReservaMeta: number // 3
}
