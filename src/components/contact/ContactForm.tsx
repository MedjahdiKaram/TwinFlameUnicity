'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Send, CheckCircle } from 'lucide-react'

export function ContactForm({ locale }: { locale: 'en' | 'ar' }) {
  const t = useTranslations('contact')
  const [sent, setSent] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate sending (integrate with email service as needed)
    await new Promise((r) => setTimeout(r, 1500))
    setIsLoading(false)
    setSent(true)
  }

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
        <p className="text-white text-lg font-display">{t('success')}</p>
      </motion.div>
    )
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit}
      className="glass-card p-8 space-y-5"
    >
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('name_label')}
          </label>
          <input required name="name" type="text" className="input-cosmic" />
        </div>
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('email_label')}
          </label>
          <input required name="email" type="email" className="input-cosmic" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
          {t('subject_label')}
        </label>
        <input required name="subject" type="text" className="input-cosmic" />
      </div>
      <div>
        <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
          {t('message_label')}
        </label>
        <textarea required name="message" rows={5} className="input-cosmic resize-none" />
      </div>
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex items-center justify-center gap-3 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 transition-all duration-300 shadow-glow-sm hover:shadow-glow"
      >
        {isLoading ? (
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          <>
            <Send className="w-4 h-4" />
            {t('submit')}
          </>
        )}
      </button>
    </motion.form>
  )
}
