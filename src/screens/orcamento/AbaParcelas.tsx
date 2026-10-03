import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { BarraProgresso } from '../../components/BarraProgresso'
import { Campo, classeInput } from '../../components/Campo'
import { Modal } from '../../components/Modal'
import { calcularLinhaDoTempoParcelas, calcularMesTermino, faltamParcela } from '../../lib/calculos'
import { db } from '../../lib/db'
import { formatarMoeda } from '../../lib/formato'
import { useParcelas } from '../../lib/hooks'
import { gerarId } from '../../lib/id'
import { formatarMesAbreviado } from '../../lib/mes'
import type { Parcela } from '../../lib/types'

type Formulario = {
  compra: string
  ondePaga: string
  noCartao: boolean
  valorParcela: string
  totalParcelas: string
  pagas: string
}

const vazio: Formulario = { compra: '', ondePaga: '', noCartao: true, valorParcela: '', totalParcelas: '', pagas: '0' }

export function AbaParcelas({ mesAtualId }: { mesAtualId: string | undefined }) {
  const parcelas = useParcelas()
  const [editando, setEditando] = useState<Parcela | null>(null)
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState<Formulario>(vazio)

  function abrirEdicao(parcela: Parcela) {
    setEditando(parcela)
    setForm({
      compra: parcela.compra,
      ondePaga: parcela.ondePaga,
      noCartao: parcela.noCartao,
      valorParcela: String(parcela.valorParcela),
      totalParcelas: parcela.totalParcelas !== undefined ? String(parcela.totalParcelas) : '',
      pagas: String(parcela.pagas),
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
    if (!form.compra.trim()) return
    const dados = {
      compra: form.compra,
      ondePaga: form.ondePaga,
      noCartao: form.noCartao,
      valorParcela: Number(form.valorParcela.replace(',', '.')) || 0,
      totalParcelas: form.totalParcelas ? Number(form.totalParcelas) : undefined,
      pagas: Number(form.pagas) || 0,
    }
    if (editando) {
      await db.parcelas.update(editando.id, dados)
    } else {
      await db.parcelas.add({ id: gerarId(), ...dados })
    }
    fechar()
  }

  async function excluir() {
    if (!editando) return
    await db.parcelas.delete(editando.id)
    fechar()
  }

  const noCartao = parcelas?.filter((p) => p.noCartao) ?? []
  const foraCartao = parcelas?.filter((p) => !p.noCartao) ?? []
  const linhaDoTempo = mesAtualId && parcelas ? calcularLinhaDoTempoParcelas(parcelas, mesAtualId, 6) : []

  return (
    <div>
      {mesAtualId && linhaDoTempo.length > 0 && (
        <div className="mb-4 rounded-2xl bg-white p-4 shadow-sm">
          <h3 className="mb-2 font-serif text-base font-semibold text-marinho">Próximos 6 meses</h3>
          <div className="h-40 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={linhaDoTempo.map((p) => ({ ...p, rotulo: formatarMesAbreviado(p.mesId) }))}>
                <CartesianGrid vertical={false} stroke="#1B2A4A" strokeOpacity={0.08} />
                <XAxis dataKey="rotulo" tickLine={false} axisLine={false} fontSize={12} />
                <YAxis hide />
                <Tooltip formatter={(valor) => formatarMoeda(Number(valor))} />
                <Bar dataKey="total" fill="#A8854F" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      <SecaoParcelas titulo="No cartão" parcelas={noCartao} mesAtualId={mesAtualId} onAbrir={abrirEdicao} />
      <SecaoParcelas titulo="Fora do cartão" parcelas={foraCartao} mesAtualId={mesAtualId} onAbrir={abrirEdicao} />

      <button
        type="button"
        onClick={abrirCriacao}
        className="mt-3 w-full rounded-xl border-2 border-dashed border-marinho/20 py-3 text-sm font-medium text-marinho/60"
      >
        + Adicionar parcela
      </button>

      <Modal aberto={editando !== null || criando} onFechar={fechar} titulo={editando ? 'Editar parcela' : 'Nova parcela'}>
        <div className="space-y-4">
          <Campo rotulo="Compra">
            <input className={classeInput} value={form.compra} onChange={(e) => setForm({ ...form, compra: e.target.value })} />
          </Campo>
          <Campo rotulo="Onde paga">
            <input
              className={classeInput}
              value={form.ondePaga}
              onChange={(e) => setForm({ ...form, ondePaga: e.target.value })}
            />
          </Campo>
          <label className="flex items-center justify-between rounded-xl bg-creme px-3 py-2.5">
            <span className="text-sm font-medium text-marinho">No cartão</span>
            <input
              type="checkbox"
              checked={form.noCartao}
              onChange={(e) => setForm({ ...form, noCartao: e.target.checked })}
              className="h-5 w-5 accent-marinho"
            />
          </label>
          <Campo rotulo="Valor da parcela (R$)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={form.valorParcela}
              onChange={(e) => setForm({ ...form, valorParcela: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Total de parcelas (vazio = a confirmar)">
            <input
              className={classeInput}
              inputMode="numeric"
              value={form.totalParcelas}
              onChange={(e) => setForm({ ...form, totalParcelas: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Parcelas já pagas">
            <input
              className={classeInput}
              inputMode="numeric"
              value={form.pagas}
              onChange={(e) => setForm({ ...form, pagas: e.target.value })}
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

function SecaoParcelas({
  titulo,
  parcelas,
  mesAtualId,
  onAbrir,
}: {
  titulo: string
  parcelas: Parcela[]
  mesAtualId: string | undefined
  onAbrir: (parcela: Parcela) => void
}) {
  if (parcelas.length === 0) return null

  return (
    <div className="mb-4">
      <h3 className="mb-2 text-sm font-semibold text-marinho/70">{titulo}</h3>
      <div className="space-y-2">
        {parcelas.map((parcela) => {
          const faltam = faltamParcela(parcela)
          const termino = mesAtualId ? calcularMesTermino(mesAtualId, parcela) : null
          const progresso = parcela.totalParcelas ? parcela.pagas / parcela.totalParcelas : 0
          return (
            <button
              key={parcela.id}
              type="button"
              onClick={() => onAbrir(parcela)}
              className="w-full rounded-xl bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-marinho">{parcela.compra}</p>
                  <p className="text-xs text-marinho/50">{parcela.ondePaga}</p>
                </div>
                <p className="font-serif font-semibold text-marinho">{formatarMoeda(parcela.valorParcela)}</p>
              </div>
              <div className="mt-2">
                <BarraProgresso progresso={parcela.totalParcelas ? progresso : 0} cor="dourado" />
                <p className="mt-1 text-xs text-marinho/50">
                  {parcela.pagas}/{parcela.totalParcelas ?? '?'} pagas · faltam {faltam} ·{' '}
                  {termino
                    ? `Termina em ${formatarMesAbreviado(termino)}`
                    : parcela.totalParcelas !== undefined && faltam === 0
                      ? 'Quitada'
                      : 'Total a confirmar'}
                </p>
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}
