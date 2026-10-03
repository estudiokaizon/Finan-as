import { baixarArquivo } from './arquivo'
import { db } from './db'
import { hojeISO } from './mes'

type PayloadBackup = {
  versao: 1
  exportadoEm: string
  dados: Record<string, unknown[]>
}

export async function exportarJSON(): Promise<void> {
  const dados: Record<string, unknown[]> = {}
  for (const tabela of db.tables) {
    dados[tabela.name] = await tabela.toArray()
  }
  const payload: PayloadBackup = { versao: 1, exportadoEm: new Date().toISOString(), dados }
  baixarArquivo(JSON.stringify(payload, null, 2), `minhas-financas-backup-${hojeISO()}.json`, 'application/json')
}

export async function importarJSON(arquivo: File): Promise<void> {
  const texto = await arquivo.text()
  const payload = JSON.parse(texto) as Partial<PayloadBackup>
  if (!payload.dados || typeof payload.dados !== 'object') {
    throw new Error('Arquivo de backup inválido: não encontrei os dados esperados.')
  }
  const dados = payload.dados

  await db.transaction('rw', db.tables, async () => {
    for (const tabela of db.tables) {
      await tabela.clear()
    }
    for (const tabela of db.tables) {
      const registros = dados[tabela.name]
      if (Array.isArray(registros) && registros.length > 0) {
        await tabela.bulkAdd(registros)
      }
    }
  })
}

function escaparCSV(texto: string): string {
  if (/[;"\n]/.test(texto)) return '"' + texto.replace(/"/g, '""') + '"'
  return texto
}

function formatarNumeroCSV(valor: number): string {
  return valor.toFixed(2).replace('.', ',')
}

export async function exportarLancamentosCSV(): Promise<void> {
  const [lancamentos, categorias] = await Promise.all([db.lancamentos.toArray(), db.categorias.toArray()])
  const nomeCategoria = (categoriaId: string) => categorias.find((c) => c.id === categoriaId)?.nome ?? categoriaId

  const linhas = [
    ['Data', 'Descrição', 'Categoria', 'Forma de pagamento', 'Mês', 'Valor'].join(';'),
    ...[...lancamentos]
      .sort((a, b) => a.data.localeCompare(b.data))
      .map((l) =>
        [l.data, escaparCSV(l.descricao), escaparCSV(nomeCategoria(l.categoriaId)), l.forma, l.mesId, formatarNumeroCSV(l.valor)].join(
          ';',
        ),
      ),
  ]

  baixarArquivo('﻿' + linhas.join('\r\n'), `lancamentos-${hojeISO()}.csv`, 'text/csv;charset=utf-8')
}
