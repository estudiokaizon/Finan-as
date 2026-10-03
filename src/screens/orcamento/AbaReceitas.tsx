import { useState } from 'react'
import { Campo, classeInput } from '../../components/Campo'
import { ChipSelecionavel } from '../../components/ChipSelecionavel'
import { Modal } from '../../components/Modal'
import { db } from '../../lib/db'
import { formatarMoeda } from '../../lib/formato'
import { useReceitas } from '../../lib/hooks'
import { gerarId } from '../../lib/id'
import type { Receita } from '../../lib/types'

type FormularioReceita = {
  fonte: string
  valor: string
  tipo: Receita['tipo']
  obs: string
}

const vazio: FormularioReceita = { fonte: '', valor: '', tipo: 'Recorrente', obs: '' }

export function AbaReceitas({ mesAtualId }: { mesAtualId: string | undefined }) {
  const receitas = useReceitas(mesAtualId)
  const [editando, setEditando] = useState<Receita | null>(null)
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState<FormularioReceita>(vazio)

  const total = receitas?.reduce((soma, r) => soma + r.valor, 0) ?? 0

  function abrirEdicao(receita: Receita) {
    setEditando(receita)
    setForm({ fonte: receita.fonte, valor: String(receita.valor), tipo: receita.tipo, obs: receita.obs ?? '' })
  }

  function abrirCriacao() {
    setCriando(true)
    setForm(vazio)
  }

  function fechar() {
    setEditando(null)
    setCriando(false)
    setForm(vazio)
  }

  async function salvar() {
    if (!mesAtualId || !form.fonte.trim()) return
    const valor = Number(form.valor.replace(',', '.')) || 0
    if (editando) {
      await db.receitas.update(editando.id, { fonte: form.fonte, valor, tipo: form.tipo, obs: form.obs || undefined })
    } else {
      await db.receitas.add({
        id: gerarId(),
        mesId: mesAtualId,
        fonte: form.fonte,
        valor,
        tipo: form.tipo,
        obs: form.obs || undefined,
      })
    }
    fechar()
  }

  async function excluir() {
    if (!editando) return
    await db.receitas.delete(editando.id)
    fechar()
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-marinho/70">Total de receitas: {formatarMoeda(total)}</p>

      <div className="space-y-2">
        {receitas?.map((receita) => (
          <button
            key={receita.id}
            type="button"
            onClick={() => abrirEdicao(receita)}
            className="flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-sm"
          >
            <div>
              <p className="font-medium text-marinho">{receita.fonte}</p>
              <p className="text-xs text-marinho/50">
                {receita.tipo}
                {receita.obs ? ` · ${receita.obs}` : ''}
              </p>
            </div>
            <p className="font-serif font-semibold text-marinho">{formatarMoeda(receita.valor)}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={abrirCriacao}
        className="mt-3 w-full rounded-xl border-2 border-dashed border-marinho/20 py-3 text-sm font-medium text-marinho/60"
      >
        + Adicionar receita
      </button>

      <Modal aberto={editando !== null || criando} onFechar={fechar} titulo={editando ? 'Editar receita' : 'Nova receita'}>
        <div className="space-y-4">
          <Campo rotulo="Fonte">
            <input
              className={classeInput}
              value={form.fonte}
              onChange={(e) => setForm({ ...form, fonte: e.target.value })}
              placeholder="Ex.: Salário"
            />
          </Campo>
          <Campo rotulo="Valor (R$)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
              placeholder="0,00"
            />
          </Campo>
          <div>
            <p className="mb-1.5 text-sm font-medium text-marinho/70">Tipo</p>
            <div className="flex gap-2">
              <ChipSelecionavel
                rotulo="Recorrente"
                selecionado={form.tipo === 'Recorrente'}
                onClick={() => setForm({ ...form, tipo: 'Recorrente' })}
              />
              <ChipSelecionavel
                rotulo="Extra"
                selecionado={form.tipo === 'Extra'}
                onClick={() => setForm({ ...form, tipo: 'Extra' })}
              />
            </div>
          </div>
          <Campo rotulo="Observação (opcional)">
            <input
              className={classeInput}
              value={form.obs}
              onChange={(e) => setForm({ ...form, obs: e.target.value })}
            />
          </Campo>

          <div className="flex gap-2 pt-2">
            {editando && (
              <button
                type="button"
                onClick={excluir}
                className="flex-1 rounded-xl border border-alerta/30 py-3 font-semibold text-alerta"
              >
                Excluir
              </button>
            )}
            <button
              type="button"
              onClick={salvar}
              className="flex-1 rounded-xl bg-marinho py-3 font-semibold text-white"
            >
              Salvar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
