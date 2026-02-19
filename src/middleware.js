import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // 1. Preparar respuesta (necesaria para manejar cookies de sesión)
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 2. Crear cliente Supabase (Versión segura para servidor)
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // 3. Revisar si hay usuario logueado
  const { data: { user } } = await supabase.auth.getUser()

  // --- REGLAS DE SEGURIDAD ---

  // REGLA A: Si quiere entrar al ADMIN y NO hay usuario -> Al Login
  if (request.nextUrl.pathname.startsWith('/admin') && !user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // REGLA B: Si quiere entrar al LOGIN y YA hay usuario -> Al Admin (para que no se loguee dos veces)
  if (request.nextUrl.pathname === '/login' && user) {
    return NextResponse.redirect(new URL('/admin', request.url))
  }

  return response
}

// --- CONFIGURACIÓN: ESTO ES LO QUE PROTEGE AL PÚBLICO ---
export const config = {
  matcher: [
    // Solo se activa en estas rutas:
    '/admin/:path*', 
    '/login'
    // Todo lo demás (home, productos, carrito) pasa de largo sin chequeo.
  ],
}