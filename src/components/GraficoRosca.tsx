import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { formatarMoeda } from '../lib/formato'

export type FatiaRosca = { nome: string; valor: number; cor: string }

type GraficoRoscaProps = {
  fatias: FatiaRosca[]
}

export function GraficoRosca({ fatias }: GraficoRoscaProps) {
  const dados = fatias.filter((f) => f.valor > 0)

  if (dados.length === 0) {
    return <p className="py-8 text-center text-sm text-marinho/50">Sem dados para exibir ainda.</p>
  }

  return (
    <div>
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={dados} dataKey="valor" nameKey="nome" innerRadius="60%" outerRadius="90%" paddingAngle={2}>
              {dados.map((fatia) => (
                <Cell key={fatia.nome} fill={fatia.cor} />
              ))}
            </Pie>
            <Tooltip formatter={(valor) => formatarMoeda(Number(valor))} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <ul className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5 text-sm">
        {dados.map((fatia) => (
          <li key={fatia.nome} className="flex items-center gap-2 text-marinho/80">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: fatia.cor }} />
            <span className="truncate">{fatia.nome}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
