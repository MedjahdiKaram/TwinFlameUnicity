import { redirect } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { LoginForm } from '@/components/auth/LoginForm'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'auth' })
  return { title: `${t('login_title')} | TwinFlameUnicity` }
}

export default async function LoginPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(`/${locale}`)

  const t = await getTranslations({ locale, namespace: 'auth' })

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-cosmic-gradient" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.2)_0%,transparent_60%)] pointer-events-none" />

      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              width: Math.random() * 2 + 0.5,
              height: Math.random() * 2 + 0.5,
              animationDelay: `${Math.random() * 4}s`,
              animationDuration: `${Math.random() * 3 + 2}s`,
            }}
          />
        ))}
      </div>

      <div className="relative z-10 w-full max-w-md mx-auto px-4">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-glow">
              <span className="text-white text-lg">✦</span>
            </div>
          </div>
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {t('login_title')}
          </h1>
          <p className="text-white/40 text-sm">
            {t('login_subtitle')}
          </p>
        </div>
        <LoginForm locale={locale as 'en' | 'ar'} />
      </div>
    </div>
  )
}
