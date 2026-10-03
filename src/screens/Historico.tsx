import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { TelaBase } from '../components/TelaBase'
import { formatarMoeda, formatarPercentual } from '../lib/formato'
import { useResumosPorMes } from '../lib/hooks'
import { formatarMesAbreviado } from '../lib/mes'
import { SecaoPatrimonio } from './historico/SecaoPatrimonio'

export function Historico() {
  const resumos = useResumosPorMes()

  if (!resumos) {
    return (
      <TelaBase titulo="Histórico">
        <p className="text-marinho/60">Carregando…</p>
      </TelaBase>
    )
  }

  const dadosGrafico = resumos.map((r) => ({
    mes: formatarMesAbreviado(r.mesId),
    Receitas: r.resumo.receitas,
    Gastos: r.resumo.gastosTotais,
  }))

  return (
    <TelaBase titulo="Histórico">
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <h2 className="mb-2 font-serif text-lg font-semibold text-marinho">Receitas × Gastos</h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico}>
              <CartesianGrid vertical={false} stroke="#1B2A4A" strokeOpacity={0.08} />
              <XAxis dataKey="mes" tickLine={false} axisLine={false} fontSize={11} />
              <YAxis hide />
              <Tooltip formatter={(valor) => formatarMoeda(Number(valor))} />
              <Legend />
              <Bar dataKey="Receitas" fill="#1E7B4A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Gastos" fill="#C0392B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-5 overflow-x-auto rounded-2xl bg-white p-2 shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead>
            <tr className="text-left text-marinho/50">
              <th className="px-2 py-2 font-medium">Mês</th>
              <th className="px-2 py-2 font-medium">Receitas</th>
              <th className="px-2 py-2 font-medium">Fixos</th>
              <th className="px-2 py-2 font-medium">Assinaturas</th>
              <th className="px-2 py-2 font-medium">Parcelas</th>
              <th className="px-2 py-2 font-medium">Dia a dia</th>
              <th className="px-2 py-2 font-medium">Separado</th>
              <th className="px-2 py-2 font-medium">Sobra</th>
              <th className="px-2 py-2 font-medium">% gastos</th>
            </tr>
          </thead>
          <tbody>
            {[...resumos].reverse().map(({ mesId, resumo, fechado }) => (
              <tr key={mesId} className="border-t border-marinho/10 text-marinho">
                <td className="px-2 py-2 font-medium whitespace-nowrap">
                  {formatarMesAbreviado(mesId)}
                  {!fechado ? ' *' : ''}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">{formatarMoeda(resumo.receitas)}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatarMoeda(resumo.fixos)}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatarMoeda(resumo.assinaturas)}</td>
                <td className="px-2 py-2 whitespace-nowrap">{formatarMoeda(resumo.parcelasDoMes)}</td>
                <td className="px-2 py-2 whitespace-nowrap">
                  {formatarMoeda(resumo.gastosTotais - resumo.fixos - resumo.assinaturas - resumo.parcelasDoMes)}
                </td>
                <td className="px-2 py-2 whitespace-nowrap">{formatarMoeda(resumo.separado)}</td>
                <td className={`px-2 py-2 whitespace-nowrap ${resumo.sobraLivre < 0 ? 'text-alerta' : ''}`}>
                  {formatarMoeda(resumo.sobraLivre)}
                </td>
                <td className={`px-2 py-2 whitespace-nowrap ${resumo.percentualGastos > 0.8 ? 'text-alerta' : ''}`}>
                  {formatarPercentual(resumo.percentualGastos)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="px-2 py-2 text-xs text-marinho/40">* mês em aberto (ainda não fechado)</p>
      </div>

      <SecaoPatrimonio />
    </TelaBase>
  )
}
