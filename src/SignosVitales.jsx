import { useState } from 'react'
import './SignosVitales.css'

const gruposEtarios = {
bebe: {
nombre: 'Bebé / Lactante',
edad: '0 a 12 meses',
icono: '👶',
temperatura: [
['Hipotermia', '< 36,5 °C'],
['Normal / afebril', '36,5–37,5 °C'],
['Fiebre', '≥ 38,0 °C'],
['Hipertermia', 'Elevación de la temperatura corporal'],
],
frecuenciaCardiaca: [
['Bradicardia', '< 100 lpm'],
['Normocardia', '100–160 lpm'],
['Taquicardia', '> 160 lpm'],
],
frecuenciaRespiratoria: [
['Apnea', 'Ausencia de respiración'],
['Bradipnea', '< 30 rpm'],
['Eupnea', '30–60 rpm'],
['Taquipnea', '> 60 rpm'],
['Disnea', 'Dificultad respiratoria'],
['Hiperpnea', 'Aumento de la profundidad respiratoria'],
],
saturacion: [
['Normal', '95–100 %'],
['Disminuida', '91–94 %'],
['Baja', '86–90 %'],
['Severamente baja', '< 86 %'],
],
presionArterial: [
['Normal', 'Evaluar según edad y condición clínica'],
['Presión elevada', 'Evaluar mediante tablas pediátricas'],
['Presión baja', 'Evaluar según edad y condición clínica'],
],
glicemia: [
['Hipoglicemia', '< 45–50 mg/dL*'],
['Normal', 'Depende de edad, alimentación y horas de vida'],
['Hiperglicemia', 'Evaluar según condición clínica'],
],
eva: [
['Sin dolor', '0'],
['Dolor leve', '1–3'],
['Dolor moderado', '4–6'],
['Dolor severo', '7–8'],
['Dolor insoportable', '9–10'],
],
nota:
'En lactantes y recién nacidos, los valores pueden variar según edad exacta, estado clínico, alimentación y protocolo institucional.',
},

nino: {
nombre: 'Niño',
edad: '1 a 17 años',
icono: '🧒',
temperatura: [
['Hipotermia', '< 35,0 °C'],
['Normal / afebril', '36,0–37,4 °C'],
['Subfebril', '37,5–37,9 °C'],
['Fiebre', '≥ 38,0 °C'],
['Hipertermia', 'Elevación de la temperatura corporal'],
],
frecuenciaCardiaca: [
['Bradicardia', 'Por debajo del rango esperado para la edad'],
['Normocardia', 'Dentro del rango esperado para la edad'],
['Taquicardia', 'Por sobre el rango esperado para la edad'],
],
frecuenciaRespiratoria: [
['Apnea', 'Ausencia de respiración'],
['Bradipnea', 'Por debajo del rango esperado para la edad'],
['Eupnea', 'Respiración normal para la edad'],
['Taquipnea', 'Por sobre el rango esperado para la edad'],
['Disnea', 'Dificultad respiratoria'],
['Ortopnea', 'Dificultad respiratoria al estar acostado'],
['Hiperpnea', 'Aumento de la profundidad respiratoria'],
],
saturacion: [
['Normal', '95–100 %'],
['Disminuida', '91–94 %'],
['Baja', '86–90 %'],
['Severamente baja', '< 86 %'],
],
presionArterial: [
['Normal', '< percentil 90'],
['Presión arterial elevada', '≥ percentil 90 y < percentil 95'],
['Hipertensión', '≥ percentil 95, según criterios pediátricos'],
['Hipotensión', 'Evaluar según edad y condición clínica'],
],
glicemia: [
['Hipoglicemia', '< 70 mg/dL'],
['Normal en ayunas', '70–99 mg/dL'],
['Prediabetes', '100–125 mg/dL'],
['Diabetes', '≥ 126 mg/dL en ayunas'],
['Postprandial', 'Interpretar según contexto clínico'],
],
eva: [
['Sin dolor', '0'],
['Dolor leve', '1–3'],
['Dolor moderado', '4–6'],
['Dolor severo', '7–8'],
['Dolor insoportable', '9–10'],
],
nota:
'En niños, la frecuencia cardíaca, respiratoria y presión arterial deben interpretarse según edad, sexo, talla y condición clínica.',
},

adulto: {
nombre: 'Adulto',
edad: '18 a 64 años',
icono: '🧑',
temperatura: [
['Hipotermia', '< 35,0 °C'],
['Afebril / normal', '36,0–37,4 °C'],
['Subfebril', '37,5–37,9 °C'],
['Fiebre', '≥ 38,0 °C'],
['Hipertermia', 'Elevación de la temperatura corporal'],
],
frecuenciaCardiaca: [
['Bradicardia', '< 60 lpm'],
['Normocardia', '60–100 lpm'],
['Taquicardia', '> 100 lpm'],
],
frecuenciaRespiratoria: [
['Apnea', 'Ausencia de respiración'],
['Bradipnea', '< 12 rpm'],
['Eupnea', '12–20 rpm'],
['Taquipnea', '> 20 rpm'],
['Disnea', 'Dificultad respiratoria'],
['Ortopnea', 'Dificultad respiratoria al estar acostado'],
['Hiperpnea / hiperventilación', 'Aumento de la profundidad o ventilación'],
],
saturacion: [
['Normal', '95–100 %'],
['Disminuida', '91–94 %'],
['Baja', '86–90 %'],
['Severamente baja', '< 86 %'],
],
presionArterial: [
['Óptima', '< 120 / < 80 mmHg'],
['Normal', '120–129 / 80–84 mmHg'],
['Normal alta', '130–139 / 85–89 mmHg'],
['Hipertensión grado 1', '140–159 / 90–99 mmHg'],
['Hipertensión grado 2', '160–179 / 100–109 mmHg'],
['Hipertensión grado 3', '≥ 180 / ≥ 110 mmHg'],
],
glicemia: [
['Hipoglicemia', '< 70 mg/dL'],
['Normal en ayunas', '70–99 mg/dL'],
['Prediabetes', '100–125 mg/dL'],
['Diabetes', '≥ 126 mg/dL en ayunas'],
['Normal 2 h postprandial', '< 140 mg/dL'],
],
eva: [
['Sin dolor', '0'],
['Dolor leve', '1–3'],
['Dolor moderado', '4–6'],
['Dolor severo', '7–8'],
['Dolor insoportable', '9–10'],
],
nota:
'Los valores son referencias educativas. La interpretación debe considerar el estado clínico y el protocolo utilizado.',
},

adultoMayor: {
nombre: 'Adulto mayor',
edad: '65 años o más',
icono: '👵',
temperatura: [
['Hipotermia', '< 35,0 °C'],
['Afebril / normal', '36,0–37,4 °C'],
['Subfebril', '37,5–37,9 °C'],
['Fiebre', '≥ 38,0 °C'],
['Hipertermia', 'Elevación de la temperatura corporal'],
],
frecuenciaCardiaca: [
['Bradicardia', '< 60 lpm'],
['Normocardia', '60–100 lpm'],
['Taquicardia', '> 100 lpm'],
],
frecuenciaRespiratoria: [
['Apnea', 'Ausencia de respiración'],
['Bradipnea', '< 12 rpm'],
['Eupnea', '12–20 rpm'],
['Taquipnea', '> 20 rpm'],
['Disnea', 'Dificultad respiratoria'],
['Ortopnea', 'Dificultad respiratoria al estar acostado'],
['Hiperpnea', 'Aumento de la profundidad respiratoria'],
],
saturacion: [
['Normal', '95–100 %'],
['Disminuida', '91–94 %'],
['Baja', '86–90 %'],
['Severamente baja', '< 86 %'],
],
presionArterial: [
['Óptima', '< 120 / < 80 mmHg'],
['Normal', '120–129 / 80–84 mmHg'],
['Normal alta', '130–139 / 85–89 mmHg'],
['Hipertensión grado 1', '140–159 / 90–99 mmHg'],
['Hipertensión grado 2', '160–179 / 100–109 mmHg'],
['Hipertensión grado 3', '≥ 180 / ≥ 110 mmHg'],
['Hipotensión ortostática', 'Evaluar caída de PA al ponerse de pie'],
],
glicemia: [
['Hipoglicemia', '< 70 mg/dL'],
['Normal en ayunas', '70–99 mg/dL'],
['Prediabetes', '100–125 mg/dL'],
['Diabetes', '≥ 126 mg/dL en ayunas'],
['Normal 2 h postprandial', '< 140 mg/dL'],
],
eva: [
['Sin dolor', '0'],
['Dolor leve', '1–3'],
['Dolor moderado', '4–6'],
['Dolor severo', '7–8'],
['Dolor insoportable', '9–10'],
],
nota:
'En adultos mayores, la ausencia de fiebre no descarta una infección. Los signos vitales deben interpretarse junto con el estado general del paciente.',
},
}

