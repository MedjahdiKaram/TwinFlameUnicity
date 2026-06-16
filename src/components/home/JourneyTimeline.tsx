'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Sun, Sparkles, HeartCrack, Flame, UserCheck, Infinity } from 'lucide-react'

const STEPS = [
  {
    num: "01",
    icon: Sun,
    key: "awakening",
  },
  {
    num: "02",
    icon: Sparkles,
    key: "recognition",
  },
  {
    num: "03",
    icon: HeartCrack,
    key: "separation",
  },
  {
    num: "04",
    icon: Flame,
    key: "healing",
  },
  {
    num: "05",
    icon: UserCheck,
    key: "inner_union",
  },
  {
    num: "06",
    icon: Infinity,
    key: "sacred_union",
  },
]

export function JourneyTimeline() {
  const t = useTranslations('home')

  return (
    <section className="relative py-24 bg-[#06030c] overflow-hidden px-4">
      {/* Background stars */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(230,200,135,0.01)_0%,transparent_80%)] pointer-events-none" />

      <div className="container mx-auto max-w-6xl relative z-10 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#e6c887] mb-2 block">
            {t('timeline_tag') || 'THE TWIN FLAME JOURNEY'}
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">
            {t('timeline_title') || 'The Path To Sacred Union'}
          </h2>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#e6c887]/50 to-transparent mt-4" />
        </motion.div>

        {/* Timeline Path */}
        <div className="relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-[52px] left-8 right-8 h-0.5 bg-gradient-to-r from-white/5 via-[#e6c887]/30 to-white/5" />

          {/* Grid of Nodes */}
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-10 lg:gap-4 relative z-10">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="flex flex-col items-center group"
              >
                {/* Gold Circle Node with Icon */}
                <div className="relative w-24 h-24 rounded-full border border-white/5 bg-black/40 flex items-center justify-center mb-4 group-hover:border-[#e6c887]/40 shadow-glow-sm group-hover:shadow-[0_0_20px_rgba(230,200,135,0.15)] transition-all duration-500">
                  <div className="absolute inset-2 rounded-full bg-white/[0.02] border border-white/5 flex items-center justify-center">
                    <step.icon className="w-8 h-8 text-[#e6c887] stroke-[1.25] group-hover:scale-110 transition-transform duration-300" />
                  </div>
                </div>

                {/* Numeric Badge */}
                <span className="text-[9px] font-bold text-[#e6c887]/70 tracking-widest mb-1.5 uppercase">
                  {step.num}
                </span>

                {/* Step Name */}
                <h3 className="font-display text-xs font-bold text-white mb-2 uppercase group-hover:text-[#e6c887] transition-colors">
                  {t(`timeline_steps.${step.key}.title`)}
                </h3>

                {/* Step Description */}
                <p className="text-[10px] text-white/40 leading-relaxed max-w-[170px]">
                  {t(`timeline_steps.${step.key}.description`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
