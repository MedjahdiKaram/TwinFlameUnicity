'use client'

import { useRouter } from '@/i18n/navigation'
import { motion } from 'framer-motion'
import { Globe } from 'lucide-react'
import { useState } from 'react'

export function LanguageSwitcher({ locale }: { locale: string }) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const switchLocale = (newLocale: string) => {
    // Navigate to the home page of the chosen language
    router.replace('/', { locale: newLocale })
    setIsOpen(false)
    // Save preference
    localStorage.setItem('preferred-locale', newLocale)
  }

  const languages = [
    { code: 'fr', label: 'Français', flag: '🇫🇷', dir: 'ltr' },
    { code: 'ar', label: 'العربية', flag: '🇲🇦', dir: 'rtl' },
  ]

  const current = languages.find((l) => l.code === locale) || languages[0]

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 hover:border-purple-500/30 transition-all duration-300 text-sm"
      >
        <Globe className="w-3.5 h-3.5" />
        <span className="text-sm">{current.flag}</span>
        <span className="hidden sm:block text-xs font-medium">
          {current.code.toUpperCase()}
        </span>
      </button>

      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 8, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.95 }}
          transition={{ duration: 0.15 }}
          className="absolute top-full mt-2 end-0 w-36 glass-card py-1 shadow-xl shadow-purple-900/30 z-50"
        >
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => switchLocale(lang.code)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors ${
                lang.code === locale
                  ? 'text-purple-300 bg-purple-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
              dir={lang.dir}
            >
              <span>{lang.flag}</span>
              <span>{lang.label}</span>
              {lang.code === locale && (
                <motion.div
                  layoutId="lang-active"
                  className="ms-auto w-1.5 h-1.5 rounded-full bg-purple-400"
                />
              )}
            </button>
          ))}
        </motion.div>
      )}
    </div>
  )
}
