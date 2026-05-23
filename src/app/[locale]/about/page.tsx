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
            <p>
              TwinFlameUnicity est un espace sacré dédié aux Flammes Jumelles et aux âmes en quête d&apos;éveil spirituel. Notre mission est de vous accompagner sur le chemin de la reconnexion à votre essence divine, à travers des articles de guidance, des pratiques de méditation et une communauté bienveillante.
            </p>
            <p>
              Nous croyons que chaque âme porte en elle une lumière unique, et que la rencontre avec sa Flamme Jumelle représente l&apos;opportunité la plus profonde d&apos;éveil et de transformation intérieure.
            </p>
            <p>
              Notre approche est holistique, alliant sagesse spirituelle ancienne et compréhension moderne de la psychologie de l&apos;âme. Nous vous invitons à explorer, questionner et vous connecter à votre vérité la plus profonde.
            </p>
          </div>
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
