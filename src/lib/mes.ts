import { addMonths, format, parse } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function mesParaData(mesId: string): Date {
  return parse(mesId, 'yyyy-MM', new Date())
}

export function dataParaMesId(data: Date): string {
  return format(data, 'yyyy-MM')
}

export function formatarMesExtenso(mesId: string): string {
  const texto = format(mesParaData(mesId), 'MMMM yyyy', { locale: ptBR })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function formatarMesAbreviado(mesId: string): string {
  const texto = format(mesParaData(mesId), 'MMM/yy', { locale: ptBR })
  return texto.charAt(0).toUpperCase() + texto.slice(1)
}

export function proximoMesId(mesId: string): string {
  return dataParaMesId(addMonths(mesParaData(mesId), 1))
}

export function somarMeses(mesId: string, quantidade: number): string {
  return dataParaMesId(addMonths(mesParaData(mesId), quantidade))
}

export function hojeISO(): string {
  return format(new Date(), 'yyyy-MM-dd')
}
