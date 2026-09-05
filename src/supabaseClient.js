import { createClient } from '@supabase/supabase-js'

const supabaseUrl =
  'https://uidzjsazfydhrxebgpay.supabase.co'

const supabasePublishableKey =
  'sb_publishable_bsxRXrVYvnF_SeRW2BinEA_9K0o8krN'

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      // Mantiene la sesión en el navegador/dispositivo
      persistSession: true,

      // Renueva automáticamente la sesión
      autoRefreshToken: true,

      // Permite detectar sesiones después de una redirección
      detectSessionInUrl: true,

      // Almacena la sesión localmente
      storage: localStorage,
    },
  }
)
