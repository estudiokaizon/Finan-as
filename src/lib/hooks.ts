import { useLiveQuery } from 'dexie-react-hooks'
import { calcularResumoMes } from './calculos'
import { db } from './db'
import type { ResumoMes } from './types'

export function useReceitas(mesId: string | undefined) {
  return useLiveQuery(() => (mesId ? db.receitas.where('mesId').equals(mesId).toArray() : []), [mesId])
}

export function useLancamentos(mesId: string | undefined) {
  return useLiveQuery(
    () => (mesId ? db.lancamentos.where('mesId').equals(mesId).reverse().sortBy('data') : []),
    [mesId],
  )
}

export function useSeparacoes() {
  return useLiveQuery(() => db.separacoes.toArray(), [])
}

export function useGastosFixos() {
  return useLiveQuery(() => db.gastosFixos.toArray(), [])
}

export function useAssinaturas() {
  return useLiveQuery(() => db.assinaturas.toArray(), [])
}

export function useParcelas() {
  return useLiveQuery(() => db.parcelas.toArray(), [])
}

export function useCategorias() {
  return useLiveQuery(() => db.categorias.orderBy('ordem').toArray(), [])
}

export function useConfig() {
  return useLiveQuery(() => db.config.get('config'), [])
}

export function usePatrimonio() {
  return useLiveQuery(() => db.patrimonio.toArray(), [])
}

export function useObjetivos() {
  return useLiveQuery(() => db.objetivos.toArray(), [])
}

export function useMeses() {
  return useLiveQuery(() => db.meses.toArray(), [])
}

export type ResumoDoMes = { mesId: string; fechado: boolean; resumo: ResumoMes }

/** Resumo de todos os meses (fechados = snapshot congelado; o mês aberto = cálculo ao vivo), ordenados do mais antigo ao mais novo. */
export function useResumosPorMes(): ResumoDoMes[] | undefined {
  const meses = useMeses()
  const mesAtualId = meses?.find((m) => !m.fechado)?.id
  const receitas = useReceitas(mesAtualId)
  const separacoes = useSeparacoes()
  const gastosFixos = useGastosFixos()
  const assinaturas = useAssinaturas()
  const parcelas = useParcelas()
  const categorias = useCategorias()
  const config = useConfig()

  if (!meses) return undefined

  const dadosAtualProntos = receitas && separacoes && gastosFixos && assinaturas && parcelas && categorias && config

  const resumos: ResumoDoMes[] = []
  for (const mes of [...meses].sort((a, b) => a.id.localeCompare(b.id))) {
    if (mes.fechado && mes.snapshot) {
      resumos.push({ mesId: mes.id, fechado: true, resumo: mes.snapshot })
    } else if (!mes.fechado && dadosAtualProntos) {
      resumos.push({
        mesId: mes.id,
        fechado: false,
        resumo: calcularResumoMes({
          receitas: receitas!,
          separacoes: separacoes!,
          gastosFixos: gastosFixos!,
          assinaturas: assinaturas!,
          parcelas: parcelas!,
          categorias: categorias!,
          mesesReservaMeta: config!.mesesReservaMeta,
        }),
      })
    }
  }
  return resumos
}
