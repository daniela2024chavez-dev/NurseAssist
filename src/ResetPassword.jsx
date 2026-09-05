import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Login.css'

function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirmarPassword, setConfirmarPassword] =
    useState('')

  const [mensaje, setMensaje] = useState('')
  const [exito, setExito] = useState(false)
  const [cargando, setCargando] = useState(false)

  const cambiarContrasena = async (e) => {
    e.preventDefault()

    setMensaje('')
    setExito(false)

    if (password.length < 6) {
      setMensaje(
        'La contraseña debe tener al menos 6 caracteres.'
      )
      return
    }

    if (password !== confirmarPassword) {
      setMensaje(
        'Las contraseñas no coinciden.'
      )
      return
    }

    setCargando(true)

    try {
      const { error } =
        await supabase.auth.updateUser({
          password: password,
        })

      if (error) {
        console.error(
          'Error al cambiar contraseña:',
          error
        )

        throw error
      }

      setExito(true)

      setMensaje(
        'Tu contraseña fue cambiada correctamente.'
      )

      setPassword('')
      setConfirmarPassword('')

    } catch (error) {
      console.error(
        'Error al cambiar contraseña:',
        error
      )

      setMensaje(
        error?.message ||
        'No se pudo cambiar la contraseña. Inténtalo nuevamente.'
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

        <h1>Nueva contraseña</h1>

        <p className="login-subtitulo">
          Crea una nueva contraseña para tu cuenta
        </p>

        {!exito ? (

          <form onSubmit={cambiarContrasena}>

            <div className="campo-login">

              <label>
                Nueva contraseña
              </label>

              <input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={password}
                onChange={(e) =>
                  setPassword(e.target.value)
                }
                minLength={6}
                required
                autoComplete="new-password"
              />

            </div>

            <div className="campo-login">

              <label>
                Confirmar contraseña
              </label>

              <input
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmarPassword}
                onChange={(e) =>
                  setConfirmarPassword(e.target.value)
                }
                minLength={6}
                required
                autoComplete="new-password"
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
                ? 'Guardando...'
                : '🔐 Cambiar contraseña'}
            </button>

          </form>

        ) : (

          <>
            <div
              className="mensaje-login"
              style={{
                background: '#effaf7',
                borderColor: '#cceee5',
                color: '#18745f',
              }}
            >
              ✅ {mensaje}
            </div>

            <button
              type="button"
              className="boton-login"
              onClick={() => {
                window.location.href = '/'
              }}
            >
              Volver a iniciar sesión
            </button>
          </>

        )}

        <p className="texto-seguridad">
          🔒 Tu contraseña está protegida de forma segura.
        </p>

      </div>

    </div>
  )
}

export default ResetPassword