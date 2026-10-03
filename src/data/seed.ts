import type {
  Assinatura,
  CategoriaDiaADia,
  Config,
  GastoFixo,
  ItemPatrimonio,
  Mes,
  ObjetivoInvestimento,
  Parcela,
  Receita,
  Separacao,
} from '../lib/types'

export const MES_ATUAL = '2026-10'

export const seedReceitas: Receita[] = [
  {
    id: 'receita-salario',
    mesId: MES_ATUAL,
    fonte: 'Salário',
    valor: 4231.07,
    tipo: 'Recorrente',
    obs: 'Validar valor líquido',
  },
  {
    id: 'receita-vale-alimentacao',
    mesId: MES_ATUAL,
    fonte: 'Pix do vale-alimentação (sogro)',
    valor: 0,
    tipo: 'Recorrente',
    obs: 'Vale menos a parcela do carro (R$ 380)',
  },
]

export const seedSeparacoes: Separacao[] = [
  { id: 'separacao-reserva', nome: 'Reserva de emergência', percentual: 0.1 },
  { id: 'separacao-investimentos', nome: 'Investimentos', percentual: 0.1 },
  { id: 'separacao-dizimo', nome: 'Dízimo', percentual: 0 },
]

export const seedGastosFixos: GastoFixo[] = [
  {
    id: 'fixo-apartamento',
    nome: 'Apartamento na planta (Águas do Cerrado)',
    valor: 861.11,
    obs: 'Entrada',
    ativo: true,
  },
  {
    id: 'fixo-taxa-obra',
    nome: 'Taxa de obra',
    valor: 780.0,
    formaPagamento: 'Pix',
    obs: 'Crescente',
    ativo: true,
  },
  {
    id: 'fixo-consorcio',
    nome: 'Consórcio HS',
    valor: 584.48,
    obs: 'Meia parcela',
    ativo: true,
  },
  {
    id: 'fixo-gasolina-moto',
    nome: 'Gasolina e óleo da moto',
    valor: 240.35,
    ativo: true,
  },
  {
    id: 'fixo-academia',
    nome: 'Academia (CTIP Fitness)',
    valor: 149.0,
    ativo: true,
  },
  {
    id: 'fixo-tarifa-bancaria',
    nome: 'Tarifa bancária + seguro prestamista (Sicredi)',
    valor: 22.45,
    formaPagamento: 'Débito em conta',
    ativo: true,
  },
]

export const seedAssinaturas: Assinatura[] = [
  { id: 'assinatura-vivo', nome: 'Vivo', valor: 70.0, status: 'Ativa', ondeCobra: 'Cartão Sicredi' },
  { id: 'assinatura-google-one', nome: 'Google One', valor: 49.99, status: 'Ativa', ondeCobra: 'Cartão Sicredi' },
  { id: 'assinatura-icloud', nome: 'iCloud', valor: 19.9, status: 'Ativa', ondeCobra: 'Cartão Sicredi' },
  {
    id: 'assinatura-apple-nao-identificada',
    nome: 'Apple (não identificada)',
    valor: 19.9,
    status: 'Ativa',
    ondeCobra: 'Cartão Sicredi',
  },
  {
    id: 'assinatura-spotify',
    nome: 'Spotify (minha parte)',
    valor: 16.0,
    status: 'Ativa',
    ondeCobra: 'A confirmar',
  },
  {
    id: 'assinatura-claude',
    nome: 'Claude + IOF',
    valor: 113.85,
    status: 'Cancelada',
    ondeCobra: 'Cartão Sicredi',
  },
  {
    id: 'assinatura-vivo-2a-linha',
    nome: 'Vivo — 2ª linha',
    valor: 41.0,
    status: 'Cancelada',
    ondeCobra: 'Cartão Sicredi',
  },
  { id: 'assinatura-hbo-max', nome: 'HBO Max', valor: 29.9, status: 'Cancelada', ondeCobra: 'Apple' },
]

