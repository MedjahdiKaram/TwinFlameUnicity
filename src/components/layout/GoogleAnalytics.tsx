'use client'

import { useEffect, useState } from 'react'
import Script from 'next/script'

export default function GoogleAnalytics() {
  const [gaId, setGaId] = useState<string | null>(null)

  useEffect(() => {
    // 1. Prioritize the environment variable (for production and general visitors)
    const envId = process.env.NEXT_PUBLIC_GA_ID || process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID
    if (envId) {
      setGaId(envId)
      return
    }

    // 2. Fallback to localStorage (mostly for local development/admin testing)
    const saved = localStorage.getItem('twinflame_settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed && parsed.analyticsId) {
          setGaId(parsed.analyticsId)
        }
      } catch (e) {
        console.error('Error parsing twinflame_settings from localStorage:', e)
      }
    }
  }, [])

  if (!gaId) return null

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
        strategy="afterInteractive"
      />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${gaId}', {
            page_path: window.location.pathname,
          });
        `}
      </Script>
    </>
  )
}
