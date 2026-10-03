import { useEffect, useState } from 'react'
import { GraficoRosca, type FatiaRosca } from '../components/GraficoRosca'
import { Modal } from '../components/Modal'
import { TelaBase } from '../components/TelaBase'
import {
  calcularAlertas,
  calcularGastoDiaADiaReal,
  calcularOrcamentoTotalDiaADia,
  calcularResumoMes,
} from '../lib/calculos'
import { fecharMes } from '../lib/fecharMes'
import { formatarMoeda, formatarPercentual } from '../lib/formato'
import {
  useAssinaturas,
  useCategorias,
  useConfig,
  useGastosFixos,
  useLancamentos,
  useMeses,
  useParcelas,
  useReceitas,
  useSeparacoes,
} from '../lib/hooks'
import { formatarMesExtenso } from '../lib/mes'
import type { ResumoMes } from '../lib/types'

type PainelProps = {
  mesAtualId: string | undefined
}

export function Painel({ mesAtualId }: PainelProps) {
  const meses = useMeses()
  const [mesSelecionadoId, setMesSelecionadoId] = useState<string | undefined>(mesAtualId)
  const [confirmandoFechamento, setConfirmandoFechamento] = useState(false)
  const [fechando, setFechando] = useState(false)

  useEffect(() => {
    if (mesSelecionadoId === undefined && mesAtualId) setMesSelecionadoId(mesAtualId)
  }, [mesAtualId, mesSelecionadoId])

  const mesSelecionado = meses?.find((m) => m.id === mesSelecionadoId)
  const ehMesAtual = mesSelecionadoId === mesAtualId

  const receitas = useReceitas(ehMesAtual ? mesSelecionadoId : undefined)
  const lancamentos = useLancamentos(ehMesAtual ? mesSelecionadoId : undefined)
  const separacoes = useSeparacoes()
  const gastosFixos = useGastosFixos()
  const assinaturas = useAssinaturas()
  const parcelas = useParcelas()
  const categorias = useCategorias()
  const config = useConfig()

  const carregandoMesAtual =
    receitas === undefined ||
    separacoes === undefined ||
    gastosFixos === undefined ||
    assinaturas === undefined ||
    parcelas === undefined ||
    categorias === undefined ||
    config === undefined

  let resumo: ResumoMes | undefined
  if (mesSelecionado?.fechado && mesSelecionado.snapshot) {
    resumo = mesSelecionado.snapshot
  } else if (ehMesAtual && !carregandoMesAtual) {
    resumo = calcularResumoMes({
      receitas: receitas!,
      separacoes: separacoes!,
      gastosFixos: gastosFixos!,
      assinaturas: assinaturas!,
      parcelas: parcelas!,
      categorias: categorias!,
      mesesReservaMeta: config!.mesesReservaMeta,
    })
  }

  if (!meses || !mesSelecionadoId || !resumo) {
    return (
      <TelaBase titulo="Minhas Finanças">
        <p className="text-marinho/60">Carregando…</p>
      </TelaBase>
    )
  }

  const gastoRealDiaADia = ehMesAtual && lancamentos ? calcularGastoDiaADiaReal(lancamentos) : 0
  const aindaPosso = resumo.tetoDiaADia - gastoRealDiaADia

  const alertas =
    ehMesAtual && categorias && lancamentos && config
      ? calcularAlertas(resumo, config.metaGastos, categorias, lancamentos)
      : []

  const reserva = separacoes?.find((s) => s.nome === 'Reserva de emergência')
  const investimentos = separacoes?.find((s) => s.nome === 'Investimentos')
  const dizimo = separacoes?.find((s) => s.nome === 'Dízimo')
  const orcamentoDiaADia = categorias ? calcularOrcamentoTotalDiaADia(categorias) : resumo.gastosTotais

  async function confirmarFechamento() {
    if (!mesAtualId || carregandoMesAtual) return
    setFechando(true)
    try {
      const novoMesId = await fecharMes(mesAtualId, {
        receitas: receitas!,
        separacoes: separacoes!,
        gastosFixos: gastosFixos!,
        assinaturas: assinaturas!,
        parcelas: parcelas!,
        categorias: categorias!,
        mesesReservaMeta: config!.mesesReservaMeta,
      })
      setMesSelecionadoId(novoMesId)
      setConfirmandoFechamento(false)
    } finally {
      setFechando(false)
    }
  }

  const fatias: FatiaRosca[] = [
    { nome: 'Fixos', valor: resumo.fixos, cor: '#1B2A4A' },
    { nome: 'Assinaturas', valor: resumo.assinaturas, cor: '#A8854F' },
    { nome: 'Parcelas', valor: resumo.parcelasDoMes, cor: '#C0392B' },
    { nome: 'Dia a dia', valor: orcamentoDiaADia, cor: '#1E7B4A' },
    { nome: 'Reserva', valor: resumo.receitas * (reserva?.percentual ?? 0), cor: '#6B7280' },
    { nome: 'Investimentos', valor: resumo.receitas * (investimentos?.percentual ?? 0), cor: '#A3A3A3' },
    { nome: 'Dízimo', valor: resumo.receitas * (dizimo?.percentual ?? 0), cor: '#D4C5A9' },
    { nome: 'Sobra', valor: Math.max(0, resumo.sobraLivre), cor: '#F3C969' },
  ]

  return (
    <TelaBase titulo="Minhas Finanças">
      <select
        value={mesSelecionadoId}
        onChange={(e) => setMesSelecionadoId(e.target.value)}
        className="mb-4 rounded-xl border border-marinho/15 bg-white px-3 py-2 font-medium text-marinho"
      >
        {[...meses]
          .sort((a, b) => b.id.localeCompare(a.id))
          .map((m) => (
            <option key={m.id} value={m.id}>
              {formatarMesExtenso(m.id)}
              {m.id === mesAtualId ? ' (atual)' : ''}
            </option>
          ))}
      </select>

      {!ehMesAtual && (
        <p className="mb-4 rounded-lg bg-marinho/5 px-3 py-2 text-sm text-marinho/70">
          Mês fechado — exibindo o resumo congelado no fechamento.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Cartao titulo="Receitas" valor={formatarMoeda(resumo.receitas)} />
        <Cartao titulo="Gastos" valor={formatarMoeda(resumo.gastosTotais)} />
        <Cartao
          titulo={`% em gastos (meta ${formatarPercentual(config?.metaGastos ?? 0.8, 0)})`}
          valor={formatarPercentual(resumo.percentualGastos)}
          destaque={resumo.percentualGastos > (config?.metaGastos ?? 0.8) ? 'alerta' : 'sucesso'}
        />
        <Cartao
          titulo="Sobra livre"
          valor={formatarMoeda(resumo.sobraLivre)}
          destaque={resumo.sobraLivre < 0 ? 'alerta' : 'sucesso'}
        />
      </div>

      {ehMesAtual && (
        <div className="mt-4 rounded-2xl bg-marinho p-5 text-center text-white">
          <p className="text-sm text-white/70">Ainda posso gastar no dia a dia</p>
          <p className="mt-1 font-serif text-3xl font-bold">{formatarMoeda(aindaPosso)}</p>
        </div>
      )}

      <div className="mt-5 rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-1 font-serif text-lg font-semibold text-marinho">Distribuição da renda</h2>
        <GraficoRosca fatias={fatias} />
      </div>

      {alertas.length > 0 && (
        <div className="mt-5 space-y-2">
          {alertas.map((alerta) => (
            <div
              key={alerta.tipo + alerta.mensagem}
              className="rounded-xl border border-alerta/30 bg-alerta/10 px-4 py-3 text-sm font-medium text-alerta"
            >
              {alerta.mensagem}
            </div>
          ))}
        </div>
      )}

      {ehMesAtual && (
        <button
          type="button"
          onClick={() => setConfirmandoFechamento(true)}
          className="mt-6 w-full rounded-xl border-2 border-marinho/20 py-3.5 font-semibold text-marinho"
        >
          Fechar mês
        </button>
      )}

      <Modal aberto={confirmandoFechamento} onFechar={() => setConfirmandoFechamento(false)} titulo="Fechar mês">
        <div className="space-y-4">
          <p className="text-marinho/80">
            Isso congela os totais de {formatarMesExtenso(mesAtualId ?? '')} no histórico, soma uma parcela paga em
            cada parcela ativa e abre o próximo mês com as receitas recorrentes já copiadas. Não pode ser desfeito
            por aqui.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmandoFechamento(false)}
              className="flex-1 rounded-xl border border-marinho/20 py-3 font-semibold text-marinho"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarFechamento}
              disabled={fechando}
              className="flex-1 rounded-xl bg-marinho py-3 font-semibold text-white disabled:opacity-50"
            >
              {fechando ? 'Fechando…' : 'Confirmar'}
            </button>
          </div>
        </div>
      </Modal>
    </TelaBase>
  )
}

function Cartao({
  titulo,
  valor,
  destaque,
}: {
  titulo: string
  valor: string
  destaque?: 'sucesso' | 'alerta'
}) {
  const cor = destaque === 'alerta' ? 'text-alerta' : destaque === 'sucesso' ? 'text-sucesso' : 'text-marinho'
  return (
    <div className="rounded-xl bg-white p-4 shadow-sm">
      <p className="text-xs text-marinho/60">{titulo}</p>
      <p className={`mt-1 font-serif text-lg font-semibold ${cor}`}>{valor}</p>
    </div>
  )
}
