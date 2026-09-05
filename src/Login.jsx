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

  const manejarSubmit = async (e) => {
    e.preventDefault()

    setMensaje('')
    setCargando(true)

    const correo = email.trim().toLowerCase()

    try {
      // =====================================================
      // CREAR CUENTA
      // =====================================================

      if (modo === 'registro') {

        if (!nombre.trim()) {
          setMensaje('Escribe tu nombre.')
          return
        }

        if (!correo) {
          setMensaje('Escribe tu correo electrónico.')
          return
        }

        if (password.length < 6) {
          setMensaje(
            'La contraseña debe tener al menos 6 caracteres.'
          )
          return
        }

        const { data, error } = await supabase.auth.signUp({
          email: correo,
          password: password,
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

        // ===================================================
        // REGISTRO EXITOSO CON SESIÓN INMEDIATA
        // ===================================================

        if (data?.session) {
          onLogin(data.session.user)
          return
        }

        // ===================================================
        // REGISTRO EXITOSO PERO REQUIERE CONFIRMACIÓN
        // ===================================================

        setMensaje(
          'Cuenta creada correctamente. Revisa tu correo electrónico y confirma tu cuenta antes de iniciar sesión.'
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
          password: password,
        })

      if (error) {
        console.error(
          'Error al iniciar sesión:',
          error
        )

        const errorMensaje =
          error.message?.toLowerCase() || ''

        // Correo sin confirmar
        if (
          errorMensaje.includes('email not confirmed') ||
          errorMensaje.includes('email_not_confirmed')
        ) {
          throw new Error(
            'Tu correo todavía no está confirmado. Revisa tu correo electrónico y confirma tu cuenta.'
          )
        }

        // Correo o contraseña incorrectos
        if (
          errorMensaje.includes(
            'invalid login credentials'
          )
        ) {
          throw new Error(
            'El correo o la contraseña son incorrectos.'
          )
        }

        // Problemas de conexión
        if (
          errorMensaje.includes('network') ||
          errorMensaje.includes('fetch') ||
          errorMensaje.includes('failed to fetch')
        ) {
          throw new Error(
            'No se pudo conectar con el servidor. Comprueba que tengas Internet e inténtalo nuevamente.'
          )
        }

        throw error
      }

      // =====================================================
      // SESIÓN CORRECTA
      // =====================================================

      if (!data?.user) {
        throw new Error(
          'No se pudo obtener la información de tu cuenta.'
        )
      }

      onLogin(data.user)

    } catch (error) {

      console.error(
        'Error de autenticación:',
        error
      )

      setMensaje(
        error?.message ||
        'Ocurrió un error. Inténtalo nuevamente.'
      )

    } finally {
      setCargando(false)
    }
  }

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

        <form onSubmit={manejarSubmit}>

          {modo === 'registro' && (
            <div className="campo-login">

              <label>Nombre</label>

              <input
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

          <div className="campo-login">

            <label>Correo electrónico</label>

            <input
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

          <div className="campo-login">

            <label>Contraseña</label>

            <input
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

          {mensaje && (
            <div
              className="mensaje-login"
              role="alert"
            >
              {mensaje}
            </div>
          )}

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
          🔒 Tu información personal estará asociada únicamente a tu cuenta.
        </p>

      </div>
    </div>
  )
}

export default Login