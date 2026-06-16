'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'
import { analyticsConfig } from '@/lib/config/analytics'

type GoogleAnalyticsProps = {
  gaId?: string
  locale?: string
}

export default function GoogleAnalytics({
  gaId,
  locale,
}: GoogleAnalyticsProps) {
  if (locale && !analyticsConfig.enabledLocales.includes(locale as (typeof analyticsConfig.enabledLocales)[number])) {
    return null
  }

  const [resolvedGaId, setResolvedGaId] = useState(gaId || '')

  useEffect(() => {
    if (gaId) {
      setResolvedGaId(gaId)
      return
    }

    try {
      const savedSettings = localStorage.getItem(analyticsConfig.settingsStorageKey)
      if (!savedSettings) return

      const parsed = JSON.parse(savedSettings) as Record<string, unknown>
      const configuredGaId = parsed[analyticsConfig.analyticsIdField]

      if (typeof configuredGaId === 'string' && configuredGaId.trim()) {
        setResolvedGaId(configuredGaId.trim())
      }
    } catch {
      // Ignore malformed local storage settings and keep GA disabled.
    }
  }, [gaId])

  if (!resolvedGaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${resolvedGaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${resolvedGaId}');
        `}
      </Script>
    </>
  )
}
