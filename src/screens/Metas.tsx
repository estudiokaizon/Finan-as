import { useState } from 'react'
import { BarraProgresso } from '../components/BarraProgresso'
import { Campo, classeInput } from '../components/Campo'
import { Modal } from '../components/Modal'
import { TelaBase } from '../components/TelaBase'
import { calcularResumoMes } from '../lib/calculos'
import { db } from '../lib/db'
import { formatarMoeda } from '../lib/formato'
import {
  useAssinaturas,
  useCategorias,
  useConfig,
  useGastosFixos,
  useObjetivos,
  usePatrimonio,
  useParcelas,
  useReceitas,
  useSeparacoes,
} from '../lib/hooks'
import { gerarId } from '../lib/id'
import type { ObjetivoInvestimento } from '../lib/types'

type MetasProps = {
  mesAtualId: string | undefined
}

export function Metas({ mesAtualId }: MetasProps) {
  const receitas = useReceitas(mesAtualId)
  const separacoes = useSeparacoes()
  const gastosFixos = useGastosFixos()
  const assinaturas = useAssinaturas()
  const parcelas = useParcelas()
  const categorias = useCategorias()
  const config = useConfig()
  const patrimonio = usePatrimonio()
  const objetivos = useObjetivos()

  const [editando, setEditando] = useState<ObjetivoInvestimento | null>(null)
  const [criando, setCriando] = useState(false)
  const [form, setForm] = useState({ nome: '', saldoAtual: '', meta: '', prazo: '', obs: '' })

  const pronto = receitas && separacoes && gastosFixos && assinaturas && parcelas && categorias && config

  if (!pronto) {
    return (
      <TelaBase titulo="Metas">
        <p className="text-marinho/60">Carregando…</p>
      </TelaBase>
    )
  }

  const resumo = calcularResumoMes({
    receitas,
    separacoes,
    gastosFixos,
    assinaturas,
    parcelas,
    categorias,
    mesesReservaMeta: config.mesesReservaMeta,
  })

  const percentualReserva = separacoes.find((s) => s.nome === 'Reserva de emergência')?.percentual ?? 0
  const aporteMensalReserva = resumo.receitas * percentualReserva
  const saldoReserva = patrimonio?.find((p) => p.tipo === 'tenho' && p.nome === 'Reserva de emergência')?.valor ?? 0
  const faltamReserva = Math.max(0, resumo.alvoReserva - saldoReserva)
  const progressoReserva = resumo.alvoReserva > 0 ? saldoReserva / resumo.alvoReserva : 0
  const mesesParaCompletar = aporteMensalReserva > 0 ? Math.ceil(faltamReserva / aporteMensalReserva) : null

  function abrirEdicao(objetivo: ObjetivoInvestimento) {
    setEditando(objetivo)
    setForm({
      nome: objetivo.nome,
      saldoAtual: String(objetivo.saldoAtual),
      meta: objetivo.meta !== undefined ? String(objetivo.meta) : '',
      prazo: objetivo.prazo ?? '',
      obs: objetivo.obs ?? '',
    })
  }

  function abrirCriacao() {
    setCriando(true)
    setForm({ nome: '', saldoAtual: '', meta: '', prazo: '', obs: '' })
  }

  function fechar() {
    setEditando(null)
    setCriando(false)
  }

  async function salvar() {
    if (!form.nome.trim()) return
    const dados = {
      nome: form.nome,
      saldoAtual: Number(form.saldoAtual.replace(',', '.')) || 0,
      meta: form.meta ? Number(form.meta.replace(',', '.')) : undefined,
      prazo: form.prazo || undefined,
      obs: form.obs || undefined,
    }
    if (editando) {
      await db.objetivos.update(editando.id, dados)
    } else {
      await db.objetivos.add({ id: gerarId(), ...dados })
    }
    fechar()
  }

  async function excluir() {
    if (!editando) return
    await db.objetivos.delete(editando.id)
    fechar()
  }

  return (
    <TelaBase titulo="Metas">
      <h2 className="mb-2 font-serif text-lg font-semibold text-marinho">Reserva de emergência</h2>
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex items-baseline justify-between">
          <p className="font-serif text-2xl font-semibold text-marinho">{formatarMoeda(saldoReserva)}</p>
          <p className="text-sm text-marinho/50">meta {formatarMoeda(resumo.alvoReserva)}</p>
        </div>
        <div className="mt-3">
          <BarraProgresso progresso={progressoReserva} cor="sucesso" />
        </div>
        <p className="mt-3 text-sm text-marinho/70">Faltam {formatarMoeda(faltamReserva)}</p>
        <p className="text-sm text-marinho/70">
          Aporte mensal estimado: {formatarMoeda(aporteMensalReserva)}
          {mesesParaCompletar !== null && (
            <> · completa em {mesesParaCompletar} {mesesParaCompletar === 1 ? 'mês' : 'meses'}</>
          )}
        </p>
      </div>

      <h2 className="mt-6 mb-2 font-serif text-lg font-semibold text-marinho">Investimentos</h2>
      <div className="space-y-2">
        {objetivos?.map((objetivo) => {
          const progresso = objetivo.meta ? objetivo.saldoAtual / objetivo.meta : undefined
          return (
            <button
              key={objetivo.id}
              type="button"
              onClick={() => abrirEdicao(objetivo)}
              className="w-full rounded-xl bg-white p-4 text-left shadow-sm"
            >
              <div className="flex items-center justify-between">
                <p className="font-medium text-marinho">{objetivo.nome}</p>
                <p className="font-serif font-semibold text-marinho">{formatarMoeda(objetivo.saldoAtual)}</p>
              </div>
              {objetivo.meta !== undefined && (
                <div className="mt-2">
                  <BarraProgresso progresso={progresso ?? 0} cor="dourado" />
                  <p className="mt-1 text-xs text-marinho/50">
                    Meta: {formatarMoeda(objetivo.meta)}
                    {objetivo.prazo ? ` · Prazo: ${objetivo.prazo}` : ''}
                  </p>
                </div>
              )}
              {objetivo.meta === undefined && objetivo.prazo && (
                <p className="mt-1 text-xs text-marinho/50">Prazo: {objetivo.prazo}</p>
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
        + Adicionar objetivo
      </button>

      <Modal aberto={editando !== null || criando} onFechar={fechar} titulo={editando ? 'Editar objetivo' : 'Novo objetivo'}>
        <div className="space-y-4">
          <Campo rotulo="Nome">
            <input className={classeInput} value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
          </Campo>
          <Campo rotulo="Saldo atual (R$)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={form.saldoAtual}
              onChange={(e) => setForm({ ...form, saldoAtual: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Meta (R$, opcional)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={form.meta}
              onChange={(e) => setForm({ ...form, meta: e.target.value })}
            />
          </Campo>
          <Campo rotulo="Prazo (opcional)">
            <input className={classeInput} value={form.prazo} onChange={(e) => setForm({ ...form, prazo: e.target.value })} />
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
    </TelaBase>
  )
}
