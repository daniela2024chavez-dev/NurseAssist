import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Login.css'

function Login({ onLogin }) {
  const [modo, setModo] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)

  // =========================================================
  // RECUPERAR CONTRASEÑA
  // =========================================================

  const recuperarContrasena = async () => {
    setMensaje('')

    const correo = email.trim().toLowerCase()

    if (!correo) {
      setMensaje(
        'Escribe tu correo electrónico para recuperar tu contraseña.'
      )
      return
    }

    setCargando(true)

    try {
      const { error } =
        await supabase.auth.resetPasswordForEmail(correo, {
          redirectTo: `${window.location.origin}/reset-password`,
        })

      if (error) {
        console.error('Error al recuperar contraseña:', error)
        throw error
      }

      setMensaje(
        '✅ Te enviamos un correo para restablecer tu contraseña. Revisa tu bandeja de entrada y también la carpeta de spam.'
      )
    } catch (error) {
      console.error('Error al recuperar contraseña:', error)

      setMensaje(
        error?.message ||
          'No se pudo enviar el correo de recuperación.'
      )
    } finally {
      setCargando(false)
    }
  }

  // =========================================================
  // INICIAR SESIÓN / REGISTRO
  // =========================================================

  const manejarSubmit = async (e) => {
    e.preventDefault()

    setMensaje('')

    const correo = email.trim().toLowerCase()

    if (!correo) {
      setMensaje('Escribe tu correo electrónico.')
      return
    }

    if (!password) {
      setMensaje('Escribe tu contraseña.')
      return
    }

    setCargando(true)

    try {
      // =====================================================
      // CREAR CUENTA
      // =====================================================

      if (modo === 'registro') {
        if (!nombre.trim()) {
          setMensaje('Escribe tu nombre.')
          return
        }

        if (password.length < 6) {
          setMensaje(
            'La contraseña debe tener al menos 6 caracteres.'
          )
          return
        }

        const { data, error } =
          await supabase.auth.signUp({
            email: correo,
            password,
            options: {
              data: {
                nombre: nombre.trim(),
              },
            },
          })

        if (error) {
          console.error('Error al registrarse:', error)

          const errorMensaje =
            error.message?.toLowerCase() || ''

          if (
            errorMensaje.includes('already registered') ||
            errorMensaje.includes('user already registered')
          ) {
            throw new Error(
              'Este correo ya está registrado. Intenta iniciar sesión.'
            )
          }

          throw error
        }

        // Si Supabase inicia sesión automáticamente
        if (data?.session?.user) {
          onLogin(data.session.user)
          return
        }

        // Si requiere confirmar correo
        setMensaje(
          '✅ Cuenta creada correctamente. Revisa tu correo electrónico y confirma tu cuenta antes de iniciar sesión.'
        )

        setModo('login')
        setPassword('')

        return
      }

      // =====================================================
      // INICIAR SESIÓN
      // =====================================================

      const { data, error } =
        await supabase.auth.signInWithPassword({
          email: correo,
          password,
        })

      if (error) {
        console.error('Error al iniciar sesión:', error)

        const errorMensaje =
          error.message?.toLowerCase() || ''

        if (
          errorMensaje.includes('email not confirmed') ||
          errorMensaje.includes('email_not_confirmed')
        ) {
          throw new Error(
            'Tu correo todavía no está confirmado. Revisa tu correo electrónico y confirma tu cuenta.'
          )
        }

        if (
          errorMensaje.includes('invalid login credentials')
        ) {
          throw new Error(
            'El correo o la contraseña son incorrectos.'
          )
        }

        if (
          errorMensaje.includes('network') ||
          errorMensaje.includes('fetch') ||
          errorMensaje.includes('failed to fetch')
        ) {
          throw new Error(
            'No se pudo conectar con el servidor. Comprueba tu conexión a Internet e inténtalo nuevamente.'
          )
        }

        throw error
      }

      if (!data?.user) {
        throw new Error(
          'No se pudo obtener la información de tu cuenta.'
        )
      }

      onLogin(data.user)
    } catch (error) {
      console.error('Error de autenticación:', error)

      setMensaje(
        error?.message ||
          'Ocurrió un error. Inténtalo nuevamente.'
      )
    } finally {
      setCargando(false)
    }
  }

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <div className="pantalla-login">
      <div className="login-card">

        <img
          src="/log app nurseassit.jpeg"
          alt="Logo de NurseAssist"
          className="logo-nurseassist"
        />

        <h1>NurseAssist</h1>

        <p className="login-subtitulo">
          Tu asistente para enfermería
        </p>

        {/* =================================================
            PESTAÑAS
        ================================================= */}

        <div className="login-tabs">

          <button
            type="button"
            className={
              modo === 'login'
                ? 'tab-activa'
                : ''
            }
            onClick={() => {
              setModo('login')
              setMensaje('')
            }}
          >
            Iniciar sesión
          </button>

          <button
            type="button"
            className={
              modo === 'registro'
                ? 'tab-activa'
                : ''
            }
            onClick={() => {
              setModo('registro')
              setMensaje('')
            }}
          >
            Crear cuenta
          </button>

        </div>

        {/* =================================================
            FORMULARIO
        ================================================= */}

        <form onSubmit={manejarSubmit}>

          {/* NOMBRE */}

          {modo === 'registro' && (
            <div className="campo-login">

              <label htmlFor="nombre">
                Nombre
              </label>

              <input
                id="nombre"
                type="text"
                placeholder="Tu nombre"
                value={nombre}
                onChange={(e) =>
                  setNombre(e.target.value)
                }
                required
                autoComplete="name"
              />

            </div>
          )}

          {/* CORREO */}

          <div className="campo-login">

            <label htmlFor="email">
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              placeholder="correo@ejemplo.com"
              value={email}
              onChange={(e) =>
                setEmail(e.target.value)
              }
              required
              autoComplete="email"
              inputMode="email"
            />

          </div>

          {/* CONTRASEÑA */}

          <div className="campo-login">

            <label htmlFor="password">
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              placeholder="Mínimo 6 caracteres"
              value={password}
              onChange={(e) =>
                setPassword(e.target.value)
              }
              required
              minLength={6}
              autoComplete={
                modo === 'login'
                  ? 'current-password'
                  : 'new-password'
              }
            />

          </div>

          {/* =================================================
              OLVIDASTE TU CONTRASEÑA
          ================================================= */}

         {modo === 'login' && (
  <div className="recuperar-container">
    <button
      type="button"
      className="boton-recuperar"
      onClick={recuperarContrasena}
      disabled={cargando}
    >
      ¿Olvidaste tu contraseña?
    </button>
  </div>
)}

          {/* =================================================
              MENSAJE
          ================================================= */}

          {mensaje && (
            <div
              className="mensaje-login"
              role="alert"
            >
              {mensaje}
            </div>
          )}

          {/* =================================================
              BOTÓN PRINCIPAL
          ================================================= */}

          <button
            type="submit"
            className="boton-login"
            disabled={cargando}
          >
            {cargando
              ? 'Procesando...'
              : modo === 'login'
                ? '🔐 Iniciar sesión'
                : '👤 Crear cuenta'}
          </button>

        </form>

        <p className="texto-seguridad">
          🔒 Tu información personal estará asociada
          únicamente a tu cuenta.
        </p>

      </div>
    </div>
  )
}

export default Login
