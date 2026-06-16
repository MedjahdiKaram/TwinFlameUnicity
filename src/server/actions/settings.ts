'use server'
/* eslint-disable @typescript-eslint/no-explicit-any */

import { revalidatePath } from 'next/cache'
import { createAdminClient, createClient } from '@/lib/supabase/server'
import { analyticsConfig } from '@/lib/config/analytics'

const GOOGLE_ANALYTICS_CONFIG_KEY = 'google_analytics_id'

export async function getGoogleAnalyticsId(): Promise<string> {
  try {
    const supabase = (await createClient()) as any
    const { data, error } = await supabase
      .from('site_config')
      .select('value')
      .eq('key', GOOGLE_ANALYTICS_CONFIG_KEY)
      .maybeSingle()

    if (error) return analyticsConfig.defaultGoogleAnalyticsId

    const gaId = data?.value
    if (typeof gaId === 'string' && gaId.trim()) {
      return gaId.trim()
    }

    return analyticsConfig.defaultGoogleAnalyticsId
  } catch {
    return analyticsConfig.defaultGoogleAnalyticsId
  }
}

export async function saveGoogleAnalyticsId(gaId: string) {
  try {
    const supabase = (await createClient()) as any
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser()

    if (!currentUser) {
      return { error: 'Non authentifié' }
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', currentUser.id)
      .single()

    if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
      return { error: 'Accès interdit. Seuls les administrateurs actifs peuvent modifier ce paramètre.' }
    }

    const adminClient = (await createAdminClient()) as any
    const normalizedGaId = gaId.trim()

    const { error } = await adminClient
      .from('site_config')
      .upsert({ key: GOOGLE_ANALYTICS_CONFIG_KEY, value: normalizedGaId }, { onConflict: 'key' })

    if (error) {
      return { error: `Impossible de sauvegarder Google Analytics ID: ${error.message}` }
    }

    revalidatePath('/[locale]/admin/settings', 'page')
    revalidatePath('/[locale]', 'layout')

    return { success: true }
  } catch (err: any) {
    return { error: err.message || 'Une erreur inattendue est survenue.' }
  }
}
