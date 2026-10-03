import { useRef, useState } from 'react'
import { Campo, classeInput } from '../components/Campo'
import { Modal } from '../components/Modal'
import { TelaBase } from '../components/TelaBase'
import { exportarJSON, exportarLancamentosCSV, importarJSON } from '../lib/backup'
import { db } from '../lib/db'
import { useConfig } from '../lib/hooks'
import { apagarTodosOsDados } from '../lib/resetar'
import { AbaSepararPrimeiro } from './orcamento/AbaSepararPrimeiro'

type AjustesProps = {
  mesAtualId: string | undefined
}

export function Ajustes({ mesAtualId }: AjustesProps) {
  const config = useConfig()
  const inputArquivoRef = useRef<HTMLInputElement>(null)

  const [metaGastosTexto, setMetaGastosTexto] = useState('')
  const [mesesReservaTexto, setMesesReservaTexto] = useState('')
  const [editandoMetaGastos, setEditandoMetaGastos] = useState(false)
  const [editandoMesesReserva, setEditandoMesesReserva] = useState(false)

  const [mensagem, setMensagem] = useState<string | null>(null)
  const [erroImportacao, setErroImportacao] = useState<string | null>(null)
  const [confirmando, setConfirmando] = useState<1 | 2 | null>(null)
  const [apagando, setApagando] = useState(false)

  function iniciarEdicaoMetaGastos() {
    if (!config) return
    setMetaGastosTexto(String(Math.round(config.metaGastos * 1000) / 10))
    setEditandoMetaGastos(true)
  }

  async function salvarMetaGastos() {
    const percentual = Math.max(0, Number(metaGastosTexto.replace(',', '.')) || 0) / 100
    await db.config.update('config', { metaGastos: percentual })
    setEditandoMetaGastos(false)
  }

  function iniciarEdicaoMesesReserva() {
    if (!config) return
    setMesesReservaTexto(String(config.mesesReservaMeta))
    setEditandoMesesReserva(true)
  }

  async function salvarMesesReserva() {
    const meses = Math.max(0, Number(mesesReservaTexto.replace(',', '.')) || 0)
    await db.config.update('config', { mesesReservaMeta: meses })
    setEditandoMesesReserva(false)
  }

  async function aoEscolherArquivo(e: React.ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0]
    e.target.value = ''
    if (!arquivo) return
    try {
      await importarJSON(arquivo)
      window.location.reload()
    } catch (erro) {
      setErroImportacao(erro instanceof Error ? erro.message : 'Não foi possível importar o arquivo.')
    }
  }

  async function confirmarApagarTudo() {
    setApagando(true)
    try {
      await apagarTodosOsDados()
      window.location.reload()
    } finally {
      setApagando(false)
    }
  }

  return (
    <TelaBase titulo="Ajustes">
      <h2 className="mb-2 font-serif text-lg font-semibold text-marinho">Metas gerais</h2>
      <div className="space-y-2">
        <button
          type="button"
          onClick={iniciarEdicaoMetaGastos}
          className="flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-sm"
        >
          <p className="font-medium text-marinho">Meta de gastos</p>
          <p className="font-serif font-semibold text-marinho">
            {config ? `${Math.round(config.metaGastos * 1000) / 10}%` : '—'}
          </p>
        </button>
        <button
          type="button"
          onClick={iniciarEdicaoMesesReserva}
          className="flex w-full items-center justify-between rounded-xl bg-white p-4 text-left shadow-sm"
        >
          <p className="font-medium text-marinho">Meses de reserva</p>
          <p className="font-serif font-semibold text-marinho">{config ? config.mesesReservaMeta : '—'}</p>
        </button>
      </div>

      <h2 className="mt-6 mb-2 font-serif text-lg font-semibold text-marinho">Separar primeiro</h2>
      <AbaSepararPrimeiro mesAtualId={mesAtualId} />

      <h2 className="mt-6 mb-2 font-serif text-lg font-semibold text-marinho">Backup</h2>
      <div className="space-y-2">
        <button
          type="button"
          onClick={() => {
            void exportarJSON()
            setMensagem('Backup JSON exportado.')
          }}
          className="w-full rounded-xl bg-white p-4 text-left font-medium text-marinho shadow-sm"
        >
          Exportar todos os dados (JSON)
        </button>
        <button
          type="button"
          onClick={() => inputArquivoRef.current?.click()}
          className="w-full rounded-xl bg-white p-4 text-left font-medium text-marinho shadow-sm"
        >
          Importar dados (JSON)
        </button>
        <input ref={inputArquivoRef} type="file" accept="application/json" className="hidden" onChange={aoEscolherArquivo} />
        <button
          type="button"
          onClick={() => {
            void exportarLancamentosCSV()
            setMensagem('Lançamentos exportados em CSV.')
          }}
          className="w-full rounded-xl bg-white p-4 text-left font-medium text-marinho shadow-sm"
        >
          Exportar lançamentos (CSV)
        </button>
      </div>
      {mensagem && <p className="mt-2 text-sm text-sucesso">{mensagem}</p>}

      <h2 className="mt-6 mb-2 font-serif text-lg font-semibold text-alerta">Zona de risco</h2>
      <button
        type="button"
        onClick={() => setConfirmando(1)}
        className="w-full rounded-xl border border-alerta/30 bg-alerta/5 p-4 text-left font-medium text-alerta"
      >
        Apagar todos os dados
      </button>

      <Modal aberto={editandoMetaGastos} onFechar={() => setEditandoMetaGastos(false)} titulo="Meta de gastos">
        <div className="space-y-4">
          <Campo rotulo="Percentual (%)">
            <input
              className={classeInput}
              inputMode="decimal"
              value={metaGastosTexto}
              onChange={(e) => setMetaGastosTexto(e.target.value)}
            />
          </Campo>
          <button type="button" onClick={salvarMetaGastos} className="w-full rounded-xl bg-marinho py-3 font-semibold text-white">
            Salvar
          </button>
        </div>
      </Modal>

      <Modal aberto={editandoMesesReserva} onFechar={() => setEditandoMesesReserva(false)} titulo="Meses de reserva">
        <div className="space-y-4">
          <Campo rotulo="Quantidade de meses">
            <input
              className={classeInput}
              inputMode="numeric"
              value={mesesReservaTexto}
              onChange={(e) => setMesesReservaTexto(e.target.value)}
            />
          </Campo>
          <button type="button" onClick={salvarMesesReserva} className="w-full rounded-xl bg-marinho py-3 font-semibold text-white">
            Salvar
          </button>
        </div>
      </Modal>

      <Modal aberto={erroImportacao !== null} onFechar={() => setErroImportacao(null)} titulo="Erro ao importar">
        <p className="text-marinho/80">{erroImportacao}</p>
        <button
          type="button"
          onClick={() => setErroImportacao(null)}
          className="mt-4 w-full rounded-xl bg-marinho py-3 font-semibold text-white"
        >
          Entendi
        </button>
      </Modal>

      <Modal aberto={confirmando === 1} onFechar={() => setConfirmando(null)} titulo="Apagar todos os dados?">
        <div className="space-y-4">
          <p className="text-marinho/80">
            Isso apaga receitas, gastos fixos, assinaturas, parcelas, lançamentos, histórico e patrimônio — tudo. Essa
            ação não pode ser desfeita. Recomendamos exportar um backup antes.
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmando(null)}
              className="flex-1 rounded-xl border border-marinho/20 py-3 font-semibold text-marinho"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => setConfirmando(2)}
              className="flex-1 rounded-xl bg-alerta py-3 font-semibold text-white"
            >
              Continuar
            </button>
          </div>
        </div>
      </Modal>

      <Modal aberto={confirmando === 2} onFechar={() => setConfirmando(null)} titulo="Tem certeza absoluta?">
        <div className="space-y-4">
          <p className="text-marinho/80">Última confirmação: todos os dados do app serão apagados permanentemente.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setConfirmando(null)}
              className="flex-1 rounded-xl border border-marinho/20 py-3 font-semibold text-marinho"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={confirmarApagarTudo}
              disabled={apagando}
              className="flex-1 rounded-xl bg-alerta py-3 font-semibold text-white disabled:opacity-50"
            >
              {apagando ? 'Apagando…' : 'Sim, apagar tudo'}
            </button>
          </div>
        </div>
      </Modal>
    </TelaBase>
  )
}
