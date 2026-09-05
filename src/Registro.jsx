import { useState } from 'react'
import { supabase } from './supabaseClient'
import './Registro.css'

function Registro({ onIrLogin }) {
const [nombre, setNombre] = useState('')
const [correo, setCorreo] = useState('')
const [password, setPassword] = useState('')
const [confirmarPassword, setConfirmarPassword] = useState('')
const [mensaje, setMensaje] = useState('')
const [cargando, setCargando] = useState(false)

const registrar = async (e) => {
e.preventDefault()
setMensaje('')

if (!nombre || !correo || !password || !confirmarPassword) {
  setMensaje('⚠️ Completa todos los campos.')
  return
}

if (password !== confirmarPassword) {
  setMensaje('❌ Las contraseñas no coinciden.')
  return
}

if (password.length < 6) {
  setMensaje('⚠️ La contraseña debe tener al menos 6 caracteres.')
  return
}

setCargando(true)

const { error } = await supabase.auth.signUp({
  email: correo,
  password: password,
  options: {
    data: {
      nombre: nombre,
    },
  },
})

setCargando(false)

if (error) {
  setMensaje(`❌ ${error.message}`)
  return
}

setMensaje(
  '✅ Cuenta creada correctamente. Revisa tu correo para confirmar tu cuenta.'
)
```

}

return ( <div className="registro-page"> <div className="registro-card">


    <div className="registro-logo">
      🩺
    </div>

    <h1>Crear cuenta</h1>

    <p className="registro-subtitulo">
      Únete a NurseAssist
    </p>

    <form onSubmit={registrar}>

      <label>Nombre</label>
      <input
        type="text"
        placeholder="Tu nombre"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
      />

      <label>Correo electrónico</label>
      <input
        type="email"
        placeholder="ejemplo@correo.com"
        value={correo}
        onChange={(e) => setCorreo(e.target.value)}
      />

      <label>Contraseña</label>
      <input
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />

      <label>Confirmar contraseña</label>
      <input
        type="password"
        placeholder="Repite tu contraseña"
        value={confirmarPassword}
        onChange={(e) => setConfirmarPassword(e.target.value)}
      />

      {mensaje && (
        <div className="registro-mensaje">
          {mensaje}
        </div>
      )}

      <button
        type="submit"
        className="btn-registrarse"
        disabled={cargando}
      >
        {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>

    </form>

    <div className="registro-login">
      ¿Ya tienes una cuenta?
      <button type="button" onClick={onIrLogin}>
        Iniciar sesión
      </button>
    </div>

  </div>
</div>
```

}

export default Registro
