import type { ReactNode } from 'react'

type CampoProps = {
  rotulo: string
  children: ReactNode
}

export function Campo({ rotulo, children }: CampoProps) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-marinho/70">{rotulo}</span>
      {children}
    </label>
  )
}

export const classeInput =
  'w-full rounded-xl border border-marinho/15 px-3 py-2.5 text-marinho focus:border-marinho focus:outline-none'
