import { calcularResumoMes, faltamParcela } from './calculos'
import { db } from './db'
import { gerarId } from './id'
import { proximoMesId } from './mes'
import type { Assinatura, CategoriaDiaADia, GastoFixo, Parcela, Receita, Separacao } from './types'

type DadosFechamento = {
  receitas: Receita[]
  separacoes: Separacao[]
  gastosFixos: GastoFixo[]
  assinaturas: Assinatura[]
  parcelas: Parcela[]
  categorias: CategoriaDiaADia[]
  mesesReservaMeta: number
}

/**
 * Fecha o mês atual (seção 7): congela o snapshot, soma 1 em `pagas` das parcelas
 * ainda ativas e cria o próximo mês copiando as receitas recorrentes.
 */
export async function fecharMes(mesAtualId: string, dados: DadosFechamento): Promise<string> {
  const resumo = calcularResumoMes(dados)
  const novoMesId = proximoMesId(mesAtualId)
  const receitasRecorrentes = dados.receitas.filter((r) => r.tipo === 'Recorrente')

  await db.transaction('rw', [db.meses, db.parcelas, db.receitas], async () => {
    await db.meses.update(mesAtualId, { fechado: true, snapshot: resumo })

    for (const parcela of dados.parcelas) {
      const faltam = faltamParcela(parcela)
      if (faltam === '?' || faltam > 0) {
        await db.parcelas.update(parcela.id, { pagas: parcela.pagas + 1 })
      }
    }

    await db.meses.add({ id: novoMesId, fechado: false })
    await db.receitas.bulkAdd(
      receitasRecorrentes.map((r) => ({
        id: gerarId(),
        mesId: novoMesId,
        fonte: r.fonte,
        valor: r.valor,
        tipo: r.tipo,
        obs: r.obs,
      })),
    )
  })

  return novoMesId
}
