'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import Image from 'next/image'

export function NewsletterSection() {
  const t = useTranslations('home')
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    // Mock signup behavior
    setTimeout(() => {
      setStatus('success')
      setFirstName('')
      setEmail('')
    }, 1200)
  }

  return (
    <section className="relative py-20 bg-[#06030c] overflow-hidden px-4 border-t border-white/5">
      {/* Background gradients and glows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(147,51,234,0.05)_0%,transparent_60%)] pointer-events-none" />

      <div className="container mx-auto max-w-5xl relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          {/* Left Column: Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-start flex flex-col items-start"
          >
            <h2 className="text-2xl sm:text-3xl font-display font-bold text-white mb-4 leading-tight">
              {t('newsletter_title') || 'Receive Weekly Spiritual Guidance'}
            </h2>
            <p className="text-xs sm:text-sm text-white/50 leading-relaxed max-w-md">
              {t('newsletter_description') || 'Join our sacred circle and receive insights, energy updates and exclusive content to support your journey.'}
            </p>
          </motion.div>

          {/* Right Column: Form Container */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-black/30 border border-white/5 rounded-3xl p-8 backdrop-blur-md relative overflow-hidden"
          >
            <form onSubmit={handleSubmit} className="space-y-4 relative z-10">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name Input */}
                <div>
                  <input
                    type="text"
                    placeholder={t('first_name_placeholder') || 'First Name'}
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-purple-950/20 px-4 py-3 text-xs text-white/90 placeholder-white/30 outline-none focus:border-[#e6c887]/50 focus:ring-1 focus:ring-[#e6c887]/30 transition-all"
                  />
                </div>

                {/* Email Input */}
                <div>
                  <input
                    type="email"
                    placeholder={t('email_placeholder') || 'Email Address'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-purple-950/20 px-4 py-3 text-xs text-white/90 placeholder-white/30 outline-none focus:border-[#e6c887]/50 focus:ring-1 focus:ring-[#e6c887]/30 transition-all"
                  />
                </div>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={status === 'loading'}
                className="btn-gold w-full text-[10px] tracking-widest font-bold h-11 flex items-center justify-center gap-2 shadow-glow-sm"
              >
                {status === 'loading' ? (
                  <span>{t('submitting') || 'SENDING...'}</span>
                ) : status === 'success' ? (
                  <span>{t('subscribed') || 'JOINED SUCCESSFULLY!'}</span>
                ) : (
                  <span>{t('newsletter_cta') || 'JOIN THE SACRED CIRCLE →'}</span>
                )}
              </button>

              {status === 'success' && (
                <p className="text-[10px] text-[#e6c887] text-center mt-2 font-semibold">
                  {t('newsletter_success') || 'Welcome to our sacred circle! Check your email.'}
                </p>
              )}
            </form>
          </motion.div>
        </div>
      </div>

      {/* Crystal Clusters Bottom Right Decoration */}
      <div className="absolute right-0 bottom-0 w-32 h-32 sm:w-44 sm:h-44 pointer-events-none opacity-40 select-none">
        <Image
          src="/images/crystals-cluster.png"
          alt="Crystals decoration"
          fill
          className="object-contain object-bottom right-0"
        />
      </div>
    </section>
  )
}
