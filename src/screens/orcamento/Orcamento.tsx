import { useState } from 'react'
import { TelaBase } from '../../components/TelaBase'
import { AbaReceitas } from './AbaReceitas'
import { AbaSepararPrimeiro } from './AbaSepararPrimeiro'
import { AbaFixos } from './AbaFixos'
import { AbaAssinaturas } from './AbaAssinaturas'
import { AbaParcelas } from './AbaParcelas'
import { AbaDiaADia } from './AbaDiaADia'

type AbaOrcamento = 'receitas' | 'separar' | 'fixos' | 'assinaturas' | 'parcelas' | 'diaadia'

const abas: Array<{ id: AbaOrcamento; rotulo: string }> = [
  { id: 'receitas', rotulo: 'Receitas' },
  { id: 'separar', rotulo: 'Separar primeiro' },
  { id: 'fixos', rotulo: 'Fixos' },
  { id: 'assinaturas', rotulo: 'Assinaturas' },
  { id: 'parcelas', rotulo: 'Parcelas' },
  { id: 'diaadia', rotulo: 'Dia a dia' },
]

type OrcamentoProps = {
  mesAtualId: string | undefined
}

export function Orcamento({ mesAtualId }: OrcamentoProps) {
  const [aba, setAba] = useState<AbaOrcamento>('receitas')

  return (
    <TelaBase titulo="Orçamento">
      <div className="-mx-4 mb-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {abas.map((a) => (
          <button
            key={a.id}
            type="button"
            onClick={() => setAba(a.id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-medium ${
              aba === a.id ? 'border-marinho bg-marinho text-white' : 'border-marinho/20 bg-white text-marinho'
            }`}
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      {aba === 'receitas' && <AbaReceitas mesAtualId={mesAtualId} />}
      {aba === 'separar' && <AbaSepararPrimeiro mesAtualId={mesAtualId} />}
      {aba === 'fixos' && <AbaFixos />}
      {aba === 'assinaturas' && <AbaAssinaturas />}
      {aba === 'parcelas' && <AbaParcelas mesAtualId={mesAtualId} />}
      {aba === 'diaadia' && <AbaDiaADia mesAtualId={mesAtualId} />}
    </TelaBase>
  )
}
