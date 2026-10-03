type BotaoFlutuanteProps = {
  onClick: () => void
}

export function BotaoFlutuante({ onClick }: BotaoFlutuanteProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed right-4 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 flex items-center gap-2 rounded-full bg-dourado px-5 py-3.5 font-semibold text-white shadow-lg active:scale-95"
    >
      <span className="text-xl leading-none">+</span>
      Lançar gasto
    </button>
  )
}
