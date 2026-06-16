import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import { ContactForm } from '@/components/contact/ContactForm'

type Props = { params: Promise<{ locale: string }> }

export default async function ContactPage({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'contact' })

  return (
    <>
      <Navbar locale={locale} />
      <main className="pt-20">
        <div className="container mx-auto px-4 lg:px-8 py-24 max-w-2xl">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-4">
              {t('title')}
            </h1>
            <p className="text-white/50">{t('subtitle')}</p>
            <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-4" />
          </div>
          <ContactForm locale={locale as 'en' | 'ar'} />
        </div>
      </main>
      <Footer locale={locale} />
    </>
  )
}
