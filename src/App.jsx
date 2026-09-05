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

const PROGRESO_INICIAL = {
  intentos: 0,
  puntajeTotal: 0,
  mejorPuntaje: 0,
  preguntasRespondidas: 0,
  aprobados: 0,
  resultadosPorTema: {},
}

function App() {
  // =========================================================
  // NAVEGACIÓN
  // =========================================================

  const [pagina, setPagina] = useState('inicio')

  // =========================================================
  // SESIÓN
  // =========================================================

  const [usuarioSesion, setUsuarioSesion] = useState(null)
  const [cargandoSesion, setCargandoSesion] = useState(true)

  // =========================================================
  // MEDICAMENTOS
  // =========================================================

  const [medicamentoSeleccionado, setMedicamentoSeleccionado] =
    useState(null)

  const [busquedaMedicamento, setBusquedaMedicamento] =
    useState('')

  const [filtroGrupo, setFiltroGrupo] = useState('Todos')

  // =========================================================
  // PROCEDIMIENTOS
  // =========================================================

  const [procedimientoSeleccionado, setProcedimientoSeleccionado] =
    useState(null)

  const [busquedaProcedimiento, setBusquedaProcedimiento] =
    useState('')

  // =========================================================
  // BÚSQUEDA GENERAL
  // =========================================================

  const [busquedaGeneral, setBusquedaGeneral] = useState('')

  // =========================================================
  // CUESTIONARIOS
  // =========================================================

  const [quizTema, setQuizTema] = useState('')
  const [quizCantidad, setQuizCantidad] = useState(10)
  const [quizPreguntas, setQuizPreguntas] = useState([])
  const [quizActual, setQuizActual] = useState(0)
  const [quizRespuesta, setQuizRespuesta] = useState(null)
  const [quizPuntaje, setQuizPuntaje] = useState(0)
  const [quizFinalizado, setQuizFinalizado] = useState(false)

  const [preguntasBancoSupabase, setPreguntasBancoSupabase] =
    useState([])

  const [cargandoPreguntas, setCargandoPreguntas] =
    useState(false)

  // =========================================================
  // PROGRESO
  // =========================================================

  const [progreso, setProgreso] = useState({
    ...PROGRESO_INICIAL,
  })

  const [cargandoProgreso, setCargandoProgreso] = useState(false)

  // =========================================================
  // TEMAS DE CUESTIONARIOS
  // =========================================================

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

  // =========================================================
  // SESIÓN SUPABASE
  // =========================================================

  useEffect(() => {
    let activo = true

    const cargarSesion = async () => {
      console.log('==========================================')
      console.log('🔐 COMPROBANDO SESIÓN DE SUPABASE')
      console.log('==========================================')

      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (!activo) {
          return
        }

        if (error) {
          console.error(
            '❌ ERROR OBTENIENDO SESIÓN:',
            error
          )

          setUsuarioSesion(null)
          setCargandoSesion(false)

          return
        }

        console.log(
          '👤 Usuario encontrado:',
          session?.user?.id || 'NO HAY USUARIO'
        )

        console.log(
          '📧 Correo:',
          session?.user?.email || 'SIN CORREO'
        )

        setUsuarioSesion(session?.user ?? null)
        setCargandoSesion(false)
      } catch (error) {
        console.error(
          '💥 ERROR INESPERADO OBTENIENDO SESIÓN:',
          error
        )

        if (activo) {
          setUsuarioSesion(null)
          setCargandoSesion(false)
        }
      }
    }

    cargarSesion()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (evento, session) => {
        if (!activo) {
          return
        }

        console.log('==========================================')
        console.log(
          '🔄 CAMBIO DE AUTENTICACIÓN:',
          evento
        )

        console.log(
          '👤 Usuario:',
          session?.user?.id || 'NO HAY USUARIO'
        )

        console.log(
          '📧 Correo:',
          session?.user?.email || 'SIN CORREO'
        )

        console.log('==========================================')

        setUsuarioSesion(session?.user ?? null)
        setCargandoSesion(false)
      }
    )

    return () => {
      activo = false
      subscription.unsubscribe()
    }
  }, [])

  // =========================================================
  // CARGAR PREGUNTAS DESDE SUPABASE
  // =========================================================

  useEffect(() => {
    // ---------------------------------------------------------
    // ESPERAR A QUE SUPABASE TERMINE DE COMPROBAR LA SESIÓN
    // ---------------------------------------------------------

    if (cargandoSesion) {
      console.log(
        '⏳ Esperando a que Supabase confirme la sesión...'
      )

      return
    }

    // ---------------------------------------------------------
    // SI NO HAY USUARIO, NO CARGAR PREGUNTAS
    // ---------------------------------------------------------

    if (!usuarioSesion?.id) {
      console.log(
        '⚠️ No hay usuario autenticado.'
      )

      console.log(
        '⚠️ No se cargarán preguntas.'
      )

      setPreguntasBancoSupabase([])
      setCargandoPreguntas(false)

      return
    }

    let activo = true

    const cargarPreguntas = async () => {
      console.log('==========================================')
      console.log('🔵 INICIANDO CARGA DE PREGUNTAS')
      console.log('==========================================')

      console.log(
        '👤 Usuario autenticado:',
        usuarioSesion.id
      )

      console.log(
        '📧 Correo:',
        usuarioSesion.email
      )

      setCargandoPreguntas(true)

      try {
        // -----------------------------------------------------
        // CONSULTA A SUPABASE
        // -----------------------------------------------------

        const {
          data,
          error,
        } = await supabase
          .from('preguntas')
          .select(
            'id, tema, pregunta, opciones, correcta, activa'
          )
          .order('id', {
            ascending: true,
          })

        console.log(
          '📦 DATA RECIBIDA DESDE SUPABASE:',
          data
        )

        console.log(
          '❌ ERROR DE SUPABASE:',
          error
        )

        console.log(
          '📊 CANTIDAD DE PREGUNTAS:',
          data?.length ?? 0
        )

        // -----------------------------------------------------
        // COMPONENTE DESMONTADO
        // -----------------------------------------------------

        if (!activo) {
          return
        }

        // -----------------------------------------------------
        // ERROR
        // -----------------------------------------------------

        if (error) {
          console.error(
            '❌ ERROR AL CARGAR PREGUNTAS:',
            error
          )

          console.error(
            'Código:',
            error.code
          )

          console.error(
            'Mensaje:',
            error.message
          )

          console.error(
            'Detalles:',
            error.details
          )

          console.error(
            'Hint:',
            error.hint
          )

          setPreguntasBancoSupabase([])

          alert(
            `No se pudieron cargar las preguntas desde Supabase.\n\n${error.message}`
          )

          return
        }

        // -----------------------------------------------------
        // SUPABASE DEVOLVIÓ CERO FILAS
        // -----------------------------------------------------

        if (!data || data.length === 0) {
          console.warn(
            '⚠️ SUPABASE DEVOLVIÓ 0 PREGUNTAS.'
          )

          console.warn(
            '⚠️ Usuario autenticado:',
            usuarioSesion.id
          )

          console.warn(
            '⚠️ Esto puede indicar un problema con las políticas RLS de Supabase.'
          )

          setPreguntasBancoSupabase([])

          alert(
            'Supabase no devolvió ninguna pregunta.\n\n' +
              'La sesión está iniciada, pero la tabla "preguntas" está devolviendo 0 registros.\n\n' +
              'Si las 45 preguntas aparecen en Supabase, revisaremos las políticas RLS.'
          )

          return
        }

        // -----------------------------------------------------
        // FORMATEAR PREGUNTAS
        // -----------------------------------------------------

        const preguntasFormateadas = data.map(
          (pregunta) => {
            let opciones = pregunta.opciones

            // -------------------------------------------------
            // OPCIONES COMO STRING
            // -------------------------------------------------

            if (typeof opciones === 'string') {
              try {
                opciones = JSON.parse(opciones)
              } catch (error) {
                console.error(
                  `❌ No se pudo convertir opciones de pregunta ${pregunta.id}:`,
                  opciones
                )

                opciones = []
              }
            }

            // -------------------------------------------------
            // SEGUNDA CONVERSIÓN POR DOBLE SERIALIZACIÓN
            // -------------------------------------------------

            if (typeof opciones === 'string') {
              try {
                opciones = JSON.parse(opciones)
              } catch {
                opciones = []
              }
            }

            // -------------------------------------------------
            // OBJETO → ARRAY
            // -------------------------------------------------

            if (
              opciones &&
              typeof opciones === 'object' &&
              !Array.isArray(opciones)
            ) {
              opciones = Object.values(opciones)
            }

            // -------------------------------------------------
            // ASEGURAR ARRAY
            // -------------------------------------------------

            if (!Array.isArray(opciones)) {
              opciones = []
            }

            // -------------------------------------------------
            // CONVERTIR OPCIONES A TEXTO
            // -------------------------------------------------

            opciones = opciones.map(
              (opcion) => String(opcion ?? '')
            )

            // -------------------------------------------------
            // CORRECTA COMO NÚMERO
            // -------------------------------------------------

            const correcta = Number(
              pregunta.correcta
            )

            console.log(
              `📝 Pregunta ${pregunta.id}:`,
              pregunta.pregunta
            )

            console.log(
              `📚 Tema ${pregunta.id}:`,
              pregunta.tema
            )

            console.log(
              `🔤 Opciones ${pregunta.id}:`,
              opciones
            )

            console.log(
              `✅ Correcta ${pregunta.id}:`,
              correcta
            )

            console.log(
              `🟢 Activa ${pregunta.id}:`,
              pregunta.activa
            )

            return {
              ...pregunta,
              correcta,
              opciones,
            }
          }
        )

        // -----------------------------------------------------
        // RESULTADO FINAL
        // -----------------------------------------------------

        console.log('==========================================')

        console.log(
          '🎯 PREGUNTAS FORMATEADAS:',
          preguntasFormateadas
        )

        console.log(
          '🎯 TOTAL FINAL:',
          preguntasFormateadas.length
        )

        console.log('==========================================')

        if (activo) {
          setPreguntasBancoSupabase(
            preguntasFormateadas
          )
        }
      } catch (error) {
        console.error(
          '💥 ERROR INESPERADO CARGANDO PREGUNTAS:',
          error
        )

        if (activo) {
          setPreguntasBancoSupabase([])

          alert(
            'Ocurrió un error inesperado al cargar las preguntas.'
          )
        }
      } finally {
        if (activo) {
          setCargandoPreguntas(false)
        }
      }
    }

    cargarPreguntas()

    return () => {
      activo = false
    }
  }, [
    cargandoSesion,
    usuarioSesion?.id,
  ])

  // =========================================================
  // CARGAR PROGRESO DESDE SUPABASE
  // =========================================================

  const cargarProgresoSupabase = async (
    usuarioId
  ) => {
    if (!usuarioId) {
      setProgreso({
        ...PROGRESO_INICIAL,
      })

      return
    }

    setCargandoProgreso(true)

    console.log(
      '📈 Cargando progreso del usuario:',
      usuarioId
    )

    const {
      data,
      error,
    } = await supabase
      .from('resultados_cuestionarios')
      .select(
        'id, tema, preguntas, correctas, porcentaje, aprobado, created_at'
      )
      .eq('user_id', usuarioId)
      .order('created_at', {
        ascending: true,
      })

    if (error) {
      console.error(
        '❌ Error al cargar progreso desde Supabase:',
        error
      )

      setCargandoProgreso(false)
      return
    }

    const resultados = data || []

    console.log(
      '📊 Resultados encontrados:',
      resultados
    )

    if (resultados.length === 0) {
      setProgreso({
        ...PROGRESO_INICIAL,
      })

      setCargandoProgreso(false)
      return
    }

    let intentos = 0
    let puntajeTotal = 0
    let mejorPuntaje = 0
    let preguntasRespondidas = 0
    let aprobados = 0

    const resultadosPorTema = {}

    resultados.forEach(
      (resultado) => {
        const porcentaje =
          Number(
            resultado.porcentaje
          ) || 0

        const preguntas =
          Number(
            resultado.preguntas
          ) || 0

        intentos += 1

        puntajeTotal += porcentaje

        preguntasRespondidas +=
          preguntas

        mejorPuntaje = Math.max(
          mejorPuntaje,
          porcentaje
        )

        if (
          resultado.aprobado ===
          true
        ) {
          aprobados += 1
        }

        const tema =
          resultado.tema ||
          'Sin tema'

        if (
          !resultadosPorTema[
            tema
          ]
        ) {
          resultadosPorTema[
            tema
          ] = {
            intentos: 0,
            mejorPuntaje: 0,
            preguntas: 0,
          }
        }

        resultadosPorTema[
          tema
        ].intentos += 1

        resultadosPorTema[
          tema
        ].mejorPuntaje =
          Math.max(
            resultadosPorTema[
              tema
            ].mejorPuntaje,
            porcentaje
          )

        resultadosPorTema[
          tema
        ].preguntas +=
          preguntas
      }
    )

    setProgreso({
      intentos,
      puntajeTotal,
      mejorPuntaje,
      preguntasRespondidas,
      aprobados,
      resultadosPorTema,
    })

    setCargandoProgreso(false)
  }

  // =========================================================
  // CARGAR PROGRESO CUANDO CAMBIA EL USUARIO
  // =========================================================

  useEffect(() => {
    if (usuarioSesion?.id) {
      cargarProgresoSupabase(
        usuarioSesion.id
      )
    } else {
      setProgreso({
        ...PROGRESO_INICIAL,
      })
    }
  }, [usuarioSesion?.id])

  // =========================================================
  // MEZCLAR PREGUNTAS
  // =========================================================

  const mezclarPreguntas = (
    lista
  ) => {
    return [...lista].sort(
      () => Math.random() - 0.5
    )
  }

  // =========================================================
  // INICIAR CUESTIONARIO
  // =========================================================

  const iniciarCuestionario =
    () => {
      if (!quizTema) {
        alert(
          'Selecciona un tema antes de comenzar.'
        )

        return
      }

      if (cargandoPreguntas) {
        alert(
          'Las preguntas todavía se están cargando.'
        )

        return
      }

      if (
        preguntasBancoSupabase.length ===
        0
      ) {
        alert(
          'No hay preguntas disponibles en Supabase.'
        )

        return
      }

      let preguntasDisponibles =
        preguntasBancoSupabase

      if (
        quizTema !==
        'Todos'
      ) {
        preguntasDisponibles =
          preguntasBancoSupabase.filter(
            (pregunta) =>
              pregunta.tema ===
                quizTema ||
              pregunta.tema ===
                'Todos'
          )
      }

      if (
        preguntasDisponibles.length <
        quizCantidad
      ) {
        alert(
          `Actualmente hay ${preguntasDisponibles.length} preguntas disponibles para este tema.`
        )

        return
      }

      const seleccionadas =
        mezclarPreguntas(
          preguntasDisponibles
        ).slice(
          0,
          quizCantidad
        )

      console.log(
        '🎯 Cuestionario iniciado:',
        seleccionadas
      )

      setQuizPreguntas(
        seleccionadas
      )

      setQuizActual(0)

      setQuizRespuesta(null)

      setQuizPuntaje(0)

      setQuizFinalizado(false)

      setPagina(
        'cuestionarios'
      )
    }

  // =========================================================
  // RESPONDER PREGUNTA
  // =========================================================

  const responderPregunta =
    (indice) => {
      if (
        quizRespuesta !==
        null
      ) {
        return
      }

      console.log(
        'Respuesta seleccionada:',
        indice
      )

      setQuizRespuesta(indice)
    }

  // =========================================================
  // SIGUIENTE PREGUNTA
  // =========================================================

  const siguientePregunta =
    async () => {
      if (
        quizRespuesta ===
        null
      ) {
        alert(
          'Selecciona una respuesta antes de continuar.'
        )

        return
      }

      const preguntaActual =
        quizPreguntas[
          quizActual
        ]

      if (!preguntaActual) {
        return
      }

      const respuestaCorrecta =
        Number(
          quizRespuesta
        ) ===
        Number(
          preguntaActual.correcta
        )

      const puntajeFinal =
        quizPuntaje +
        (respuestaCorrecta
          ? 1
          : 0)

      console.log(
        'Respuesta:',
        quizRespuesta
      )

      console.log(
        'Respuesta correcta:',
        preguntaActual.correcta
      )

      console.log(
        'Puntaje:',
        puntajeFinal
      )

      // =======================================================
      // TODAVÍA QUEDAN PREGUNTAS
      // =======================================================

      if (
        quizActual + 1 <
        quizPreguntas.length
      ) {
        setQuizActual(
          (actual) =>
            actual + 1
        )

        setQuizRespuesta(
          null
        )

        setQuizPuntaje(
          puntajeFinal
        )

        return
      }

      // =======================================================
      // FINAL DEL CUESTIONARIO
      // =======================================================

      const porcentaje =
        Math.round(
          (puntajeFinal /
            quizPreguntas.length) *
            100
        )

      console.log(
        '🎉 Cuestionario terminado'
      )

      console.log(
        'Correctas:',
        puntajeFinal
      )

      console.log(
        'Porcentaje:',
        porcentaje
      )

      // =======================================================
      // GUARDAR RESULTADO
      // =======================================================

      if (usuarioSesion?.id) {
        const {
          error,
        } = await supabase
          .from(
            'resultados_cuestionarios'
          )
          .insert({
            user_id:
              usuarioSesion.id,

            tema:
              quizTema,

            preguntas:
              quizPreguntas.length,

            correctas:
              puntajeFinal,

            porcentaje:
              porcentaje,

            aprobado:
              porcentaje >= 70,
          })

        if (error) {
          console.error(
            '❌ Error al guardar resultado:',
            error
          )

          alert(
            'El cuestionario terminó, pero no se pudo guardar el resultado en Supabase.'
          )
        } else {
          console.log(
            '✅ Resultado guardado correctamente en Supabase.'
          )

          await cargarProgresoSupabase(
            usuarioSesion.id
          )
        }
      }

      setQuizPuntaje(
        puntajeFinal
      )

      setQuizFinalizado(
        true
      )
    }

  // =========================================================
  // HACER OTRO CUESTIONARIO
  // =========================================================

  const volverASeleccionQuiz =
    () => {
      setQuizPreguntas([])
      setQuizActual(0)
      setQuizRespuesta(null)
      setQuizPuntaje(0)
      setQuizFinalizado(false)

      setPagina(
        'cuestionarios'
      )
    }

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  const cerrarSesion =
    async () => {
      console.log(
        '🚪 Cerrando sesión...'
      )

      const {
        error,
      } =
        await supabase.auth.signOut()

      if (error) {
        console.error(
          '❌ Error cerrando sesión:',
          error
        )

        alert(
          'No se pudo cerrar la sesión correctamente.'
        )

        return
      }

      console.log(
        '✅ Sesión cerrada correctamente.'
      )

      setUsuarioSesion(null)

      setPagina('inicio')

      setMedicamentoSeleccionado(
        null
      )

      setProcedimientoSeleccionado(
        null
      )

      setPreguntasBancoSupabase(
        []
      )

      setCargandoPreguntas(
        false
      )

      setProgreso({
        ...PROGRESO_INICIAL,
      })

      setQuizPreguntas([])

      setQuizActual(0)

      setQuizRespuesta(null)

      setQuizPuntaje(0)

      setQuizFinalizado(false)
    }

  // =========================================================
  // PROCEDIMIENTOS
  // =========================================================

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
      descripcion:
        'Preparación y administración segura',
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
            nombre:
              'Mascarilla con reservorio',
            flujo: '10–15 L/min',
            fio2: 'Aproximadamente 60–95%',
          },
        ],

        altoFlujo: [
          {
            nombre:
              'Mascarilla Venturi',
            flujo: 'Según adaptador',
            fio2: 'Aproximadamente 24–50%',
          },
          {
            nombre:
              'Cánula nasal de alto flujo',
            flujo:
              'Hasta aproximadamente 60 L/min',
            fio2: '21–100%',
          },
        ],
      },
    },
  ]

  // =========================================================
  // BÚSQUEDA GENERAL
  // =========================================================

  const resultadosGenerales = [
    ...medicamentos.map(
      (medicamento) => ({
        nombre:
          medicamento.nombre,
        descripcion:
          medicamento.grupo ||
          'Medicamento',
        icono: '💊',
        tipo: 'Medicamentos',
        pagina: 'medicamentos',
        dato: medicamento,
      })
    ),

    ...procedimientos.map(
      (procedimiento) => ({
        nombre:
          procedimiento.nombre,
        descripcion:
          procedimiento.descripcion,
        icono:
          procedimiento.icono,
        tipo: 'Procedimientos',
        pagina:
          'procedimientos',
        dato: procedimiento,
      })
    ),

    {
      nombre:
        'Calculadora de dosis',
      descripcion:
        'Cálculo de dosis, volumen y comprimidos',
      icono: '🧮',
      tipo: 'Herramientas',
      pagina: 'calculadora',
    },

    {
      nombre:
        'Calculadora de PAM',
      descripcion:
        'Presión arterial media',
      icono: '🩺',
      tipo: 'Herramientas',
      pagina: 'pam',
    },

    {
      nombre:
        'Calculadora de índice de masa corporal',
      descripcion:
        'Cálculo de IMC según peso y altura',
      icono: '⚖️',
      tipo: 'Herramientas',
      pagina: 'imc',
    },

    {
      nombre:
        'Cuestionarios',
      descripcion:
        'Practica por tema y mide tu resultado',
      icono: '📝',
      tipo: 'Estudio',
      pagina:
        'cuestionarios',
    },

    {
      nombre:
        'Mi progreso',
      descripcion:
        'Revisa tus resultados y avances',
      icono: '📈',
      tipo: 'Estudio',
      pagina: 'progreso',
    },

    {
      nombre: 'RCP',
      descripcion:
        'Reanimación cardiopulmonar',
      icono: '🚨',
      tipo: 'Urgencias',
      pagina: 'urgencias',
    },

    {
      nombre:
        'Manejo de emergencias',
      descripcion:
        'Evaluación y respuesta inicial',
      icono: '🚑',
      tipo: 'Urgencias',
      pagina: 'urgencias',
    },

    {
      nombre:
        'Entrega de turno',
      descripcion:
        'Comunicación y continuidad del cuidado',
      icono: '📋',
      tipo: 'Comunicación',
      pagina: 'turno',
    },

    {
      nombre: 'SBAR',
      descripcion:
        'Herramienta de comunicación clínica',
      icono: '🗣️',
      tipo: 'Comunicación',
      pagina: 'turno',
    },

    {
      nombre: 'EPOC',
      descripcion:
        'Enfermedad pulmonar obstructiva crónica',
      icono: '🫁',
      tipo: 'Guías',
      pagina: 'guias',
    },

    {
      nombre: 'Neumonía',
      descripcion:
        'Información general',
      icono: '🫁',
      tipo: 'Guías',
      pagina: 'guias',
    },

    {
      nombre: 'Asma',
      descripcion:
        'Información general',
      icono: '🫁',
      tipo: 'Guías',
      pagina: 'guias',
    },
  ]

  const resultadosFiltrados =
    resultadosGenerales.filter(
      (resultado) => {
        const texto =
          `${resultado.nombre} ${resultado.descripcion} ${resultado.tipo}`.toLowerCase()

        return texto.includes(
          busquedaGeneral.toLowerCase()
        )
      }
    )

  // =========================================================
  // MEDICAMENTOS FILTRADOS
  // =========================================================

  const gruposMedicamentos = [
    'Todos',
    ...new Set(
      medicamentos
        .map(
          (medicamento) =>
            medicamento.grupo
        )
        .filter(Boolean)
    ),
  ]

  const medicamentosFiltrados =
    medicamentos.filter(
      (medicamento) => {
        const coincideBusqueda =
          medicamento.nombre
            .toLowerCase()
            .includes(
              busquedaMedicamento.toLowerCase()
            )

        const coincideGrupo =
          filtroGrupo ===
            'Todos' ||
          medicamento.grupo ===
            filtroGrupo

        return (
          coincideBusqueda &&
          coincideGrupo
        )
      }
    )

  // =========================================================
  // PROCEDIMIENTOS FILTRADOS
  // =========================================================

  const procedimientosFiltrados =
    procedimientos.filter(
      (procedimiento) =>
        `${procedimiento.nombre} ${procedimiento.descripcion}`
          .toLowerCase()
          .includes(
            busquedaProcedimiento.toLowerCase()
          )
    )

  // =========================================================
  // USUARIO
  // =========================================================

  const nombreUsuario =
    usuarioSesion?.user_metadata
      ?.nombre ||
    usuarioSesion?.user_metadata
      ?.full_name ||
    usuarioSesion?.email?.split(
      '@'
    )[0] ||
    'Usuario'

  const correoUsuario =
    usuarioSesion?.email || ''

  // =========================================================
  // CARGANDO SESIÓN
  // =========================================================

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
                margin:
                  '0 auto 20px',
              }}
            />

            <h2>
              Cargando NurseAssist...
            </h2>
          </section>
        </main>
      </div>
    )
  }

  // =========================================================
  // RESET PASSWORD
  // =========================================================

  if (
    window.location.pathname ===
    '/reset-password'
  ) {
    return <ResetPassword />
  }

  // =========================================================
  // LOGIN
  // =========================================================

  if (!usuarioSesion) {
    return (
      <Login
        onLogin={(usuario) => {
          console.log(
            '✅ Login recibido en App:',
            usuario
          )

          setUsuarioSesion(
            usuario
          )

          setPagina('inicio')
        }}
      />
    )
  }

  // =========================================================
  // CALCULADORA DE DOSIS
  // =========================================================

  if (
    pagina ===
    'calculadora'
  ) {
    return (
      <CalculadoraDosis
        onVolver={() =>
          setPagina('inicio')
        }
      />
    )
  }

  // =========================================================
  // CALCULADORA PAM
  // =========================================================

  if (pagina === 'pam') {
    return (
      <CalculadoraPAM
        onVolver={() =>
          setPagina('inicio')
        }
      />
    )
  }

  // =========================================================
  // CALCULADORA IMC
  // =========================================================

  if (pagina === 'imc') {
    return (
      <CalculadoraIMC
        onVolver={() =>
          setPagina('inicio')
        }
      />
    )
  }

  // =========================================================
  // SIGNOS VITALES
  // =========================================================

  if (
    pagina ===
    'signosVitales'
  ) {
    return (
      <SignosVitales
        onVolver={() =>
          setPagina('inicio')
        }
      />
    )
  }

  // =========================================================
  // ENTREGA DE TURNO
  // =========================================================

  if (pagina === 'turno') {
    return (
      <EntregaTurno
        onVolver={() =>
          setPagina('inicio')
        }
      />
    )
  }

  // =========================================================
  // CUESTIONARIOS
  // =========================================================

  if (
    pagina ===
    'cuestionarios'
  ) {
    const preguntaActual =
      quizPreguntas[
        quizActual
      ]

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              📝 Cuestionarios
            </h1>

            <p>
              Practica y evalúa tus
              conocimientos
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setPagina('inicio')
            }
          >
            ← Volver
          </button>
        </header>

        <main className="content">

          {/* =================================================
              SELECCIÓN
              ================================================= */}

          {quizPreguntas.length ===
            0 && (
            <>
              <section className="welcome">
                <h2>
                  📚 Elige tu
                  cuestionario
                </h2>

                <p>
                  Selecciona el tema
                  y la cantidad de
                  preguntas que
                  quieres responder.
                </p>

                <p>
                  {cargandoPreguntas
                    ? '⏳ Cargando preguntas desde Supabase...'
                    : `📚 ${preguntasBancoSupabase.length} preguntas cargadas`}
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
                      setQuizTema(
                        e.target.value
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #ccc',
                      fontSize:
                        '16px',
                    }}
                  >
                    <option value="">
                      Selecciona un
                      tema
                    </option>

                    {temasQuiz.map(
                      (tema) => {
                        const disponibles =
                          tema ===
                          'Todos'
                            ? preguntasBancoSupabase.length
                            : preguntasBancoSupabase.filter(
                                (
                                  pregunta
                                ) =>
                                  pregunta.tema ===
                                    tema ||
                                  pregunta.tema ===
                                    'Todos'
                              ).length

                        return (
                          <option
                            key={tema}
                            value={tema}
                          >
                            {tema} (
                            {
                              disponibles
                            }{' '}
                            disponibles)
                          </option>
                        )
                      }
                    )}
                  </select>
                </div>

                <div
                  className="campo-login"
                  style={{
                    marginTop:
                      '20px',
                  }}
                >
                  <label htmlFor="cantidadQuiz">
                    Cantidad de
                    preguntas
                  </label>

                  <select
                    id="cantidadQuiz"
                    value={
                      quizCantidad
                    }
                    onChange={(e) =>
                      setQuizCantidad(
                        Number(
                          e.target.value
                        )
                      )
                    }
                    style={{
                      width: '100%',
                      padding: '12px',
                      borderRadius:
                        '8px',
                      border:
                        '1px solid #ccc',
                      fontSize:
                        '16px',
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
                    ].map(
                      (
                        cantidad
                      ) => (
                        <option
                          key={
                            cantidad
                          }
                          value={
                            cantidad
                          }
                        >
                          {cantidad}{' '}
                          preguntas
                        </option>
                      )
                    )}
                  </select>
                </div>

                <button
                  type="button"
                  className="boton-login"
                  onClick={
                    iniciarCuestionario
                  }
                  disabled={
                    cargandoPreguntas ||
                    preguntasBancoSupabase.length ===
                      0
                  }
                  style={{
                    marginTop:
                      '20px',
                  }}
                >
                  {cargandoPreguntas
                    ? '⏳ CARGANDO PREGUNTAS...'
                    : '▶️ COMENZAR CUESTIONARIO'}
                </button>
              </div>

              <section className="welcome">
                <h3>
                  💡 ¿Cómo funciona?
                </h3>

                <p>
                  Las preguntas se
                  seleccionan
                  aleatoriamente y no
                  se repiten dentro
                  del mismo
                  cuestionario.
                </p>

                <p>
                  Al terminar podrás
                  ver tu porcentaje y
                  guardar el resultado
                  en tu progreso.
                </p>
              </section>
            </>
          )}

          {/* =================================================
              PREGUNTA ACTUAL
              ================================================= */}

          {quizPreguntas.length >
            0 &&
            !quizFinalizado &&
            preguntaActual && (
              <>
                <section className="welcome">
                  <p>
                    Tema:{' '}
                    <strong>
                      {quizTema}
                    </strong>
                  </p>

                  <h2>
                    Pregunta{' '}
                    {quizActual + 1}{' '}
                    de{' '}
                    {
                      quizPreguntas.length
                    }
                  </h2>

                  <p>
                    Progreso:{' '}
                    {Math.round(
                      ((quizActual +
                        1) /
                        quizPreguntas.length) *
                        100
                    )}
                    %
                  </p>
                </section>

                <div className="medicamento-detalle">

                  <h3
                    style={{
                      fontSize:
                        '20px',
                      lineHeight:
                        '1.5',
                    }}
                  >
                    {
                      preguntaActual.pregunta
                    }
                  </h3>

                  <div
                    style={{
                      marginTop:
                        '20px',
                    }}
                  >
                    {Array.isArray(
                      preguntaActual.opciones
                    ) &&
                    preguntaActual
                      .opciones
                      .length > 0 ? (
                      preguntaActual.opciones.map(
                        (
                          opcion,
                          indice
                        ) => {
                          const seleccionada =
                            Number(
                              quizRespuesta
                            ) ===
                            Number(
                              indice
                            )

                          const correcta =
                            Number(
                              indice
                            ) ===
                            Number(
                              preguntaActual.correcta
                            )

                          let fondo =
                            '#ffffff'

                          let borde =
                            '1px solid #ccc'

                          if (
                            quizRespuesta !==
                              null &&
                            correcta
                          ) {
                            fondo =
                              '#dff6e4'

                            borde =
                              '2px solid #2e9d50'
                          } else if (
                            seleccionada
                          ) {
                            fondo =
                              '#ffe0e0'

                            borde =
                              '2px solid #d9534f'
                          }

                          return (
                            <button
                              key={`${preguntaActual.id}-${indice}`}
                              type="button"
                              onClick={() =>
                                responderPregunta(
                                  indice
                                )
                              }
                              disabled={
                                quizRespuesta !==
                                null
                              }
                              style={{
                                display:
                                  'block',
                                width:
                                  '100%',
                                textAlign:
                                  'left',
                                padding:
                                  '16px',
                                marginBottom:
                                  '12px',
                                borderRadius:
                                  '10px',
                                border:
                                  borde,
                                background:
                                  fondo,
                                cursor:
                                  quizRespuesta !==
                                  null
                                    ? 'default'
                                    : 'pointer',
                                fontSize:
                                  '16px',
                                fontWeight:
                                  seleccionada
                                    ? '700'
                                    : '400',
                                transition:
                                  'all 0.2s ease',
                                color:
                                  '#222',
                              }}
                            >
                              <strong>
                                {String.fromCharCode(
                                  65 +
                                    indice
                                )}
                                .
                              </strong>{' '}
                              {opcion}
                            </button>
                          )
                        }
                      )
                    ) : (
                      <div
                        className="detalle-item"
                        style={{
                          background:
                            '#fff3cd',
                          border:
                            '1px solid #ffeeba',
                          padding:
                            '15px',
                          borderRadius:
                            '10px',
                        }}
                      >
                        <p>
                          ⚠️ Esta pregunta
                          no tiene
                          opciones
                          disponibles.
                        </p>

                        <p
                          style={{
                            fontSize:
                              '13px',
                            color:
                              '#666',
                          }}
                        >
                          Revisa en
                          Supabase que la
                          columna
                          <strong>
                            {' '}
                            opciones
                          </strong>{' '}
                          contenga las
                          alternativas.
                        </p>
                      </div>
                    )}
                  </div>

                  {quizRespuesta !==
                    null && (
                    <div
                      className="detalle-item"
                      style={{
                        marginTop:
                          '20px',
                        padding:
                          '15px',
                        borderRadius:
                          '10px',
                      }}
                    >
                      {Number(
                        quizRespuesta
                      ) ===
                      Number(
                        preguntaActual.correcta
                      ) ? (
                        <p
                          style={{
                            color:
                              '#198754',
                            fontWeight:
                              '700',
                          }}
                        >
                          ✅{' '}
                          <strong>
                            ¡Correcto!
                          </strong>
                        </p>
                      ) : (
                        <p
                          style={{
                            color:
                              '#dc3545',
                            fontWeight:
                              '600',
                          }}
                        >
                          ❌{' '}
                          <strong>
                            Incorrecto
                          </strong>

                          <br />

                          <span
                            style={{
                              color:
                                '#333',
                              fontWeight:
                                '400',
                            }}
                          >
                            Respuesta
                            correcta:{' '}
                            <strong>
                              {preguntaActual
                                .opciones?.[
                                Number(
                                  preguntaActual.correcta
                                )
                              ] ??
                                'No disponible'}
                            </strong>
                          </span>
                        </p>
                      )}
                    </div>
                  )}

                  <button
                    type="button"
                    className="boton-login"
                    onClick={
                      siguientePregunta
                    }
                    disabled={
                      quizRespuesta ===
                      null
                    }
                    style={{
                      marginTop:
                        '20px',
                      width: '100%',
                      opacity:
                        quizRespuesta ===
                        null
                          ? 0.5
                          : 1,
                      cursor:
                        quizRespuesta ===
                        null
                          ? 'not-allowed'
                          : 'pointer',
                    }}
                  >
                    {quizActual + 1 ===
                    quizPreguntas.length
                      ? '🏁 FINALIZAR'
                      : 'SIGUIENTE →'}
                  </button>
                </div>
              </>
            )}

          {/* =================================================
              RESULTADO FINAL
              ================================================= */}

          {quizFinalizado && (
            <>
              <section className="welcome">
                <h2>
                  🎉 Cuestionario
                  terminado
                </h2>

                <p>
                  Tema:{' '}
                  <strong>
                    {quizTema}
                  </strong>
                </p>

                <p
                  style={{
                    fontSize:
                      '30px',
                    fontWeight:
                      '800',
                  }}
                >
                  {quizPuntaje}/
                  {
                    quizPreguntas.length
                  }
                </p>

                <p
                  style={{
                    fontSize:
                      '24px',
                    fontWeight:
                      '800',
                  }}
                >
                  {Math.round(
                    (quizPuntaje /
                      quizPreguntas.length) *
                      100
                  )}
                  %
                </p>

                <p>
                  {Math.round(
                    (quizPuntaje /
                      quizPreguntas.length) *
                      100
                  ) >= 70
                    ? '🎉 ¡Cuestionario aprobado!'
                    : '📚 Sigue practicando para mejorar tu resultado.'}
                </p>
              </section>

              <div className="medicamento-detalle">
                <div className="detalle-item">
                  <strong>
                    📊 Resultado
                  </strong>

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
                    {
                      quizPreguntas.length
                    }
                  </p>

                  <p>
                    Porcentaje:{' '}
                    {Math.round(
                      (quizPuntaje /
                        quizPreguntas.length) *
                        100
                    )}
                    %
                  </p>
                </div>

                <button
                  type="button"
                  className="boton-login"
                  onClick={
                    volverASeleccionQuiz
                  }
                >
                  🔄 HACER OTRO
                  CUESTIONARIO
                </button>

                <button
                  type="button"
                  className="back-button"
                  onClick={() =>
                    setPagina(
                      'progreso'
                    )
                  }
                  style={{
                    marginTop:
                      '12px',
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

  // =========================================================
  // PROGRESO
  // =========================================================

  if (
    pagina === 'progreso'
  ) {
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
            <h1>
              📈 Mi progreso
            </h1>

            <p>
              Resultados de tus
              cuestionarios
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setPagina('inicio')
            }
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>
              📊 Tu progreso
            </h2>

            <p>
              Tus resultados se
              guardan en tu cuenta
              de NurseAssist.
            </p>

            {cargandoProgreso && (
              <p>
                ⏳ Actualizando
                progreso...
              </p>
            )}
          </section>

          <div className="medicamento-detalle">
            <div className="detalle-item">
              <strong>
                📝 Intentos
              </strong>

              <p
                style={{
                  fontSize:
                    '26px',
                }}
              >
                {progreso.intentos}
              </p>
            </div>

            <div className="detalle-item">
              <strong>
                📊 Promedio
              </strong>

              <p
                style={{
                  fontSize:
                    '26px',
                }}
              >
                {promedio}%
              </p>
            </div>

            <div className="detalle-item">
              <strong>
                🏆 Mejor resultado
              </strong>

              <p
                style={{
                  fontSize:
                    '26px',
                }}
              >
                {
                  progreso.mejorPuntaje
                }
                %
              </p>
            </div>

            <div className="detalle-item">
              <strong>
                ❓ Preguntas
                respondidas
              </strong>

              <p
                style={{
                  fontSize:
                    '26px',
                }}
              >
                {
                  progreso.preguntasRespondidas
                }
              </p>
            </div>

            <div className="detalle-item">
              <strong>
                ✅ Cuestionarios
                aprobados
              </strong>

              <p
                style={{
                  fontSize:
                    '26px',
                }}
              >
                {
                  progreso.aprobados
                }
              </p>
            </div>
          </div>

          <section className="welcome">
            <h3>
              📚 Resultados por
              tema
            </h3>

            {Object.keys(
              progreso.resultadosPorTema
            ).length === 0 ? (
              <p>
                Todavía no tienes
                resultados
                registrados.
              </p>
            ) : (
              Object.entries(
                progreso.resultadosPorTema
              ).map(
                ([
                  tema,
                  resultado,
                ]) => (
                  <div
                    key={tema}
                    className="detalle-item"
                    style={{
                      marginTop:
                        '12px',
                    }}
                  >
                    <strong>
                      {tema}
                    </strong>

                    <p>
                      Intentos:{' '}
                      {
                        resultado.intentos
                      }
                    </p>

                    <p>
                      Mejor
                      resultado:{' '}
                      {
                        resultado.mejorPuntaje
                      }
                      %
                    </p>

                    <p>
                      Preguntas
                      respondidas:{' '}
                      {
                        resultado.preguntas
                      }
                    </p>
                  </div>
                )
              )
            )}
          </section>
        </main>
      </div>
    )
  }

  // =========================================================
  // PERFIL
  // =========================================================

  if (pagina === 'perfil') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              👤 Mi perfil
            </h1>

            <p>
              Cuenta de NurseAssist
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setPagina('inicio')
            }
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>
              Hola, {nombreUsuario}{' '}
              👋
            </h2>

            <p>
              {correoUsuario}
            </p>
          </section>

          <div className="medicamento-detalle">
            <div className="detalle-item">
              <strong>
                📧 Correo
              </strong>

              <p>
                {correoUsuario}
              </p>
            </div>

            <div className="detalle-item">
              <strong>
                📝 Cuestionarios
                realizados
              </strong>

              <p>
                {progreso.intentos}
              </p>
            </div>

            <div className="detalle-item">
              <strong>
                🏆 Mejor resultado
              </strong>

              <p>
                {
                  progreso.mejorPuntaje
                }
                %
              </p>
            </div>

            <button
              type="button"
              className="boton-login"
              onClick={() =>
                setPagina(
                  'progreso'
                )
              }
            >
              📈 VER MI PROGRESO
            </button>

            <button
              type="button"
              className="back-button"
              onClick={
                cerrarSesion
              }
              style={{
                marginTop:
                  '12px',
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

  // =========================================================
  // PROCEDIMIENTOS
  // =========================================================

  if (
    pagina ===
    'procedimientos'
  ) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              🩺 Procedimientos
            </h1>

            <p>
              Procedimientos de
              enfermería
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => {
              setPagina('inicio')

              setProcedimientoSeleccionado(
                null
              )
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
              value={
                busquedaProcedimiento
              }
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
                  key={
                    procedimiento.id
                  }
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
                    {
                      procedimiento.icono
                    }
                  </div>

                  <div>
                    <h3>
                      {
                        procedimiento.nombre
                      }
                    </h3>

                    <p>
                      {
                        procedimiento.descripcion
                      }
                    </p>
                  </div>
                </button>
              )
            )}
          </div>

          {procedimientoSeleccionado && (
            <div
              className="medicamento-detalle"
              style={{
                marginTop:
                  '20px',
              }}
            >
              <h2>
                {
                  procedimientoSeleccionado.icono
                }{' '}
                {
                  procedimientoSeleccionado.nombre
                }
              </h2>

              <div className="detalle-item">
                <strong>
                  🎯 Objetivo
                </strong>

                <p>
                  {
                    procedimientoSeleccionado.objetivo
                  }
                </p>
              </div>

              <div className="detalle-item">
                <strong>
                  🧰 Materiales
                </strong>

                <ul>
                  {procedimientoSeleccionado.materiales.map(
                    (material) => (
                      <li
                        key={
                          material
                        }
                      >
                        {material}
                      </li>
                    )
                  )}
                </ul>
              </div>

              <div className="detalle-item">
                <strong>
                  📋 Procedimiento
                </strong>

                <p>
                  {
                    procedimientoSeleccionado.procedimiento
                  }
                </p>
              </div>

              <div className="detalle-item">
                <strong>
                  🔢 Pasos
                </strong>

                <ol>
                  {procedimientoSeleccionado.pasos.map(
                    (paso) => (
                      <li
                        key={paso}
                      >
                        {paso}
                      </li>
                    )
                  )}
                </ol>
              </div>

              <div className="detalle-item">
                <strong>
                  ⚠️ Consideraciones
                </strong>

                <ul>
                  {procedimientoSeleccionado.consideraciones.map(
                    (
                      consideracion
                    ) => (
                      <li
                        key={
                          consideracion
                        }
                      >
                        {
                          consideracion
                        }
                      </li>
                    )
                  )}
                </ul>
              </div>

              {procedimientoSeleccionado.sistemas && (
                <>
                  <div className="detalle-item">
                    <strong>
                      🫁 Sistemas de
                      oxigenoterapia
                    </strong>

                    <h4>
                      Bajo flujo
                    </h4>

                    <div
                      style={{
                        overflowX:
                          'auto',
                      }}
                    >
                      <table
                        style={{
                          width:
                            '100%',
                          borderCollapse:
                            'collapse',
                        }}
                      >
                        <thead>
                          <tr>
                            <th>
                              Dispositivo
                            </th>

                            <th>
                              Flujo
                            </th>

                            <th>
                              FiO₂
                              aprox.
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {procedimientoSeleccionado.sistemas.bajoFlujo.map(
                            (
                              sistema
                            ) => (
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
                        marginTop:
                          '20px',
                      }}
                    >
                      Alto flujo
                    </h4>

                    <div
                      style={{
                        overflowX:
                          'auto',
                      }}
                    >
                      <table
                        style={{
                          width:
                            '100%',
                          borderCollapse:
                            'collapse',
                        }}
                      >
                        <thead>
                          <tr>
                            <th>
                              Dispositivo
                            </th>

                            <th>
                              Flujo
                            </th>

                            <th>
                              FiO₂
                              aprox.
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {procedimientoSeleccionado.sistemas.altoFlujo.map(
                            (
                              sistema
                            ) => (
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

  // =========================================================
  // MEDICAMENTOS
  // =========================================================

  if (
    pagina ===
    'medicamentos'
  ) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              💊 Medicamentos
            </h1>

            <p>
              Información
              farmacológica
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => {
              setPagina('inicio')

              setMedicamentoSeleccionado(
                null
              )
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
              value={
                busquedaMedicamento
              }
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
              marginBottom:
                '20px',
            }}
          >
            {gruposMedicamentos.map(
              (grupo) => (
                <button
                  type="button"
                  key={grupo}
                  onClick={() =>
                    setFiltroGrupo(
                      grupo
                    )
                  }
                  className={
                    filtroGrupo ===
                    grupo
                      ? 'boton-login'
                      : 'back-button'
                  }
                >
                  {grupo}
                </button>
              )
            )}
          </div>

          <div className="cards-grid">
            {medicamentosFiltrados.map(
              (medicamento) => (
                <button
                  type="button"
                  key={
                    medicamento.nombre
                  }
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
                      {
                        medicamento.nombre
                      }
                    </h3>

                    <p>
                      {
                        medicamento.grupo ||
                        'Medicamento'
                      }
                    </p>
                  </div>
                </button>
              )
            )}
          </div>

          {medicamentosFiltrados.length ===
            0 && (
            <section className="welcome">
              <h3>
                No encontramos
                medicamentos
              </h3>

              <p>
                Prueba con otro
                nombre o grupo.
              </p>
            </section>
          )}

          {medicamentoSeleccionado && (
            <div
              className="medicamento-detalle"
              style={{
                marginTop:
                  '20px',
              }}
            >
              <h2>
                💊{' '}
                {
                  medicamentoSeleccionado.nombre
                }
              </h2>

              <div className="detalle-item">
                <strong>
                  Grupo
                </strong>

                <p>
                  {
                    medicamentoSeleccionado.grupo
                  }
                </p>
              </div>

              {medicamentoSeleccionado.uso && (
                <div className="detalle-item">
                  <strong>
                    Uso
                  </strong>

                  <p>
                    {
                      medicamentoSeleccionado.uso
                    }
                  </p>
                </div>
              )}

              {medicamentoSeleccionado.mecanismo && (
                <div className="detalle-item">
                  <strong>
                    Mecanismo
                  </strong>

                  <p>
                    {
                      medicamentoSeleccionado.mecanismo
                    }
                  </p>
                </div>
              )}

              {medicamentoSeleccionado.indicaciones && (
                <div className="detalle-item">
                  <strong>
                    Indicaciones
                  </strong>

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
                    Reacciones
                    adversas
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
                    Reacciones
                    adversas
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

  // =========================================================
  // URGENCIAS
  // =========================================================

  if (
    pagina === 'urgencias'
  ) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              🚨 Urgencias
            </h1>

            <p>
              Atención inicial y
              emergencias
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setPagina('inicio')
            }
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>
              🚨 Urgencias
            </h2>

            <p>
              Sección destinada a
              contenidos de
              evaluación inicial,
              emergencias y
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
                  Reanimación
                  cardiopulmonar
                </p>
              </div>
            </div>

            <div className="medicamento-card">
              <div className="card-icon">
                🚑
              </div>

              <div>
                <h3>
                  Emergencias
                </h3>

                <p>
                  Evaluación y
                  respuesta
                  inicial
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // =========================================================
  // GUÍAS
  // =========================================================

  if (pagina === 'guias') {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              📚 Guías
            </h1>

            <p>
              Consulta rápida
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setPagina('inicio')
            }
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
                  Enfermedad
                  pulmonar
                  obstructiva
                  crónica
                </p>
              </div>
            </div>

            <div className="medicamento-card">
              <div className="card-icon">
                🫁
              </div>

              <div>
                <h3>
                  Neumonía
                </h3>

                <p>
                  Información
                  general
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
                  Información
                  general
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // =========================================================
  // FAVORITOS
  // =========================================================

  if (
    pagina === 'favoritos'
  ) {
    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              ⭐ Guardados
            </h1>

            <p>
              Tus contenidos
              favoritos
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setPagina('inicio')
            }
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>
              ⭐ Guardados
            </h2>

            <p>
              Aquí podrás acceder
              a tus contenidos
              guardados.
            </p>
          </section>
        </main>
      </div>
    )
  }

  // =========================================================
  // INICIO
  // =========================================================

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>
            🩺 NurseAssist
          </h1>

          <p>
            Tu asistente de
            enfermería
          </p>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() =>
            setPagina('perfil')
          }
        >
          👤
        </button>
      </header>

      <main className="content">
        <section className="welcome">
          <h2>
            Hola, {nombreUsuario}{' '}
            👋
          </h2>

          <p>
            ¿Qué necesitas
            consultar hoy?
          </p>
        </section>

        <div className="search">
          <input
            type="text"
            placeholder="🔎 Buscar medicamentos, procedimientos, guías..."
            value={
              busquedaGeneral
            }
            onChange={(e) =>
              setBusquedaGeneral(
                e.target.value
              )
            }
          />
        </div>

        {busquedaGeneral.trim() !==
          '' && (
          <section
            className="medicamento-detalle"
            style={{
              marginBottom:
                '20px',
            }}
          >
            <h3>
              Resultados de
              búsqueda
            </h3>

            {resultadosFiltrados.length ===
            0 ? (
              <p>
                No encontramos
                resultados.
              </p>
            ) : (
              resultadosFiltrados
                .slice(0, 12)
                .map(
                  (
                    resultado
                  ) => (
                    <button
                      type="button"
                      key={`${resultado.tipo}-${resultado.nombre}`}
                      className="medicamento-card"
                      style={{
                        width:
                          '100%',
                        marginBottom:
                          '10px',
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

                        setBusquedaGeneral(
                          ''
                        )
                      }}
                    >
                      <div className="card-icon">
                        {
                          resultado.icono
                        }
                      </div>

                      <div>
                        <h3>
                          {
                            resultado.nombre
                          }
                        </h3>

                        <p>
                          {
                            resultado.tipo
                          }{' '}
                          ·{' '}
                          {
                            resultado.descripcion
                          }
                        </p>
                      </div>
                    </button>
                  )
                )
            )}
          </section>
        )}

        <section className="welcome">
          <h2>
            ⚡ Acceso rápido
          </h2>
        </section>

        <div className="cards-grid">
          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina(
                'medicamentos'
              )
            }
          >
            <div className="card-icon">
              💊
            </div>

            <div>
              <h3>
                Medicamentos
              </h3>

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
              setPagina(
                'calculadora'
              )
            }
          >
            <div className="card-icon">
              🧮
            </div>

            <div>
              <h3>
                Calculadora de
                dosis
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
                Calculadora de
                PAM
              </h3>

              <p>
                Presión arterial
                media
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
                Calculadora de
                IMC
              </h3>

              <p>
                Índice de masa
                corporal
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina(
                'cuestionarios'
              )
            }
          >
            <div className="card-icon">
              📝
            </div>

            <div>
              <h3>
                Cuestionarios
              </h3>

              <p>
                Practica por tema
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina(
                'progreso'
              )
            }
          >
            <div className="card-icon">
              📈
            </div>

            <div>
              <h3>
                Mi progreso
              </h3>

              <p>
                Revisa tus
                resultados
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina(
                'urgencias'
              )
            }
          >
            <div className="card-icon">
              🚨
            </div>

            <div>
              <h3>
                Urgencias
              </h3>

              <p>
                Emergencias y
                atención inicial
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
                Comunicación
                clínica
              </p>
            </div>
          </button>

          <button
            type="button"
            className="medicamento-card"
            onClick={() =>
              setPagina(
                'procedimientos'
              )
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
              setPagina(
                'guias'
              )
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
              setPagina(
                'favoritos'
              )
            }
          >
            <div className="card-icon">
              ⭐
            </div>

            <div>
              <h3>
                Guardados
              </h3>

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
          justifyContent:
            'space-around',
          alignItems: 'center',
          padding: '12px',
          borderTop:
            '1px solid #ddd',
          position: 'sticky',
          bottom: 0,
          background: '#fff',
          marginTop: '20px',
        }}
      >
        <button
          type="button"
          className="back-button"
          onClick={() =>
            setPagina('inicio')
          }
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
            setPagina(
              'favoritos'
            )
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