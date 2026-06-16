import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { motion } from 'framer-motion'

type Props = { params: Promise<{ locale: string }> }

export default async function AboutPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'about' })

  return (
    <>
      <Navbar locale={locale} />
      <main className="pt-20">
        <div className="container mx-auto px-4 lg:px-8 py-24 max-w-3xl">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
              <span className="text-cosmic">{t('title')}</span>
            </h1>
            <p className="text-white/50">{t('subtitle')}</p>
            <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-6" />
          </div>

          <div className="glass-card p-10 space-y-6 text-white/70 leading-relaxed">
            {locale === 'ar' ? (
              <>
                <p>
                  TwinFlameUnicity هو مساحة مقدسة مكرسة لتوائم الشعلة والنفوس التي تسعى إلى الصحوة الروحية. مهمتنا هي مرافقتك في طريق إعادة الاتصال بجوهرك الإلهي، من خلال مقالات الإرشاد، وممارسات التأمل، ومجتمع متعاطف.
                </p>
                <p>
                  نحن نؤمن بأن كل روح تحمل نوراً فريداً، وأن لقاء توأم الشعلة يمثل الفرصة الأعمق للصحوة والتحول الداخلي.
                </p>
                <p>
                  نهجنا شمولي، يجمع بين الحكمة الروحية القديمة والفهم الحديث لعلم نفس الروح. ندعوك للاستكشاف والتساؤل والاتصال بحقيقتك العميقة.
                </p>
              </>
            ) : (
              <>
                <p>
                  TwinFlameUnicity is a sacred space dedicated to Twin Flames and souls seeking spiritual awakening. Our mission is to accompany you on the path of reconnecting to your divine essence, through guidance articles, meditation practices, and a caring community.
                </p>
                <p>
                  We believe that every soul carries a unique light, and that meeting one's Twin Flame represents the most profound opportunity for awakening and inner transformation.
                </p>
                <p>
                  Our approach is holistic, combining ancient spiritual wisdom with a modern understanding of soul psychology. We invite you to explore, question, and connect to your deepest truth.
                </p>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
