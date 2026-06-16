import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'
import { getMessages, getTranslations } from 'next-intl/server'
import { Cinzel, Playfair_Display, Inter, Amiri, Cairo } from 'next/font/google'
import { ThemeProvider } from '@/components/providers/ThemeProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { Toaster } from '@/components/ui/toaster'
import { routing } from '@/i18n/routing'
import { FairyCursor } from '@/components/layout/FairyCursor'
import GoogleAnalytics from '@/components/layout/GoogleAnalytics'
import { getGoogleAnalyticsId } from '@/server/actions/settings'
import '../globals.css'

// ── Fonts ──────────────────────────────────────────────────
const cinzel = Cinzel({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-cinzel',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-playfair',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
})

const amiri = Amiri({
  subsets: ['arabic'],
  weight: ['400', '700'],
  style: ['normal', 'italic'],
  variable: '--font-amiri',
  display: 'swap',
})

const cairo = Cairo({
  subsets: ['arabic'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-cairo',
  display: 'swap',
})

// ── Types ───────────────────────────────────────────────────
type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

// ── Metadata ────────────────────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'seo' })
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: t('default_title'),
      template: `%s | TwinFlameUnicity`,
    },
    description: t('default_description'),
    keywords: [
      'flammes jumelles', 'twin flames', 'union sacrée', 'éveil spirituel', 
      'amour inconditionnel', 'relation d\'âme', 'âme sœur', 'spiritualité', 
      'numérologie', 'ésotérisme', 'tarot', 'méditation', 'astrologie', 
      'توأم الشعلة', 'الروحانية', 'اليقظة الروحية', 'علم الأعداد'
    ],
    authors: [{ name: 'TwinFlameUnicity' }],
    creator: 'TwinFlameUnicity',
    publisher: 'TwinFlameUnicity',
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon-32x32.png',
      apple: '/apple-touch-icon.png',
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
    },
    openGraph: {
      type: 'website',
      locale: locale === 'ar' ? 'ar_MA' : 'fr_FR',
      siteName: 'TwinFlameUnicity',
      title: t('default_title'),
      description: t('default_description'),
      url: `${siteUrl}/${locale}`,
      images: [
        {
          url: '/images/og-default.jpg',
          width: 1200,
          height: 630,
          alt: 'TwinFlameUnicity — Éveil & Flammes Jumelles',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: t('default_title'),
      description: t('default_description'),
      images: ['/images/og-default.jpg'],
    },
    alternates: {
      canonical: `/${locale}`,
      languages: {
        en: '/en',
        ar: '/ar',
      },
    },
    verification: {
      google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || '',
      yandex: process.env.NEXT_PUBLIC_YANDEX_VERIFICATION || '',
    },
    other: {
      'theme-color': '#0a0516',
      'apple-mobile-web-app-capable': 'yes',
      'apple-mobile-web-app-status-bar-style': 'black-translucent',
    },
  }
}

// ── Static params ────────────────────────────────────────────
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

// ── Layout ───────────────────────────────────────────────────
export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params

  if (!routing.locales.includes(locale as 'en' | 'ar')) {
    notFound()
  }

  const messages = await getMessages()
  const isRtl = locale === 'ar'
  const googleAnalyticsId = await getGoogleAnalyticsId()

  return (
    <html
      lang={locale}
      dir={isRtl ? 'rtl' : 'ltr'}
      suppressHydrationWarning
      className={`${cinzel.variable} ${playfair.variable} ${inter.variable} ${amiri.variable} ${cairo.variable}`}
    >
      <body className="min-h-screen bg-cosmic-gradient antialiased">
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem={false}
            disableTransitionOnChange={false}
          >
            <QueryProvider>
              <GoogleAnalytics gaId={googleAnalyticsId} locale={locale} />
              <FairyCursor />
              {children}
              <Toaster />
            </QueryProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
