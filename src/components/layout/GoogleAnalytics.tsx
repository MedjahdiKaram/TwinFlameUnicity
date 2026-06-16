'use client'

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

  const resolvedGaId = (gaId || '').trim()
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
