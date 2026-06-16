import { notFound } from 'next/navigation'
import { getTranslations } from 'next-intl/server'
import { Navbar } from '@/components/layout/Navbar'
import { Footer } from '@/components/layout/Footer'
import Image from 'next/image'
import { Eye, Heart, Flame, Moon, Sparkles, Sun, Infinity, Compass } from 'lucide-react'

type Props = {
  params: Promise<{ locale: string; slug: string }>
}

// Map slugs to background images
const BG_IMAGES: Record<string, string> = {
  'awakening': '/images/static-awakening.jpg',
  'healing': '/images/static-healing.jpg',
  'twin-flame-union': '/images/static-twin-flame-union.jpg',
  'spiritual-growth': '/images/static-spiritual-growth.jpg',
}

// Map slugs to feature icons
const FEATURE_ICONS: Record<string, any[]> = {
  'awakening': [Sun, Sparkles, Compass],
  'healing': [Heart, Sparkles, Compass],
  'twin-flame-union': [Flame, Infinity, Heart],
  'spiritual-growth': [Moon, Compass, Sparkles],
}

export async function generateStaticParams() {
  const slugs = ['awakening', 'healing', 'twin-flame-union', 'spiritual-growth']
  return slugs.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props) {
  const { locale, slug } = await params
  if (!['awakening', 'healing', 'twin-flame-union', 'spiritual-growth'].includes(slug)) {
    return {}
  }
  const t = await getTranslations({ locale, namespace: 'static_pages' })
  return {
    title: `${t(`${slug}.title` as any)} | TwinFlameUnicity`,
    description: t(`${slug}.intro` as any),
  }
}

export default async function StaticPage({ params }: Props) {
  const { locale, slug } = await params

  if (!['awakening', 'healing', 'twin-flame-union', 'spiritual-growth'].includes(slug)) {
    notFound()
  }

  const t = await getTranslations({ locale, namespace: 'static_pages' })
  const bgImage = BG_IMAGES[slug]
  const icons = FEATURE_ICONS[slug]

  // Retrieve features (index 0, 1, 2)
  const features = [0, 1, 2].map((idx) => ({
    title: t(`${slug}.features.${idx}.title` as any),
    desc: t(`${slug}.features.${idx}.desc` as any),
    icon: icons[idx] || Sparkles,
  }))

  const isRtl = locale === 'ar'

  return (
    <>
      <Navbar locale={locale} />
      <main className="min-h-screen bg-[#06030c] overflow-hidden">
        {/* Hero Banner Section */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 select-none pointer-events-none">
            <Image
              src={bgImage}
              alt={t(`${slug}.title` as any)}
              fill
              priority
              className="object-cover opacity-60"
            />
            {/* Smooth transition gradient */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/20 to-[#06030c]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,#06030c_90%)]" />
          </div>

          <div className="relative z-10 container mx-auto px-4 text-center max-w-3xl pt-12">
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#e6c887] mb-3 block">
              {t(`${slug}.subtitle` as any)}
            </span>
            <h1 className="text-4xl sm:text-5xl font-display font-black text-white mb-6 uppercase tracking-wider leading-tight">
              {t(`${slug}.title` as any)}
            </h1>
            <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#e6c887]/50 to-transparent" />
          </div>
        </section>

        {/* Narrative & Details Section */}
        <section className="py-20 relative">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.02)_0%,transparent_70%)] pointer-events-none" />

          <div className="container mx-auto px-4 lg:px-8 max-w-4xl relative z-10">
            {/* Intro paragraph */}
            <div className="text-center mb-16 max-w-2xl mx-auto">
              <p className="text-sm sm:text-base text-white/70 leading-relaxed font-light">
                {t(`${slug}.intro` as any)}
              </p>
            </div>

            {/* Features Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map((feature, i) => (
                <div
                  key={i}
                  className="border-gold-glow p-8 rounded-2xl bg-black/40 backdrop-blur-md text-center flex flex-col items-center group hover:bg-white/[0.01] transition-all duration-300"
                >
                  <div className="mb-5 text-[#e6c887] group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-8 h-8 stroke-[1.25] drop-shadow-[0_0_8px_rgba(230,200,135,0.2)]" />
                  </div>
                  <h3 className="font-display font-bold text-xs tracking-wider text-white mb-3 uppercase">
                    {feature.title}
                  </h3>
                  <p className="text-[11px] text-white/40 leading-relaxed">
                    {feature.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer locale={locale} />
    </>
  )
}
