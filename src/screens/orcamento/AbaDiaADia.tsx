import { useState } from 'react'
import { BarraProgresso } from '../../components/BarraProgresso'
import { Campo, classeInput } from '../../components/Campo'
import { Modal } from '../../components/Modal'
import { calcularGastoCategoria, calcularOrcamentoTotalDiaADia } from '../../lib/calculos'
import { db } from '../../lib/db'
import { formatarMoeda } from '../../lib/formato'
import { useCategorias, useLancamentos } from '../../lib/hooks'
import { gerarId } from '../../lib/id'
import type { CategoriaDiaADia } from '../../lib/types'

type Formulario = { nome: string; orcamentoMensal: string }

const vazio: Formulario = { nome: '', orcamentoMensal: '' }

export function AbaDiaADia({ mesAtualId }: { mesAtualId: string | undefined }) {
  const categorias = useCategorias()
  const lancamentos = useLancamentos(mesAtualId)
  const [editando, setEditando] = useState<CategoriaDiaADia | null>(null)
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState<Formulario>(vazio)

  const total = categorias ? calcularOrcamentoTotalDiaADia(categorias) : 0

  function abrirEdicao(categoria: CategoriaDiaADia) {
    setEditando(categoria)
    setForm({ nome: categoria.nome, orcamentoMensal: String(categoria.orcamentoMensal) })
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
    if (!form.nome.trim()) return
    const orcamentoMensal = Number(form.orcamentoMensal.replace(',', '.')) || 0
    if (editando) {
      await db.categorias.update(editando.id, { nome: form.nome, orcamentoMensal })
    } else {
      const proximaOrdem = (categorias?.length ?? 0)
      await db.categorias.add({ id: gerarId(), nome: form.nome, orcamentoMensal, ordem: proximaOrdem })
    }
    fechar()
  }

  async function excluir() {
    if (!editando) return
    await db.categorias.delete(editando.id)
    fechar()
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-marinho/70">Orçamento total do dia a dia: {formatarMoeda(total)}</p>

      <div className="space-y-2">
        {categorias?.map((categoria) => {
          const gasto = lancamentos ? calcularGastoCategoria(lancamentos, categoria.id) : 0
          const estourou = categoria.orcamentoMensal > 0 && gasto > categoria.orcamentoMensal
          return (
            <button
              key={categoria.id}
              type="button"
              onClick={() => abrirEdicao(categoria)}
              className="w-full rounded-xl bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-marinho">{categoria.nome}</p>
                <p className="font-serif font-semibold text-marinho">{formatarMoeda(categoria.orcamentoMensal)}</p>
              </div>
              {mesAtualId && (
                <div className="mt-2">
                  <BarraProgresso
                    progresso={categoria.orcamentoMensal > 0 ? gasto / categoria.orcamentoMensal : 0}
                    cor={estourou ? 'alerta' : 'sucesso'}
                  />
                  <p className={`mt-1 text-xs ${estourou ? 'text-alerta' : 'text-marinho/50'}`}>
                    Gasto este mês: {formatarMoeda(gasto)}
                  </p>
                </div>
              )}
            </button>
          )
        })}
      </div>

      <button
        type="button"
        onClick={abrirCriacao}
        className="mt-3 w-full rounded-xl border-2 border-dashed border-marinho/20 py-3 text-sm font-medium text-marinho/60"
      >
        + Adicionar categoria
      </button>

      <Modal aberto={editando !== null || criando} onFechar={fechar} titulo={editando ? 'Editar categoria' : 'Nova categoria'}>
        <div className="space-y-4">
          <Campo rotulo="Nome">
            <input className={classeInput} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="Orçamento mensal (R$)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={form.orcamentoMensal}
              onChange={(e) => setForm({ ...form, orcamentoMensal: e.target.value })}
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
            <button type="button" onClick={salvar} className="flex-1 rounded-xl bg-marinho py-3 font-semibold text-white">
              Salvar
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
