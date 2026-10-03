type ChipSelecionavelProps = {
  rotulo: string
  selecionado: boolean
  onClick: () => void
}

export function ChipSelecionavel({ rotulo, selecionado, onClick }: ChipSelecionavelProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
        selecionado
          ? 'border-marinho bg-marinho text-white'
          : 'border-marinho/20 bg-white text-marinho hover:border-marinho/40'
      }`}
    >
      {rotulo}
    </button>
  )
}
