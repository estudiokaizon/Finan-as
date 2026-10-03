import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { formatarMoeda } from '../lib/formato'

type GraficoBarrasAssinaturasProps = {
  ativas: number
  canceladas: number
}

export function GraficoBarrasAssinaturas({ ativas, canceladas }: GraficoBarrasAssinaturasProps) {
  const dados = [
    { nome: 'Ativas', valor: ativas, cor: '#1B2A4A' },
    { nome: 'Canceladas', valor: canceladas, cor: '#9CA3AF' },
  ]

  return (
    <div className="h-32 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={dados} layout="vertical" margin={{ left: 0, right: 16 }}>
          <CartesianGrid horizontal={false} stroke="#1B2A4A" strokeOpacity={0.08} />
          <XAxis type="number" hide />
          <YAxis type="category" dataKey="nome" width={80} tickLine={false} axisLine={false} />
          <Tooltip formatter={(valor) => formatarMoeda(Number(valor))} />
          <Bar dataKey="valor" radius={6}>
            {dados.map((d) => (
              <Cell key={d.nome} fill={d.cor} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
