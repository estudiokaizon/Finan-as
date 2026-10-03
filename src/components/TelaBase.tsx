import type { ReactNode } from 'react'

export function TelaBase({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="mx-auto max-w-md px-4 pt-[calc(1.5rem+env(safe-area-inset-top))] pb-28">
      <h1 className="mb-4 font-serif text-2xl font-semibold text-marinho">{titulo}</h1>
      {children}
    </div>
  )
}
