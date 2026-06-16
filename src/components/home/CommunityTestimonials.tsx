'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Star, ChevronLeft, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const TESTIMONIALS = [
  {
    stars: 5,
    key: "sophia",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&h=150&q=80",
    name: "SOPHIA L.",
    country: "France",
  },
  {
    stars: 5,
    key: "melanie",
    avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&h=150&q=80",
    name: "MELANIE R.",
    country: "Canada",
  },
  {
    stars: 5,
    key: "jessica",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
    name: "JESSICA T.",
    country: "Australia",
  },
]

export function CommunityTestimonials() {
  const t = useTranslations('home')
  const [index, setIndex] = useState(0)

  const handleNext = () => {
    setIndex((prev) => (prev + 1) % TESTIMONIALS.length)
  }

  const handlePrev = () => {
    setIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  }

  return (
    <section className="relative py-24 bg-[#06030c] overflow-hidden px-4">
      <div className="container mx-auto max-w-5xl relative z-10 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-display font-bold text-white leading-tight">
            {t('testimonials_title') || 'What Our Community Says'}
          </h2>
          <div className="w-16 h-px mx-auto bg-gradient-to-r from-transparent via-[#e6c887]/50 to-transparent mt-4" />
        </motion.div>

        {/* Testimonials Slider */}
        <div className="relative flex items-center justify-center min-h-[300px]">
          {/* Left Button */}
          <button
            onClick={handlePrev}
            className="absolute left-0 md:left-4 z-20 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#e6c887] hover:border-[#e6c887]/40 bg-black/40 backdrop-blur-sm transition-all"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          {/* Testimonial Cards Grid / Desktop View (All 3) */}
          <div className="hidden md:grid grid-cols-3 gap-6 w-full max-w-4xl">
            {TESTIMONIALS.map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="border-gold-glow p-8 rounded-2xl flex flex-col justify-between text-center relative group"
              >
                <div>
                  {/* Gold Stars */}
                  <div className="flex justify-center gap-1 text-[#e6c887] mb-6">
                    {Array.from({ length: item.stars }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#e6c887] stroke-none" />
                    ))}
                  </div>

                  {/* Review Text */}
                  <p className="text-[11px] text-white/70 leading-relaxed italic mb-8 min-h-[80px]">
                    "{t(`testimonials.${item.key}.text`)}"
                  </p>
                </div>

                {/* Profile Info */}
                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#e6c887]/40 mb-3 shadow-[0_0_15px_rgba(230,200,135,0.1)]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                    {item.name}
                  </span>
                  <span className="text-[9px] text-[#e6c887]/65 tracking-wider font-semibold mt-0.5">
                    {item.country}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Mobile Testimonial View (1 card at a time with Animation) */}
          <div className="md:hidden w-full max-w-sm px-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="border-gold-glow p-8 rounded-2xl flex flex-col justify-between text-center min-h-[300px]"
              >
                <div>
                  <div className="flex justify-center gap-1 text-[#e6c887] mb-6">
                    {Array.from({ length: TESTIMONIALS[index].stars }).map((_, s) => (
                      <Star key={s} className="w-3.5 h-3.5 fill-[#e6c887] stroke-none" />
                    ))}
                  </div>
                  <p className="text-[11px] text-white/70 leading-relaxed italic mb-8">
                    "{t(`testimonials.${TESTIMONIALS[index].key}.text`)}"
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border border-[#e6c887]/40 mb-3">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={TESTIMONIALS[index].avatar}
                      alt={TESTIMONIALS[index].name}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <span className="text-[10px] font-bold text-white tracking-widest uppercase">
                    {TESTIMONIALS[index].name}
                  </span>
                  <span className="text-[9px] text-[#e6c887]/65 tracking-wider mt-0.5">
                    {TESTIMONIALS[index].country}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Right Button */}
          <button
            onClick={handleNext}
            className="absolute right-0 md:right-4 z-20 w-10 h-10 rounded-full border border-white/10 flex items-center justify-center text-white/40 hover:text-[#e6c887] hover:border-[#e6c887]/40 bg-black/40 backdrop-blur-sm transition-all"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </section>
  )
}
