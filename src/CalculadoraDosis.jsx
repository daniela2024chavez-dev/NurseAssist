
import { useState } from 'react'
import './CalculadoraDosis.css'

function CalculadoraDosis({ onVolver }) {
  const [seccion, setSeccion] = useState('inicio')

  // ================================
  // REGLA DE TRES
  // ================================

  const [dosisDeseada, setDosisDeseada] = useState('')
  const [dosisDisponible, setDosisDisponible] = useState('')
  const [volumenDisponible, setVolumenDisponible] = useState('')

  const calcularReglaTres = () => {
    const deseada = parseFloat(dosisDeseada)
    const disponible = parseFloat(dosisDisponible)
    const volumen = parseFloat(volumenDisponible)

    if (
      isNaN(deseada) ||
      isNaN(disponible) ||
      isNaN(volumen) ||
      deseada <= 0 ||
      disponible <= 0 ||
      volumen <= 0
    ) {
      return null
    }

    return (deseada * volumen) / disponible
  }

  // ================================
  // DOSIS POR PESO
  // ================================

  const [peso, setPeso] = useState('')
  const [mgKg, setMgKg] = useState('')
  const [frecuencia, setFrecuencia] = useState('1')

  const calcularPeso = () => {
    const p = parseFloat(peso)
    const dosis = parseFloat(mgKg)
    const freq = parseFloat(frecuencia)

    if (
      isNaN(p) ||
      isNaN(dosis) ||
      isNaN(freq) ||
      p <= 0 ||
      dosis <= 0 ||
      freq <= 0
    ) {
      return null
    }

    const dosisAdministracion = p * dosis
    const dosisDiaria = dosisAdministracion * freq

    return {
      administracion: dosisAdministracion,
      diaria: dosisDiaria,
    }
  }

  // ================================
  // SUPERFICIE CORPORAL
  // Fórmula de Mosteller
  // ================================

  const [pesoSC, setPesoSC] = useState('')
  const [tallaSC, setTallaSC] = useState('')
  const [mgM2, setMgM2] = useState('')

  const calcularSuperficieCorporal = () => {
    const peso = parseFloat(pesoSC)
    const talla = parseFloat(tallaSC)
    const dosis = parseFloat(mgM2)

    if (
      isNaN(peso) ||
      isNaN(talla) ||
      isNaN(dosis) ||
      peso <= 0 ||
      talla <= 0 ||
      dosis <= 0
    ) {
      return null
    }

    const superficie = Math.sqrt((peso * talla) / 3600)
    const dosisTotal = superficie * dosis

    return {
      superficie,
      dosisTotal,
    }
  }

  // ================================
  // CONCENTRACIÓN MG/ML
  // ================================

  const [cantidadFarmaco, setCantidadFarmaco] = useState('')
  const [volumenConcentracion, setVolumenConcentracion] = useState('')

  const calcularConcentracion = () => {
    const cantidad = parseFloat(cantidadFarmaco)
    const volumen = parseFloat(volumenConcentracion)

    if (
      isNaN(cantidad) ||
      isNaN(volumen) ||
      cantidad <= 0 ||
      volumen <= 0
    ) {
      return null
    }

    return cantidad / volumen
  }

  // ================================
  // PORCENTAJE
  // ================================

  const [porcentaje, setPorcentaje] = useState('')
  const [volumenPorcentaje, setVolumenPorcentaje] = useState('')

  const calcularPorcentaje = () => {
    const porcentajeValor = parseFloat(porcentaje)
    const volumen = parseFloat(volumenPorcentaje)

    if (
      isNaN(porcentajeValor) ||
      isNaN(volumen) ||
      porcentajeValor <= 0 ||
      volumen <= 0
    ) {
      return null
    }

    return (porcentajeValor * volumen) / 100
  }

  // ================================
  // MOLARIDAD
  // ================================

  const [moles, setMoles] = useState('')
  const [litros, setLitros] = useState('')

  const calcularMolaridad = () => {
    const mol = parseFloat(moles)
    const l = parseFloat(litros)

    if (
      isNaN(mol) ||
      isNaN(l) ||
      mol <= 0 ||
      l <= 0
    ) {
      return null
    }

    return mol / l
  }

  // ================================
  // CONVERSIÓN DE UNIDADES
  // ================================

  const [valorConversion, setValorConversion] = useState('')
  const [tipoConversion, setTipoConversion] = useState('mg-g')

  const convertirUnidad = () => {
    const valor = parseFloat(valorConversion)

    if (isNaN(valor)) {
      return null
    }

    switch (tipoConversion) {
      case 'mg-g':
        return valor / 1000

      case 'g-mg':
        return valor * 1000

      case 'g-mcg':
        return valor * 1000000

      case 'mg-mcg':
        return valor * 1000

      case 'mcg-mg':
        return valor / 1000

      case 'mcg-g':
        return valor / 1000000

      case 'ml-l':
        return valor / 1000

      case 'l-ml':
        return valor * 1000

      case 'kg-g':
        return valor * 1000

      case 'g-kg':
        return valor / 1000

      default:
        return null
    }
  }

  // ================================
  // EJERCICIOS
  // ================================

  const ejercicios = [
    {
      titulo: 'Ejercicio 1: Cefaclor',
      problema:
        'Tenemos una botella de Cefaclor etiquetada como 125 mg/5 mL. Si deben administrarse 60 mg, ¿cuántos mL se precisan?',
      pasos: [
        'Dosis disponible: 125 mg',
        'Volumen disponible: 5 mL',
        'Dosis deseada: 60 mg',
        'X = (60 mg × 5 mL) ÷ 125 mg',
        'X = 2,4 mL',
      ],
      respuesta: '2,4 mL',
    },
    {
      titulo: 'Ejercicio 2: Suero glucosado al 5%',
      problema:
        'A un paciente se le administran 1.000 mL/día de suero glucosado al 5%. ¿Cuántos mg de glucosa recibe al día?',
      pasos: [
        'Una solución al 5% contiene 5 g por cada 100 mL.',
        'X = (5 g × 1.000 mL) ÷ 100 mL',
        'X = 50 g',
        '50 g × 1.000 = 50.000 mg',
      ],
      respuesta: '50.000 mg de glucosa al día',
    },
    {
      titulo: 'Ejercicio 3: Albúmina',
      problema:
        'Se prescribe Albúmina 6 g por cada litro de líquido ascítico obtenido. Se obtienen 5 litros. Se dispone de Albúmina Humana al 20%, en frascos de 50 mL.',
      pasos: [
        '6 g × 5 L = 30 g de albúmina necesarios.',
        'Una solución al 20% contiene 20 g por cada 100 mL.',
        'X = (30 g × 100 mL) ÷ 20 g',
        'X = 150 mL',
        'Cada frasco contiene 50 mL.',
        '150 mL ÷ 50 mL = 3 frascos.',
      ],
      respuesta: '150 mL de albúmina = 3 frascos de 50 mL',
    },
  ]

  // ================================
  // TÍTULO DE SECCIÓN
  // ================================

  const TituloSeccion = ({ icono, titulo, descripcion }) => (
    <div className="titulo-seccion">
      <div className="titulo-icono">{icono}</div>

      <div>
        <h2>{titulo}</h2>

        {descripcion && <p>{descripcion}</p>}
      </div>
    </div>
  )

  // ================================
  // INICIO
  // ================================

  const renderInicio = () => (
    <div>
      <div className="hero-dosis">
        <div>
          <span className="etiqueta">NURSEASSIST</span>

          <h1>💊 Cálculo de Dosis</h1>

          <p>
            Herramientas para estudiar y practicar cálculos relacionados
            con la administración de medicamentos.
          </p>
        </div>
      </div>

      <div className="advertencia-dosis">
        <strong>⚠️ Importante</strong>

        <p>
          Estas calculadoras son herramientas educativas. Antes de
          administrar un medicamento se debe verificar la prescripción,
          concentración, presentación, vía, paciente, unidades y protocolo
          institucional.
        </p>
      </div>

      <div className="tarjetas-menu">
        <button
          type="button"
          onClick={() => setSeccion('conceptos')}
        >
          <span>📚</span>
          <strong>Conceptos básicos</strong>
          <small>Dosis, concentración, disolución y más</small>
        </button>

        <button
          type="button"
          onClick={() => setSeccion('unidades')}
        >
          <span>⚖️</span>
          <strong>Unidades de medida</strong>
          <small>Equivalencias y conversiones</small>
        </button>

        <button
          type="button"
          onClick={() => setSeccion('regla')}
        >
          <span>🧮</span>
          <strong>Regla de tres</strong>
          <small>Cálculo de volumen a administrar</small>
        </button>

        <button
          type="button"
          onClick={() => setSeccion('peso')}
        >
          <span>⚖️</span>
          <strong>Dosis por peso</strong>
          <small>mg/kg y dosis diaria</small>
        </button>

        <button
          type="button"
          onClick={() => setSeccion('superficie')}
        >
          <span>📐</span>
          <strong>Superficie corporal</strong>
          <small>mg/m²</small>
        </button>

        <button
          type="button"
          onClick={() => setSeccion('concentracion')}
        >
          <span>🧪</span>
          <strong>Concentración</strong>
          <small>mg/mL y porcentajes</small>
        </button>

        <button
          type="button"
          onClick={() => setSeccion('molaridad')}
        >
          <span>🔬</span>
          <strong>Molaridad</strong>
          <small>moles/L</small>
        </button>

        <button
          type="button"
          onClick={() => setSeccion('ejercicios')}
        >
          <span>📝</span>
          <strong>Ejercicios resueltos</strong>
          <small>Ejemplos paso a paso</small>
        </button>
      </div>
    </div>
  )

  // ================================
  // CONCEPTOS
  // ================================

  const renderConceptos = () => (
    <div className="contenido">
      <TituloSeccion
        icono="📚"
        titulo="Conceptos básicos"
        descripcion="Principios fundamentales para el cálculo de dosis"
      />

      <div className="conceptos-grid">
        <div className="concepto-card">
          <h3>Dosis</h3>
          <p>
            Cantidad de medicamento que debe administrarse para producir
            el efecto deseado.
          </p>
          <ul>
            <li>
              <strong>Dosis/día:</strong> cantidad administrada en un día.
            </li>
            <li>
              <strong>Dosis/ciclo:</strong> cantidad durante un ciclo.
            </li>
            <li>
              <strong>Dosis total:</strong> cantidad durante todo el
              tratamiento.
            </li>
          </ul>
        </div>

        <div className="concepto-card">
          <h3>Cantidad total de medicamento</h3>
          <p>
            Cantidad de medicamento que debe administrarse durante un
            período determinado o durante todo el tratamiento.
          </p>
        </div>

        <div className="concepto-card">
          <h3>Número de dosis</h3>
          <p>
            Está determinado por la cantidad total de medicamento y el
            tamaño de cada dosis.
          </p>
        </div>

        <div className="concepto-card">
          <h3>Tamaño de la dosis</h3>
          <p>
            Cantidad de medicamento que corresponde administrar en cada
            administración.
          </p>
        </div>

        <div className="concepto-card">
          <h3>Disolución</h3>
          <p>
            Mezcla homogénea en la que una o más sustancias se disuelven
            en otra.
          </p>
        </div>

        <div className="concepto-card">
          <h3>Soluto</h3>
          <p>
            Sustancia que se disuelve dentro de una disolución.
          </p>
        </div>

        <div className="concepto-card">
          <h3>Disolvente</h3>
          <p>
            Sustancia en la que se disuelve el soluto.
          </p>
        </div>

        <div className="concepto-card">
          <h3>Concentración</h3>
          <p>
            Indica la cantidad de soluto presente en una determinada
            cantidad de disolución.
          </p>
        </div>
      </div>
    </div>
  )

  // ================================
  // UNIDADES
  // ================================

  const renderUnidades = () => {
    const resultado = convertirUnidad()

    return (
      <div className="contenido">
        <TituloSeccion
          icono="⚖️"
          titulo="Unidades de medida"
          descripcion="Equivalencias frecuentes utilizadas en farmacología"
        />

        <div className="tabla-unidades">
          <div className="fila encabezado">
            <span>Unidad</span>
            <span>Equivalencia</span>
          </div>

          <div className="fila">
            <span>1 g</span>
            <span>1.000 mg</span>
          </div>

          <div className="fila">
            <span>1 mg</span>
            <span>1.000 mcg</span>
          </div>

          <div className="fila">
            <span>1 kg</span>
            <span>1.000 g</span>
          </div>

          <div className="fila">
            <span>1 L</span>
            <span>1.000 mL</span>
          </div>

          <div className="fila">
            <span>1 mg</span>
            <span>0,001 g</span>
          </div>
        </div>

        <div className="calculadora-card">
          <h3>🔄 Conversor de unidades</h3>

          <div className="form-grid">
            <label>
              Valor

              <input
                type="number"
                value={valorConversion}
                onChange={(e) =>
                  setValorConversion(e.target.value)
                }
                placeholder="Ej: 500"
              />
            </label>

            <label>
              Conversión

              <select
                value={tipoConversion}
                onChange={(e) =>
                  setTipoConversion(e.target.value)
                }
              >
                <option value="mg-g">mg → g</option>
                <option value="g-mg">g → mg</option>
                <option value="g-mcg">g → mcg</option>
                <option value="mg-mcg">mg → mcg</option>
                <option value="mcg-mg">mcg → mg</option>
                <option value="mcg-g">mcg → g</option>
                <option value="ml-l">mL → L</option>
                <option value="l-ml">L → mL</option>
                <option value="kg-g">kg → g</option>
                <option value="g-kg">g → kg</option>
              </select>
            </label>
          </div>

          {resultado !== null && (
            <div className="resultado">
              <span>Resultado</span>
              <strong>{resultado}</strong>
            </div>
          )}

          <p className="nota">
            ⚠️ Antes de calcular una dosis, asegúrate de que todas las
            unidades sean compatibles.
          </p>
        </div>
      </div>
    )
  }

  // ================================
  // REGLA DE TRES
  // ================================

  const renderReglaTres = () => {
    const resultado = calcularReglaTres()

    return (
      <div className="contenido">
        <TituloSeccion
          icono="🧮"
          titulo="Regla de tres"
          descripcion="Cálculo de volumen según dosis disponible y dosis indicada"
        />

        <div className="formula-box">
          <strong>Fórmula</strong>

          <div className="formula">
            X = (Dosis deseada × Volumen disponible) ÷ Dosis disponible
          </div>
        </div>

        <div className="calculadora-card">
          <h3>💊 Calculadora de dosis</h3>

          <div className="form-grid">
            <label>
              Dosis deseada

              <input
                type="number"
                value={dosisDeseada}
                onChange={(e) =>
                  setDosisDeseada(e.target.value)
                }
                placeholder="Ej: 60"
              />
            </label>

            <label>
              Dosis disponible

              <input
                type="number"
                value={dosisDisponible}
                onChange={(e) =>
                  setDosisDisponible(e.target.value)
                }
                placeholder="Ej: 125"
              />
            </label>

            <label>
              Volumen disponible (mL)

              <input
                type="number"
                value={volumenDisponible}
                onChange={(e) =>
                  setVolumenDisponible(e.target.value)
                }
                placeholder="Ej: 5"
              />
            </label>
          </div>

          {resultado !== null && (
            <div className="resultado">
              <span>Volumen a administrar</span>

              <strong>
                {resultado.toFixed(2)} mL
              </strong>
            </div>
          )}

          <div className="ejemplo-mini">
            <strong>Ejemplo:</strong>

            <p>
              Si tienes 125 mg en 5 mL y necesitas administrar 60 mg:
            </p>

            <p className="formula">
              X = (60 × 5) ÷ 125 = 2,4 mL
            </p>
          </div>
        </div>
      </div>
    )
  }

  // ================================
  // DOSIS POR PESO
  // ================================

  const renderPeso = () => {
    const resultado = calcularPeso()

    return (
      <div className="contenido">
        <TituloSeccion
          icono="⚖️"
          titulo="Dosis según peso corporal"
          descripcion="Cálculo de dosis expresadas en mg/kg"
        />

        <div className="formula-box">
          <strong>Dosis por administración</strong>

          <div className="formula">
            Dosis (mg) = mg/kg × peso (kg)
          </div>

          <strong>Dosis diaria</strong>

          <div className="formula">
            Dosis diaria = mg/kg × peso (kg) × frecuencia
          </div>
        </div>

        <div className="calculadora-card">
          <h3>⚖️ Calculadora mg/kg</h3>

          <div className="form-grid">
            <label>
              Peso del paciente (kg)

              <input
                type="number"
                min="0"
                value={peso}
                onChange={(e) =>
                  setPeso(e.target.value)
                }
                placeholder="Ej: 70"
              />
            </label>

            <label>
              Dosis indicada (mg/kg)

              <input
                type="number"
                min="0"
                value={mgKg}
                onChange={(e) =>
                  setMgKg(e.target.value)
                }
                placeholder="Ej: 10"
              />
            </label>

            <label>
              Frecuencia (veces/día)

              <input
                type="number"
                min="1"
                value={frecuencia}
                onChange={(e) =>
                  setFrecuencia(e.target.value)
                }
              />
            </label>
          </div>

          {resultado && (
            <div className="resultados-dobles">
              <div className="resultado">
                <span>Dosis por administración</span>

                <strong>
                  {resultado.administracion.toFixed(2)} mg
                </strong>
              </div>

              <div className="resultado">
                <span>Dosis diaria</span>

                <strong>
                  {resultado.diaria.toFixed(2)} mg/día
                </strong>
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ================================
  // SUPERFICIE CORPORAL
  // ================================

  const renderSuperficie = () => {
    const resultado = calcularSuperficieCorporal()

    return (
      <div className="contenido">
        <TituloSeccion
          icono="📐"
          titulo="Dosis según superficie corporal"
          descripcion="Cálculo utilizando mg/m²"
        />

        <div className="formula-box">
          <strong>Fórmula de dosis</strong>

          <div className="formula">
            Dosis = mg/m² × superficie corporal (m²)
          </div>

          <strong>Superficie corporal - Mosteller</strong>

          <div className="formula">
            SC = √[(peso × talla) ÷ 3600]
          </div>
        </div>

        <div className="calculadora-card">
          <h3>📐 Calculadora de superficie corporal</h3>

          <div className="form-grid">
            <label>
              Peso (kg)

              <input
                type="number"
                min="0"
                value={pesoSC}
                onChange={(e) =>
                  setPesoSC(e.target.value)
                }
                placeholder="Ej: 70"
              />
            </label>

            <label>
              Talla (cm)

              <input
                type="number"
                min="0"
                value={tallaSC}
                onChange={(e) =>
                  setTallaSC(e.target.value)
                }
                placeholder="Ej: 170"
              />
            </label>

            <label>
              Dosis indicada (mg/m²)

              <input
                type="number"
                min="0"
                value={mgM2}
                onChange={(e) =>
                  setMgM2(e.target.value)
                }
                placeholder="Ej: 100"
              />
            </label>
          </div>

          {resultado && (
            <div className="resultados-dobles">
              <div className="resultado">
                <span>Superficie corporal</span>

                <strong>
                  {resultado.superficie.toFixed(2)} m²
                </strong>
              </div>

              <div className="resultado">
                <span>Dosis calculada</span>

                <strong>
                  {resultado.dosisTotal.toFixed(2)} mg
                </strong>
              </div>
            </div>
          )}

          <p className="nota">
            La superficie corporal puede calcularse mediante diferentes
            fórmulas. Aquí se utiliza la fórmula de Mosteller.
          </p>
        </div>
      </div>
    )
  }

  // ================================
  // CONCENTRACIÓN
  // ================================

  const renderConcentracion = () => {
    const resultadoMgMl = calcularConcentracion()
    const resultadoPorcentaje = calcularPorcentaje()

    return (
      <div className="contenido">
        <TituloSeccion
          icono="🧪"
          titulo="Concentración"
          descripcion="Interpretación de mg/mL y concentraciones porcentuales"
        />

        <div className="info-concentracion">
          <div>
            <h3>Masa/volumen</h3>

            <p>
              Una concentración de <strong>2 mg/mL</strong> significa
              que existen 2 mg de fármaco por cada 1 mL de solución.
            </p>
          </div>

          <div>
            <h3>Porcentaje (%)</h3>

            <p>
              Una concentración de <strong>5%</strong> corresponde,
              en general para peso/volumen, a 5 g de soluto por cada
              100 mL de solución.
            </p>
          </div>

          <div>
            <h3>Razón</h3>

            <p>
              Establece una relación entre la cantidad de soluto y una
              cantidad determinada de solución.
            </p>
          </div>
        </div>

        <div className="calculadora-card">
          <h3>🧪 Calculadora mg/mL</h3>

          <div className="form-grid">
            <label>
              Cantidad de fármaco (mg)

              <input
                type="number"
                min="0"
                value={cantidadFarmaco}
                onChange={(e) =>
                  setCantidadFarmaco(e.target.value)
                }
                placeholder="Ej: 500"
              />
            </label>

            <label>
              Volumen (mL)

              <input
                type="number"
                min="0"
                value={volumenConcentracion}
                onChange={(e) =>
                  setVolumenConcentracion(e.target.value)
                }
                placeholder="Ej: 10"
              />
            </label>
          </div>

          {resultadoMgMl !== null && (
            <div className="resultado">
              <span>Concentración</span>

              <strong>
                {resultadoMgMl.toFixed(2)} mg/mL
              </strong>
            </div>
          )}
        </div>

        <div className="calculadora-card">
          <h3>📊 Calculadora de porcentaje</h3>

          <div className="form-grid">
            <label>
              Concentración (%)

              <input
                type="number"
                min="0"
                value={porcentaje}
                onChange={(e) =>
                  setPorcentaje(e.target.value)
                }
                placeholder="Ej: 5"
              />
            </label>

            <label>
              Volumen total (mL)

              <input
                type="number"
                min="0"
                value={volumenPorcentaje}
                onChange={(e) =>
                  setVolumenPorcentaje(e.target.value)
                }
                placeholder="Ej: 1000"
              />
            </label>
          </div>

          {resultadoPorcentaje !== null && (
            <div className="resultado">
              <span>Cantidad de soluto</span>

              <strong>
                {resultadoPorcentaje.toFixed(2)} g
              </strong>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ================================
  // MOLARIDAD
  // ================================

  const renderMolaridad = () => {
    const resultado = calcularMolaridad()

    return (
      <div className="contenido">
        <TituloSeccion
          icono="🔬"
          titulo="Molaridad"
          descripcion="Cantidad de moles de soluto por litro de disolución"
        />

        <div className="formula-box">
          <strong>Fórmula</strong>

          <div className="formula">
            M = moles de soluto ÷ litros de disolución
          </div>
        </div>

        <div className="calculadora-card">
          <h3>🔬 Calculadora de molaridad</h3>

          <div className="form-grid">
            <label>
              Moles de soluto

              <input
                type="number"
                min="0"
                value={moles}
                onChange={(e) =>
                  setMoles(e.target.value)
                }
                placeholder="Ej: 0.5"
              />
            </label>

            <label>
              Volumen de disolución (L)

              <input
                type="number"
                min="0"
                value={litros}
                onChange={(e) =>
                  setLitros(e.target.value)
                }
                placeholder="Ej: 1"
              />
            </label>
          </div>

          {resultado !== null && (
            <div className="resultado">
              <span>Molaridad</span>

              <strong>
                {resultado.toFixed(3)} M
              </strong>
            </div>
          )}

          <div className="nota">
            <strong>Recuerda:</strong> el mol de un soluto se obtiene
            a partir de su masa molar, calculada utilizando los pesos
            atómicos de los elementos que lo componen.
          </div>
        </div>
      </div>
    )
  }

  // ================================
  // EJERCICIOS
  // ================================

  const renderEjercicios = () => (
    <div className="contenido">
      <TituloSeccion
        icono="📝"
        titulo="Ejercicios de ejemplo resueltos"
        descripcion="Practica los principales tipos de cálculo"
      />

      {ejercicios.map((ejercicio, index) => (
        <div className="ejercicio-card" key={index}>
          <div className="ejercicio-numero">
            {index + 1}
          </div>

          <div className="ejercicio-contenido">
            <h3>{ejercicio.titulo}</h3>

            <p className="problema">
              {ejercicio.problema}
            </p>

            <h4>Resolución paso a paso</h4>

            <div className="pasos">
              {ejercicio.pasos.map((paso, pasoIndex) => (
                <div className="paso" key={pasoIndex}>
                  <span>{pasoIndex + 1}</span>

                  <p>{paso}</p>
                </div>
              ))}
            </div>

            <div className="respuesta-final">
              <span>✅ Respuesta</span>

              <strong>
                {ejercicio.respuesta}
              </strong>
            </div>
          </div>
        </div>
      ))}

      <div className="advertencia-dosis">
        <strong>⚠️ Seguridad del paciente</strong>

        <p>
          Un cálculo correcto de dosis es fundamental para disminuir
          el riesgo de errores de medicación. Siempre verifica el
          resultado antes de la administración.
        </p>
      </div>
    </div>
  )

  // ================================
  // RENDER DEL CONTENIDO
  // ================================

  const renderContenido = () => {
    switch (seccion) {
      case 'conceptos':
        return renderConceptos()

      case 'unidades':
        return renderUnidades()

      case 'regla':
        return renderReglaTres()

      case 'peso':
        return renderPeso()

      case 'superficie':
        return renderSuperficie()

      case 'concentracion':
        return renderConcentracion()

      case 'molaridad':
        return renderMolaridad()

      case 'ejercicios':
        return renderEjercicios()

      default:
        return renderInicio()
    }
  }

  // ================================
  // COMPONENTE PRINCIPAL
  // ================================

  return (
    <div className="calculadora-dosis">

      <header className="barra-superior-dosis">

        <button
          type="button"
          className="btn-volver"
          onClick={onVolver}
        >
          ← Volver
        </button>

        <div className="nombre-modulo">
          💊 Cálculo de Dosis
        </div>

      </header>

      <nav className="menu-dosis">

        <button
          type="button"
          className={seccion === 'inicio' ? 'activo' : ''}
          onClick={() => setSeccion('inicio')}
        >
          🏠 Inicio
        </button>

        <button
          type="button"
          className={seccion === 'conceptos' ? 'activo' : ''}
          onClick={() => setSeccion('conceptos')}
        >
          📚 Conceptos
        </button>

        <button
          type="button"
          className={seccion === 'unidades' ? 'activo' : ''}
          onClick={() => setSeccion('unidades')}
        >
          ⚖️ Unidades
        </button>

        <button
          type="button"
          className={seccion === 'regla' ? 'activo' : ''}
          onClick={() => setSeccion('regla')}
        >
          🧮 Regla de tres
        </button>

        <button
          type="button"
          className={seccion === 'peso' ? 'activo' : ''}
          onClick={() => setSeccion('peso')}
        >
          ⚖️ mg/kg
        </button>

        <button
          type="button"
          className={seccion === 'superficie' ? 'activo' : ''}
          onClick={() => setSeccion('superficie')}
        >
          📐 mg/m²
        </button>

        <button
          type="button"
          className={seccion === 'concentracion' ? 'activo' : ''}
          onClick={() => setSeccion('concentracion')}
        >
          🧪 Concentración
        </button>

        <button
          type="button"
          className={seccion === 'molaridad' ? 'activo' : ''}
          onClick={() => setSeccion('molaridad')}
        >
          🔬 Molaridad
        </button>

        <button
          type="button"
          className={seccion === 'ejercicios' ? 'activo' : ''}
          onClick={() => setSeccion('ejercicios')}
        >
          📝 Ejercicios
        </button>

      </nav>

      <main className="contenedor-dosis">
        {renderContenido()}
      </main>

    </div>
  )
}

export default CalculadoraDosis
