type TecladoNumericoProps = {
  valorCentavos: number
  onMudar: (valorCentavos: number) => void
}

const teclas = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', '⌫']

export function TecladoNumerico({ valorCentavos, onMudar }: TecladoNumericoProps) {
  function aoTocarTecla(tecla: string) {
    if (tecla === '⌫') {
      onMudar(Math.floor(valorCentavos / 10))
      return
    }
    if (tecla === ',') return
    const digito = Number(tecla)
    const proximo = valorCentavos * 10 + digito
    if (proximo > Number.MAX_SAFE_INTEGER / 10) return
    onMudar(proximo)
  }

  return (
    <div>
      <p className="text-center font-serif text-4xl font-semibold text-marinho">
        {formatarCentavos(valorCentavos)}
      </p>
      <div className="mt-4 grid grid-cols-3 gap-2">
        {teclas.map((tecla) => (
          <button
            key={tecla}
            type="button"
            onClick={() => aoTocarTecla(tecla)}
            disabled={tecla === ','}
            className="rounded-xl bg-creme py-4 text-xl font-semibold text-marinho disabled:opacity-30 active:bg-marinho/10"
          >
            {tecla}
          </button>
        ))}
      </div>
    </div>
  )
}

function formatarCentavos(valorCentavos: number): string {
  const reais = valorCentavos / 100
  return reais.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}
