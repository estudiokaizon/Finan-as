import { db } from './db'
import { dataParaMesId } from './mes'

/**
 * Apaga todos os dados do usuário, mas mantém a estrutura mínima para o app continuar
 * funcionando: os 3 slots fixos de "Separar primeiro" (zerados), a configuração padrão
 * e um mês aberto novo (o mês real de hoje).
 */
export async function apagarTodosOsDados(): Promise<void> {
  await db.transaction('rw', db.tables, async () => {
    for (const tabela of db.tables) {
      await tabela.clear()
    }

    await db.separacoes.bulkAdd([
      { id: 'separacao-reserva', nome: 'Reserva de emergência', percentual: 0 },
      { id: 'separacao-investimentos', nome: 'Investimentos', percentual: 0 },
      { id: 'separacao-dizimo', nome: 'Dízimo', percentual: 0 },
    ])
    await db.config.add({ id: 'config', metaGastos: 0.8, mesesReservaMeta: 3 })
    await db.meses.add({ id: dataParaMesId(new Date()), fechado: false })
  })
}
