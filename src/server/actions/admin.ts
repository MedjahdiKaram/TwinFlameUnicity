'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createUserAction(formData: FormData) {
  try {
    // 1. Vérifier si l'utilisateur actuel est authentifié et admin
    const supabase = (await createClient()) as any
    const { data: { user: currentUser } } = await supabase.auth.getUser()
    
    if (!currentUser) {
      return { error: 'Non authentifié' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', currentUser.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
      return { error: 'Accès interdit. Seuls les administrateurs actifs peuvent créer des utilisateurs.' }
    }

    // 2. Extraire les données du formulaire
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const role = formData.get('role') as 'admin' | 'user' | 'visitor'
    const status = formData.get('status') as 'pending' | 'active' | 'disabled'
    const first_name = formData.get('first_name') as string
    const last_name = formData.get('last_name') as string
    const pseudo = formData.get('pseudo') as string
    const gender = formData.get('gender') as 'male' | 'female' | 'other' | 'prefer_not_to_say'

    // Validation de base
    if (!email || !password || !role) {
      return { error: 'L\'email, le mot de passe et le rôle sont obligatoires.' }
    }

    if (password.length < 8) {
      return { error: 'Le mot de passe doit contenir au moins 8 caractères.' }
    }

    const adminClient = (await createAdminClient()) as any

    // 3. Vérifier si le pseudo est unique
    if (pseudo) {
      const { data: existingPseudo } = await adminClient
        .from('profiles')
        .select('id')
        .eq('pseudo', pseudo)
        .maybeSingle()

      if (existingPseudo) {
        return { error: 'Ce pseudo est déjà utilisé.' }
      }
    }

    // 4. Créer l'utilisateur dans Supabase Auth
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        first_name,
        last_name,
        pseudo,
        gender,
        role,
      }
    })

    if (authError) {
      if (authError.message.includes('already registered') || authError.message.includes('email already')) {
        return { error: 'Cet email est déjà utilisé.' }
      }
      return { error: authError.message }
    }

    const newUser = authData.user
    if (!newUser) {
      return { error: 'Erreur lors de la création de l\'utilisateur.' }
    }

    // 5. Mettre à jour le profil (car le trigger handle_new_user() peut avoir des valeurs par défaut)
    // On s'assure que le rôle et le statut saisis par l'admin soient bien appliqués
    const { error: profileError } = await adminClient
      .from('profiles')
      .update({
        role,
        status: status || 'active',
        first_name: first_name || null,
        last_name: last_name || null,
        pseudo: pseudo || null,
        gender: gender || 'prefer_not_to_say',
      })
      .eq('id', newUser.id)

    if (profileError) {
      return { error: `Utilisateur créé dans auth, mais erreur lors de la mise à jour du profil: ${profileError.message}` }
    }

    // Récupérer le profil complet mis à jour pour le renvoyer au client
    const { data: updatedProfile } = await adminClient
      .from('profiles')
      .select('id, email, first_name, last_name, pseudo, gender, role, status, created_at, avatar_url')
      .eq('id', newUser.id)
      .single()

    revalidatePath('/[locale]/admin/users', 'page')

    return { 
      success: true, 
      user: updatedProfile
    }
  } catch (err: any) {
    return { error: err.message || 'Une erreur inattendue est survenue.' }
  }
}
