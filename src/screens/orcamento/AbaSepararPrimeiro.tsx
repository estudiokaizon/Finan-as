import { useState } from 'react'
import { Campo, classeInput } from '../../components/Campo'
import { Modal } from '../../components/Modal'
import { db } from '../../lib/db'
import { formatarMoeda, formatarPercentual } from '../../lib/formato'
import { useReceitas, useSeparacoes } from '../../lib/hooks'
import type { Separacao } from '../../lib/types'

export function AbaSepararPrimeiro({ mesAtualId }: { mesAtualId: string | undefined }) {
  const separacoes = useSeparacoes()
  const receitas = useReceitas(mesAtualId)
  const [editando, setEditando] = useState<Separacao | null>(null)
  const [percentualTexto, setPercentualTexto] = useState('')

  const receitaTotal = receitas?.reduce((soma, r) => soma + r.valor, 0) ?? 0
  const totalPercentual = separacoes?.reduce((soma, s) => soma + s.percentual, 0) ?? 0

  function abrirEdicao(separacao: Separacao) {
    setEditando(separacao)
    setPercentualTexto(String(Math.round(separacao.percentual * 1000) / 10))
  }

  async function salvar() {
    if (!editando) return
    const percentual = Math.max(0, Number(percentualTexto.replace(',', '.')) || 0) / 100
    await db.separacoes.update(editando.id, { percentual })
    setEditando(null)
  }

  return (
    <div>
      <p className="mb-3 text-sm text-marinho/70">
        Total separado: <span className="font-semibold text-marinho">{formatarPercentual(totalPercentual)}</span> ={' '}
        {formatarMoeda(receitaTotal * totalPercentual)}
      </p>

      <div className="space-y-2">
        {separacoes?.map((separacao) => (
          <button
            key={separacao.id}
            type="button"
            onClick={() => abrirEdicao(separacao)}
            className="flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-sm"
          >
            <p className="font-medium text-marinho">{separacao.nome}</p>
            <div className="text-right">
              <p className="font-serif font-semibold text-marinho">{formatarPercentual(separacao.percentual)}</p>
              <p className="text-xs text-marinho/50">{formatarMoeda(receitaTotal * separacao.percentual)}</p>
            </div>
          </button>
        ))}
      </div>

      <Modal aberto={editando !== null} onFechar={() => setEditando(null)} titulo={editando?.nome ?? ''}>
        <div className="space-y-4">
          <Campo rotulo="Percentual (%)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={percentualTexto}
              onChange={(e) => setPercentualTexto(e.target.value)}
              placeholder="10"
            />
          </Campo>
          <button type="button" onClick={salvar} className="w-full rounded-xl bg-marinho py-3 font-semibold text-white">
            Salvar
          </button>
        </div>
      </Modal>
    </div>
  )
}
