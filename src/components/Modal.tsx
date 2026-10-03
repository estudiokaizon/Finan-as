import type { ReactNode } from 'react'

type ModalProps = {
  aberto: boolean
  onFechar: () => void
  titulo: string
  children: ReactNode
}

export function Modal({ aberto, onFechar, titulo, children }: ModalProps) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-marinho/40 sm:items-center">
      <div
        className="max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-t-2xl bg-white p-5 pb-[calc(1.25rem+env(safe-area-inset-bottom))] shadow-xl sm:rounded-2xl"
        role="dialog"
        aria-modal="true"
        aria-label={titulo}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-serif text-lg font-semibold text-marinho">{titulo}</h2>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="rounded-full p-2 text-marinho/60 hover:bg-creme"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}
