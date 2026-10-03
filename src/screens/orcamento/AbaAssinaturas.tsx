import { useState } from 'react'
import { Campo, classeInput } from '../../components/Campo'
import { GraficoBarrasAssinaturas } from '../../components/GraficoBarrasAssinaturas'
import { Modal } from '../../components/Modal'
import { calcularAssinaturasAtivas, calcularEconomiaAssinaturas } from '../../lib/calculos'
import { db } from '../../lib/db'
import { formatarMoeda } from '../../lib/formato'
import { useAssinaturas } from '../../lib/hooks'
import { gerarId } from '../../lib/id'
import { hojeISO } from '../../lib/mes'
import type { Assinatura } from '../../lib/types'

type Formulario = {
  nome: string
  valor: string
  ondeCobra: string
  obs: string
  ativa: boolean
}

const vazio: Formulario = { nome: '', valor: '', ondeCobra: '', obs: '', ativa: true }

export function AbaAssinaturas() {
  const assinaturas = useAssinaturas()
  const [editando, setEditando] = useState<Assinatura | null>(null)
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState<Formulario>(vazio)

  const ativas = assinaturas ? calcularAssinaturasAtivas(assinaturas) : 0
  const economia = assinaturas ? calcularEconomiaAssinaturas(assinaturas) : 0

  function abrirEdicao(assinatura: Assinatura) {
    setEditando(assinatura)
    setForm({
      nome: assinatura.nome,
      valor: String(assinatura.valor),
      ondeCobra: assinatura.ondeCobra,
      obs: assinatura.obs ?? '',
      ativa: assinatura.status === 'Ativa',
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

  async function alternarStatus(assinatura: Assinatura) {
    const vaiCancelar = assinatura.status === 'Ativa'
    await db.assinaturas.update(assinatura.id, {
      status: vaiCancelar ? 'Cancelada' : 'Ativa',
      dataCancelamento: vaiCancelar ? hojeISO() : undefined,
    })
  }

  async function salvar() {
    if (!form.nome.trim()) return
    const valor = Number(form.valor.replace(',', '.')) || 0
    const dados = {
      nome: form.nome,
      valor,
      ondeCobra: form.ondeCobra || 'A confirmar',
      obs: form.obs || undefined,
      status: form.ativa ? ('Ativa' as const) : ('Cancelada' as const),
      dataCancelamento: form.ativa ? undefined : hojeISO(),
    }
    if (editando) {
      await db.assinaturas.update(editando.id, dados)
    } else {
      await db.assinaturas.add({ id: gerarId(), ...dados })
    }
    fechar()
  }

  async function excluir() {
    if (!editando) return
    await db.assinaturas.delete(editando.id)
    fechar()
  }

  return (
    <div>
      <p className="mb-3 text-sm font-medium text-marinho/70">
        Ativas: {formatarMoeda(ativas)} · Economia com cancelamentos: {formatarMoeda(economia)}/mês
      </p>

      <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
        <GraficoBarrasAssinaturas ativas={ativas} canceladas={economia} />
      </div>

      <div className="space-y-2">
        {assinaturas?.map((assinatura) => {
          const ativa = assinatura.status === 'Ativa'
          return (
            <div
              key={assinatura.id}
              onClick={() => abrirEdicao(assinatura)}
              className={`flex items-center justify-between rounded-xl bg-white p-4 shadow-sm ${ativa ? '' : 'opacity-50'}`}
            >
              <div>
                <p className={`font-medium text-marinho ${ativa ? '' : 'line-through'}`}>{assinatura.nome}</p>
                <p className="text-xs text-marinho/50">{assinatura.ondeCobra}</p>
              </div>
              <div className="flex items-center gap-3">
                <p className="font-serif font-semibold text-marinho">{formatarMoeda(assinatura.valor)}</p>
                <input
                  type="checkbox"
                  checked={ativa}
                  onClick={(e) => e.stopPropagation()}
                  onChange={() => alternarStatus(assinatura)}
                  className="h-5 w-5 accent-sucesso"
                  aria-label={ativa ? 'Marcar como cancelada' : 'Marcar como ativa'}
                />
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={abrirCriacao}
        className="mt-3 w-full rounded-xl border-2 border-dashed border-marinho/20 py-3 text-sm font-medium text-marinho/60"
      >
        + Adicionar assinatura
      </button>

      <Modal
        aberto={editando !== null || criando}
        onFechar={fechar}
        titulo={editando ? 'Editar assinatura' : 'Nova assinatura'}
      >
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
          <Campo rotulo="Onde cobra">
            <input
              className={classeInput}
              value={form.ondeCobra}
              onChange={(e) => setForm({ ...form, ondeCobra: e.target.value })}
              placeholder="Ex.: Cartão Sicredi"
            />
          </Campo>
          <Campo rotulo="Observação (opcional)">
            <input className={classeInput} value={form.obs} onChange={(e) => setForm({ ...form, obs: e.target.value })} />
          </Campo>
          <label className="flex items-center justify-between rounded-xl bg-creme px-3 py-2.5">
            <span className="text-sm font-medium text-marinho">Ativa</span>
            <input
              type="checkbox"
              checked={form.ativa}
              onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
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
