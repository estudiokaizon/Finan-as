import { useLiveQuery } from 'dexie-react-hooks'
import { db } from './db'

/** O único mês em aberto (não fechado). Lançamentos e receitas novos sempre entram nele. */
export function useMesAtual() {
  return useLiveQuery(() => db.meses.filter((m) => !m.fechado).first(), [])
}
