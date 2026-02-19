import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // Si no hay "next", que vaya al admin por defecto
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    // 1. Preparamos la respuesta de Redirección (El destino final)
    const response = NextResponse.redirect(`${origin}${next}`)

    // 2. Creamos el cliente Supabase pasándole esa respuesta
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              // A. Actualizamos la request (para que el código actual la vea)
              request.cookies.set(name, value)
              // B. IMPORTANTE: Guardamos la cookie en la RESPUESTA que va al navegador
              response.cookies.set(name, value, options)
            })
          },
        },
      }
    )
    
    // 3. Hacemos el canje (Esto dispara el setAll de arriba)
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // 4. Devolvemos la respuesta que YA TIENE las cookies pegadas
      return response
    }
  }

  // Si falló algo, devolvemos al login
  return NextResponse.redirect(`${origin}/login?error=auth-code-error`)
}