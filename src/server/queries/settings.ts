/* eslint-disable @typescript-eslint/no-explicit-any */

import { createClient } from '@/lib/supabase/server'
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
