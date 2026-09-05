import { useEffect, useState } from 'react'
import './App.css'
import medicamentos from './data/medicamentos'
import CalculadoraDosis from './CalculadoraDosis'
import CalculadoraPAM from './CalculadoraPAM'
import CalculadoraIMC from './CalculadoraIMC'
import SignosVitales from './SignosVitales'
import EntregaTurno from './EntregaTurno'
import Login from './Login'
import ResetPassword from './ResetPassword'
import { supabase } from './supabaseClient'

function App() {
  const [pagina, setPagina] = useState('inicio')

  const [usuarioSesion, setUsuarioSesion] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  const [medicamentoSeleccionado, setMedicamentoSeleccionado] =
    useState(null)

  const [busquedaMedicamento, setBusquedaMedicamento] = useState('')
  const [filtroGrupo, setFiltroGrupo] = useState('Todos')

  const [procedimientoSeleccionado, setProcedimientoSeleccionado] =
    useState(null)

  const [busquedaProcedimiento, setBusquedaProcedimiento] = useState('')

  const [busquedaGeneral, setBusquedaGeneral] = useState('')

  // =========================
  // CUESTIONARIOS
  // =========================

  const preguntasBanco = [
    {
      id: 1,
      tema: 'Medicamentos',
      pregunta: '¿Cuál es una de las principales medidas para prevenir errores en la administración de medicamentos?',
      opciones: [
        'Administrar rápidamente el medicamento',
        'Verificar los datos y la indicación antes de administrar',
        'Evitar revisar la prescripción',
        'Administrar todos los medicamentos juntos',
      ],
      correcta: 1,
    },
    {
      id: 2,
      tema: 'Medicamentos',
      pregunta: '¿Qué vía de administración utiliza directamente el tracto gastrointestinal?',
      opciones: [
        'Vía enteral',
        'Vía intravenosa',
        'Vía intramuscular',
        'Vía subcutánea',
      ],
      correcta: 0,
    },
    {
      id: 3,
      tema: 'Medicamentos',
      pregunta: '¿Qué información debe verificarse antes de administrar un medicamento?',
      opciones: [
        'Solo el nombre del paciente',
        'Solo el color del medicamento',
        'Paciente, medicamento, dosis, vía y horario, entre otros datos de seguridad',
        'Solo la fecha',
      ],
      correcta: 2,
    },
    {
      id: 4,
      tema: 'Medicamentos',
      pregunta: '¿Qué debe hacerse si existe una duda respecto de una indicación farmacológica?',
      opciones: [
        'Administrar igualmente',
        'Preguntar o verificar la indicación antes de administrar',
        'Cambiar la dosis',
        'Suspender todos los medicamentos del paciente',
      ],
      correcta: 1,
    },
    {
      id: 5,
      tema: 'Medicamentos',
      pregunta: '¿Qué vía administra el medicamento directamente al torrente sanguíneo?',
      opciones: [
        'Oral',
        'Tópica',
        'Intravenosa',
        'Rectal',
      ],
      correcta: 2,
    },

    {
      id: 6,
      tema: 'Signos vitales',
      pregunta: '¿Cuáles son considerados signos vitales básicos?',
      opciones: [
        'Peso, talla y perímetro abdominal',
        'Temperatura, pulso, respiración y presión arterial',
        'Glucosa, peso y talla',
        'Dolor y peso únicamente',
      ],
      correcta: 1,
    },
    {
      id: 7,
      tema: 'Signos vitales',
      pregunta: '¿Qué instrumento se utiliza para medir la presión arterial?',
      opciones: [
        'Oxímetro',
        'Termómetro',
        'Esfigmomanómetro',
        'Glucómetro',
      ],
      correcta: 2,
    },
    {
      id: 8,
      tema: 'Signos vitales',
      pregunta: '¿Qué mide principalmente un oxímetro de pulso?',
      opciones: [
        'Presión arterial',
        'Saturación periférica de oxígeno y frecuencia de pulso',
        'Temperatura corporal',
        'Glucemia',
      ],
      correcta: 1,
    },
    {
      id: 9,
      tema: 'Signos vitales',
      pregunta: '¿Qué debe hacerse antes de registrar un signo vital?',
      opciones: [
        'Inventar el valor si no se recuerda',
        'Realizar una medición adecuada y observar al paciente',
        'Redondear siempre al número más cercano',
        'No informar ningún resultado',
      ],
      correcta: 1,
    },
    {
      id: 10,
      tema: 'Signos vitales',
      pregunta: '¿Qué parámetro corresponde a la frecuencia respiratoria?',
      opciones: [
        'Número de respiraciones por minuto',
        'Cantidad de sangre por minuto',
        'Temperatura de la piel',
        'Presión arterial media',
      ],
      correcta: 0,
    },

    {
      id: 11,
      tema: 'Procedimientos',
      pregunta: '¿Cuál es uno de los objetivos principales del lavado de manos clínico?',
      opciones: [
        'Eliminar toda la flora normal de la piel',
        'Reducir la transmisión de microorganismos',
        'Reemplazar el uso de guantes en cualquier situación',
        'Evitar registrar procedimientos',
      ],
      correcta: 1,
    },
    {
      id: 12,
      tema: 'Procedimientos',
      pregunta: '¿Qué debe realizarse antes de un procedimiento de enfermería?',
      opciones: [
        'Identificar al paciente y preparar el material necesario',
        'Comenzar sin explicar nada',
        'Evitar revisar el procedimiento',
        'Utilizar cualquier material disponible',
      ],
      correcta: 0,
    },
    {
      id: 13,
      tema: 'Procedimientos',
      pregunta: '¿Por qué es importante mantener una técnica limpia o aséptica cuando corresponde?',
      opciones: [
        'Para aumentar el tiempo del procedimiento',
        'Para disminuir el riesgo de contaminación e infección',
        'Para evitar registrar información',
        'Para reemplazar la higiene de manos',
      ],
      correcta: 1,
    },
    {
      id: 14,
      tema: 'Procedimientos',
      pregunta: 'Después de finalizar un procedimiento, ¿qué acción es importante?',
      opciones: [
        'Dejar el material utilizado en cualquier lugar',
        'Realizar higiene de manos y registrar lo correspondiente',
        'No observar al paciente',
        'Retirarse sin informar',
      ],
      correcta: 1,
    },
    {
      id: 15,
      tema: 'Procedimientos',
      pregunta: '¿Qué elemento debe considerarse al preparar un procedimiento?',
      opciones: [
        'Solo la rapidez',
        'La seguridad del paciente y el material necesario',
        'El color del uniforme',
        'La cantidad de personas presentes',
      ],
      correcta: 1,
    },

    {
      id: 16,
      tema: 'Urgencias',
      pregunta: 'Ante una persona inconsciente, ¿qué debe evaluarse inicialmente?',
      opciones: [
        'Su peso',
        'Su respuesta y condiciones básicas de seguridad',
        'Su alimentación',
        'Su temperatura de la semana anterior',
      ],
      correcta: 1,
    },
    {
      id: 17,
      tema: 'Urgencias',
      pregunta: '¿Qué significa RCP?',
      opciones: [
        'Registro Clínico Preventivo',
        'Reanimación Cardiopulmonar',
        'Respuesta Clínica Primaria',
        'Revisión Cardíaca Preventiva',
      ],
      correcta: 1,
    },
    {
      id: 18,
      tema: 'Urgencias',
      pregunta: 'En una emergencia, ¿por qué es importante activar oportunamente el sistema de respuesta?',
      opciones: [
        'Para retrasar la atención',
        'Para facilitar una respuesta coordinada y oportuna',
        'Para evitar evaluar al paciente',
        'Para reemplazar todas las intervenciones',
      ],
      correcta: 1,
    },
    {
      id: 19,
      tema: 'Urgencias',
      pregunta: '¿Qué debe priorizarse en una situación de emergencia?',
      opciones: [
        'La seguridad de la escena y la evaluación inicial',
        'El registro administrativo antes de atender',
        'La alimentación del paciente',
        'El traslado sin evaluación',
      ],
      correcta: 0,
    },
    {
      id: 20,
      tema: 'Urgencias',
      pregunta: '¿Qué elemento es fundamental al entregar información durante una emergencia?',
      opciones: [
        'Información clara y relevante del paciente',
        'Información inventada',
        'Solo el nombre del paciente',
        'Ningún dato',
      ],
      correcta: 0,
    },

    {
      id: 21,
      tema: 'Sistema respiratorio',
      pregunta: '¿Cuál es la función principal del sistema respiratorio?',
      opciones: [
        'Regular exclusivamente la temperatura',
        'Realizar el intercambio de oxígeno y dióxido de carbono',
        'Producir insulina',
        'Regular la presión arterial directamente',
      ],
      correcta: 1,
    },
    {
      id: 22,
      tema: 'Sistema respiratorio',
      pregunta: '¿Qué dispositivo puede utilizarse para administrar oxígeno a un paciente?',
      opciones: [
        'Glucómetro',
        'Cánula nasal',
        'Esfigmomanómetro',
        'Termómetro',
      ],
      correcta: 1,
    },
    {
      id: 23,
      tema: 'Sistema respiratorio',
      pregunta: '¿Qué parámetro puede monitorizarse mediante un oxímetro?',
      opciones: [
        'Saturación periférica de oxígeno',
        'Glucosa capilar',
        'Temperatura central',
        'Presión intraocular',
      ],
      correcta: 0,
    },
    {
      id: 24,
      tema: 'Sistema respiratorio',
      pregunta: '¿Qué signo puede indicar dificultad respiratoria?',
      opciones: [
        'Disminución del esfuerzo respiratorio siempre',
        'Uso de musculatura accesoria',
        'Ausencia de cambios',
        'Aumento del apetito',
      ],
      correcta: 1,
    },
    {
      id: 25,
      tema: 'Sistema respiratorio',
      pregunta: '¿Qué debe observarse además de la saturación de oxígeno?',
      opciones: [
        'Solo el peso',
        'El estado general y el trabajo respiratorio del paciente',
        'Solo la talla',
        'Solo la edad',
      ],
      correcta: 1,
    },

    {
      id: 26,
      tema: 'Diabetes',
      pregunta: '¿Qué mide principalmente una glicemia capilar?',
      opciones: [
        'La presión arterial',
        'La concentración de glucosa en sangre',
        'La saturación de oxígeno',
        'La temperatura',
      ],
      correcta: 1,
    },
    {
      id: 27,
      tema: 'Diabetes',
      pregunta: '¿Qué instrumento se utiliza habitualmente para medir glicemia capilar?',
      opciones: [
        'Glucómetro',
        'Oxímetro',
        'Termómetro',
        'Esfigmomanómetro',
      ],
      correcta: 0,
    },
    {
      id: 28,
      tema: 'Diabetes',
      pregunta: '¿Qué debe verificarse antes de realizar una glicemia capilar?',
      opciones: [
        'Identificación del paciente y material necesario',
        'Solo el color de la lanceta',
        'El peso del glucómetro',
        'Nada',
      ],
      correcta: 0,
    },
    {
      id: 29,
      tema: 'Diabetes',
      pregunta: '¿Qué síntoma puede asociarse a hipoglucemia?',
      opciones: [
        'Sudoración y temblor',
        'Solo aumento de talla',
        'Dolor de oído siempre',
        'Ningún síntoma posible',
      ],
      correcta: 0,
    },
    {
      id: 30,
      tema: 'Diabetes',
      pregunta: '¿Qué hormona está relacionada directamente con la regulación de la glucosa sanguínea?',
      opciones: [
        'Insulina',
        'Melatonina',
        'Adrenalina exclusivamente',
        'Tiroxina exclusivamente',
      ],
      correcta: 0,
    },

    {
      id: 31,
      tema: 'Cardiología',
      pregunta: '¿Qué representa la presión arterial sistólica?',
      opciones: [
        'La presión durante la contracción ventricular',
        'La presión durante el sueño',
        'La frecuencia respiratoria',
        'La saturación de oxígeno',
      ],
      correcta: 0,
    },
    {
      id: 32,
      tema: 'Cardiología',
      pregunta: '¿Qué representa la presión arterial diastólica?',
      opciones: [
        'La presión durante la relajación ventricular',
        'La frecuencia respiratoria',
        'La temperatura corporal',
        'La glucemia',
      ],
      correcta: 0,
    },
    {
      id: 33,
      tema: 'Cardiología',
      pregunta: '¿Qué significa PAM?',
      opciones: [
        'Presión Arterial Media',
        'Presión Auricular Máxima',
        'Pulso Arterial Manual',
        'Presión Aérea Media',
      ],
      correcta: 0,
    },
    {
      id: 34,
      tema: 'Cardiología',
      pregunta: '¿Qué estructura del corazón impulsa la sangre hacia la circulación sistémica?',
      opciones: [
        'Ventrículo izquierdo',
        'Aurícula derecha',
        'Aurícula izquierda',
        'Ventrículo derecho exclusivamente',
      ],
      correcta: 0,
    },
    {
      id: 35,
      tema: 'Cardiología',
      pregunta: '¿Qué signo vital permite evaluar la frecuencia cardíaca?',
      opciones: [
        'Pulso',
        'Temperatura',
        'Saturación',
        'Glicemia',
      ],
      correcta: 0,
    },

    {
      id: 36,
      tema: 'Neurología',
      pregunta: '¿Qué sistema coordina principalmente las funciones nerviosas del organismo?',
      opciones: [
        'Sistema nervioso',
        'Sistema digestivo',
        'Sistema tegumentario',
        'Sistema urinario',
      ],
      correcta: 0,
    },
    {
      id: 37,
      tema: 'Neurología',
      pregunta: '¿Qué puede evaluarse durante una valoración neurológica?',
      opciones: [
        'Nivel de conciencia y respuesta',
        'Solo el peso',
        'Solo la temperatura',
        'Solo la presión arterial',
      ],
      correcta: 0,
    },
    {
      id: 38,
      tema: 'Neurología',
      pregunta: '¿Qué significa ACV?',
      opciones: [
        'Accidente Cerebrovascular',
        'Alteración Cardíaca Vascular',
        'Actividad Clínica Variable',
        'Atención Cardiovascular',
      ],
      correcta: 0,
    },
    {
      id: 39,
      tema: 'Neurología',
      pregunta: '¿Qué signo puede ser compatible con un ACV y requiere evaluación urgente?',
      opciones: [
        'Alteración súbita del habla o debilidad de un lado del cuerpo',
        'Aumento del apetito',
        'Dolor muscular después de ejercicio',
        'Sed leve',
      ],
      correcta: 0,
    },
    {
      id: 40,
      tema: 'Neurología',
      pregunta: '¿Por qué es importante registrar el momento de inicio de síntomas neurológicos?',
      opciones: [
        'Porque puede ser relevante para la evaluación y manejo clínico',
        'Porque reemplaza todos los exámenes',
        'Porque determina el peso',
        'Porque evita realizar una evaluación',
      ],
      correcta: 0,
    },

    {
      id: 41,
      tema: 'Todos',
      pregunta: '¿Qué principio debe estar presente en todos los procedimientos de enfermería?',
      opciones: [
        'Seguridad del paciente',
        'Realizar todo rápidamente',
        'Evitar comunicarse',
        'No registrar',
      ],
      correcta: 0,
    },
    {
      id: 42,
      tema: 'Todos',
      pregunta: '¿Qué acción ayuda a disminuir las infecciones asociadas a la atención de salud?',
      opciones: [
        'Higiene adecuada de manos',
        'Evitar el uso de EPP',
        'Reutilizar material descartable',
        'No limpiar superficies',
      ],
      correcta: 0,
    },
    {
      id: 43,
      tema: 'Todos',
      pregunta: '¿Por qué es importante identificar correctamente al paciente?',
      opciones: [
        'Para disminuir errores y entregar una atención segura',
        'Solo para completar formularios',
        'Para evitar hablar con el paciente',
        'No es necesario',
      ],
      correcta: 0,
    },
    {
      id: 44,
      tema: 'Todos',
      pregunta: '¿Qué característica debe tener un registro de enfermería?',
      opciones: [
        'Ser claro, oportuno y objetivo',
        'Ser inventado',
        'Ser incompleto',
        'No incluir información relevante',
      ],
      correcta: 0,
    },
    {
      id: 45,
      tema: 'Todos',
      pregunta: '¿Qué debe hacerse frente a un cambio importante en el estado del paciente?',
      opciones: [
        'Ignorarlo',
        'Evaluar, informar según corresponda y registrar',
        'Esperar varios días',
        'No comunicarlo',
      ],
      correcta: 1,
    },
  ]

const [quizTema, setQuizTema] = useState('')
const [quizCantidad, setQuizCantidad] = useState(10)
const [quizPreguntas, setQuizPreguntas] = useState([])
const [quizActual, setQuizActual] = useState(0)
const [quizRespuesta, setQuizRespuesta] = useState(null)
const [quizPuntaje, setQuizPuntaje] = useState(0)
const [quizFinalizado, setQuizFinalizado] = useState(false)

const [preguntasBancoSupabase, setPreguntasBancoSupabase] = useState([])
const [cargandoPreguntas, setCargandoPreguntas] = useState(false)
  const [progreso, setProgreso] = useState(() => { useEffect(() => {
  const cargarPreguntas = async () => {
    setCargandoPreguntas(true)

    const { data, error } = await supabase
      .from('preguntas')
      .select('id, tema, pregunta, opciones, correcta')
      .eq('activa', true)
      .order('id', { ascending: true })

    if (error) {
      console.error(
        'Error al cargar preguntas desde Supabase:',
        error
      )

      alert(
        'No se pudieron cargar las preguntas desde Supabase.'
      )

      setCargandoPreguntas(false)
      return
    }

    setPreguntasBancoSupabase(data || [])
    setCargandoPreguntas(false)
  }

  cargarPreguntas()
}, [])
    try {
      const guardado = localStorage.getItem('nurseassist_progreso')

      return guardado
        ? JSON.parse(guardado)
        : {
            intentos: 0,
            puntajeTotal: 0,
            mejorPuntaje: 0,
            preguntasRespondidas: 0,
            aprobados: 0,
            resultadosPorTema: {},
          }
    } catch {
      return {
        intentos: 0,
        puntajeTotal: 0,
        mejorPuntaje: 0,
        preguntasRespondidas: 0,
        aprobados: 0,
        resultadosPorTema: {},
      }
    }
  })

  useEffect(() => {
    localStorage.setItem(
      'nurseassist_progreso',
      JSON.stringify(progreso)
    )
  }, [progreso])
useEffect(() => {
  const cargarPreguntas = async () => {
    setCargandoPreguntas(true)

    const { data, error } = await supabase
      .from('preguntas')
      .select('id, tema, pregunta, opciones, correcta')
      .eq('activa', true)
      .order('id', { ascending: true })

    if (error) {
      console.error(
        'Error al cargar preguntas desde Supabase:',
        error
      )

      alert(
        'No se pudieron cargar las preguntas desde Supabase.'
      )

      setCargandoPreguntas(false)
      return
    }

    setPreguntasBancoSupabase(data || [])
    setCargandoPreguntas(false)
  }

  cargarPreguntas()
}, [])
  const temasQuiz = [
    'Medicamentos',
    'Signos vitales',
    'Procedimientos',
    'Urgencias',
    'Sistema respiratorio',
    'Diabetes',
    'Cardiología',
    'Neurología',
    'Todos',
  ]

  const mezclarPreguntas = (lista) => {
    return [...lista].sort(() => Math.random() - 0.5)
  }
const iniciarCuestionario = () => {
  if (!quizTema) {
    alert('Selecciona un tema antes de comenzar.')
    return
  }

  if (cargandoPreguntas) {
    alert('Las preguntas todavía se están cargando.')
    return
  }

  if (preguntasBancoSupabase.length === 0) {
    alert('No hay preguntas disponibles en Supabase.')
    return
  }

  let preguntasDisponibles = preguntasBancoSupabase

  if (quizTema !== 'Todos') {
    preguntasDisponibles = preguntasBancoSupabase.filter(
      (pregunta) =>
        pregunta.tema === quizTema ||
        pregunta.tema === 'Todos'
    )
  }

  if (preguntasDisponibles.length < quizCantidad) {
    alert(
      `Actualmente hay ${preguntasDisponibles.length} preguntas disponibles para este tema.`
    )
    return
  }

  const seleccionadas = mezclarPreguntas(
    preguntasDisponibles
  ).slice(0, quizCantidad)

  setQuizPreguntas(seleccionadas)
  setQuizActual(0)
  setQuizRespuesta(null)
  setQuizPuntaje(0)
  setQuizFinalizado(false)
  setPagina('cuestionarios')
}
  if (!quizTema) {
    alert('Selecciona un tema antes de comenzar.')
    return
  }

  if (cargandoPreguntas) {
    alert('Las preguntas todavía se están cargando.')
    return
  }

  if (preguntasBancoSupabase.length === 0) {
    alert('No hay preguntas disponibles en Supabase.')
    return
  }

  let preguntasDisponibles = preguntasBancoSupabase

  if (quizTema !== 'Todos') {
    preguntasDisponibles = preguntasBancoSupabase.filter(
      (pregunta) =>
        pregunta.tema === quizTema ||
        pregunta.tema === 'Todos'
    )
  }

  if (preguntasDisponibles.length < quizCantidad) {
    alert(
      `Actualmente hay ${preguntasDisponibles.length} preguntas disponibles para este tema.`
    )
    return
  }

  const seleccionadas = mezclarPreguntas(
    preguntasDisponibles
  ).slice(0, quizCantidad)

  setQuizPreguntas(seleccionadas)
  setQuizActual(0)
  setQuizRespuesta(null)
  setQuizPuntaje(0)
  setQuizFinalizado(false)
  setPagina('cuestionarios')
}

  const responderPregunta = (indice) => {
    if (quizRespuesta !== null) return

    setQuizRespuesta(indice)

    const preguntaActual = quizPreguntas[quizActual]

    if (indice === preguntaActual.correcta) {
      setQuizPuntaje((puntajeAnterior) => puntajeAnterior + 1)
    }
  }

