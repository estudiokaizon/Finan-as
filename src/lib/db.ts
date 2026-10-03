import Dexie, { type EntityTable } from 'dexie'
import type {
  Assinatura,
  CategoriaDiaADia,
  Config,
  GastoFixo,
  ItemPatrimonio,
  Lancamento,
  Mes,
  ObjetivoInvestimento,
  Parcela,
  Receita,
  Separacao,
} from './types'

export class FinancasDB extends Dexie {
  meses!: EntityTable<Mes, 'id'>
  receitas!: EntityTable<Receita, 'id'>
  lancamentos!: EntityTable<Lancamento, 'id'>
  separacoes!: EntityTable<Separacao, 'id'>
  gastosFixos!: EntityTable<GastoFixo, 'id'>
  assinaturas!: EntityTable<Assinatura, 'id'>
  parcelas!: EntityTable<Parcela, 'id'>
  categorias!: EntityTable<CategoriaDiaADia, 'id'>
  patrimonio!: EntityTable<ItemPatrimonio, 'id'>
  objetivos!: EntityTable<ObjetivoInvestimento, 'id'>
  config!: EntityTable<Config, 'id'>

  constructor() {
    super('financas-db')
    this.version(1).stores({
      meses: 'id, fechado',
      receitas: 'id, mesId',
      lancamentos: 'id, mesId, categoriaId, data',
      separacoes: 'id',
      gastosFixos: 'id, ativo',
      assinaturas: 'id, status',
      parcelas: 'id',
      categorias: 'id, ordem',
      patrimonio: 'id, tipo',
      objetivos: 'id',
      config: 'id',
    })
  }
}

export const db = new FinancasDB()
