'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'

export function QuizBanner() {
  const t = useTranslations('home')

  return (
    <section className="relative py-16 bg-[#06030c] overflow-hidden px-4">
      <div className="container mx-auto max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl border border-white/5 bg-gradient-to-r from-purple-950/20 via-black/40 to-[#0c051a] overflow-hidden p-8 md:p-12 flex flex-col md:flex-row items-center gap-8 md:gap-12"
        >
          {/* Subtle starry background inside the banner */}
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,rgba(230,200,135,0.05)_0%,transparent_70%)] pointer-events-none" />

          {/* Left Side: Circular Glowing Portal */}
          <div className="relative w-44 h-44 sm:w-56 sm:h-56 flex-shrink-0 flex items-center justify-center">
            {/* Outer golden halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#e6c887] via-[#d4af37] to-transparent opacity-10 blur-md animate-pulse-slow" />
            
            {/* Spinning space portal layer */}
            <div className="absolute inset-2 rounded-full border border-[#e6c887]/20 border-dashed animate-spin-slow" />
            
            {/* Glowing radial orb */}
            <div className="absolute inset-4 rounded-full bg-[radial-gradient(circle,rgba(230,200,135,0.15)_0%,transparent_70%)] blur-sm" />
            
            {/* The Image inside the circular portal */}
            <div className="relative w-36 h-36 sm:w-44 sm:h-44 rounded-full overflow-hidden border border-[#e6c887]/40 shadow-[0_0_20px_rgba(230,200,135,0.2)]">
              <Image
                src="/images/signs-portal.png"
                alt="Twin Flame Connection Portal"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-purple-950/20 to-transparent mix-blend-overlay" />
            </div>
          </div>

          {/* Right Side: Text and CTA */}
          <div className="flex-1 text-center md:text-start flex flex-col items-center md:items-start relative z-10">
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4 leading-tight">
              {t('quiz_title') || 'Are You Experiencing a Twin Flame Connection?'}
            </h2>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed mb-8 max-w-xl">
              {t('quiz_description') || 'Take our free quiz and receive personalized insights about your unique twin flame journey.'}
            </p>
            <Link
              href="/register"
              className="btn-gold px-8 py-3.5 text-[10px] tracking-widest font-bold shadow-glow-sm"
            >
              <span>{t('quiz_cta') || 'TAKE THE FREE QUIZ →'}</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
