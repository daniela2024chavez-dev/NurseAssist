import { useState } from 'react'

function CalculadoraIMC({ onVolver }) {
  const [peso, setPeso] = useState('')
  const [altura, setAltura] = useState('')
  const [resultado, setResultado] = useState(null)

  const calcularIMC = () => {
    const pesoNumero = Number(peso)
    const alturaNumero = Number(altura)

    if (
      !pesoNumero ||
      !alturaNumero ||
      pesoNumero <= 0 ||
      alturaNumero <= 0
    ) {
      setResultado(null)
      return
    }

    const alturaMetros =
      alturaNumero > 3
        ? alturaNumero / 100
        : alturaNumero

    const imc = pesoNumero / (alturaMetros * alturaMetros)

    let categoria = ''

    if (imc < 18.5) {
      categoria = 'Bajo peso'
    } else if (imc < 25) {
      categoria = 'Peso normal'
    } else if (imc < 30) {
      categoria = 'Sobrepeso'
    } else if (imc < 35) {
      categoria = 'Obesidad grado I'
    } else if (imc < 40) {
      categoria = 'Obesidad grado II'
    } else {
      categoria = 'Obesidad grado III'
    }

    setResultado({
      valor: imc.toFixed(1),
      categoria,
    })
  }

  const limpiar = () => {
    setPeso('')
    setAltura('')
    setResultado(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>⚖️ Calculadora de IMC</h1>
          <p>Índice de masa corporal</p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={onVolver}
        >
          ← Volver
        </button>
      </header>

      <main className="content">
        <section className="welcome">
          <h2>Calculadora de IMC ⚖️</h2>

          <p>
            Calcula el índice de masa corporal utilizando
            el peso y la estatura.
          </p>
        </section>

        <div className="medicamento-detalle">
          <div className="campo-login">
            <label htmlFor="peso">
              Peso (kg)
            </label>

            <input
              id="peso"
              type="number"
              min="1"
              step="0.1"
              placeholder="Ej: 70"
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
            />
          </div>

          <div className="campo-login">
            <label htmlFor="altura">
              Altura (cm)
            </label>

            <input
              id="altura"
              type="number"
              min="1"
              step="0.1"
              placeholder="Ej: 170"
              value={altura}
              onChange={(e) => setAltura(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="boton-login"
            onClick={calcularIMC}
          >
            CALCULAR IMC
          </button>

          <button
            type="button"
            className="back-button"
            onClick={limpiar}
            style={{ marginTop: '12px', width: '100%' }}
          >
            LIMPIAR
          </button>

          {resultado !== null && (
            <div className="detalle-item" style={{ marginTop: '20px' }}>
              <strong>📊 Resultado</strong>

              <p style={{ fontSize: '24px', fontWeight: '800' }}>
                IMC: {resultado.valor}
              </p>

              <p>
                Clasificación: {resultado.categoria}
              </p>
            </div>
          )}
        </div>

        <section className="welcome">
          <p>
            El IMC es una herramienta de orientación basada
            en peso y talla. No constituye por sí solo una
            evaluación nutricional o diagnóstica completa.
          </p>
        </section>
      </main>
    </div>
  )
}

export default CalculadoraIMC