function TablaSigno({ titulo, icono, datos }) {
return ( <section className="signo-card"> <div className="signo-titulo"> <span className="signo-icono">{icono}</span> <h3>{titulo}</h3> </div>

```
  <div className="tabla-responsive">
    <table className="tabla-signos">
      <thead>
        <tr>
          <th>Clasificación</th>
          <th>Valor / referencia</th>
        </tr>
      </thead>

      <tbody>
        {datos.map(([clasificacion, valor], index) => (
          <tr key={index}>
            <td>{clasificacion}</td>
            <td>{valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
</section>


)
}

function SignosVitales({ onVolver }) {
const [grupoSeleccionado, setGrupoSeleccionado] = useState('adulto')

const grupo = gruposEtarios[grupoSeleccionado]

return ( <div className="signos-container">

  <div className="signos-header">
    <button className="boton-volver-signos" onClick={onVolver}>
      ← Volver
    </button>

    <div className="signos-header-titulo">
      <span>🩺</span>
      <div>
        <h1>Signos vitales</h1>
        <p>Valores de referencia por grupo etario</p>
      </div>
    </div>
  </div>

  <div className="selector-etario">
    <h2>Selecciona el grupo etario</h2>

    <div className="grupos-grid">
      {Object.entries(gruposEtarios).map(([clave, item]) => (
        <button
          key={clave}
          className={`grupo-btn ${
            grupoSeleccionado === clave ? 'grupo-activo' : ''
          }`}
          onClick={() => setGrupoSeleccionado(clave)}
        >
          <span className="grupo-icono">{item.icono}</span>

          <span className="grupo-nombre">
            {item.nombre}
          </span>

          <span className="grupo-edad">
            {item.edad}
          </span>
        </button>
      ))}
    </div>
  </div>

  <div className="grupo-seleccionado">
    <span className="grupo-seleccionado-icono">
      {grupo.icono}
    </span>

    <div>
      <h2>{grupo.nombre}</h2>
      <p>{grupo.edad}</p>
    </div>
  </div>

  <div className="tablas-signos">

    <TablaSigno
      titulo="Temperatura corporal"
      icono="🌡️"
      datos={grupo.temperatura}
    />

    <TablaSigno
      titulo="Frecuencia cardíaca"
      icono="❤️"
      datos={grupo.frecuenciaCardiaca}
    />

    <TablaSigno
      titulo="Frecuencia respiratoria"
      icono="🫁"
      datos={grupo.frecuenciaRespiratoria}
    />

    <TablaSigno
      titulo="Saturación de oxígeno"
      icono="🫧"
      datos={grupo.saturacion}
    />

    <TablaSigno
      titulo="Presión arterial"
      icono="🩸"
      datos={grupo.presionArterial}
    />

    <TablaSigno
      titulo="Glicemia"
      icono="🩸"
      datos={grupo.glicemia}
    />

    <TablaSigno
      titulo="Escala EVA del dolor"
      icono="😣"
      datos={grupo.eva}
    />

  </div>

  <div className="nota-signos">
    <strong>⚠️ Importante</strong>
    <p>{grupo.nota}</p>
    <p>
      Estos valores tienen finalidad educativa y de estudio.
      Ante un paciente real, siempre se debe considerar la
      condición clínica, el método de medición y el protocolo
      institucional vigente.
    </p>
  </div>

</div>

)
}

export default SignosVitales