export const seedParcelas: Parcela[] = [
  {
    id: 'parcela-curso',
    compra: 'Curso',
    ondePaga: 'Cartão Nubank',
    noCartao: true,
    valorParcela: 245.0,
    totalParcelas: undefined,
    pagas: 0,
  },
  {
    id: 'parcela-havan',
    compra: 'Havan',
    ondePaga: 'Cartão Sicredi',
    noCartao: true,
    valorParcela: 81.06,
    totalParcelas: 2,
    pagas: 0,
  },
  {
    id: 'parcela-jd-esportes-maga',
    compra: 'Jd Esportes Maga',
    ondePaga: 'Cartão Sicredi',
    noCartao: true,
    valorParcela: 64.34,
    totalParcelas: 3,
    pagas: 0,
  },
  {
    id: 'parcela-havan-app',
    compra: 'Havan (app)',
    ondePaga: 'App Havan',
    noCartao: false,
    valorParcela: 65.0,
    totalParcelas: 1,
    pagas: 0,
  },
]

export const seedCategorias: CategoriaDiaADia[] = [
  { id: 'categoria-alimentacao-fora', nome: 'Alimentação fora', orcamentoMensal: 200, ordem: 0 },
  { id: 'categoria-mercado', nome: 'Mercado', orcamentoMensal: 150, ordem: 1 },
  {
    id: 'categoria-imprevistos',
    nome: 'Imprevistos (gasolina extra, refeição necessária)',
    orcamentoMensal: 100,
    ordem: 2,
  },
  { id: 'categoria-farmacia-saude', nome: 'Farmácia e saúde', orcamentoMensal: 40, ordem: 3 },
  { id: 'categoria-lazer-compras', nome: 'Lazer e compras', orcamentoMensal: 50, ordem: 4 },
  { id: 'categoria-outros', nome: 'Outros', orcamentoMensal: 0, ordem: 5 },
]

export const seedPatrimonio: ItemPatrimonio[] = [
  { id: 'patrimonio-saldo-conta', tipo: 'tenho', nome: 'Saldo em conta', valor: 2.45 },
  { id: 'patrimonio-reserva', tipo: 'tenho', nome: 'Reserva de emergência', valor: 0 },
  { id: 'patrimonio-investimento-casamento', tipo: 'tenho', nome: 'Investimento casamento', valor: 5800.0 },
  { id: 'patrimonio-fatura-cartao', tipo: 'devo', nome: 'Fatura do cartão a vencer', valor: 1065.04 },
]

export const seedObjetivos: ObjetivoInvestimento[] = [
  { id: 'objetivo-casamento', nome: 'Casamento', saldoAtual: 5800.0, prazo: '2027' },
  { id: 'objetivo-patrimonio-longo-prazo', nome: 'Patrimônio de longo prazo', saldoAtual: 0 },
]

export const seedConfig: Config = {
  id: 'config',
  metaGastos: 0.8,
  mesesReservaMeta: 3,
}

export const seedMesAtual: Mes = {
  id: MES_ATUAL,
  fechado: false,
}

/**
 * Histórico jan–set/2026: a spec só fornece receitas e gastos totais por mês
 * (seção 8). O detalhamento (fixos/assinaturas/parcelas/dia a dia) desses
 * meses fechados não está disponível, então o snapshot guarda apenas o que é
 * conhecido; os demais campos ficam zerados como placeholder.
 */
const historicoReceitasGastos: Array<[mes: string, receitas: number, gastosTotais: number]> = [
  ['2026-01', 3852.93, 3787.43],
  ['2026-02', 3852.93, 3689.59],
  ['2026-03', 4231.07, 4443.45],
  ['2026-04', 4231.07, 4238.57],
  ['2026-05', 4231.07, 4239.76],
  ['2026-06', 4231.07, 4030.98],
  ['2026-07', 4056.0, 4027.7],
  ['2026-08', 4071.0, 3843.79],
  ['2026-09', 4260.0, 4357.52],
]

export const seedMesesHistorico: Mes[] = historicoReceitasGastos.map(([id, receitas, gastosTotais]) => ({
  id,
  fechado: true,
  snapshot: {
    receitas,
    separado: 0,
    limiteGastos: receitas,
    fixos: 0,
    assinaturas: 0,
    economiaAssinaturas: 0,
    parcelasDoMes: 0,
    saldoParcelas: 0,
    tetoDiaADia: 0,
    gastosTotais,
    percentualGastos: gastosTotais / receitas,
    sobraLivre: receitas - gastosTotais,
    alvoReserva: 0,
  },
}))
