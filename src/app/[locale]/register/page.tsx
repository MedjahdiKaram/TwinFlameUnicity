import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { RegisterForm } from '@/components/auth/RegisterForm'
import type { Metadata } from 'next'

type Props = { params: Promise<{ locale: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  return { title: locale === 'ar' ? 'إنشاء حساب | TwinFlameUnicity' : 'Inscription | TwinFlameUnicity' }
}

export default async function RegisterPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect(`/${locale}`)

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden py-12">
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

      <div className="relative z-10 w-full max-w-2xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-display font-bold text-white mb-2">
            {locale === 'ar' ? 'انضم إلى المجتمع' : 'Rejoindre la Communauté'}
          </h1>
          <p className="text-white/40 text-sm">
            {locale === 'ar' ? 'رحلتك تبدأ هنا' : 'Votre voyage commence ici'}
          </p>
        </div>
        <RegisterForm locale={locale as 'fr' | 'ar'} />
      </div>
    </div>
  )
}
