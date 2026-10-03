import {
  seedAssinaturas,
  seedCategorias,
  seedConfig,
  seedGastosFixos,
  seedMesAtual,
  seedMesesHistorico,
  seedObjetivos,
  seedParcelas,
  seedPatrimonio,
  seedReceitas,
  seedSeparacoes,
} from '../data/seed'
import { db } from './db'

let promessaSeed: Promise<void> | null = null

/** Popula o banco com os dados iniciais (seção 8 da spec) apenas na primeira execução. */
export function garantirDadosIniciais(): Promise<void> {
  if (!promessaSeed) promessaSeed = executarSeed()
  return promessaSeed
}

async function executarSeed(): Promise<void> {
  const totalMeses = await db.meses.count()
  if (totalMeses > 0) return

  await db.transaction(
    'rw',
    [
      db.meses,
      db.receitas,
      db.separacoes,
      db.gastosFixos,
      db.assinaturas,
      db.parcelas,
      db.categorias,
      db.patrimonio,
      db.objetivos,
      db.config,
    ],
    async () => {
      await db.meses.bulkAdd([seedMesAtual, ...seedMesesHistorico])
      await db.receitas.bulkAdd(seedReceitas)
      await db.separacoes.bulkAdd(seedSeparacoes)
      await db.gastosFixos.bulkAdd(seedGastosFixos)
      await db.assinaturas.bulkAdd(seedAssinaturas)
      await db.parcelas.bulkAdd(seedParcelas)
      await db.categorias.bulkAdd(seedCategorias)
      await db.patrimonio.bulkAdd(seedPatrimonio)
      await db.objetivos.bulkAdd(seedObjetivos)
      await db.config.add(seedConfig)
    },
  )
}
