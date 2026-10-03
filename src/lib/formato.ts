const formatadorMoeda = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
})

export function formatarMoeda(valor: number): string {
  return formatadorMoeda.format(valor)
}

export function formatarPercentual(valor: number, casasDecimais = 1): string {
  return `${(valor * 100).toFixed(casasDecimais).replace('.', ',')}%`
}
