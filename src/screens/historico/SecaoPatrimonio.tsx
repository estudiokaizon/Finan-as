import { useState } from 'react'
import { Campo, classeInput } from '../../components/Campo'
import { ChipSelecionavel } from '../../components/ChipSelecionavel'
import { Modal } from '../../components/Modal'
import { calcularSaldoParcelas } from '../../lib/calculos'
import { db } from '../../lib/db'
import { formatarMoeda } from '../../lib/formato'
import { usePatrimonio, useParcelas } from '../../lib/hooks'
import { gerarId } from '../../lib/id'
import type { ItemPatrimonio } from '../../lib/types'

export function SecaoPatrimonio() {
  const patrimonio = usePatrimonio()
  const parcelas = useParcelas()
  const [editando, setEditando] = useState<ItemPatrimonio | null>(null)
  const [criando, setCriando] = useState<'tenho' | 'devo' | null>(null)
  const [form, setForm] = useState({ nome: '', valor: '', obs: '', tipo: 'tenho' as ItemPatrimonio['tipo'] })

  const tenho = patrimonio?.filter((p) => p.tipo === 'tenho') ?? []
  const devo = patrimonio?.filter((p) => p.tipo === 'devo') ?? []
  const totalTenho = tenho.reduce((soma, p) => soma + p.valor, 0)
  const totalDevoManual = devo.reduce((soma, p) => soma + p.valor, 0)
  const parcelasRestantes = parcelas ? calcularSaldoParcelas(parcelas) : 0
  const totalDevo = totalDevoManual + parcelasRestantes
  const patrimonioLiquido = totalTenho - totalDevo

  function abrirEdicao(item: ItemPatrimonio) {
    setEditando(item)
    setForm({ nome: item.nome, valor: String(item.valor), obs: item.obs ?? '', tipo: item.tipo })
  }

  function abrirCriacao(tipo: 'tenho' | 'devo') {
    setCriando(tipo)
    setForm({ nome: '', valor: '', obs: '', tipo })
  }

  function fechar() {
    setEditando(null)
    setCriando(null)
  }

  async function salvar() {
    if (!form.nome.trim()) return
    const dados = { nome: form.nome, valor: Number(form.valor.replace(',', '.')) || 0, obs: form.obs || undefined, tipo: form.tipo }
    if (editando) {
      await db.patrimonio.update(editando.id, dados)
    } else {
      await db.patrimonio.add({ id: gerarId(), ...dados })
    }
    fechar()
  }

  async function excluir() {
    if (!editando) return
    await db.patrimonio.delete(editando.id)
    fechar()
  }

  return (
    <div className="mt-6">
      <h2 className="mb-2 font-serif text-lg font-semibold text-marinho">Patrimônio</h2>

      <div className="rounded-2xl bg-marinho p-5 text-center text-white">
        <p className="text-sm text-white/70">Patrimônio líquido</p>
        <p className={`mt-1 font-serif text-2xl font-bold ${patrimonioLiquido < 0 ? 'text-alerta' : ''}`}>
          {formatarMoeda(patrimonioLiquido)}
        </p>
      </div>

      <h3 className="mt-4 mb-2 text-sm font-semibold text-marinho/70">Tenho: {formatarMoeda(totalTenho)}</h3>
      <div className="space-y-2">
        {tenho.map((item) => (
          <ItemLinha key={item.id} item={item} onClick={() => abrirEdicao(item)} />
        ))}
      </div>
      <button
        type="button"
        onClick={() => abrirCriacao('tenho')}
        className="mt-2 w-full rounded-xl border-2 border-dashed border-marinho/20 py-2.5 text-sm font-medium text-marinho/60"
      >
        + Adicionar o que tenho
      </button>

      <h3 className="mt-5 mb-2 text-sm font-semibold text-marinho/70">Devo: {formatarMoeda(totalDevo)}</h3>
      <div className="space-y-2">
        {devo.map((item) => (
          <ItemLinha key={item.id} item={item} onClick={() => abrirEdicao(item)} />
        ))}
        <div className="flex items-center justify-between rounded-xl bg-creme p-4">
          <p className="text-sm text-marinho/70">Parcelas restantes (calculado)</p>
          <p className="font-serif font-semibold text-marinho">{formatarMoeda(parcelasRestantes)}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={() => abrirCriacao('devo')}
        className="mt-2 w-full rounded-xl border-2 border-dashed border-marinho/20 py-2.5 text-sm font-medium text-marinho/60"
      >
        + Adicionar o que devo
      </button>

      <Modal aberto={editando !== null || criando !== null} onFechar={fechar} titulo={editando ? 'Editar item' : 'Novo item'}>
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 text-sm font-medium text-marinho/70">Tipo</p>
            <div className="flex gap-2">
              <ChipSelecionavel rotulo="Tenho" selecionado={form.tipo === 'tenho'} onClick={() => setForm({ ...form, tipo: 'tenho' })} />
              <ChipSelecionavel rotulo="Devo" selecionado={form.tipo === 'devo'} onClick={() => setForm({ ...form, tipo: 'devo' })} />
            </div>
          </div>
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
          <Campo rotulo="Observação (opcional)">
            <input className={classeInput} value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
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

function ItemLinha({ item, onClick }: { item: ItemPatrimonio; onClick: () => void }) {
  return (
    <button type="button" onClick={onClick} className="flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-sm">
      <div>
        <p className="font-medium text-marinho">{item.nome}</p>
        {item.obs && <p className="text-xs text-marinho/50">{item.obs}</p>}
      </div>
      <p className="font-serif font-semibold text-marinho">{formatarMoeda(item.valor)}</p>
    </button>
  )
}
