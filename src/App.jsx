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

  const preguntas = [
    {
      id: 1,
      tema: 'Signos vitales',
      pregunta:
        '¿Cuál de los siguientes corresponde a un signo vital?',
      opciones: [
        'Presión arterial',
        'Peso',
        'Talla',
        'Perímetro abdominal',
      ],
      correcta: 0,
    },

    {
      id: 2,
      tema: 'Higiene de manos',
      pregunta:
        '¿Cuál es uno de los objetivos principales de la higiene de manos?',
      opciones: [
        'Aumentar la temperatura corporal',
        'Prevenir la transmisión de microorganismos',
        'Disminuir la presión arterial',
        'Aumentar la frecuencia cardíaca',
      ],
      correcta: 1,
    },

    {
      id: 3,
      tema: 'Medicamentos',
      pregunta:
        'Antes de administrar un medicamento se debe verificar principalmente:',
      opciones: [
        'El color de la habitación',
        'La indicación, paciente, medicamento, dosis, vía y horario',
        'La temperatura exterior',
        'El peso del equipo clínico',
      ],
      correcta: 1,
    },

    {
      id: 4,
      tema: 'Glicemia',
      pregunta:
        '¿Qué equipo se utiliza habitualmente para medir la glicemia capilar?',
      opciones: [
        'Tensiómetro',
        'Glucómetro',
        'Termómetro',
        'Fonendoscopio',
      ],
      correcta: 1,
    },

    {
      id: 5,
      tema: 'Oxigenoterapia',
      pregunta:
        'La administración de oxígeno debe realizarse:',
      opciones: [
        'Siempre al máximo flujo posible',
        'Según indicación y protocolo correspondiente',
        'Sin controlar la saturación',
        'Sin evaluar al paciente',
      ],
      correcta: 1,
    },

    {
      id: 6,
      tema: 'Curaciones',
      pregunta:
        'Durante una curación se debe observar especialmente:',
      opciones: [
        'Signos de infección y características de la herida',
        'El color de las paredes',
        'La temperatura del ambiente solamente',
        'La talla del paciente',
      ],
      correcta: 0,
    },

    {
      id: 7,
      tema: 'Seguridad',
      pregunta:
        'Ante una duda respecto a una indicación de medicamento, lo correcto es:',
      opciones: [
        'Administrarlo igualmente',
        'Cambiar la dosis',
        'Verificar la indicación antes de administrar',
        'Preguntar al paciente qué dosis desea',
      ],
      correcta: 2,
    },

    {
      id: 8,
      tema: 'Oxigenoterapia',
      pregunta:
        '¿Cuál es aproximadamente la concentración de oxígeno del aire ambiental?',
      opciones: [
        '10%',
        '21%',
        '50%',
        '100%',
      ],
      correcta: 1,
    },

    {
      id: 9,
      tema: 'Procedimientos',
      pregunta:
        'Una vez finalizado un procedimiento clínico, es importante:',
      opciones: [
        'No registrar nada',
        'Registrar la atención y los hallazgos correspondientes',
        'Eliminar todos los registros',
        'Esperar varios días para registrar',
      ],
      correcta: 1,
    },

    {
      id: 10,
      tema: 'Paciente',
      pregunta:
        'Antes de realizar un procedimiento se debe:',
      opciones: [
        'Identificar correctamente al paciente',
        'Evitar explicar el procedimiento',
        'Omitir la higiene de manos',
        'Comenzar inmediatamente',
      ],
      correcta: 0,
    },
  ]

  const [preguntaActual, setPreguntaActual] = useState(0)
  const [respuestasQuiz, setRespuestasQuiz] = useState([])
  const [quizTerminado, setQuizTerminado] = useState(false)

  const [historialQuiz, setHistorialQuiz] = useState(() => {
    try {
      const guardado = localStorage.getItem(
        'nurseassist_historial_quiz'
      )

      return guardado ? JSON.parse(guardado) : []
    } catch {
      return []
    }
  })

  // =========================================================
  // SESIÓN SUPABASE
  // =========================================================

  useEffect(() => {
    let activo = true

    const cargarSesion = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (activo) {
        setUsuarioSesion(session?.user ?? null)
        setCargandoSesion(false)
      }
    }

    cargarSesion()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (activo) {
          setUsuarioSesion(session?.user ?? null)
        }
      }
    )

    return () => {
      activo = false
      subscription.unsubscribe()
    }
  }, [])

  // =========================================================
  // GUARDAR HISTORIAL
  // =========================================================

  useEffect(() => {
    localStorage.setItem(
      'nurseassist_historial_quiz',
      JSON.stringify(historialQuiz)
    )
  }, [historialQuiz])

  // =========================================================
  // CERRAR SESIÓN
  // =========================================================

  const cerrarSesion = async () => {
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error('Error al cerrar sesión:', error)
      return
    }

    setUsuarioSesion(null)
    setPagina('inicio')
    setBusquedaGeneral('')
    setMedicamentoSeleccionado(null)
    setProcedimientoSeleccionado(null)
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
        'Reducir la presencia de microorganismos en las manos y prevenir la transmisión de infecciones.',

      materiales:
        'Agua corriente, jabón líquido, toalla desechable y contenedor para residuos.',

      procedimiento:
        'Realizar higiene de manos siguiendo la técnica establecida y respetando el tiempo recomendado.',

      pasos: [
        'Mojar las manos.',
        'Aplicar jabón.',
        'Frotar palmas, dorsos y espacios interdigitales.',
        'Limpiar pulgares, uñas y muñecas.',
        'Enjuagar completamente.',
        'Secar con toalla desechable.',
      ],

      consideraciones:
        'Retirar anillos, pulseras y otros accesorios antes de realizar el procedimiento.',
    },

    {
      id: 'medicamentos',
      icono: '💉',
      nombre: 'Administración de medicamentos',
      descripcion: 'Preparación y administración segura',

      objetivo:
        'Administrar medicamentos de forma segura, verificando la indicación y las condiciones del paciente.',

      materiales:
        'Medicamento indicado, bandeja, jeringa o dispositivo correspondiente y elementos necesarios para la administración.',

      procedimiento:
        'Verificar la indicación, preparar el medicamento utilizando técnica segura y administrar por la vía indicada.',

      pasos: [
        'Verificar la indicación del medicamento.',
        'Identificar correctamente al paciente.',
        'Comprobar medicamento, dosis, vía y horario.',
        'Realizar higiene de manos.',
        'Preparar el medicamento con técnica segura.',
        'Administrar según la vía indicada.',
        'Observar la respuesta del paciente.',
        'Registrar la administración.',
      ],

      consideraciones:
        'Ante cualquier duda sobre la indicación, medicamento, dosis o vía de administración, verificar antes de administrar.',
    },

    {
      id: 'glicemia',
      icono: '🩸',
      nombre: 'Glicemia capilar',
      descripcion: 'Control de glucosa',

      objetivo:
        'Obtener una medición de glucosa capilar para evaluar el nivel de glucemia del paciente.',

      materiales:
        'Glucómetro, tira reactiva, lanceta, guantes y contenedor para material cortopunzante.',

      procedimiento:
        'Realizar la medición de glucosa capilar utilizando técnica segura y registrando el resultado obtenido.',

      pasos: [
        'Realizar higiene de manos.',
        'Preparar el glucómetro y la tira reactiva.',
        'Colocarse guantes.',
        'Seleccionar el sitio de punción.',
        'Realizar la punción.',
        'Obtener la muestra.',
        'Aplicar la muestra en la tira reactiva.',
        'Leer y registrar el resultado.',
        'Eliminar la lanceta correctamente.',
      ],

      consideraciones:
        'Realizar el procedimiento según el protocolo institucional y las instrucciones del equipo utilizado.',
    },

    {
      id: 'signos',
      icono: '❤️',
      nombre: 'Signos vitales',
      descripcion: 'Control y registro',

      objetivo:
        'Evaluar parámetros fisiológicos básicos del paciente y detectar cambios en su condición.',

      materiales:
        'Termómetro, tensiómetro, fonendoscopio, reloj con segundero y oxímetro de pulso según corresponda.',

      procedimiento:
        'Medir y registrar los signos vitales utilizando una técnica adecuada para cada parámetro.',

      pasos: [
        'Realizar higiene de manos.',
        'Explicar el procedimiento al paciente.',
        'Medir temperatura.',
        'Medir frecuencia cardíaca.',
        'Medir frecuencia respiratoria.',
        'Medir presión arterial.',
        'Medir saturación de oxígeno cuando corresponda.',
        'Registrar los valores obtenidos.',
      ],

      consideraciones:
        'Registrar los valores correctamente e informar oportunamente cualquier alteración.',
    },

    {
      id: 'curacion',
      icono: '🩹',
      nombre: 'Curación de heridas',
      descripcion: 'Procedimiento de curación',

      objetivo:
        'Favorecer la limpieza y protección de una herida, disminuyendo el riesgo de infección.',

      materiales:
        'Guantes, material estéril o limpio según técnica, solución indicada, gasas y apósitos.',

      procedimiento:
        'Realizar la curación utilizando la técnica correspondiente y manteniendo las medidas de prevención de infecciones.',

      pasos: [
        'Realizar higiene de manos.',
        'Preparar el material.',
        'Identificar al paciente.',
        'Explicar el procedimiento.',
        'Retirar el apósito anterior.',
        'Observar las características de la herida.',
        'Realizar la limpieza según protocolo.',
        'Colocar el apósito correspondiente.',
        'Eliminar los residuos correctamente.',
        'Registrar el procedimiento.',
      ],

      consideraciones:
        'Observar signos de infección, cambios en la herida o cualquier alteración.',
    },

    {
      id: 'oxigenoterapia',
      icono: '🫁',
      nombre: 'Oxigenoterapia',
      descripcion: 'Administración de oxígeno',

      objetivo:
        'Administrar oxígeno suplementario para aumentar la disponibilidad de oxígeno en la sangre y los tejidos.',

      materiales:
        'Fuente de oxígeno, flujómetro, humidificador cuando corresponda, dispositivo de administración indicado y elementos de protección personal según el procedimiento.',

      procedimiento:
        'Administrar oxígeno según indicación médica, utilizando el dispositivo correspondiente y verificando continuamente la respuesta clínica del paciente.',

      pasos: [
        'Verificar la indicación médica y el dispositivo indicado.',
        'Realizar higiene de manos.',
        'Evaluar saturación de oxígeno, frecuencia respiratoria y estado general del paciente.',
        'Preparar y revisar el sistema de oxígeno.',
        'Seleccionar el dispositivo de administración correspondiente.',
        'Conectar correctamente el dispositivo a la fuente de oxígeno.',
        'Regular el flujo según la indicación médica.',
        'Colocar el dispositivo correctamente al paciente.',
        'Comprobar la respuesta del paciente y controlar la saturación de oxígeno.',
        'Observar posibles molestias, irritación o lesiones por presión.',
        'Registrar el dispositivo utilizado, flujo administrado, saturación y respuesta del paciente.',
      ],

      consideraciones:
        'El oxígeno debe administrarse según indicación médica y protocolo institucional. No modificar el flujo por iniciativa propia. Mantener el oxígeno alejado de fuego, calor, chispas y otras fuentes de ignición.',

      sistemasBajoFlujo: [
        {
          dispositivo: 'Naricera',
          flujo: '1–6 L/min',
          fio2: '24–44% aproximadamente',
        },
        {
          dispositivo: 'Mascarilla simple',
          flujo: '5–10 L/min',
          fio2: '35–60% aproximadamente',
        },
        {
          dispositivo: 'Mascarilla con reservorio',
          flujo: '10–15 L/min',
          fio2: '60–95% aproximadamente',
        },
      ],

      sistemasAltoFlujo: [
        {
          dispositivo: 'Mascarilla Venturi',
          flujo: 'Según adaptador',
          fio2: '24–50% aproximadamente',
        },
        {
          dispositivo: 'Cánula nasal de alto flujo',
          flujo: 'Hasta 60 L/min aproximadamente',
          fio2: '21–100%',
        },
      ],

      cuidados: [
        'Verificar la indicación médica antes de administrar oxígeno.',
        'Realizar higiene de manos antes y después del procedimiento.',
        'Controlar saturación de oxígeno y frecuencia respiratoria.',
        'Evaluar el estado general y la respuesta del paciente.',
        'Comprobar que el sistema esté correctamente conectado.',
        'Verificar que el flujo corresponda a la indicación.',
        'Revisar nariz, orejas y cara para detectar irritación o lesiones por presión.',
        'Mantener la vía aérea permeable y favorecer una posición adecuada.',
        'Mantener los dispositivos limpios y en buenas condiciones.',
        'Mantener el oxígeno alejado de fuego, calor, chispas y fuentes de ignición.',
        'No modificar el flujo sin indicación.',
        'Observar signos de deterioro respiratorio.',
        'Registrar dispositivo, flujo, saturación y respuesta del paciente.',
        'Informar oportunamente cualquier cambio en la condición clínica.',
      ],
    },
  ]

  // =========================================================
  // BÚSQUEDA GENERAL
  // =========================================================

  const resultadosGenerales = [
    ...medicamentos.map((medicamento) => ({
      nombre: medicamento.nombre,
      descripcion: medicamento.grupo || 'Medicamento',
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
      descripcion: 'Practica y comprueba tus conocimientos',
      icono: '🧠',
      tipo: 'Evaluación',
      pagina: 'cuestionarios',
    },

    {
      nombre: 'Mi progreso',
      descripcion: 'Revisa tus puntajes y resultados',
      icono: '🏆',
      tipo: 'Evaluación',
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
      icono: '🚨',
      tipo: 'Urgencias',
      pagina: 'urgencias',
    },

    {
      nombre: 'Entrega de turno',
      descripcion: 'Organización de información clínica',
      icono: '📋',
      tipo: 'Entrega de turno',
      pagina: 'turno',
    },

    {
      nombre: 'SBAR',
      descripcion: 'Comunicación estructurada',
      icono: '📋',
      tipo: 'Entrega de turno',
      pagina: 'turno',
    },

    {
      nombre: 'EPOC',
      descripcion: 'Enfermedad pulmonar obstructiva crónica',
      icono: '📚',
      tipo: 'Guías',
      pagina: 'guias',
    },

    {
      nombre: 'Neumonía',
      descripcion: 'Guía de estudio',
      icono: '📚',
      tipo: 'Guías',
      pagina: 'guias',
    },

    {
      nombre: 'Asma',
      descripcion: 'Guía de estudio',
      icono: '📚',
      tipo: 'Guías',
      pagina: 'guias',
    },

    {
      nombre: 'Mis favoritos',
      descripcion: 'Contenidos guardados',
      icono: '⭐',
      tipo: 'Favoritos',
      pagina: 'favoritos',
    },
  ]

  const resultadosFiltrados =
    busquedaGeneral.trim() === ''
      ? []
      : resultadosGenerales.filter((resultado) => {
          const texto =
            resultado.nombre +
            ' ' +
            resultado.descripcion +
            ' ' +
            resultado.tipo

          return texto
            .toLowerCase()
            .includes(busquedaGeneral.toLowerCase())
        })

  // =========================================================
  // DATOS USUARIO
  // =========================================================

  const nombreUsuario =
    usuarioSesion?.user_metadata?.nombre ||
    usuarioSesion?.user_metadata?.full_name ||
    usuarioSesion?.email?.split('@')[0] ||
    'Usuario'

  const correoUsuario = usuarioSesion?.email || ''

  // =========================================================
  // FUNCIONES CUESTIONARIO
  // =========================================================

  const iniciarQuiz = () => {
    setPreguntaActual(0)
    setRespuestasQuiz([])
    setQuizTerminado(false)
    setPagina('cuestionarios')
  }

  const responderPregunta = (indiceRespuesta) => {
    const nuevasRespuestas = [
      ...respuestasQuiz,
      indiceRespuesta,
    ]

    setRespuestasQuiz(nuevasRespuestas)

    if (preguntaActual === preguntas.length - 1) {
      const correctas = nuevasRespuestas.filter(
        (respuesta, index) =>
          respuesta === preguntas[index].correcta
      ).length

      const porcentaje = Math.round(
        (correctas / preguntas.length) * 100
      )

      const nuevoResultado = {
        fecha: new Date().toLocaleString('es-CL'),
        correctas,
        total: preguntas.length,
        porcentaje,
      }

      setHistorialQuiz((actual) => [
        nuevoResultado,
        ...actual,
      ])

      setQuizTerminado(true)
    } else {
      setPreguntaActual((actual) => actual + 1)
    }
  }

  const obtenerNivel = (porcentaje) => {
    if (porcentaje < 60) return '🔴 Necesita reforzar'
    if (porcentaje < 70) return '🟠 En progreso'
    if (porcentaje < 80) return '🟡 Aceptable'
    if (porcentaje < 90) return '🟢 Buen dominio'
    return '🏆 Dominio excelente'
  }

  // =========================================================
  // CARGANDO
  // =========================================================

  if (cargandoSesion) {
    return (
      <div className="app">
        <main className="content">
          <section className="welcome">
            <img
              src="/log app nurseassit.jpeg"
              alt="Logo de NurseAssist"
              className="logo-nurseassist"
            />

            <h2>⏳ Cargando NurseAssist...</h2>

            <p>
              Estamos comprobando tu sesión.
            </p>
          </section>
        </main>
      </div>
    )
  }

  // =========================================================
  // RECUPERACIÓN DE CONTRASEÑA
  // =========================================================

  if (window.location.pathname === '/reset-password') {
    return <ResetPassword />
  }

  // =========================================================
  // LOGIN
  // =========================================================

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

  // =========================================================
  // CALCULADORA DOSIS
  // =========================================================

  if (pagina === 'calculadora') {
    return (
      <div className="app">
        <CalculadoraDosis
          onVolver={() => setPagina('inicio')}
        />
      </div>
    )
  }

  // =========================================================
  // CALCULADORA PAM
  // =========================================================

  if (pagina === 'pam') {
    return (
      <div className="app">
        <CalculadoraPAM
          onVolver={() => setPagina('inicio')}
        />
      </div>
    )
  }

  // =========================================================
  // CALCULADORA IMC
  // =========================================================

  if (pagina === 'imc') {
    return (
      <div className="app">
        <CalculadoraIMC
          onVolver={() => setPagina('inicio')}
        />
      </div>
    )
  }

  // =========================================================
  // SIGNOS VITALES
  // =========================================================

  if (pagina === 'signosVitales') {
    return (
      <div className="app">
        <SignosVitales
          onVolver={() => {
            setProcedimientoSeleccionado(null)
            setBusquedaProcedimiento('')
            setPagina('procedimientos')
          }}
        />
      </div>
    )
  }

  // =========================================================
  // ENTREGA DE TURNO
  // =========================================================

  if (pagina === 'turno') {
    return (
      <div className="app">
        <EntregaTurno
          onVolver={() => setPagina('inicio')}
        />
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
            <h1>👤 Mi perfil</h1>
            <p>Cuenta de NurseAssist</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Volver al inicio
          </button>
        </header>

        <main className="content">
          <section className="perfil-container">
            <img
              src="/log app nurseassit.jpeg"
              alt="Logo de NurseAssist"
              className="logo-nurseassist"
            />

            <h2>👋 Hola, {nombreUsuario}</h2>

            <p className="perfil-subtitulo">
              Has iniciado sesión en NurseAssist.
            </p>

            <div className="perfil-info">
              <div className="detalle-item">
                <strong>👤 Nombre</strong>
                <p>{nombreUsuario}</p>
              </div>

              <div className="detalle-item">
                <strong>📧 Correo electrónico</strong>
                <p>{correoUsuario}</p>
              </div>
            </div>

            <button
              type="button"
              className="boton-perfil"
              onClick={cerrarSesion}
            >
              CERRAR SESIÓN
            </button>
          </section>
        </main>
      </div>
    )
  }

  // =========================================================
  // CUESTIONARIOS
  // =========================================================

  if (pagina === 'cuestionarios') {
    if (quizTerminado) {
      const correctas = respuestasQuiz.filter(
        (respuesta, index) =>
          respuesta === preguntas[index].correcta
      ).length

      const porcentaje = Math.round(
        (correctas / preguntas.length) * 100
      )

      return (
        <div className="app">
          <header className="header">
            <div>
              <h1>🧠 Cuestionario</h1>
              <p>Resultado</p>
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
              <h2>🎉 Cuestionario terminado</h2>

              <p
                style={{
                  fontSize: '42px',
                  fontWeight: '800',
                  margin: '20px 0',
                }}
              >
                {porcentaje}%
              </p>

              <p>
                <strong>
                  {correctas} correctas
                </strong>{' '}
                de {preguntas.length}
              </p>

              <p
                style={{
                  fontSize: '22px',
                  fontWeight: '700',
                }}
              >
                {obtenerNivel(porcentaje)}
              </p>
            </section>

            <div className="medicamento-detalle">
              <div className="detalle-item">
                <strong>📊 Resultado</strong>

                <p>
                  Respondiste correctamente {correctas} de{' '}
                  {preguntas.length} preguntas.
                </p>
              </div>

              <button
                type="button"
                className="boton-login"
                onClick={iniciarQuiz}
              >
                🔄 INTENTAR NUEVAMENTE
              </button>

              <button
                type="button"
                className="back-button"
                style={{
                  width: '100%',
                  marginTop: '12px',
                }}
                onClick={() => setPagina('progreso')}
              >
                🏆 VER MI PROGRESO
              </button>
            </div>
          </main>
        </div>
      )
    }

    const pregunta = preguntas[preguntaActual]

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>🧠 Cuestionarios</h1>
            <p>
              Pregunta {preguntaActual + 1} de{' '}
              {preguntas.length}
            </p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => setPagina('inicio')}
          >
            ← Salir
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>{pregunta.tema}</h2>

            <p>
              Comprueba tus conocimientos.
            </p>
          </section>

          <div className="medicamento-detalle">
            <h2>{pregunta.pregunta}</h2>

            <div
              style={{
                display: 'grid',
                gap: '12px',
                marginTop: '20px',
              }}
            >
              {pregunta.opciones.map(
                (opcion, index) => (
                  <button
                    key={opcion}
                    type="button"
                    className="card"
                    onClick={() =>
                      responderPregunta(index)
                    }
                  >
                    <strong>
                      {String.fromCharCode(65 + index)}.{' '}
                      {opcion}
                    </strong>
                  </button>
                )
              )}
            </div>
          </div>
        </main>
      </div>
    )
  }

  // =========================================================
  // PROGRESO
  // =========================================================

  if (pagina === 'progreso') {
    const promedio =
      historialQuiz.length > 0
        ? Math.round(
            historialQuiz.reduce(
              (total, resultado) =>
                total + resultado.porcentaje,
              0
            ) / historialQuiz.length
          )
        : 0

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>🏆 Mi progreso</h1>
            <p>Tus resultados en NurseAssist</p>
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

            <p
              style={{
                fontSize: '36px',
                fontWeight: '800',
              }}
            >
              {promedio}%
            </p>

            <p>
              Promedio general
            </p>

            <p
              style={{
                fontSize: '20px',
                fontWeight: '700',
              }}
            >
              {obtenerNivel(promedio)}
            </p>
          </section>

          <div className="medicamento-detalle">
            <div className="detalle-item">
              <strong>📝 Cuestionarios realizados</strong>

              <p>{historialQuiz.length}</p>
            </div>

            {historialQuiz.length === 0 ? (
              <div className="detalle-item">
                <strong>📚 Todavía no tienes resultados</strong>

                <p>
                  Realiza tu primer cuestionario para
                  comenzar a registrar tu progreso.
                </p>
              </div>
            ) : (
              <>
                <h3>Últimos resultados</h3>

                {historialQuiz
                  .slice(0, 10)
                  .map((resultado, index) => (
                    <div
                      className="detalle-item"
                      key={`${resultado.fecha}-${index}`}
                    >
                      <strong>
                        {resultado.porcentaje >= 80
                          ? '🟢'
                          : resultado.porcentaje >= 70
                            ? '🟡'
                            : resultado.porcentaje >= 60
                              ? '🟠'
                              : '🔴'}{' '}
                        {resultado.porcentaje}%
                      </strong>

                      <p>
                        {resultado.correctas} de{' '}
                        {resultado.total} correctas
                      </p>

                      <small>
                        {resultado.fecha}
                      </small>
                    </div>
                  ))}
              </>
            )}

            <button
              type="button"
              className="boton-login"
              onClick={iniciarQuiz}
            >
              🧠 HACER CUESTIONARIO
            </button>
          </div>
        </main>
      </div>
    )
  }

  // =========================================================
  // PROCEDIMIENTOS
  // =========================================================

  if (pagina === 'procedimientos') {
    const procedimientosFiltrados =
      procedimientos.filter((procedimiento) =>
        procedimiento.nombre
          .toLowerCase()
          .includes(
            busquedaProcedimiento.toLowerCase()
          )
      )

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>🩺 Procedimientos</h1>
            <p>Guías paso a paso de enfermería</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() => {
              setProcedimientoSeleccionado(null)
              setPagina('inicio')
            }}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>Procedimientos 🩺</h2>
            <p>
              Busca y selecciona un procedimiento.
            </p>
          </section>

          <div className="buscador-medicamentos">
            <span>🔍</span>

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

          <h3>Procedimientos disponibles</h3>

          <section className="cards">
            {procedimientosFiltrados.map(
              (procedimiento) => (
                <button
                  type="button"
                  className="card"
                  key={procedimiento.id}
                  onClick={() => {
                    if (
                      procedimiento.id === 'signos'
                    ) {
                      setProcedimientoSeleccionado(null)
                      setPagina('signosVitales')
                    } else {
                      setProcedimientoSeleccionado(
                        procedimiento
                      )
                    }
                  }}
                >
                  <span className="card-icon">
                    {procedimiento.icono}
                  </span>

                  <strong>
                    {procedimiento.nombre}
                  </strong>

                  <small>
                    {procedimiento.descripcion}
                  </small>
                </button>
              )
            )}
          </section>

          {procedimientoSeleccionado && (
            <div className="medicamento-detalle">
              <h2>
                {procedimientoSeleccionado.icono}{' '}
                {procedimientoSeleccionado.nombre}
              </h2>

              <div className="detalle-item">
                <strong>🎯 Objetivo</strong>
                <p>
                  {procedimientoSeleccionado.objetivo}
                </p>
              </div>

              <div className="detalle-item">
                <strong>🧰 Materiales</strong>
                <p>
                  {procedimientoSeleccionado.materiales}
                </p>
              </div>

              <div className="detalle-item">
                <strong>🩺 Procedimiento</strong>
                <p>
                  {procedimientoSeleccionado.procedimiento}
                </p>
              </div>

              <div className="detalle-item">
                <strong>📋 Pasos principales</strong>

                <ol>
                  {procedimientoSeleccionado.pasos.map(
                    (paso, index) => (
                      <li key={index}>
                        {paso}
                      </li>
                    )
                  )}
                </ol>
              </div>

              <div className="detalle-item">
                <strong>⚠️ Consideraciones</strong>

                <p>
                  {
                    procedimientoSeleccionado.consideraciones
                  }
                </p>
              </div>

              {procedimientoSeleccionado.sistemasBajoFlujo && (
                <div className="detalle-item">
                  <strong>
                    🟢 Sistemas de bajo flujo
                  </strong>

                  <div className="tabla-oxigenoterapia">
                    <div className="tabla-fila tabla-encabezado">
                      <div>Dispositivo</div>
                      <div>Litros/minuto</div>
                      <div>FiO₂</div>
                    </div>

                    {procedimientoSeleccionado.sistemasBajoFlujo.map(
                      (sistema, index) => (
                        <div
                          className="tabla-fila"
                          key={index}
                        >
                          <div>
                            {sistema.dispositivo}
                          </div>

                          <div>
                            {sistema.flujo}
                          </div>

                          <div>
                            {sistema.fio2}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {procedimientoSeleccionado.sistemasAltoFlujo && (
                <div className="detalle-item">
                  <strong>
                    🔵 Sistemas de alto flujo
                  </strong>

                  <div className="tabla-oxigenoterapia">
                    <div className="tabla-fila tabla-encabezado">
                      <div>Dispositivo</div>
                      <div>Flujo</div>
                      <div>FiO₂</div>
                    </div>

                    {procedimientoSeleccionado.sistemasAltoFlujo.map(
                      (sistema, index) => (
                        <div
                          className="tabla-fila"
                          key={index}
                        >
                          <div>
                            {sistema.dispositivo}
                          </div>

                          <div>
                            {sistema.flujo}
                          </div>

                          <div>
                            {sistema.fio2}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                </div>
              )}

              {procedimientoSeleccionado.cuidados && (
                <div className="detalle-item">
                  <strong>
                    👩‍⚕️ Cuidados de enfermería/TENS
                  </strong>

                  <ul className="cuidados-lista">
                    {procedimientoSeleccionado.cuidados.map(
                      (cuidado, index) => (
                        <li key={index}>
                          {cuidado}
                        </li>
                      )
                    )}
                  </ul>
                </div>
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

  if (pagina === 'medicamentos') {
    const medicamentosFiltrados =
      medicamentos.filter((medicamento) => {
        const coincideBusqueda =
          medicamento.nombre
            .toLowerCase()
            .includes(
              busquedaMedicamento.toLowerCase()
            )

        const coincideGrupo =
          filtroGrupo === 'Todos' ||
          medicamento.grupo === filtroGrupo

        return (
          coincideBusqueda &&
          coincideGrupo
        )
      })

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
              setMedicamentoSeleccionado(null)
              setPagina('inicio')
            }}
          >
            ← Volver
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>Medicamentos 💊</h2>
            <p>
              Busca información sobre medicamentos.
            </p>
          </section>

          <div className="buscador-medicamentos">
            <span>🔍</span>

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

          <div className="filtros-grupo">
            <button
              type="button"
              className={
                filtroGrupo === 'Todos'
                  ? 'filtro activo'
                  : 'filtro'
              }
              onClick={() =>
                setFiltroGrupo('Todos')
              }
            >
              Todos
            </button>

            {[
              ...new Set(
                medicamentos.map(
                  (medicamento) =>
                    medicamento.grupo
                )
              ),
            ].map((grupo) => (
              <button
                type="button"
                key={grupo}
                className={
                  filtroGrupo === grupo
                    ? 'filtro activo'
                    : 'filtro'
                }
                onClick={() =>
                  setFiltroGrupo(grupo)
                }
              >
                {grupo}
              </button>
            ))}
          </div>

          {medicamentoSeleccionado && (
            <div className="medicamento-detalle">
              <h2>
                💊 {medicamentoSeleccionado.nombre}
              </h2>

              <div className="detalle-item">
                <strong>
                  📚 Grupo farmacológico
                </strong>

                <p>
                  {medicamentoSeleccionado.grupo ||
                    'Información no disponible.'}
                </p>
              </div>

              <div className="detalle-item">
                <strong>🎯 Uso</strong>

                <p>
                  {medicamentoSeleccionado.uso ||
                    'Información no disponible.'}
                </p>
              </div>

              <div className="detalle-item">
                <strong>
                  ⚙️ Mecanismo de acción
                </strong>

                <p>
                  {medicamentoSeleccionado.mecanismo ||
                    'Información no disponible.'}
                </p>
              </div>

              <div className="detalle-item">
                <strong>
                  ⚠️ Contraindicaciones y precauciones
                </strong>

                <p>
                  {medicamentoSeleccionado.contraindicaciones ||
                    'Información no disponible.'}
                </p>
              </div>

              <div className="detalle-item">
                <strong>📌 Indicaciones</strong>

                <p>
                  {medicamentoSeleccionado.indicaciones ||
                    'Información no disponible.'}
                </p>
              </div>

              <div className="detalle-item">
                <strong>
                  ⚠️ Reacciones adversas
                </strong>

                <p>
                  {medicamentoSeleccionado.reacciones ||
                    medicamentoSeleccionado.reaccionesAdversas ||
                    'Información no disponible.'}
                </p>
              </div>
            </div>
          )}

          <h3>Medicamentos disponibles</h3>

          <section className="cards">
            {medicamentosFiltrados.map(
              (medicamento) => (
                <button
                  type="button"
                  className="card"
                  key={medicamento.nombre}
                  onClick={() =>
                    setMedicamentoSeleccionado(
                      medicamento
                    )
                  }
                >
                  <span className="card-icon">
                    💊
                  </span>

                  <strong>
                    {medicamento.nombre}
                  </strong>

                  <small>
                    {medicamento.grupo}
                  </small>
                </button>
              )
            )}
          </section>

          {medicamentosFiltrados.length === 0 && (
            <div className="medicamento-detalle">
              <h2>🔍 Sin resultados</h2>

              <p>
                No encontramos medicamentos que
                coincidan con tu búsqueda.
              </p>
            </div>
          )}
        </main>
      </div>
    )
  }

  // =========================================================
  // PÁGINAS TEMPORALES
  // =========================================================

  if (
    pagina === 'urgencias' ||
    pagina === 'guias' ||
    pagina === 'favoritos'
  ) {
    const informacion = {
      urgencias: {
        icono: '🚨',
        titulo: 'Urgencias',
        descripcion: 'Protocolos y emergencias',
        mensaje:
          'Aquí encontrarás protocolos, evaluaciones y contenidos relacionados con situaciones de urgencia.',
      },

      guias: {
        icono: '📚',
        titulo: 'Guías',
        descripcion: 'Material de estudio',
        mensaje:
          'Aquí encontrarás guías y material de apoyo para tus estudios de enfermería.',
      },

      favoritos: {
        icono: '⭐',
        titulo: 'Favoritos',
        descripcion: 'Tus contenidos guardados',
        mensaje:
          'Aquí aparecerán los contenidos que marques como favoritos.',
      },
    }

    const info = informacion[pagina]

    return (
      <div className="app">
        <header className="header">
          <div>
            <h1>
              {info.icono} {info.titulo}
            </h1>

            <p>{info.descripcion}</p>
          </div>

          <button
            type="button"
            className="back-button"
            onClick={() =>
              setPagina('inicio')
            }
          >
            ← Volver al inicio
          </button>
        </header>

        <main className="content">
          <section className="welcome">
            <h2>
              {info.icono} {info.titulo}
            </h2>

            <p>{info.mensaje}</p>
          </section>
        </main>
      </div>
    )
  }

  // =========================================================
  // PÁGINA PRINCIPAL
  // =========================================================

  return (
    <div className="app">
      <header className="header">
        <div>
          <img
            src="/log app nurseassit.jpeg"
            alt="Logo de NurseAssist"
            className="logo-nurseassist"
          />

          <h1>🩺 NurseAssist</h1>

          <p>Tu asistente de enfermería</p>
        </div>

        <div className="header-icons">
          <button
            type="button"
            aria-label="Notificaciones"
          >
            🔔
          </button>

          <button
            type="button"
            aria-label="Perfil"
            onClick={() =>
              setPagina('perfil')
            }
          >
            👤
          </button>
        </div>
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
          <span>🔍</span>

          <input
            type="text"
            placeholder="Buscar en NurseAssist..."
            value={busquedaGeneral}
            onChange={(e) =>
              setBusquedaGeneral(
                e.target.value
              )
            }
          />
        </div>

        {/* RESULTADOS DE BÚSQUEDA */}

        {busquedaGeneral.trim() !== '' && (
          <div className="cards">
            {resultadosFiltrados.length > 0 ? (
              resultadosFiltrados.map(
                (resultado, index) => (
                  <button
                    type="button"
                    className="card"
                    key={`${resultado.nombre}-${index}`}
                    onClick={() => {
                      setBusquedaGeneral('')

                      if (
                        resultado.pagina ===
                        'medicamentos'
                      ) {
                        setBusquedaMedicamento('')
                        setFiltroGrupo('Todos')
                        setMedicamentoSeleccionado(
                          resultado.dato
                        )
                        setPagina('medicamentos')
                      } else if (
                        resultado.pagina ===
                        'procedimientos'
                      ) {
                        setBusquedaProcedimiento('')
                        setProcedimientoSeleccionado(
                          resultado.dato
                        )
                        setPagina('procedimientos')
                      } else {
                        setPagina(
                          resultado.pagina
                        )
                      }
                    }}
                  >
                    <span className="card-icon">
                      {resultado.icono}
                    </span>

                    <strong>
                      {resultado.nombre}
                    </strong>

                    <small>
                      {resultado.tipo} ·{' '}
                      {resultado.descripcion}
                    </small>
                  </button>
                )
              )
            ) : (
              <div className="medicamento-detalle">
                <h2>
                  🔍 Sin resultados
                </h2>

                <p>
                  No encontramos información que
                  coincida con "
                  {busquedaGeneral}".
                </p>
              </div>
            )}
          </div>
        )}

        {/* ACCESOS RÁPIDOS */}

        {busquedaGeneral.trim() === '' && (
          <>
            <h3>Accesos rápidos</h3>

            <section className="cards">

              {/* MEDICAMENTOS */}

              <button
                type="button"
                className="card"
                onClick={() => {
                  setMedicamentoSeleccionado(null)
                  setBusquedaMedicamento('')
                  setFiltroGrupo('Todos')
                  setPagina('medicamentos')
                }}
              >
                <span className="card-icon">
                  💊
                </span>

                <strong>
                  Medicamentos
                </strong>

                <small>
                  Información farmacológica
                </small>
              </button>

              {/* PROCEDIMIENTOS */}

              <button
                type="button"
                className="card"
                onClick={() => {
                  setProcedimientoSeleccionado(null)
                  setBusquedaProcedimiento('')
                  setPagina('procedimientos')
                }}
              >
                <span className="card-icon">
                  🩺
                </span>

                <strong>
                  Procedimientos
                </strong>

                <small>
                  Guías paso a paso
                </small>
              </button>

              {/* CUESTIONARIOS */}

              <button
                type="button"
                className="card"
                onClick={iniciarQuiz}
              >
                <span className="card-icon">
                  🧠
                </span>

                <strong>
                  Cuestionarios
                </strong>

                <small>
                  Practica y comprueba tus conocimientos
                </small>
              </button>

              {/* PROGRESO */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('progreso')
                }
              >
                <span className="card-icon">
                  🏆
                </span>

                <strong>
                  Mi progreso
                </strong>

                <small>
                  Puntajes y resultados
                </small>
              </button>

              {/* CALCULADORA DOSIS */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('calculadora')
                }
              >
                <span className="card-icon">
                  🧮
                </span>

                <strong>
                  Calculadora de dosis
                </strong>

                <small>
                  Dosis, volumen y comprimidos
                </small>
              </button>

              {/* PAM */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('pam')
                }
              >
                <span className="card-icon">
                  🩺
                </span>

                <strong>
                  Calculadora de PAM
                </strong>

                <small>
                  Presión arterial media
                </small>
              </button>

              {/* IMC */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('imc')
                }
              >
                <span className="card-icon">
                  ⚖️
                </span>

                <strong>
                  Calculadora de IMC
                </strong>

                <small>
                  Índice de masa corporal
                </small>
              </button>

              {/* URGENCIAS */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('urgencias')
                }
              >
                <span className="card-icon">
                  🚨
                </span>

                <strong>
                  Urgencias
                </strong>

                <small>
                  Protocolos y emergencias
                </small>
              </button>

              {/* ENTREGA DE TURNO */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('turno')
                }
              >
                <span className="card-icon">
                  📋
                </span>

                <strong>
                  Entrega de turno
                </strong>

                <small>
                  Organiza información
                </small>
              </button>

              {/* GUÍAS */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('guias')
                }
              >
                <span className="card-icon">
                  📚
                </span>

                <strong>
                  Guías
                </strong>

                <small>
                  Material de consulta
                </small>
              </button>

              {/* FAVORITOS */}

              <button
                type="button"
                className="card"
                onClick={() =>
                  setPagina('favoritos')
                }
              >
                <span className="card-icon">
                  ⭐
                </span>

                <strong>
                  Favoritos
                </strong>

                <small>
                  Tus contenidos guardados
                </small>
              </button>

            </section>
          </>
        )}
      </main>

      {/* =====================================================
          MENÚ INFERIOR
      ===================================================== */}

      <nav className="bottom-nav">
        <button
          type="button"
          className={
            pagina === 'inicio'
              ? 'active'
              : ''
          }
          onClick={() => {
            setPagina('inicio')
            setBusquedaGeneral('')
          }}
        >
          🏠
          <span>Inicio</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setPagina('inicio')

            setTimeout(() => {
              document
                .querySelector(
                  '.search input'
                )
                ?.focus()
            }, 0)
          }}
        >
          🔍
          <span>Buscar</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setPagina('cuestionarios')
          }
        >
          🧠
          <span>Practicar</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setPagina('progreso')
          }
        >
          🏆
          <span>Progreso</span>
        </button>

        <button
          type="button"
          onClick={() =>
            setPagina('perfil')
          }
        >
          👤
          <span>Perfil</span>
        </button>
      </nav>
    </div>
  )
}

export default App