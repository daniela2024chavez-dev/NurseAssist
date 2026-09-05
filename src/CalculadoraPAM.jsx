import { useState } from 'react'

function CalculadoraPAM({ onVolver }) {
  const [sistolica, setSistolica] = useState('')
  const [diastolica, setDiastolica] = useState('')
  const [resultado, setResultado] = useState(null)

  const calcularPAM = () => {
    const pas = Number(sistolica)
    const pad = Number(diastolica)

    if (!pas || !pad || pas <= 0 || pad <= 0 || pas < pad) {
      setResultado(null)
      return
    }

    const pam = (pas + 2 * pad) / 3

    setResultado(pam.toFixed(1))
  }

  const limpiar = () => {
    setSistolica('')
    setDiastolica('')
    setResultado(null)
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🩺 Calculadora de PAM</h1>
          <p>Presión arterial media</p>
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
          <h2>Calculadora de PAM 🩺</h2>

          <p>
            Calcula la presión arterial media a partir de la
            presión sistólica y diastólica.
          </p>
        </section>

        <div className="medicamento-detalle">
          <div className="detalle-item">
            <strong>📐 Fórmula</strong>

            <p>
              PAM = (PAS + 2 × PAD) ÷ 3
            </p>
          </div>

          <div className="campo-login">
            <label htmlFor="sistolica">
              Presión sistólica (PAS)
            </label>

            <input
              id="sistolica"
              type="number"
              min="1"
              placeholder="Ej: 120"
              value={sistolica}
              onChange={(e) => setSistolica(e.target.value)}
            />
          </div>

          <div className="campo-login">
            <label htmlFor="diastolica">
              Presión diastólica (PAD)
            </label>

            <input
              id="diastolica"
              type="number"
              min="1"
              placeholder="Ej: 80"
              value={diastolica}
              onChange={(e) => setDiastolica(e.target.value)}
            />
          </div>

          <button
            type="button"
            className="boton-login"
            onClick={calcularPAM}
          >
            CALCULAR PAM
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
              <strong>🩸 Resultado</strong>

              <p style={{ fontSize: '24px', fontWeight: '800' }}>
                PAM: {resultado} mmHg
              </p>
            </div>
          )}
        </div>

        <section className="welcome">
          <p>
            La PAM es un valor estimado de la presión promedio
            en las arterias durante un ciclo cardíaco.
          </p>

          <p>
            Este cálculo es orientativo y debe interpretarse
            junto con el contexto clínico y los demás signos
            vitales.
          </p>
        </section>
      </main>
    </div>
  )
}

export default CalculadoraPAM
