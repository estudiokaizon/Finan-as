export type Aba = 'inicio' | 'orcamento' | 'metas' | 'historico' | 'ajustes'

const abas: Array<{ id: Aba; rotulo: string; icone: string }> = [
  { id: 'inicio', rotulo: 'Início', icone: '🏠' },
  { id: 'orcamento', rotulo: 'Orçamento', icone: '📊' },
  { id: 'metas', rotulo: 'Metas', icone: '🎯' },
  { id: 'historico', rotulo: 'Histórico', icone: '📅' },
  { id: 'ajustes', rotulo: 'Ajustes', icone: '⚙️' },
]

type NavInferiorProps = {
  abaAtiva: Aba
  onMudarAba: (aba: Aba) => void
}

export function NavInferior({ abaAtiva, onMudarAba }: NavInferiorProps) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-marinho/10 bg-white pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto flex max-w-md">
        {abas.map((aba) => (
          <button
            key={aba.id}
            type="button"
            onClick={() => onMudarAba(aba.id)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2.5 text-xs font-medium ${
              abaAtiva === aba.id ? 'text-marinho' : 'text-marinho/40'
            }`}
          >
            <span className="text-xl leading-none">{aba.icone}</span>
            {aba.rotulo}
          </button>
        ))}
      </div>
    </nav>
  )
}
