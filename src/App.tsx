import { useEffect, useState } from 'react'
import { BotaoFlutuante } from './components/BotaoFlutuante'
import { ModalLancarGasto } from './components/ModalLancarGasto'
import { NavInferior, type Aba } from './components/NavInferior'
import { garantirDadosIniciais } from './lib/bootstrap'
import { useMesAtual } from './lib/useMesAtual'
import { Painel } from './screens/Painel'
import { Orcamento } from './screens/orcamento/Orcamento'
import { Metas } from './screens/Metas'
import { Historico } from './screens/Historico'
import { Ajustes } from './screens/Ajustes'

function App() {
  const [pronto, setPronto] = useState(false)
  const [aba, setAba] = useState<Aba>('inicio')
  const [modalAberto, setModalAberto] = useState(false)
  const mesAtual = useMesAtual()

  useEffect(() => {
    void garantirDadosIniciais().then(() => setPronto(true))
  }, [])

  if (!pronto) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-creme">
        <p className="text-marinho/60">Carregando…</p>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-creme">
      {aba === 'inicio' && <Painel mesAtualId={mesAtual?.id} />}
      {aba === 'orcamento' && <Orcamento mesAtualId={mesAtual?.id} />}
      {aba === 'metas' && <Metas mesAtualId={mesAtual?.id} />}
      {aba === 'historico' && <Historico />}
      {aba === 'ajustes' && <Ajustes mesAtualId={mesAtual?.id} />}

      <BotaoFlutuante onClick={() => setModalAberto(true)} />
      <NavInferior abaAtiva={aba} onMudarAba={setAba} />
      <ModalLancarGasto aberto={modalAberto} onFechar={() => setModalAberto(false)} mesId={mesAtual?.id} />
    </div>
  )
}

export default App
