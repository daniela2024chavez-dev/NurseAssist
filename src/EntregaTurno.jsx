import { useEffect, useState } from 'react'
import './EntregaTurno.css'
import { supabase } from './supabaseClient'

// =====================================================
// DATOS INICIALES
// =====================================================

const datosIniciales = {
  paciente: '',
  rut: '',
  edad: '',
  servicio: '',
  cama: '',
  diagnostico: '',

  presionArterial: '',
  frecuenciaCardiaca: '',
  frecuenciaRespiratoria: '',
  saturacion: '',
  temperatura: '',
  glicemia: '',

  tratamientos: '',
  riesgos: '',

  situacion: '',
  antecedentes: '',
  evaluacion: '',
  recomendacion: '',
}

// =====================================================
// FUNCIONES AUXILIARES
// =====================================================

const normalizarTexto = (valor = '') =>
  String(valor)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()

const normalizarRut = (valor = '') =>
  String(valor)
    .replace(/[.\-\s]/g, '')
    .toLowerCase()

const formatearFecha = (fecha) => {
  if (!fecha) return '--'

  const fechaObj = new Date(fecha)

  if (Number.isNaN(fechaObj.getTime())) return '--'

  return fechaObj.toLocaleString('es-CL', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// =====================================================
// EVALUACIÓN DE SIGNOS VITALES
// =====================================================

const evaluarSigno = (tipo, valor) => {
  if (valor === '' || valor === null || valor === undefined) {
    return 'normal'
  }

  const numero = parseFloat(valor)

  if (Number.isNaN(numero)) return 'normal'

  switch (tipo) {
    case 'frecuenciaCardiaca':
      if (numero < 60 || numero > 100) return 'alerta'
      return 'normal'

    case 'frecuenciaRespiratoria':
      if (numero < 12 || numero > 20) return 'alerta'
      return 'normal'

    case 'saturacion':
      if (numero < 92) return 'critico'
      if (numero < 95) return 'alerta'
      return 'normal'

    case 'temperatura':
      if (numero < 36 || numero >= 38) return 'alerta'
      return 'normal'

    case 'glicemia':
      if (numero < 70 || numero > 180) return 'alerta'
      return 'normal'

    default:
      return 'normal'
  }
}

// =====================================================
// COMPONENTE SIGNO VITAL
// =====================================================

function CampoSignoVital({
  label,
  name,
  value,
  onChange,
  placeholder,
  unidad,
  tipoEvaluacion,
}) {
  const estado = evaluarSigno(tipoEvaluacion, value)

  return (
    <div className="campo-signo">
      <label htmlFor={name}>{label}</label>

      <div className="campo-signo-input">
        <input
          id={name}
          name={name}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
        />

        {unidad && <span>{unidad}</span>}
      </div>

      {value !== '' && (
        <div className={`estado-signo ${estado}`}>
          {estado === 'normal' && '✓ Dentro de rango'}
          {estado === 'alerta' && '⚠ Revisar'}
          {estado === 'critico' && '🔴 Atención'}
        </div>
      )}
    </div>
  )
}

// =====================================================
// COMPONENTE PRINCIPAL
// =====================================================

function EntregaTurno({ usuario, onVolver }) {
  const [vista, setVista] = useState('pacientes')

  const [pacientesGuardados, setPacientesGuardados] = useState([])

  const [pacienteSeleccionado, setPacienteSeleccionado] = useState(null)

  const [datos, setDatos] = useState(datosIniciales)

  const [cargando, setCargando] = useState(true)

  const [guardando, setGuardando] = useState(false)

  const [mensaje, setMensaje] = useState('')

  // ===================================================
  // FILTROS
  // ===================================================

  const [busquedaPaciente, setBusquedaPaciente] = useState('')

  const [filtroServicio, setFiltroServicio] = useState('todos')

  const [ordenPacientes, setOrdenPacientes] = useState('recientes')

  // ===================================================
  // OBTENER USUARIO ACTUAL
  // ===================================================

  const obtenerUsuarioActual = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    return user
  }

  // ===================================================
  // CARGAR PACIENTES
  // ===================================================

  const cargarPacientes = async () => {
    setCargando(true)

    try {
      const user = await obtenerUsuarioActual()

      if (!user) {
        setPacientesGuardados([])
        setCargando(false)
        return
      }

      const { data, error } = await supabase
        .from('entregas_turno')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error cargando pacientes:', error)
        setMensaje('No fue posible cargar los pacientes.')
        setPacientesGuardados([])
      } else {
        setPacientesGuardados(data || [])
      }
    } catch (error) {
      console.error(error)
      setMensaje('Ocurrió un error al cargar los pacientes.')
      setPacientesGuardados([])
    } finally {
      setCargando(false)
    }
  }

  useEffect(() => {
    cargarPacientes()
  }, [])

  // ===================================================
  // SERVICIOS DISPONIBLES
  // ===================================================

  const servicios = [
    ...new Set(
      pacientesGuardados
        .map((paciente) => paciente.servicio)
        .filter(Boolean)
    ),
  ].sort((a, b) =>
    String(a).localeCompare(String(b), 'es')
  )

  // ===================================================
  // PACIENTES FILTRADOS
  // ===================================================

  const pacientesFiltrados = [...pacientesGuardados]
    .filter((paciente) => {
      const busqueda = normalizarTexto(busquedaPaciente)

      const nombre = normalizarTexto(paciente.paciente)

      const cama = normalizarTexto(paciente.cama)

      const rut = normalizarRut(paciente.rut)

      const busquedaRut = normalizarRut(busquedaPaciente)

      const coincideBusqueda =
        busqueda === '' ||
        nombre.includes(busqueda) ||
        cama.includes(busqueda) ||
        rut.includes(busquedaRut)

      const coincideServicio =
        filtroServicio === 'todos' ||
        paciente.servicio === filtroServicio

      return coincideBusqueda && coincideServicio
    })
    .sort((a, b) => {
      if (ordenPacientes === 'nombre') {
        return normalizarTexto(a.paciente).localeCompare(
          normalizarTexto(b.paciente),
          'es'
        )
      }

      if (ordenPacientes === 'antiguos') {
        return (
          new Date(a.created_at || 0) -
          new Date(b.created_at || 0)
        )
      }

      return (
        new Date(b.created_at || 0) -
        new Date(a.created_at || 0)
      )
    })

  // ===================================================
  // LIMPIAR FILTROS
  // ===================================================

  const limpiarFiltros = () => {
    setBusquedaPaciente('')
    setFiltroServicio('todos')
    setOrdenPacientes('recientes')
  }

  // ===================================================
  // CAMBIO DE CAMPOS
  // ===================================================

  const manejarCambio = (e) => {
    const { name, value } = e.target

    setDatos((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // ===================================================
  // NUEVO PACIENTE
  // ===================================================

  const nuevoPaciente = () => {
    setPacienteSeleccionado(null)
    setDatos(datosIniciales)
    setMensaje('')
    setVista('formulario')
  }

  // ===================================================
  // VER PACIENTE
  // ===================================================

  const verPaciente = (paciente) => {
    setPacienteSeleccionado(paciente)
    setVista('detalle')
    setMensaje('')
  }

  // ===================================================
  // EDITAR PACIENTE
  // ===================================================

  const editarPaciente = (paciente) => {
    setPacienteSeleccionado(paciente)

    setDatos({
      paciente: paciente.paciente || '',
      rut: paciente.rut || '',
      edad: paciente.edad ?? '',
      servicio: paciente.servicio || '',
      cama: paciente.cama || '',
      diagnostico: paciente.diagnostico || '',

      presionArterial:
        paciente.signos_vitales?.presionArterial || '',
      frecuenciaCardiaca:
        paciente.signos_vitales?.frecuenciaCardiaca || '',
      frecuenciaRespiratoria:
        paciente.signos_vitales?.frecuenciaRespiratoria || '',
      saturacion:
        paciente.signos_vitales?.saturacion || '',
      temperatura:
        paciente.signos_vitales?.temperatura || '',
      glicemia:
        paciente.signos_vitales?.glicemia || '',

      tratamientos: paciente.tratamientos || '',
      riesgos: paciente.riesgos || '',

      situacion: paciente.situacion || '',
      antecedentes: paciente.antecedentes || '',
      evaluacion: paciente.evaluacion || '',
      recomendacion: paciente.recomendacion || '',
    })

    setMensaje('')
    setVista('formulario')
  }

  // ===================================================
  // GUARDAR PACIENTE
  // ===================================================

  const guardarEntrega = async (e) => {
    e.preventDefault()

    if (!datos.paciente.trim()) {
      setMensaje('Debes ingresar el nombre del paciente.')
      return
    }

    setGuardando(true)
    setMensaje('')

    try {
      const user = await obtenerUsuarioActual()

      if (!user) {
        setMensaje('La sesión ha expirado. Ingresa nuevamente.')
        setGuardando(false)
        return
      }

      const nombreUsuario =
        user.user_metadata?.nombre ||
        user.user_metadata?.name ||
        user.email ||
        'Usuario'

      const signosVitales = {
        presionArterial: datos.presionArterial,
        frecuenciaCardiaca: datos.frecuenciaCardiaca,
        frecuenciaRespiratoria: datos.frecuenciaRespiratoria,
        saturacion: datos.saturacion,
        temperatura: datos.temperatura,
        glicemia: datos.glicemia,
      }

      // ================================================
      // NUEVO REGISTRO
      // ================================================

      if (!pacienteSeleccionado) {
        const nuevoRegistro = {
          user_id: user.id,

          paciente: datos.paciente.trim(),
          rut: datos.rut.trim(),
          edad: datos.edad
            ? parseInt(datos.edad, 10)
            : null,
          servicio: datos.servicio.trim(),
          cama: datos.cama.trim(),
          diagnostico: datos.diagnostico.trim(),

          signos_vitales: signosVitales,

          tratamientos: datos.tratamientos.trim(),
          riesgos: datos.riesgos.trim(),

          situacion: datos.situacion.trim(),
          antecedentes: datos.antecedentes.trim(),
          evaluacion: datos.evaluacion.trim(),
          recomendacion: datos.recomendacion.trim(),

          created_by_name: nombreUsuario,
          updated_by: user.id,
          updated_by_name: nombreUsuario,
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('entregas_turno')
          .insert([nuevoRegistro])
          .select()
          .single()

        if (error) {
          console.error('Error guardando:', error)
          setMensaje(
            `No se pudo guardar el paciente: ${error.message}`
          )
          setGuardando(false)
          return
        }

        setPacientesGuardados((prev) => [
          data,
          ...prev,
        ])

        setPacienteSeleccionado(data)
        setVista('detalle')
        setMensaje('Paciente guardado correctamente.')
      }

      // ================================================
      // ACTUALIZAR REGISTRO
      // ================================================

      else {
        const datosActualizados = {
          paciente: datos.paciente.trim(),
          rut: datos.rut.trim(),
          edad: datos.edad
            ? parseInt(datos.edad, 10)
            : null,
          servicio: datos.servicio.trim(),
          cama: datos.cama.trim(),
          diagnostico: datos.diagnostico.trim(),

          signos_vitales: signosVitales,

          tratamientos: datos.tratamientos.trim(),
          riesgos: datos.riesgos.trim(),

          situacion: datos.situacion.trim(),
          antecedentes: datos.antecedentes.trim(),
          evaluacion: datos.evaluacion.trim(),
          recomendacion: datos.recomendacion.trim(),

          updated_by: user.id,
          updated_by_name: nombreUsuario,
          updated_at: new Date().toISOString(),
        }

        const { data, error } = await supabase
          .from('entregas_turno')
          .update(datosActualizados)
          .eq('id', pacienteSeleccionado.id)
          .select()
          .single()

        if (error) {
          console.error('Error actualizando:', error)
          setMensaje(
            `No se pudo actualizar el paciente: ${error.message}`
          )
          setGuardando(false)
          return
        }

        setPacientesGuardados((prev) =>
          prev.map((paciente) =>
            paciente.id === data.id
              ? data
              : paciente
          )
        )

        setPacienteSeleccionado(data)
        setVista('detalle')
        setMensaje('Paciente actualizado correctamente.')
      }
    } catch (error) {
      console.error(error)
      setMensaje(
        'Ocurrió un error inesperado al guardar.'
      )
    } finally {
      setGuardando(false)
    }
  }

  // ===================================================
  // VOLVER
  // ===================================================

  const volverAPacientes = () => {
    setVista('pacientes')
    setPacienteSeleccionado(null)
    setMensaje('')
    cargarPacientes()
  }

  // ===================================================
  // VISTA DE PACIENTES
  // ===================================================

  if (vista === 'pacientes') {
    return (
      <div className="entrega-turno-container">

        {/* ENCABEZADO */}

        <div className="entrega-header">

          <div className="entrega-header-info">

            <div className="entrega-logo">
              🩺
            </div>

            <div>
              <div className="entrega-mini-titulo">
                NURSEASSIST
              </div>

              <h1>Entrega de Turno</h1>

              <p>
                Gestión de pacientes y continuidad de cuidados
              </p>
            </div>

          </div>

          <div className="entrega-header-botones">

            <button
              className="btn-volver"
              onClick={onVolver}
            >
              ← Volver
            </button>

            <button
              className="btn-nuevo"
              onClick={nuevoPaciente}
            >
              ＋ Nuevo paciente
            </button>

          </div>

        </div>

        {/* CONTENIDO */}

        <div className="pacientes-panel">

          <div className="pacientes-panel-header">

            <div className="pacientes-titulo">

              <div className="pacientes-icono">
                👥
              </div>

              <div>
                <h2>Pacientes registrados</h2>

                <p>
                  Consulta y gestiona la información de tus pacientes.
                </p>
              </div>

            </div>

            <div className="contador-pacientes">
              {pacientesGuardados.length}
            </div>

          </div>

          {/* =================================================
              BUSCADOR - SIEMPRE VISIBLE
          ================================================= */}

          <div className="filtros-pacientes">

            <div className="campo-busqueda">

              <label htmlFor="busqueda-paciente">
                Buscar paciente
              </label>

              <div className="input-busqueda">

                <span className="icono-busqueda">
                  🔎
                </span>

                <input
                  id="busqueda-paciente"
                  type="search"
                  value={busquedaPaciente}
                  onChange={(e) =>
                    setBusquedaPaciente(e.target.value)
                  }
                  placeholder="Buscar por nombre, RUT o cama..."
                  autoComplete="off"
                />

                {busquedaPaciente && (
                  <button
                    type="button"
                    className="btn-limpiar-busqueda"
                    onClick={() =>
                      setBusquedaPaciente('')
                    }
                    aria-label="Limpiar búsqueda"
                  >
                    ×
                  </button>
                )}

              </div>

            </div>

            <div className="campo-filtro">

              <label htmlFor="filtro-servicio">
                Servicio
              </label>

              <select
                id="filtro-servicio"
                value={filtroServicio}
                onChange={(e) =>
                  setFiltroServicio(e.target.value)
                }
              >
                <option value="todos">
                  Todos los servicios
                </option>

                {servicios.map((servicio) => (
                  <option
                    key={servicio}
                    value={servicio}
                  >
                    {servicio}
                  </option>
                ))}
              </select>

            </div>

            <div className="campo-filtro">

              <label htmlFor="orden-pacientes">
                Ordenar
              </label>

              <select
                id="orden-pacientes"
                value={ordenPacientes}
                onChange={(e) =>
                  setOrdenPacientes(e.target.value)
                }
              >
                <option value="recientes">
                  Más recientes
                </option>

                <option value="antiguos">
                  Más antiguos
                </option>

                <option value="nombre">
                  Nombre A-Z
                </option>
              </select>

            </div>

            <button
              type="button"
              className="btn-limpiar-filtros"
              onClick={limpiarFiltros}
            >
              Limpiar filtros
            </button>

          </div>

          {/* =================================================
              RESULTADO DE FILTROS
          ================================================= */}

          {!cargando &&
            pacientesGuardados.length > 0 && (
              <div className="resultado-filtros">
                Mostrando{' '}
                <strong>
                  {pacientesFiltrados.length}
                </strong>{' '}
                de{' '}
                <strong>
                  {pacientesGuardados.length}
                </strong>{' '}
                pacientes
              </div>
            )}

          {/* =================================================
              CARGANDO
          ================================================= */}

          {cargando && (
            <div className="estado-pacientes">
              <div className="spinner"></div>

              <p>
                Cargando pacientes...
              </p>
            </div>
          )}

          {/* =================================================
              SIN PACIENTES
          ================================================= */}

          {!cargando &&
            pacientesGuardados.length === 0 && (
              <div className="estado-pacientes vacio">

                <div className="estado-icono">
                  👤
                </div>

                <h3>
                  No hay pacientes registrados
                </h3>

                <p>
                  Comienza agregando un nuevo paciente
                  para crear una entrega de turno.
                </p>

                <button
                  className="btn-nuevo"
                  onClick={nuevoPaciente}
                >
                  ＋ Nuevo paciente
                </button>

              </div>
            )}

          {/* =================================================
              NO HAY RESULTADOS
          ================================================= */}

          {!cargando &&
            pacientesGuardados.length > 0 &&
            pacientesFiltrados.length === 0 && (
              <div className="estado-pacientes vacio">

                <div className="estado-icono">
                  🔎
                </div>

                <h3>
                  No se encontraron pacientes
                </h3>

                <p>
                  Prueba con otro nombre, RUT, cama
                  o servicio.
                </p>

                <button
                  className="btn-limpiar-filtros"
                  onClick={limpiarFiltros}
                >
                  Limpiar filtros
                </button>

              </div>
            )}

          {/* =================================================
              LISTADO DE PACIENTES
          ================================================= */}

          {!cargando &&
            pacientesFiltrados.length > 0 && (
              <div className="lista-pacientes">

                {pacientesFiltrados.map((paciente) => (

                  <div
                    className="tarjeta-paciente"
                    key={paciente.id}
                  >

                    <div className="icono-paciente">
                      👤
                    </div>

                    <div className="info-paciente">

                      <h3>
                        {paciente.paciente ||
                          'Paciente sin nombre'}
                      </h3>

                      <div className="datos-basicos">

                        {paciente.rut && (
                          <span>
                            🪪 {paciente.rut}
                          </span>
                        )}

                        {paciente.edad !== null &&
                          paciente.edad !== undefined &&
                          paciente.edad !== '' && (
                            <span>
                              🎂 {paciente.edad} años
                            </span>
                          )}

                        {paciente.servicio && (
                          <span>
                            🏥 {paciente.servicio}
                          </span>
                        )}

                        {paciente.cama && (
                          <span>
                            🛏️ Cama {paciente.cama}
                          </span>
                        )}

                      </div>

                      <div className="auditoria-paciente">

                        <div>
                          <strong>
                            Creado por:
                          </strong>{' '}
                          {paciente.created_by_name ||
                            'Usuario anterior'}
                        </div>

                        <div>
                          <strong>
                            Fecha:
                          </strong>{' '}
                          {formatearFecha(
                            paciente.created_at
                          )}
                        </div>

                        {paciente.updated_by_name && (
                          <div>
                            <strong>
                              Última edición:
                            </strong>{' '}
                            {paciente.updated_by_name}
                          </div>
                        )}

                      </div>

                    </div>

                    <div className="acciones-paciente">

                      <button
                        type="button"
                        className="btn-ver"
                        onClick={() =>
                          verPaciente(paciente)
                        }
                      >
                        Ver
                      </button>

                      <button
                        type="button"
                        className="btn-editar"
                        onClick={() =>
                          editarPaciente(paciente)
                        }
                      >
                        Editar
                      </button>

                    </div>

                  </div>

                ))}

              </div>
            )}

        </div>

      </div>
    )
  }

  // =====================================================
  // VISTA DETALLE
  // =====================================================

  if (vista === 'detalle' && pacienteSeleccionado) {

    const signos =
      pacienteSeleccionado.signos_vitales || {}

    return (
      <div className="entrega-turno-container">

        <div className="entrega-header">

          <div className="entrega-header-info">

            <div className="entrega-logo">
              🩺
            </div>

            <div>
              <div className="entrega-mini-titulo">
                NURSEASSIST
              </div>

              <h1>Entrega de Turno</h1>

              <p>
                Información clínica del paciente
              </p>
            </div>

          </div>

          <div className="entrega-header-botones">

            <button
              className="btn-volver"
              onClick={volverAPacientes}
            >
              ← Pacientes
            </button>

            <button
              className="btn-nuevo"
              onClick={() =>
                editarPaciente(
                  pacienteSeleccionado
                )
              }
            >
              ✎ Editar
            </button>

          </div>

        </div>

        <div className="detalle-paciente">

          {/* IDENTIFICACIÓN */}

          <section className="seccion-detalle">

            <div className="titulo-seccion">
              <span>👤</span>
              <h2>Identificación del paciente</h2>
            </div>

            <div className="grid-detalle">

              <div>
                <label>Paciente</label>
                <strong>
                  {pacienteSeleccionado.paciente ||
                    '--'}
                </strong>
              </div>

              <div>
                <label>RUT</label>
                <strong>
                  {pacienteSeleccionado.rut || '--'}
                </strong>
              </div>

              <div>
                <label>Edad</label>
                <strong>
                  {pacienteSeleccionado.edad
                    ? `${pacienteSeleccionado.edad} años`
                    : '--'}
                </strong>
              </div>

              <div>
                <label>Servicio</label>
                <strong>
                  {pacienteSeleccionado.servicio ||
                    '--'}
                </strong>
              </div>

              <div>
                <label>Cama</label>
                <strong>
                  {pacienteSeleccionado.cama ||
                    '--'}
                </strong>
              </div>

              <div className="detalle-completo">
                <label>Diagnóstico</label>
                <p>
                  {pacienteSeleccionado.diagnostico ||
                    '--'}
                </p>
              </div>

            </div>

          </section>

          {/* SIGNOS VITALES */}

          <section className="seccion-detalle">

            <div className="titulo-seccion">
              <span>❤️</span>
              <h2>Signos vitales</h2>
            </div>

            <div className="grid-signos-detalle">

              <div className="signo-detalle">
                <span>Presión arterial</span>
                <strong>
                  {signos.presionArterial || '--'}
                </strong>
                {signos.presionArterial && (
                  <small>mmHg</small>
                )}
              </div>

              <div className="signo-detalle">
                <span>Frecuencia cardíaca</span>
                <strong>
                  {signos.frecuenciaCardiaca || '--'}
                </strong>
                {signos.frecuenciaCardiaca && (
                  <small>lpm</small>
                )}
              </div>

              <div className="signo-detalle">
                <span>Frecuencia respiratoria</span>
                <strong>
                  {signos.frecuenciaRespiratoria || '--'}
                </strong>
                {signos.frecuenciaRespiratoria && (
                  <small>rpm</small>
                )}
              </div>

              <div className="signo-detalle">
                <span>Saturación</span>
                <strong>
                  {signos.saturacion || '--'}
                </strong>
                {signos.saturacion && (
                  <small>%</small>
                )}
              </div>

              <div className="signo-detalle">
                <span>Temperatura</span>
                <strong>
                  {signos.temperatura || '--'}
                </strong>
                {signos.temperatura && (
                  <small>°C</small>
                )}
              </div>

              <div className="signo-detalle">
                <span>Glicemia</span>
                <strong>
                  {signos.glicemia || '--'}
                </strong>
                {signos.glicemia && (
                  <small>mg/dL</small>
                )}
              </div>

            </div>

          </section>

          {/* TRATAMIENTOS */}

          <section className="seccion-detalle">

            <div className="titulo-seccion">
              <span>💊</span>
              <h2>Tratamientos y cuidados</h2>
            </div>

            <div className="texto-detalle">
              {pacienteSeleccionado.tratamientos ||
                'No hay información registrada.'}
            </div>

          </section>

          {/* RIESGOS */}

          <section className="seccion-detalle">

            <div className="titulo-seccion">
              <span>⚠️</span>
              <h2>Riesgos y precauciones</h2>
            </div>

            <div className="texto-detalle">
              {pacienteSeleccionado.riesgos ||
                'No hay información registrada.'}
            </div>

          </section>

          {/* SBAR */}

          <section className="seccion-detalle">

            <div className="titulo-seccion">
              <span>📋</span>
              <h2>Entrega SBAR</h2>
            </div>

            <div className="sbar-detalle">

              <div>
                <h3>S — Situación</h3>
                <p>
                  {pacienteSeleccionado.situacion ||
                    'No registrado.'}
                </p>
              </div>

              <div>
                <h3>B — Antecedentes</h3>
                <p>
                  {pacienteSeleccionado.antecedentes ||
                    'No registrado.'}
                </p>
              </div>

              <div>
                <h3>A — Evaluación</h3>
                <p>
                  {pacienteSeleccionado.evaluacion ||
                    'No registrado.'}
                </p>
              </div>

              <div>
                <h3>R — Recomendación</h3>
                <p>
                  {pacienteSeleccionado.recomendacion ||
                    'No registrado.'}
                </p>
              </div>

            </div>

          </section>

          {/* AUDITORÍA */}

          <section className="seccion-detalle auditoria-detalle">

            <div className="titulo-seccion">
              <span>🕒</span>
              <h2>Registro y modificaciones</h2>
            </div>

            <div className="auditoria-grid">

              <div>
                <label>Creado por</label>
                <strong>
                  {pacienteSeleccionado.created_by_name ||
                    'Usuario anterior'}
                </strong>
              </div>

              <div>
                <label>Fecha de creación</label>
                <strong>
                  {formatearFecha(
                    pacienteSeleccionado.created_at
                  )}
                </strong>
              </div>

              <div>
                <label>Última edición por</label>
                <strong>
                  {pacienteSeleccionado.updated_by_name ||
                    'Sin modificaciones'}
                </strong>
              </div>

              <div>
                <label>Última modificación</label>
                <strong>
                  {formatearFecha(
                    pacienteSeleccionado.updated_at
                  )}
                </strong>
              </div>

            </div>

          </section>

          <div className="botones-finales">

            <button
              className="btn-volver"
              onClick={volverAPacientes}
            >
              ← Volver a pacientes
            </button>

            <button
              className="btn-nuevo"
              onClick={() =>
                editarPaciente(
                  pacienteSeleccionado
                )
              }
            >
              ✎ Editar paciente
            </button>

          </div>

        </div>

      </div>
    )
  }

  // =====================================================
  // FORMULARIO
  // =====================================================

  return (
    <div className="entrega-turno-container">

      <div className="entrega-header">

        <div className="entrega-header-info">

          <div className="entrega-logo">
            🩺
          </div>

          <div>
            <div className="entrega-mini-titulo">
              NURSEASSIST
            </div>

            <h1>
              {pacienteSeleccionado
                ? 'Editar paciente'
                : 'Nuevo paciente'}
            </h1>

            <p>
              Registro de entrega de turno
            </p>
          </div>

        </div>

        <button
          className="btn-volver"
          onClick={volverAPacientes}
        >
          ← Volver
        </button>

      </div>

      <form
        className="formulario-entrega"
        onSubmit={guardarEntrega}
      >

        {/* IDENTIFICACIÓN */}

        <section className="form-seccion">

          <div className="form-titulo">
            <span>👤</span>

            <div>
              <h2>Identificación del paciente</h2>
              <p>
                Información básica del paciente
              </p>
            </div>
          </div>

          <div className="form-grid">

            <div className="campo-formulario campo-grande">

              <label htmlFor="paciente">
                Nombre del paciente *
              </label>

              <input
                id="paciente"
                name="paciente"
                type="text"
                value={datos.paciente}
                onChange={manejarCambio}
                placeholder="Nombre completo"
                required
              />

            </div>

            <div className="campo-formulario">

              <label htmlFor="rut">
                RUT
              </label>

              <input
                id="rut"
                name="rut"
                type="text"
                value={datos.rut}
                onChange={manejarCambio}
                placeholder="12.345.678-9"
              />

            </div>

            <div className="campo-formulario">

              <label htmlFor="edad">
                Edad
              </label>

              <input
                id="edad"
                name="edad"
                type="number"
                min="0"
                max="130"
                value={datos.edad}
                onChange={manejarCambio}
                placeholder="Edad"
              />

            </div>

            <div className="campo-formulario">

              <label htmlFor="servicio">
                Servicio
              </label>

              <input
                id="servicio"
                name="servicio"
                type="text"
                value={datos.servicio}
                onChange={manejarCambio}
                placeholder="Ej: Medicina"
              />

            </div>

            <div className="campo-formulario">

              <label htmlFor="cama">
                Cama
              </label>

              <input
                id="cama"
                name="cama"
                type="text"
                value={datos.cama}
                onChange={manejarCambio}
                placeholder="Ej: 12"
              />

            </div>

            <div className="campo-formulario campo-completo">

              <label htmlFor="diagnostico">
                Diagnóstico
              </label>

              <textarea
                id="diagnostico"
                name="diagnostico"
                value={datos.diagnostico}
                onChange={manejarCambio}
                placeholder="Diagnóstico médico o motivo de hospitalización..."
                rows="3"
              />

            </div>

          </div>

        </section>

        {/* SIGNOS VITALES */}

        <section className="form-seccion">

          <div className="form-titulo">
            <span>❤️</span>

            <div>
              <h2>Signos vitales</h2>
              <p>
                Registra los últimos signos vitales
              </p>
            </div>
          </div>

          <div className="signos-grid">

            <CampoSignoVital
              label="Presión arterial"
              name="presionArterial"
              value={datos.presionArterial}
              onChange={manejarCambio}
              placeholder="120/80"
              unidad="mmHg"
              tipoEvaluacion="presionArterial"
            />

            <CampoSignoVital
              label="Frecuencia cardíaca"
              name="frecuenciaCardiaca"
              value={datos.frecuenciaCardiaca}
              onChange={manejarCambio}
              placeholder="80"
              unidad="lpm"
              tipoEvaluacion="frecuenciaCardiaca"
            />

            <CampoSignoVital
              label="Frecuencia respiratoria"
              name="frecuenciaRespiratoria"
              value={datos.frecuenciaRespiratoria}
              onChange={manejarCambio}
              placeholder="16"
              unidad="rpm"
              tipoEvaluacion="frecuenciaRespiratoria"
            />

            <CampoSignoVital
              label="Saturación O₂"
              name="saturacion"
              value={datos.saturacion}
              onChange={manejarCambio}
              placeholder="98"
              unidad="%"
              tipoEvaluacion="saturacion"
            />

            <CampoSignoVital
              label="Temperatura"
              name="temperatura"
              value={datos.temperatura}
              onChange={manejarCambio}
              placeholder="36,5"
              unidad="°C"
              tipoEvaluacion="temperatura"
            />

            <CampoSignoVital
              label="Glicemia"
              name="glicemia"
              value={datos.glicemia}
              onChange={manejarCambio}
              placeholder="100"
              unidad="mg/dL"
              tipoEvaluacion="glicemia"
            />

          </div>

        </section>

        {/* TRATAMIENTOS */}

        <section className="form-seccion">

          <div className="form-titulo">
            <span>💊</span>

            <div>
              <h2>Tratamientos y cuidados</h2>
              <p>
                Medicamentos, procedimientos y cuidados pendientes
              </p>
            </div>
          </div>

          <div className="campo-formulario">

            <label htmlFor="tratamientos">
              Tratamientos / cuidados
            </label>

            <textarea
              id="tratamientos"
              name="tratamientos"
              value={datos.tratamientos}
              onChange={manejarCambio}
              placeholder="Ej: medicamentos, curaciones, oxigenoterapia, controles, procedimientos pendientes..."
              rows="5"
            />

          </div>

        </section>

        {/* RIESGOS */}

        <section className="form-seccion">

          <div className="form-titulo">
            <span>⚠️</span>

            <div>
              <h2>Riesgos y precauciones</h2>
              <p>
                Información relevante para la continuidad de cuidados
              </p>
            </div>
          </div>

          <div className="campo-formulario">

            <label htmlFor="riesgos">
              Riesgos / precauciones
            </label>

            <textarea
              id="riesgos"
              name="riesgos"
              value={datos.riesgos}
              onChange={manejarCambio}
              placeholder="Ej: riesgo de caída, alergias, aislamiento, riesgo de UPP..."
              rows="4"
            />

          </div>

        </section>

        {/* SBAR */}

        <section className="form-seccion">

          <div className="form-titulo">

            <span>📋</span>

            <div>
              <h2>Entrega SBAR</h2>
              <p>
                Comunicación estructurada de la información clínica
              </p>
            </div>

          </div>

          <div className="sbar-form">

            <div className="sbar-item">

              <div className="sbar-letra">
                S
              </div>

              <div className="campo-formulario">

                <label htmlFor="situacion">
                  Situación
                </label>

                <textarea
                  id="situacion"
                  name="situacion"
                  value={datos.situacion}
                  onChange={manejarCambio}
                  placeholder="¿Cuál es la situación actual del paciente?"
                  rows="4"
                />

              </div>

            </div>

            <div className="sbar-item">

              <div className="sbar-letra">
                B
              </div>

              <div className="campo-formulario">

                <label htmlFor="antecedentes">
                  Antecedentes
                </label>

                <textarea
                  id="antecedentes"
                  name="antecedentes"
                  value={datos.antecedentes}
                  onChange={manejarCambio}
                  placeholder="Antecedentes relevantes del paciente..."
                  rows="4"
                />

              </div>

            </div>

            <div className="sbar-item">

              <div className="sbar-letra">
                A
              </div>

              <div className="campo-formulario">

                <label htmlFor="evaluacion">
                  Evaluación
                </label>

                <textarea
                  id="evaluacion"
                  name="evaluacion"
                  value={datos.evaluacion}
                  onChange={manejarCambio}
                  placeholder="¿Cuál es tu evaluación actual del paciente?"
                  rows="4"
                />

              </div>

            </div>

            <div className="sbar-item">

              <div className="sbar-letra">
                R
              </div>

              <div className="campo-formulario">

                <label htmlFor="recomendacion">
                  Recomendación
                </label>

                <textarea
                  id="recomendacion"
                  name="recomendacion"
                  value={datos.recomendacion}
                  onChange={manejarCambio}
                  placeholder="¿Qué debe realizar o vigilar el siguiente turno?"
                  rows="4"
                />

              </div>

            </div>

          </div>

        </section>

        {/* MENSAJE */}

        {mensaje && (
          <div className="mensaje-formulario">
            {mensaje}
          </div>
        )}

        {/* BOTONES */}

        <div className="botones-formulario">

          <button
            type="button"
            className="btn-volver"
            onClick={volverAPacientes}
            disabled={guardando}
          >
            Cancelar
          </button>

          <button
            type="submit"
            className="btn-nuevo btn-guardar"
            disabled={guardando}
          >
            {guardando
              ? 'Guardando...'
              : pacienteSeleccionado
                ? '✓ Guardar cambios'
                : '✓ Guardar paciente'}
          </button>

        </div>

      </form>

    </div>
  )
}

export default EntregaTurno