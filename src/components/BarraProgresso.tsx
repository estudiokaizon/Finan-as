type BarraProgressoProps = {
  progresso: number // 0 a 1
  cor?: 'marinho' | 'dourado' | 'sucesso' | 'alerta'
}

const cores: Record<NonNullable<BarraProgressoProps['cor']>, string> = {
  marinho: 'bg-marinho',
  dourado: 'bg-dourado',
  sucesso: 'bg-sucesso',
  alerta: 'bg-alerta',
}

export function BarraProgresso({ progresso, cor = 'marinho' }: BarraProgressoProps) {
  const percentual = Math.min(100, Math.max(0, progresso * 100))
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-marinho/10">
      <div className={`h-full rounded-full ${cores[cor]}`} style={{ width: `${percentual}%` }} />
    </div>
  )
}
