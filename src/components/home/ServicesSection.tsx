'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Eye, Heart, Flame, Moon, ArrowRight, ArrowLeft } from 'lucide-react'

const SERVICES = [
  {
    icon: Eye,
    key: 'eveil_interieur',
    href: '/static/awakening' as const,
  },
  {
    icon: Heart,
    key: 'harmonie_couple',
    href: '/static/healing' as const,
  },
  {
    icon: Flame,
    key: 'eveil_conscience',
    href: '/static/twin-flame-union' as const,
  },
  {
    icon: Moon,
    key: 'guidance_spirituelle',
    href: '/static/spiritual-growth' as const,
  },
]

export function ServicesSection({ locale }: { locale: 'en' | 'ar' }) {
  const t = useTranslations('home')

  return (
    <section className="relative py-20 bg-[#06030c] border-y border-white/5 overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,200,135,0.02)_0%,transparent_85%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y lg:divide-y-0 lg:divide-x divide-white/5 rtl:divide-x-reverse border border-white/5 rounded-3xl bg-black/30 backdrop-blur-md">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="p-8 flex flex-col items-center text-center group cursor-pointer hover:bg-white/[0.01] transition-all duration-300"
            >
              {/* Gold Outline Icon */}
              <div className="mb-6 text-[#e6c887] group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-8 h-8 stroke-[1.25] drop-shadow-[0_0_8px_rgba(230,200,135,0.2)]" />
              </div>

              {/* Title */}
              <h3 className="font-display font-semibold text-xs tracking-widest text-white mb-3 uppercase">
                {t(`services_list.${service.key}.title`)}
              </h3>

              {/* Description */}
              <p className="text-[11px] text-white/40 leading-relaxed mb-6 max-w-[220px] h-12 flex items-center justify-center">
                {t(`services_list.${service.key}.description`)}
              </p>

              {/* Gold Link */}
              <Link
                href={service.href}
                className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest text-[#e6c887] group-hover:text-white transition-colors uppercase"
              >
                <span>{t('explore') || 'EXPLORE'}</span>
                {locale === 'ar' ? (
                  <ArrowLeft className="w-3 h-3 transition-transform group-hover:-translate-x-1" />
                ) : (
                  <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                )}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
