import { useState } from 'react'
import { ChipSelecionavel } from './ChipSelecionavel'
import { Modal } from './Modal'
import { TecladoNumerico } from './TecladoNumerico'
import { calcularGastoCategoria } from '../lib/calculos'
import { db } from '../lib/db'
import { gerarId } from '../lib/id'
import { useCategorias, useLancamentos } from '../lib/hooks'
import { hojeISO } from '../lib/mes'
import { formatarMoeda } from '../lib/formato'
import type { Lancamento } from '../lib/types'

const formasPagamento: Lancamento['forma'][] = ['Pix', 'Cartão de crédito', 'Débito', 'Dinheiro']

type ModalLancarGastoProps = {
  aberto: boolean
  onFechar: () => void
  mesId: string | undefined
}

export function ModalLancarGasto({ aberto, onFechar, mesId }: ModalLancarGastoProps) {
  const categorias = useCategorias()
  const lancamentos = useLancamentos(mesId)

  const [valorCentavos, setValorCentavos] = useState(0)
  const [categoriaId, setCategoriaId] = useState<string | null>(null)
  const [forma, setForma] = useState<Lancamento['forma'] | null>(null)
  const [data, setData] = useState(hojeISO())
  const [confirmacao, setConfirmacao] = useState<string | null>(null)

  const podeSalvar = valorCentavos > 0 && categoriaId !== null && forma !== null && mesId !== undefined

  function resetar() {
    setValorCentavos(0)
    setCategoriaId(null)
    setForma(null)
    setData(hojeISO())
    setConfirmacao(null)
  }

  function fecharTudo() {
    resetar()
    onFechar()
  }

  async function salvar() {
    if (!podeSalvar || !mesId || !categoriaId || !forma) return
    const categoria = categorias?.find((c) => c.id === categoriaId)
    const valor = valorCentavos / 100

    await db.lancamentos.add({
      id: gerarId(),
      mesId,
      data,
      descricao: categoria?.nome ?? 'Gasto',
      categoriaId,
      valor,
      forma,
    })

    if (categoria) {
      const gastoAnterior = calcularGastoCategoria(lancamentos ?? [], categoriaId)
      const restante = categoria.orcamentoMensal - (gastoAnterior + valor)
      setConfirmacao(`Restam ${formatarMoeda(restante)} em ${categoria.nome} este mês`)
    } else {
      fecharTudo()
    }
  }

  return (
    <Modal aberto={aberto} onFechar={fecharTudo} titulo="Lançar gasto">
      {confirmacao ? (
        <div className="py-4 text-center">
          <p className="text-3xl">✅</p>
          <p className="mt-3 text-marinho">{confirmacao}</p>
          <button
            type="button"
            onClick={fecharTudo}
            className="mt-5 w-full rounded-xl bg-marinho py-3 font-semibold text-white"
          >
            OK
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          <TecladoNumerico valorCentavos={valorCentavos} onMudar={setValorCentavos} />

          <div>
            <p className="mb-2 text-sm font-medium text-marinho/70">Categoria</p>
            <div className="grid grid-cols-2 gap-2">
              {categorias?.map((categoria) => (
                <button
                  key={categoria.id}
                  type="button"
                  onClick={() => setCategoriaId(categoria.id)}
                  className={`rounded-xl border px-3 py-3 text-left text-sm font-medium ${
                    categoriaId === categoria.id
                      ? 'border-marinho bg-marinho text-white'
                      : 'border-marinho/15 bg-white text-marinho'
                  }`}
                >
                  {categoria.nome}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium text-marinho/70">Forma de pagamento</p>
            <div className="flex flex-wrap gap-2">
              {formasPagamento.map((f) => (
                <ChipSelecionavel key={f} rotulo={f} selecionado={forma === f} onClick={() => setForma(f)} />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-marinho/70" htmlFor="data-gasto">
              Data
            </label>
            <input
              id="data-gasto"
              type="date"
              value={data}
              onChange={(e) => setData(e.target.value)}
              className="w-full rounded-xl border border-marinho/15 px-3 py-2.5 text-marinho"
            />
          </div>

          <button
            type="button"
            disabled={!podeSalvar}
            onClick={salvar}
            className="w-full rounded-xl bg-dourado py-3.5 font-semibold text-white disabled:opacity-40"
          >
            Salvar
          </button>
        </div>
      )}
    </Modal>
  )
}
