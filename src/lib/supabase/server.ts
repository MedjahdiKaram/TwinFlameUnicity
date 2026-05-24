import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database.types'

function getSupabaseUrl(): string {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) {
    throw new Error(
      'Missing env variable NEXT_PUBLIC_SUPABASE_URL. Add it to your Vercel project settings.'
    )
  }
  return url
}

function getSupabaseAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!key) {
    throw new Error(
      'Missing env variable NEXT_PUBLIC_SUPABASE_ANON_KEY. Add it to your Vercel project settings.'
    )
  }
  return key
}

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    getSupabaseUrl(),
    getSupabaseAnonKey(),
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: object }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Called from Server Component — can be ignored
          }
        },
      },
    }
  )
}

export async function createAdminClient() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!serviceRoleKey) {
    throw new Error(
      'Missing env variable SUPABASE_SERVICE_ROLE_KEY. Add it to your Vercel project settings (not prefixed with NEXT_PUBLIC_).'
    )
  }

  const cookieStore = await cookies()

  return createServerClient<Database>(
    getSupabaseUrl(),
    serviceRoleKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options?: object }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
