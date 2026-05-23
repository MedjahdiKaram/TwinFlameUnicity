'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { loginSchema, registerSchema } from '@/lib/validations/auth'

export async function loginAction(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const parsed = loginSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) {
    return { error: 'Email ou mot de passe incorrect' }
  }

  // Check if user is active
  const { data: { user } } = await supabase.auth.getUser()
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single()

    if (profile?.status === 'pending') {
      await supabase.auth.signOut()
      return { error: 'pending' }
    }

    if (profile?.status === 'disabled') {
      await supabase.auth.signOut()
      return { error: 'Compte désactivé. Contactez l\'administrateur.' }
    }
  }

  revalidatePath('/', 'layout')
  return { success: true }
}

export async function registerAction(formData: FormData) {
  const raw = {
    first_name: formData.get('first_name') as string,
    last_name: formData.get('last_name') as string,
    pseudo: formData.get('pseudo') as string,
    gender: formData.get('gender') as string,
    bio: formData.get('bio') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirm_password: formData.get('confirm_password') as string,
  }

  const parsed = registerSchema.safeParse(raw)
  if (!parsed.success) {
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createClient()

  // Check pseudo uniqueness
  const { data: existingPseudo } = await supabase
    .from('profiles')
    .select('id')
    .eq('pseudo', parsed.data.pseudo)
    .single()

  if (existingPseudo) {
    return { error: 'Ce pseudo est déjà utilisé' }
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        pseudo: parsed.data.pseudo,
        gender: parsed.data.gender,
        bio: parsed.data.bio || '',
        role: 'user',
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'Cet email est déjà utilisé' }
    }
    return { error: error.message }
  }

  if (data.user) {
    // Update profile with extra data
    await supabase.from('profiles').update({
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      pseudo: parsed.data.pseudo,
      gender: parsed.data.gender as any,
      bio: parsed.data.bio,
    }).eq('id', data.user.id)
  }

  return { success: true }
}

export async function logoutAction() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/fr')
}

export async function updateProfileAction(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Non authentifié' }

  const updates: Record<string, string> = {}
  const fields = ['first_name', 'last_name', 'pseudo', 'gender', 'bio']
  for (const field of fields) {
    const val = formData.get(field)
    if (val !== null) updates[field] = val as string
  }

  const { error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)

  if (error) return { error: error.message }

  revalidatePath('/', 'layout')
  return { success: true }
}
