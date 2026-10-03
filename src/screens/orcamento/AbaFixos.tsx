import { useState } from 'react'
import { Campo, classeInput } from '../../components/Campo'
import { Modal } from '../../components/Modal'
import { calcularFixos } from '../../lib/calculos'
import { db } from '../../lib/db'
import { formatarMoeda } from '../../lib/formato'
import { useGastosFixos } from '../../lib/hooks'
import { gerarId } from '../../lib/id'
import type { GastoFixo } from '../../lib/types'

type Formulario = {
  nome: string
  valor: string
  diaVencimento: string
  formaPagamento: string
  obs: string
  ativo: boolean
}

const vazio: Formulario = { nome: '', valor: '', diaVencimento: '', formaPagamento: '', obs: '', ativo: true }

export function AbaFixos() {
  const gastosFixos = useGastosFixos()
  const [editando, setEditando] = useState<GastoFixo | null>(null)
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState<Formulario>(vazio)

  const totalAtivos = gastosFixos ? calcularFixos(gastosFixos) : 0

  function abrirEdicao(gasto: GastoFixo) {
    setEditando(gasto)
    setForm({
      nome: gasto.nome,
      valor: String(gasto.valor),
      diaVencimento: gasto.diaVencimento ? String(gasto.diaVencimento) : '',
      formaPagamento: gasto.formaPagamento ?? '',
      obs: gasto.obs ?? '',
      ativo: gasto.ativo,
    })
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
    const valor = Number(form.valor.replace(',', '.')) || 0
    const diaVencimento = form.diaVencimento ? Number(form.diaVencimento) : undefined
    const dados = {
      nome: form.nome,
      valor,
      diaVencimento,
      formaPagamento: form.formaPagamento || undefined,
      obs: form.obs || undefined,
      ativo: form.ativo,
    }
    if (editando) {
      await db.gastosFixos.update(editando.id, dados)
    } else {
      await db.gastosFixos.add({ id: gerarId(), ...dados })
    }
    fechar()
  }

  async function excluir() {
    if (!editando) return
    await db.gastosFixos.delete(editando.id)
    fechar()
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-marinho/70">Fixos ativos: {formatarMoeda(totalAtivos)}</p>

      <div className="space-y-2">
        {gastosFixos?.map((gasto) => (
          <button
            key={gasto.id}
            type="button"
            onClick={() => abrirEdicao(gasto)}
            className={`flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-sm ${
              gasto.ativo ? '' : 'opacity-50'
            }`}
          >
            <div>
              <p className={`font-medium text-marinho ${gasto.ativo ? '' : 'line-through'}`}>{gasto.nome}</p>
              <p className="text-xs text-marinho/50">
                {gasto.formaPagamento ?? 'Forma não informada'}
                {gasto.obs ? ` · ${gasto.obs}` : ''}
              </p>
            </div>
            <p className="font-serif font-semibold text-marinho">{formatarMoeda(gasto.valor)}</p>
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={abrirCriacao}
        className="mt-3 w-full rounded-xl border-2 border-dashed border-marinho/20 py-3 text-sm font-medium text-marinho/60"
      >
        + Adicionar gasto fixo
      </button>

      <Modal aberto={editando !== null || criando} onFechar={fechar} titulo={editando ? 'Editar gasto fixo' : 'Novo gasto fixo'}>
        <div className="space-y-4">
          <Campo rotulo="Nome">
            <input className={classeInput} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="Valor (R$)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={form.valor}
              onChange={(e) => setForm({ ...form, valor: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Dia de vencimento (opcional)">
            <input
              className={classeInput}
              inputMode="numeric"
              value={form.diaVencimento}
              onChange={(e) => setForm({ ...form, diaVencimento: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Forma de pagamento (opcional)">
            <input
              className={classeInput}
              value={form.formaPagamento}
              onChange={(e) => setForm({ ...form, formaPagamento: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Observação (opcional)">
            <input className={classeInput} value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
          </Campo>
          <label className="flex items-center justify-between rounded-xl bg-creme px-3 py-2.5">
            <span className="text-sm font-medium text-marinho">Ativo</span>
            <input
              type="checkbox"
              checked={form.ativo}
              onChange={(e) => setForm({ ...form, ativo: e.target.checked })}
              className="h-5 w-5 accent-marinho"
            />
          </label>

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