const siguientePregunta = async () => {
  if (quizRespuesta === null) {
    alert('Selecciona una respuesta antes de continuar.')
    return
  }

  const preguntaActual = quizPreguntas[quizActual]

  const respuestaCorrecta =
    quizRespuesta === preguntaActual.correcta

  const puntajeFinal =
    quizPuntaje + (respuestaCorrecta ? 1 : 0)

  if (quizActual + 1 < quizPreguntas.length) {
    setQuizActual((actual) => actual + 1)
    setQuizRespuesta(null)
    setQuizPuntaje(puntajeFinal)
    return
  }

  const porcentaje = Math.round(
    (puntajeFinal / quizPreguntas.length) * 100
  )

  if (usuarioSesion?.id) {
    const { error } = await supabase
      .from('resultados_cuestionarios')
      .insert({
        user_id: usuarioSesion.id,
        tema: quizTema,
        preguntas: quizPreguntas.length,
        correctas: puntajeFinal,
        porcentaje: porcentaje,
        aprobado: porcentaje >= 70,
      })

    if (error) {
      console.error(
        'Error al guardar resultado:',
        error
      )

      alert(
        'El cuestionario terminó, pero no se pudo guardar el resultado en Supabase.'
      )
    }
  }

  setProgreso((anterior) => {
    const resultadosTema = {
      ...anterior.resultadosPorTema,
    }

    const anteriorTema =
      resultadosTema[quizTema] || {
        intentos: 0,
        mejorPuntaje: 0,
        preguntas: 0,
      }

    resultadosTema[quizTema] = {
      intentos: anteriorTema.intentos + 1,
      mejorPuntaje: Math.max(
        anteriorTema.mejorPuntaje,
        porcentaje
      ),
      preguntas:
        anteriorTema.preguntas +
        quizPreguntas.length,
    }

    return {
      ...anterior,
      intentos: anterior.intentos + 1,
      puntajeTotal:
        anterior.puntajeTotal + porcentaje,
      mejorPuntaje: Math.max(
        anterior.mejorPuntaje,
        porcentaje
      ),
      preguntasRespondidas:
        anterior.preguntasRespondidas +
        quizPreguntas.length,
      aprobados:
        anterior.aprobados +
        (porcentaje >= 70 ? 1 : 0),
      resultadosPorTema: resultadosTema,
    }
  })

  setQuizPuntaje(puntajeFinal)
  setQuizFinalizado(true)
}
  if (quizRespuesta === null) {
    alert('Selecciona una respuesta antes de continuar.')
    return
  }

  const preguntaActual = quizPreguntas[quizActual]

  const respuestaCorrecta =
    quizRespuesta === preguntaActual.correcta

  const puntajeFinal =
    quizPuntaje + (respuestaCorrecta ? 1 : 0)

  if (quizActual + 1 < quizPreguntas.length) {
    setQuizActual((actual) => actual + 1)
    setQuizRespuesta(null)
    return
  }

  const porcentaje = Math.round(
    (puntajeFinal / quizPreguntas.length) * 100
  )

  // =========================
  // GUARDAR RESULTADO EN SUPABASE
  // =========================

  if (usuarioSesion?.id) {
    const { error } = await supabase
      .from('resultados_cuestionarios')
      .insert({
        user_id: usuarioSesion.id,
        tema: quizTema,
        preguntas: quizPreguntas.length,
        correctas: puntajeFinal,
        porcentaje: porcentaje,
        aprobado: porcentaje >= 70,
      })

    if (error) {
      console.error(
        'Error al guardar resultado:',
        error
      )

      alert(
        'El cuestionario terminó, pero no se pudo guardar el resultado en Supabase.'
      )
    }
  }

  // =========================
  // ACTUALIZAR PROGRESO LOCAL
  // =========================

  setProgreso((anterior) => {
    const resultadosTema = {
      ...anterior.resultadosPorTema,
    }

    const anteriorTema =
      resultadosTema[quizTema] || {
        intentos: 0,
        mejorPuntaje: 0,
        preguntas: 0,
      }

    resultadosTema[quizTema] = {
      intentos: anteriorTema.intentos + 1,
      mejorPuntaje: Math.max(
        anteriorTema.mejorPuntaje,
        porcentaje
      ),
      preguntas:
        anteriorTema.preguntas +
        quizPreguntas.length,
    }

    return {
      ...anterior,
      intentos: anterior.intentos + 1,
      puntajeTotal:
        anterior.puntajeTotal + porcentaje,
      mejorPuntaje: Math.max(
        anterior.mejorPuntaje,
        porcentaje
      ),
      preguntasRespondidas:
        anterior.preguntasRespondidas +
        quizPreguntas.length,
      aprobados:
        anterior.aprobados +
        (porcentaje >= 70 ? 1 : 0),
      resultadosPorTema: resultadosTema,
    }
  })

  setQuizPuntaje(puntajeFinal)
  setQuizFinalizado(true)
}

  const volverASeleccionQuiz = () => {
    setQuizPreguntas([])
    setQuizActual(0)
    setQuizRespuesta(null)
    setQuizPuntaje(0)
    setQuizFinalizado(false)
    setPagina('cuestionarios')
  }

  // =========================
  // SESIÓN SUPABASE
  // =========================

  useEffect(() => {
    const cargarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      setUsuarioSesion(session?.user ?? null)
      setCargandoSesion(false)
    }

    cargarSesion()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUsuarioSesion(session?.user ?? null)
        setCargandoSesion(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const cerrarSesion = async () => {
    await supabase.auth.signOut()

    setUsuarioSesion(null)
    setPagina('inicio')
    setMedicamentoSeleccionado(null)
    setProcedimientoSeleccionado(null)
  }

  // =========================
  // PROCEDIMIENTOS
  // =========================

  const procedimientos = [
    {
      id: 'lavado',
      icono: '🧼',
      nombre: 'Lavado clínico de manos',
      descripcion: 'Higiene de manos',
      objetivo:
        'Reducir la transmisión de microorganismos y prevenir infecciones.',
      materiales: [
        'Lavamanos',
        'Agua',
        'Jabón',
        'Toalla desechable',
      ],
      procedimiento:
        'Realizar higiene de manos siguiendo la técnica correspondiente y respetando los tiempos establecidos por el protocolo.',
      pasos: [
        'Retirar accesorios de manos y muñecas.',
        'Abrir el agua y mojar las manos.',
        'Aplicar jabón.',
        'Frotar palmas y dorsos.',
        'Limpiar espacios interdigitales.',
        'Enjuagar y secar correctamente.',
      ],
      consideraciones: [
        'Realizar higiene de manos antes y después del contacto con el paciente.',
        'Mantener uñas cortas y limpias.',
        'Evitar accesorios que dificulten la higiene.',
      ],
    },
    {
      id: 'medicamentos',
      icono: '💉',
      nombre: 'Administración de medicamentos',
      descripcion: 'Preparación y administración segura',
      objetivo:
        'Administrar medicamentos de forma segura, verificando la indicación y los datos del paciente.',
      materiales: [
        'Medicamento indicado',
        'Material correspondiente a la vía',
        'EPP según procedimiento',
        'Registro clínico',
      ],
      procedimiento:
        'Verificar la indicación, identificar al paciente, preparar el medicamento y administrarlo por la vía indicada.',
      pasos: [
        'Revisar la indicación médica.',
        'Identificar correctamente al paciente.',
        'Verificar medicamento, dosis, vía y horario.',
        'Revisar fecha de vencimiento e integridad.',
        'Realizar higiene de manos.',
        'Preparar el medicamento.',
        'Administrar según la vía indicada.',
        'Registrar la administración y observar la respuesta.',
      ],
      consideraciones: [
        'Ante cualquier duda, verificar la indicación antes de administrar.',
        'Observar posibles reacciones adversas.',
        'Mantener medidas de seguridad durante todo el procedimiento.',
      ],
    },
    {
      id: 'glicemia',
      icono: '🩸',
      nombre: 'Glicemia capilar',
      descripcion: 'Control de glucosa',
      objetivo:
        'Obtener una medición de glucosa capilar de manera segura.',
      materiales: [
        'Glucómetro',
        'Tira reactiva',
        'Lanceta',
        'Guantes',
        'Gasa',
        'Contenedor para cortopunzantes',
      ],
      procedimiento:
        'Realizar higiene de manos, preparar el glucómetro, obtener la muestra capilar y registrar el resultado.',
      pasos: [
        'Verificar la identificación del paciente.',
        'Realizar higiene de manos.',
        'Preparar el material.',
        'Colocar guantes según corresponda.',
        'Preparar el glucómetro.',
        'Realizar la punción según técnica.',
        'Obtener la muestra.',
        'Esperar el resultado.',
        'Eliminar el material cortopunzante de forma segura y registrar.',
      ],
      consideraciones: [
        'No reutilizar lancetas.',
        'Eliminar inmediatamente los cortopunzantes.',
        'Informar resultados que requieran atención según protocolo.',
      ],
    },
    {
      id: 'signos',
      icono: '❤️',
      nombre: 'Signos vitales',
      descripcion: 'Control y registro',
      objetivo:
        'Obtener y registrar parámetros fisiológicos relevantes del paciente.',
      materiales: [
        'Termómetro',
        'Esfigmomanómetro',
        'Fonendoscopio',
        'Oxímetro',
        'Reloj',
      ],
      procedimiento:
        'Realizar la evaluación de los signos vitales utilizando equipos adecuados y registrar los valores obtenidos.',
      pasos: [
        'Identificar al paciente.',
        'Explicar el procedimiento.',
        'Preparar el material.',
        'Medir temperatura.',
        'Evaluar pulso.',
        'Evaluar frecuencia respiratoria.',
        'Medir presión arterial.',
        'Medir saturación de oxígeno cuando corresponda.',
      ],
      consideraciones: [
        'Utilizar equipos adecuados y en buenas condiciones.',
        'Registrar los valores oportunamente.',
        'Observar el estado general del paciente.',
      ],
    },
    {
      id: 'curacion',
      icono: '🩹',
      nombre: 'Curación de heridas',
      descripcion: 'Procedimiento de curación',
      objetivo:
        'Realizar el cuidado de una herida disminuyendo el riesgo de contaminación.',
      materiales: [
        'Guantes',
        'Gasas',
        'Suero fisiológico según indicación',
        'Material estéril según procedimiento',
        'Apósito',
        'Contenedor de residuos',
      ],
      procedimiento:
        'Realizar la curación respetando la técnica indicada y observando las características de la herida.',
      pasos: [
        'Identificar al paciente.',
        'Explicar el procedimiento.',
        'Realizar higiene de manos.',
        'Preparar el material.',
        'Utilizar EPP correspondiente.',
        'Retirar el apósito anterior según técnica.',
        'Observar la herida.',
        'Realizar limpieza según indicación.',
        'Colocar el apósito correspondiente.',
        'Registrar características y procedimiento realizado.',
      ],
      consideraciones: [
        'Observar signos de infección.',
        'Registrar características de la herida.',
        'Mantener técnica adecuada durante todo el procedimiento.',
      ],
    },
    {
      id: 'oxigenoterapia',
      icono: '🫁',
      nombre: 'Oxigenoterapia',
      descripcion: 'Administración de oxígeno',
      objetivo:
        'Administrar oxígeno según indicación y monitorizar la respuesta del paciente.',
      materiales: [
        'Fuente de oxígeno',
        'Flujómetro',
        'Dispositivo de administración',
        'Humidificación cuando corresponda',
        'Oxímetro',
      ],
      procedimiento:
        'Verificar la indicación, seleccionar el dispositivo correspondiente, administrar el flujo indicado y monitorizar al paciente.',
      pasos: [
        'Verificar la indicación.',
        'Identificar al paciente.',
        'Explicar el procedimiento.',
        'Realizar higiene de manos.',
        'Preparar el sistema.',
        'Seleccionar el dispositivo indicado.',
        'Regular el flujo prescrito.',
        'Colocar correctamente el dispositivo.',
        'Evaluar tolerancia.',
        'Monitorizar saturación y estado respiratorio.',
        'Registrar el procedimiento y respuesta.',
      ],
      consideraciones: [
        'No modificar el flujo indicado sin una orden o protocolo que lo permita.',
        'Mantener vigilancia del estado respiratorio.',
        'Mantener medidas de seguridad frente al uso de oxígeno.',
      ],
      sistemas: {
        bajoFlujo: [
          {
            nombre: 'Cánula nasal',
            flujo: '1–6 L/min',
            fio2: 'Aproximadamente 24–44%',
          },
          {
            nombre: 'Mascarilla simple',
            flujo: '5–10 L/min',
            fio2: 'Aproximadamente 35–60%',
          },
          {
            nombre: 'Mascarilla con reservorio',
            flujo: '10–15 L/min',
            fio2: 'Aproximadamente 60–95%',
          },
        ],
        altoFlujo: [
          {
            nombre: 'Mascarilla Venturi',
            flujo: 'Según adaptador',
            fio2: 'Aproximadamente 24–50%',
          },
          {
            nombre: 'Cánula nasal de alto flujo',
            flujo: 'Hasta aproximadamente 60 L/min',
            fio2: '21–100%',
          },
        ],
      },
    },
  ]

  // =========================
  // BÚSQUEDA GENERAL
  // =========================

  const resultadosGenerales = [
    ...medicamentos.map((medicamento) => ({
      nombre: medicamento.nombre,
      descripcion:
        medicamento.grupo || 'Medicamento',
      icono: '💊',
      tipo: 'Medicamentos',
      pagina: 'medicamentos',
      dato: medicamento,
    })),

    ...procedimientos.map((procedimiento) => ({
      nombre: procedimiento.nombre,
      descripcion: procedimiento.descripcion,
      icono: procedimiento.icono,
      tipo: 'Procedimientos',
      pagina: 'procedimientos',
      dato: procedimiento,
    })),

    {
      nombre: 'Calculadora de dosis',
      descripcion: 'Cálculo de dosis, volumen y comprimidos',
      icono: '🧮',
      tipo: 'Herramientas',
      pagina: 'calculadora',
    },
    {
      nombre: 'Calculadora de PAM',
      descripcion: 'Presión arterial media',
      icono: '🩺',
      tipo: 'Herramientas',
      pagina: 'pam',
    },
    {
      nombre: 'Calculadora de índice de masa corporal',
      descripcion: 'Cálculo de IMC según peso y altura',
      icono: '⚖️',
      tipo: 'Herramientas',
      pagina: 'imc',
    },
    {
      nombre: 'Cuestionarios',
      descripcion: 'Practica por tema y mide tu resultado',
      icono: '📝',
      tipo: 'Estudio',
      pagina: 'cuestionarios',
    },
    {
      nombre: 'Mi progreso',
      descripcion: 'Revisa tus resultados y avances',
      icono: '📈',
      tipo: 'Estudio',
      pagina: 'progreso',
    },
    {
      nombre: 'RCP',
      descripcion: 'Reanimación cardiopulmonar',
      icono: '🚨',
      tipo: 'Urgencias',
      pagina: 'urgencias',
    },
    {
      nombre: 'Manejo de emergencias',
      descripcion: 'Evaluación y respuesta inicial',
      icono: '🚑',
      tipo: 'Urgencias',
      pagina: 'urgencias',
    },
    {
      nombre: 'Entrega de turno',
      descripcion: 'Comunicación y continuidad del cuidado',
      icono: '📋',
      tipo: 'Comunicación',
      pagina: 'turno',
    },
    {
      nombre: 'SBAR',
      descripcion: 'Herramienta de comunicación clínica',
      icono: '🗣️',
      tipo: 'Comunicación',
      pagina: 'turno',
    },
    {
      nombre: 'EPOC',
      descripcion: 'Enfermedad pulmonar obstructiva crónica',
      icono: '🫁',
      tipo: 'Guías',
      pagina: 'guias',
    },
    {
      nombre: 'Neumonía',
      descripcion: 'Información general',
      icono: '🫁',
      tipo: 'Guías',
      pagina: 'guias',
    },
    {
      nombre: 'Asma',
      descripcion: 'Información general',
      icono: '🫁',
      tipo: 'Guías',
      pagina: 'guias',
    },
  ]

  const resultadosFiltrados = resultadosGenerales.filter(
    (resultado) => {
      const texto =
        `${resultado.nombre} ${resultado.descripcion} ${resultado.tipo}`.toLowerCase()

      return texto.includes(
        busquedaGeneral.toLowerCase()
      )
    }
  )

  const gruposMedicamentos = [
    'Todos',
    ...new Set(
      medicamentos
        .map((medicamento) => medicamento.grupo)
        .filter(Boolean)
    ),
  ]

  const medicamentosFiltrados = medicamentos.filter(
    (medicamento) => {
      const coincideBusqueda =
        medicamento.nombre
          .toLowerCase()
          .includes(busquedaMedicamento.toLowerCase())

      const coincideGrupo =
        filtroGrupo === 'Todos' ||
        medicamento.grupo === filtroGrupo

      return coincideBusqueda && coincideGrupo
    }
  )

  const procedimientosFiltrados =
    procedimientos.filter((procedimiento) =>
      `${procedimiento.nombre} ${procedimiento.descripcion}`
        .toLowerCase()
        .includes(
          busquedaProcedimiento.toLowerCase()
        )
    )

  // =========================
  // USUARIO
  // =========================

  const nombreUsuario =
    usuarioSesion?.user_metadata?.nombre ||
    usuarioSesion?.user_metadata?.full_name ||
    usuarioSesion?.email?.split('@')[0] ||
    'Usuario'

  const correoUsuario =
    usuarioSesion?.email || ''

  // =========================
  // CARGANDO
  // =========================

  if (cargandoSesion) {
    return (
      <div className="app">
        <main className="content">
          <section className="welcome">
            <img
              src="/log app nurseassit.jpeg"
              alt="NurseAssist"
              style={{
                width: '120px',
                display: 'block',
                margin: '0 auto 20px',
              }}
            />

            <h2>Cargando NurseAssist...</h2>
          </section>
        </main>
      </div>
    )
  }

  // =========================
  // RESET PASSWORD
  // =========================

  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />
  }

  // =========================
  // LOGIN
  // =========================

  if (!usuarioSesion) {
    return (
      <Login
        onLogin={(usuario) => {
          setUsuarioSesion(usuario)
          setPagina('inicio')
        }}
      />
    )
  }

  // =========================
  // CALCULADORA DE DOSIS
  // =========================

  if (pagina === 'calculadora') {
    return (
      <CalculadoraDosis
        onVolver={() => setPagina('inicio')}
      />
    )
  }

  // =========================
  // CALCULADORA PAM
  // =========================

  if (pagina === 'pam') {
    return (
      <CalculadoraPAM
        onVolver={() => setPagina('inicio')}
      />
    )
  }

  // =========================
  // CALCULADORA IMC
  // =========================

  if (pagina === 'imc') {
    return (
      <CalculadoraIMC
        onVolver={() => setPagina('inicio')}
      />
    )
  }

  // =========================
  // SIGNOS VITALES
  // =========================

  if (pagina === 'signosVitales') {
    return (
      <SignosVitales
        onVolver={() => setPagina('inicio')}
      />
    )
  }

  // =========================
  // ENTREGA DE TURNO
  // =========================

  if (pagina === 'turno') {
    return (
      <EntregaTurno
        onVolver={() => setPagina('inicio')}
      />
    )
  }

  // =========================
  // CUESTIONARIOS
  // =========================

  if (pagina === 'cuestionarios') {
    const preguntaActual =
      quizPreguntas[quizActual]

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>📝 Cuestionarios</h1>
            <p>Practica y evalúa tus conocimientos</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          {quizPreguntas.length === 0 && (
            <>
              <section className="welcome">
                <h2>📚 Elige tu cuestionario</h2>
                <p>
                  Selecciona el tema y la cantidad
                  de preguntas que quieres responder.
                </p>
              </section>

              <div className="medicamento-detalle">
                <div className="campo-login">
                  <label htmlFor="temaQuiz">
                    Tema
                  </label>

                  <select
                    id="temaQuiz"
                    value={quizTema}
                    onChange={(e) =>
                      setQuizTema(e.target.value)
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '16px',
                    }}
                  >
                    <option value="">
                      Selecciona un tema
                    </option>

                    {temasQuiz.map((tema) => {
const disponibles =
  tema === 'Todos'
    ? preguntasBancoSupabase.length
    : preguntasBancoSupabase.filter(
        (pregunta) =>
          pregunta.tema === tema ||
          pregunta.tema === 'Todos'
      ).length
                      return (
                        <option
                          key={tema}
                          value={tema}
                        >
                          {tema} ({disponibles} disponibles)
                        </option>
                      )
                    })}
                  </select>
                </div>

                <div
                  className="campo-login"
                  style={{ marginTop: '20px' }}
                >
                  <label htmlFor="cantidadQuiz">
                    Cantidad de preguntas
                  </label>

                  <select
                    id="cantidadQuiz"
                    value={quizCantidad}
                    onChange={(e) =>
                      setQuizCantidad(
                        Number(e.target.value)
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius: '8px',
                      border: '1px solid #ccc',
                      fontSize: '16px',
                    }}
                  >
                    {[
                      5,
                      10,
                      15,
                      20,
                      25,
                      30,
                      35,
                      40,
                      45,
                    ].map((cantidad) => (
                      <option
                        key={cantidad}
                        value={cantidad}
                      >
                        {cantidad} preguntas
                      </option>
                    ))}
                  </select>
                </div>

               <button 
  type="button" 
  className="boton-login" 
  onClick={iniciarCuestionario} 
  disabled={cargandoPreguntas}
  style={{ marginTop: '20px' }}
>
  {cargandoPreguntas
    ? '⏳ CARGANDO PREGUNTAS...'
    : '▶️ COMENZAR CUESTIONARIO'}
</button>
              </div>

              <section className="welcome">
                <h3>💡 ¿Cómo funciona?</h3>
                <p>
                  Las preguntas se seleccionan
                  aleatoriamente y no se repiten dentro
                  del mismo cuestionario.
                </p>
                <p>
                  Al terminar podrás ver tu porcentaje
                  y guardar el resultado en tu progreso.
                </p>
              </section>
            </>
          )}

          {quizPreguntas.length > 0 &&
            !quizFinalizado &&
            preguntaActual && (
              <>
                <section className="welcome">
                  <p>
                    Tema: <strong>{quizTema}</strong>
                  </p>

                  <h2>
                    Pregunta {quizActual + 1} de{' '}
                    {quizPreguntas.length}
                  </h2>

                  <p>
                    Progreso:{' '}
                    {Math.round(
                      ((quizActual + 1) /
                        quizPreguntas.length) *
                        100
                    )}
                    %
                  </p>
                </section>

                <div className="medicamento-detalle">
                  <h3>
                    {preguntaActual.pregunta}
                  </h3>

                  <div style={{ marginTop: '20px' }}>
                    {preguntaActual.opciones.map(
                      (opcion, indice) => {
                        const seleccionada =
                          quizRespuesta === indice

                        const correcta =
                          indice ===
                          preguntaActual.correcta

                        let fondo = 'transparent'

                        if (
                          quizRespuesta !== null &&
                          correcta
                        ) {
                          fondo = '#dff6e4'
                        } else if (seleccionada) {
                          fondo = '#ffe0e0'
                        }

                        return (
                          <button
                            key={indice}
                            type="button"
                            onClick={() =>
                              responderPregunta(
                                indice
                              )
                            }
                            style={{
                              display: 'block',
                              width: '100%',
                              textAlign: 'left',
                              padding: '15px',
                              marginBottom: '10px',
                              borderRadius: '10px',
                              border:
                                '1px solid #ccc',
                              background: fondo,
                              cursor:
                                quizRespuesta !== null
                                  ? 'default'
                                  : 'pointer',
                              fontSize: '16px',
                            }}
                          >
                            {String.fromCharCode(
                              65 + indice
                            )}
                            . {opcion}
                          </button>
                        )
                      }
                    )}
                  </div>

                  {quizRespuesta !== null && (
                    <div
                      className="detalle-item"
                      style={{ marginTop: '20px' }}
                    >
                      {quizRespuesta ===
                      preguntaActual.correcta ? (
                        <p>
                          ✅ <strong>Correcto</strong>
                        </p>
                      ) : (
                        <p>
                          ❌ <strong>Incorrecto</strong>
                          <br />
                          Respuesta correcta:{' '}
                          {
                            preguntaActual.opciones[
                              preguntaActual.correcta
                            ]
                          }
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="boton-login"
                    onClick={siguientePregunta}
                    style={{ marginTop: '20px' }}
                  >
                    {quizActual + 1 ===
                    quizPreguntas.length
                      ? '🏁 FINALIZAR'
                      : 'SIGUIENTE →'}
                  </button>
                </div>
              </>
            )}

          {quizFinalizado && (
            <>
              <section className="welcome">
                <h2>🎉 Cuestionario terminado</h2>

                <p>
                  Tema: <strong>{quizTema}</strong>
                </p>

                <p
                  style={{
                    fontSize: '30px',
                    fontWeight: '800',
                  }}
                >
                  {quizPuntaje}/{quizPreguntas.length}
                </p>

                <p
                  style={{
                    fontSize: '24px',
                    fontWeight: '800',
                  }}
                >
                  {Math.round(
                    (quizPuntaje /
                      quizPreguntas.length) *
                      100
                  )}
                  %
                </p>
              </section>

              <div className="medicamento-detalle">
                <div className="detalle-item">
                  <strong>📊 Resultado</strong>

                  <p>
                    Correctas:{' '}
                    {quizPuntaje}
                  </p>

                  <p>
                    Incorrectas:{' '}
                    {quizPreguntas.length -
                      quizPuntaje}
                  </p>

                  <p>
                    Preguntas:{' '}
                    {quizPreguntas.length}
                  </p>
                </div>

                <button
                  type="button"
                  className="boton-login"
                  onClick={volverASeleccionQuiz}
                >
                  🔄 HACER OTRO CUESTIONARIO
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    setPagina('progreso')
                  }
                  style={{
                    marginTop: '12px',
                    width: '100%',
                  }}
                >
                  📈 VER MI PROGRESO
                </button>
              </div>
            </>
          )}
        </main>
      </div>
    )
  }

  // =========================
  // PROGRESO
  // =========================

  if (pagina === 'progreso') {
    const promedio =
      progreso.intentos > 0
        ? Math.round(
            progreso.puntajeTotal /
              progreso.intentos
          )
        : 0

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>📈 Mi progreso</h1>
            <p>Resultados de tus cuestionarios</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>📊 Tu progreso</h2>
            <p>
              Aquí puedes revisar tus resultados
              acumulados.
            </p>
          </section>

          <div className="medicamento-detalle">
            <div className="detalle-item">
              <strong>📝 Intentos</strong>
              <p style={{ fontSize: '26px' }}>
                {progreso.intentos}
              </p>
            </div>

            <div className="detalle-item">
              <strong>📊 Promedio</strong>
              <p style={{ fontSize: '26px' }}>
                {promedio}%
              </p>
            </div>

            <div className="detalle-item">
              <strong>🏆 Mejor resultado</strong>
              <p style={{ fontSize: '26px' }}>
                {progreso.mejorPuntaje}%
              </p>
            </div>

            <div className="detalle-item">
              <strong>❓ Preguntas respondidas</strong>
              <p style={{ fontSize: '26px' }}>
                {progreso.preguntasRespondidas}
              </p>
            </div>

            <div className="detalle-item">
              <strong>✅ Cuestionarios aprobados</strong>
              <p style={{ fontSize: '26px' }}>
                {progreso.aprobados}
              </p>
            </div>
          </div>

          <section className="welcome">
            <h3>📚 Resultados por tema</h3>

            {Object.keys(progreso.resultadosPorTema)
              .length === 0 ? (
              <p>
                Todavía no tienes resultados
                registrados.
              </p>
            ) : (
              Object.entries(
                progreso.resultadosPorTema
              ).map(([tema, resultado]) => (
                <div
                  key={tema}
                  className="detalle-item"
                  style={{ marginTop: '12px' }}
                >
                  <strong>{tema}</strong>

                  <p>
                    Intentos:{' '}
                    {resultado.intentos}
                  </p>

                  <p>
                    Mejor resultado:{' '}
                    {resultado.mejorPuntaje}%
                  </p>

                  <p>
                    Preguntas respondidas:{' '}
                    {resultado.preguntas}
                  </p>
                </div>
              ))
            )}
          </section>
        </main>
      </div>
    )
  }

  // =========================
  // PERFIL
  // =========================

  if (pagina === 'perfil') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>👤 Mi perfil</h1>
            <p>Cuenta de NurseAssist</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>Hola, {nombreUsuario} 👋</h2>
            <p>{correoUsuario}</p>
          </section>

          <div className="medicamento-detalle">
            <div className="detalle-item">
              <strong>📧 Correo</strong>
              <p>{correoUsuario}</p>
            </div>

            <div className="detalle-item">
              <strong>📝 Cuestionarios realizados</strong>
              <p>{progreso.intentos}</p>
            </div>

            <div className="detalle-item">
              <strong>🏆 Mejor resultado</strong>
              <p>{progreso.mejorPuntaje}%</p>
            </div>

            <button
              type="button"
              className="boton-login"
              onClick={() => setPagina('progreso')}
            >
              📈 VER MI PROGRESO
            </button>

            <button
              type="button"
              className="back-button"
              onClick={cerrarSesion}
              style={{
                marginTop: '12px',
                width: '100%',
              }}
            >
              CERRAR SESIÓN
            </button>
          </div>
        </main>
      </div>
    )
  }

  // =========================
  // PROCEDIMIENTOS
  // =========================

  if (pagina === 'procedimientos') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>🩺 Procedimientos</h1>
            <p>Procedimientos de enfermería</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => {
              setPagina('inicio')
              setProcedimientoSeleccionado(null)
            }}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <div className="search">
            <input
              type="text"
              placeholder="Buscar procedimiento..."
              value={busquedaProcedimiento}
              onChange={(e) =>
                setBusquedaProcedimiento(
                  e.target.value
                )
              }
            />
          </div>

          <div className="cards-grid">
            {procedimientosFiltrados.map(
              (procedimiento) => (
                <button
                  type="button"
                  key={procedimiento.id}
                  className="medicamento-card"
                  onClick={() => {
                    if (
                      procedimiento.id ===
                      'signos'
                    ) {
                      setPagina(
                        'signosVitales'
                      )
                    } else {
                      setProcedimientoSeleccionado(
                        procedimiento
                      )
                    }
                  }}
                >
                  <div className="card-icon">
                    {procedimiento.icono}
                  </div>

                  <div>
                    <h3>
                      {procedimiento.nombre}
                    </h3>

                    <p>
                      {procedimiento.descripcion}
                    </p>
                  </div>
                </button>
              )
            )}
          </div>

          {procedimientoSeleccionado && (
            <div
              className="medicamento-detalle"
              style={{ marginTop: '20px' }}
            >
              <h2>
                {procedimientoSeleccionado.icono}{' '}
                {procedimientoSeleccionado.nombre}
              </h2>

              <div className="detalle-item">
                <strong>🎯 Objetivo</strong>
                <p>
                  {
                    procedimientoSeleccionado.objetivo
                  }
                </p>
              </div>

              <div className="detalle-item">
                <strong>🧰 Materiales</strong>

                <ul>
                  {procedimientoSeleccionado.materiales.map(
                    (material) => (
                      <li key={material}>
                        {material}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="detalle-item">
                <strong>📋 Procedimiento</strong>
                <p>
                  {
                    procedimientoSeleccionado.procedimiento
                  }
                </p>
              </div>

              <div className="detalle-item">
                <strong>🔢 Pasos</strong>

                <ol>
                  {procedimientoSeleccionado.pasos.map(
                    (paso) => (
                      <li key={paso}>{paso}</li>
                    )
                  )}
                </ol>
              </div>

              <div className="detalle-item">
                <strong>⚠️ Consideraciones</strong>

                <ul>
                  {procedimientoSeleccionado.consideraciones.map(
                    (consideracion) => (
                      <li key={consideracion}>
                        {consideracion}
                      </li>
                    )
                  )}
                </ul>
              </div>

              {procedimientoSeleccionado.sistemas && (
                <>
                  <div className="detalle-item">
                    <strong>
                      🫁 Sistemas de oxigenoterapia
                    </strong>

                    <h4>Bajo flujo</h4>

                    <div style={{ overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse:
                            'collapse',
                        }}
                      >
                        <thead>
                          <tr>
                            <th>Dispositivo</th>
                            <th>Flujo</th>
                            <th>FiO₂ aprox.</th>
                          </tr>
                        </thead>

                        <tbody>
                          {procedimientoSeleccionado.sistemas.bajoFlujo.map(
                            (sistema) => (
                              <tr
                                key={
                                  sistema.nombre
                                }
                              >
                                <td>
                                  {
                                    sistema.nombre
                                  }
                                </td>
                                <td>
                                  {
                                    sistema.flujo
                                  }
                                </td>
                                <td>
                                  {
                                    sistema.fio2
                                  }
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>

                    <h4
                      style={{
                        marginTop: '20px',
                      }}
                    >
                      Alto flujo
                    </h4>

                    <div style={{ overflowX: 'auto' }}>
                      <table
                        style={{
                          width: '100%',
                          borderCollapse:
                            'collapse',
                        }}
                      >
                        <thead>
                          <tr>
                            <th>Dispositivo</th>
                            <th>Flujo</th>
                            <th>FiO₂ aprox.</th>
                          </tr>
                        </thead>

                        <tbody>
                          {procedimientoSeleccionado.sistemas.altoFlujo.map(
                            (sistema) => (
                              <tr
                                key={
                                  sistema.nombre
                                }
                              >
                                <td>
                                  {
                                    sistema.nombre
                                  }
                                </td>
                                <td>
                                  {
                                    sistema.flujo
                                  }
                                </td>
                                <td>
                                  {
                                    sistema.fio2
                                  }
                                </td>
                              </tr>
                            )
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    )
  }

  // =========================
  // MEDICAMENTOS
  // =========================

  if (pagina === 'medicamentos') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>💊 Medicamentos</h1>
            <p>Información farmacológica</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => {
              setPagina('inicio')
              setMedicamentoSeleccionado(null)
            }}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <div className="search">
            <input
              type="text"
              placeholder="Buscar medicamento..."
              value={busquedaMedicamento}
              onChange={(e) =>
                setBusquedaMedicamento(
                  e.target.value
                )
              }
            />
          </div>

          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginBottom: '20px',
            }}
          >
            {gruposMedicamentos.map((grupo) => (
              <button
                type="button"
                key={grupo}
                onClick={() =>
                  setFiltroGrupo(grupo)
                }
                className={
                  filtroGrupo === grupo
                    ? 'boton-login'
                    : 'back-button'
                }
              >
                {grupo}
              </button>
            ))}
          </div>

          <div className="cards-grid">
            {medicamentosFiltrados.map(
              (medicamento) => (
                <button
                  type="button"
                  key={medicamento.nombre}
                  className="medicamento-card"
                  onClick={() =>
                    setMedicamentoSeleccionado(
                      medicamento
                    )
                  }
                >
                  <div className="card-icon">
                    💊
                  </div>

                  <div>
                    <h3>
                      {medicamento.nombre}
                    </h3>

                    <p>
                      {medicamento.grupo ||
                        'Medicamento'}
                    </p>
                  </div>
                </button>
              )
            )}
          </div>

          {medicamentosFiltrados.length === 0 && (
            <section className="welcome">
              <h3>
                No encontramos medicamentos
              </h3>
              <p>
                Prueba con otro nombre o grupo.
              </p>
            </section>
          )}

          {medicamentoSeleccionado && (
            <div
              className="medicamento-detalle"
              style={{ marginTop: '20px' }}
            >
              <h2>
                💊{' '}
                {medicamentoSeleccionado.nombre}
              </h2>

              <div className="detalle-item">
                <strong>Grupo</strong>
                <p>
                  {
                    medicamentoSeleccionado.grupo
                  }
                </p>
              </div>

              {medicamentoSeleccionado.uso && (
                <div className="detalle-item">
                  <strong>Uso</strong>
                  <p>
                    {
                      medicamentoSeleccionado.uso
                    }
                  </p>
                </div>
              )}

              {medicamentoSeleccionado.mecanismo && (
                <div className="detalle-item">
                  <strong>Mecanismo</strong>
                  <p>
                    {
                      medicamentoSeleccionado.mecanismo
                    }
                  </p>
                </div>
              )}

              {medicamentoSeleccionado.indicaciones && (
                <div className="detalle-item">
                  <strong>Indicaciones</strong>

                  <p>
                    {
                      medicamentoSeleccionado.indicaciones
                    }
                  </p>
                </div>
              )}

              {medicamentoSeleccionado.contraindicaciones && (
                <div className="detalle-item">
                  <strong>
                    Contraindicaciones
                  </strong>

                  <p>
                    {
                      medicamentoSeleccionado.contraindicaciones
                    }
                  </p>
                </div>
              )}

              {medicamentoSeleccionado.reacciones && (
                <div className="detalle-item">
                  <strong>
                    Reacciones adversas
                  </strong>

                  <p>
                    {
                      medicamentoSeleccionado.reacciones
                    }
                  </p>
                </div>
              )}

              {medicamentoSeleccionado.reaccionesAdversas && (
                <div className="detalle-item">
                  <strong>
                    Reacciones adversas
                  </strong>

                  <p>
                    {
                      medicamentoSeleccionado.reaccionesAdversas
                    }
                  </p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    )
  }

  // =========================
  // URGENCIAS
  // =========================

  if (pagina === 'urgencias') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>🚨 Urgencias</h1>
            <p>Atención inicial y emergencias</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>🚨 Urgencias</h2>
            <p>
              Sección destinada a contenidos de
              evaluación inicial, emergencias y
              atención oportuna.
            </p>
          </section>

          <div className="cards-grid">
            <div className="medicamento-card">
              <div className="card-icon">
                ❤️
              </div>
              <div>
                <h3>RCP</h3>
                <p>
                  Reanimación cardiopulmonar
                </p>
              </div>
            </div>

            <div className="medicamento-card">
              <div className="card-icon">
                🚑
              </div>
              <div>
                <h3>Emergencias</h3>
                <p>
                  Evaluación y respuesta inicial
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // =========================
  // GUÍAS
  // =========================

  if (pagina === 'guias') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>📚 Guías</h1>
            <p>Consulta rápida</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <div className="cards-grid">
            <div className="medicamento-card">
              <div className="card-icon">
                🫁
              </div>
              <div>
                <h3>EPOC</h3>
                <p>
                  Enfermedad pulmonar obstructiva
                  crónica
                </p>
              </div>
            </div>

            <div className="medicamento-card">
              <div className="card-icon">
                🫁
              </div>
              <div>
                <h3>Neumonía</h3>
                <p>
                  Información general
                </p>
              </div>
            </div>

            <div className="medicamento-card">
              <div className="card-icon">
                🫁
              </div>
              <div>
                <h3>Asma</h3>
                <p>
                  Información general
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // =========================
  // FAVORITOS
  // =========================

  if (pagina === 'favoritos') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>⭐ Guardados</h1>
            <p>Tus contenidos favoritos</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>⭐ Guardados</h2>
            <p>
              Aquí podrás acceder a tus contenidos
              guardados.
            </p>
          </section>
        </main>
      </div>
    )
  }

  // =========================
  // INICIO
  // =========================

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>🩺 NurseAssist</h1>
          <p>Tu asistente de enfermería</p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => setPagina('perfil')}
        >
          👤
        </button>
      </header>

      <main className="content">
        <section className="welcome">
          <h2>
            Hola, {nombreUsuario} 👋
          </h2>

          <p>
            ¿Qué necesitas consultar hoy?
          </p>
        </section>

        <div className="search">
          <input
            type="text"
            placeholder="🔎 Buscar medicamentos, procedimientos, guías..."
            value={busquedaGeneral}
            onChange={(e) =>
              setBusquedaGeneral(e.target.value)
            }
          />
        </div>

        {busquedaGeneral.trim() !== '' && (
          <section
            className="medicamento-detalle"
            style={{ marginBottom: '20px' }}
          >
            <h3>
              Resultados de búsqueda
            </h3>

            {resultadosFiltrados.length === 0 ? (
              <p>
                No encontramos resultados.
              </p>
            ) : (
              resultadosFiltrados
                .slice(0, 12)
                .map((resultado) => (
                  <button
                    type="button"
                    key={`${resultado.tipo}-${resultado.nombre}`}
                    className="medicamento-card"
                    style={{
                      width: '100%',
                      marginBottom: '10px',
                    }}
                    onClick={() => {
                      setPagina(
                        resultado.pagina
                      )

                      if (
                        resultado.pagina ===
                        'medicamentos'
                      ) {
                        setMedicamentoSeleccionado(
                          resultado.dato
                        )
                      }

                      if (
                        resultado.pagina ===
                        'procedimientos'
                      ) {
                        setProcedimientoSeleccionado(
                          resultado.dato
                        )
                      }

                      setBusquedaGeneral('')
                    }}
                  >
                    <div className="card-icon">
                      {resultado.icono}
                    </div>

                    <div>
                      <h3>
                        {resultado.nombre}
                      </h3>

                      <p>
                        {resultado.tipo} ·{' '}
                        {resultado.descripcion}
                      </p>
                    </div>
                  </button>
                ))
            )}
          </section>
        )}

        <section className="welcome">
          <h2>⚡ Acceso rápido</h2>
        </section>

        <div className="cards-grid">
          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('medicamentos')
            }
          >
            <div className="card-icon">
              💊
            </div>

            <div>
              <h3>Medicamentos</h3>
              <p>
                Consulta información
                farmacológica
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('calculadora')
            }
          >
            <div className="card-icon">
              🧮
            </div>

            <div>
              <h3>
                Calculadora de dosis
              </h3>
              <p>
                Dosis, volumen y
                comprimidos
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('pam')
            }
          >
            <div className="card-icon">
              🩺
            </div>

            <div>
              <h3>
                Calculadora de PAM
              </h3>
              <p>
                Presión arterial media
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('imc')
            }
          >
            <div className="card-icon">
              ⚖️
            </div>

            <div>
              <h3>
                Calculadora de IMC
              </h3>
              <p>
                Índice de masa corporal
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('cuestionarios')
            }
          >
            <div className="card-icon">
              📝
            </div>

            <div>
              <h3>Cuestionarios</h3>
              <p>
                Practica por tema
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('progreso')
            }
          >
            <div className="card-icon">
              📈
            </div>

            <div>
              <h3>Mi progreso</h3>
              <p>
                Revisa tus resultados
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('urgencias')
            }
          >
            <div className="card-icon">
              🚨
            </div>

            <div>
              <h3>Urgencias</h3>
              <p>
                Emergencias y atención
                inicial
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('turno')
            }
          >
            <div className="card-icon">
              📋
            </div>

            <div>
              <h3>
                Entrega de turno
              </h3>
              <p>
                Comunicación clínica
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('procedimientos')
            }
          >
            <div className="card-icon">
              🩺
            </div>

            <div>
              <h3>
                Procedimientos
              </h3>
              <p>
                Procedimientos de
                enfermería
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('guias')
            }
          >
            <div className="card-icon">
              📚
            </div>

            <div>
              <h3>Guías</h3>
              <p>
                Consulta rápida
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina('favoritos')
            }
          >
            <div className="card-icon">
              ⭐
            </div>

            <div>
              <h3>Guardados</h3>
              <p>
                Tus contenidos
              </p>
            </div>
          </button>
        </div>
      </main>

      <nav
        style={{
          display: 'flex',
          justifyContent: 'space-around',
          alignItems: 'center',
          padding: '12px',
          borderTop: '1px solid #ddd',
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          marginTop: '20px',
        }}
      >
        <button
          type="button"
          className="back-button"
          onClick={() => setPagina('inicio')}
        >
          🏠 Inicio
        </button>

        <button
          type="button"
          className="back-button"
          onClick={() => {
            const input =
              document.querySelector(
                '.search input'
              )

            if (input) {
              input.focus()
            }
          }}
        >
          🔎 Buscar
        </button>

        <button
          type="button"
          className="back-button"
          onClick={() =>
            setPagina('favoritos')
          }
        >
          ⭐ Guardados
        </button>

        <button
          type="button"
          className="back-button"
          onClick={() =>
            setPagina('perfil')
          }
        >
          👤 Perfil
        </button>
      </nav>
    </div>
  )
}

export default App
