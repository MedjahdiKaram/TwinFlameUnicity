'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Flame, Heart, Eye, Star } from 'lucide-react'

const SERVICES = [
  {
    icon: Flame,
    key: 'eveil_interieur',
    gradient: 'from-purple-600 to-violet-700',
    glow: 'rgba(147,51,234,0.4)',
  },
  {
    icon: Heart,
    key: 'harmonie_couple',
    gradient: 'from-pink-600 to-rose-700',
    glow: 'rgba(236,72,153,0.4)',
  },
  {
    icon: Eye,
    key: 'eveil_conscience',
    gradient: 'from-indigo-600 to-blue-700',
    glow: 'rgba(99,102,241,0.4)',
  },
  {
    icon: Star,
    key: 'guidance_spirituelle',
    gradient: 'from-amber-500 to-orange-600',
    glow: 'rgba(245,158,11,0.4)',
  },
]

export function ServicesSection({ locale }: { locale: 'en' | 'ar' }) {
  const t = useTranslations('home')

  return (
    <section className="relative py-24 overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-950/20 to-transparent pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-3">
            {t('services_title')}{' '}
            <span className="text-cosmic">{t('services_highlight')}</span>
          </h2>
          <div className="w-24 h-px mx-auto bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-4" />
        </motion.div>

        {/* Icons row */}
        <div className="flex justify-center gap-6 sm:gap-10 mb-16 flex-wrap">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex flex-col items-center gap-3 group cursor-pointer"
            >
              <div
                className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${service.gradient} flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg`}
                style={{ boxShadow: `0 0 20px ${service.glow}` }}
              >
                <service.icon className="w-7 h-7 text-white" />
              </div>
              <span className="text-xs font-semibold uppercase tracking-wider text-white/50 text-center max-w-[80px] leading-tight">
                {t(`services_list.${service.key}.title`)}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {SERVICES.map((service, i) => (
            <motion.div
              key={service.key}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="glass-card p-6 group cursor-pointer border border-white/5 hover:border-purple-500/30 transition-all duration-500"
              style={{ '--glow': service.glow } as React.CSSProperties}
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${service.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}
                style={{ boxShadow: `0 0 15px ${service.glow}` }}
              >
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display font-semibold text-white/90 mb-2 text-sm uppercase tracking-wide">
                {t(`services_list.${service.key}.title`)}
              </h3>
              <p className="text-xs text-white/45 leading-relaxed">
                {t(`services_list.${service.key}.description`)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
