'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Settings } from 'lucide-react'
import Image from 'next/image'
import { Link, usePathname } from '@/i18n/navigation'
import { LanguageSwitcher } from './LanguageSwitcher'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/types/database.types'

const NAV_LINKS = [
  { key: 'home', href: '/' as const },
  { key: 'twin_flames', href: '/categories/flammes-jumelles' as const },
  { key: 'soulmates', href: '/categories/ames-soeurs' as const },
  { key: 'awakening', href: '/categories/eveil-spirituel' as const },
  { key: 'healing', href: '/categories/guerison' as const },
  { key: 'blog', href: '/blog' as const },
  { key: 'resources', href: '/resources' as const },
  { key: 'about', href: '/about' as const },
]

export function Navbar({ locale }: { locale: string }) {
  const t = useTranslations('nav')
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  // Scroll listener
  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  // Fetch current user
  useEffect(() => {
    const supabase = createClient()
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()
        setProfile(data)
      }
    }
    fetchProfile()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      fetchProfile()
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = useCallback(async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setProfile(null)
    setIsUserMenuOpen(false)
  }, [])

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    return pathname.includes(href)
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled
          ? 'bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-purple-900/10'
          : 'bg-transparent'
      }`}
    >
      <nav className="container mx-auto flex items-center justify-between lg:grid lg:grid-cols-3 h-20 px-4 lg:px-8">
        {/* Logo */}
        <div className="flex justify-start">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-10 h-10 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#e6c887]/10 to-[#d4af37]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
              <Image
                src="/images/logo_twin.png"
                alt="TwinFlame Unicity Logo"
                title="TwinFlame Unicity Logo"
                width={40}
                height={40}
                className="relative z-10 w-auto h-10 object-contain transition-transform duration-300 group-hover:scale-105"
                priority
              />
            </div>
            <div className="hidden sm:block">
              <div className="text-sm font-display font-bold tracking-wider text-white leading-none">
                TwinFlame
              </div>
              <div className="text-[10px] text-gold font-display font-semibold tracking-widest">
                UNICITY
              </div>
            </div>
          </Link>
        </div>

        {/* Desktop navigation */}
        <div className="hidden lg:flex justify-center">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map(({ key, href }) => (
              <li key={key}>
                <Link
                  href={href}
                  className={`relative px-3 py-2 text-[10px] font-semibold uppercase tracking-wider transition-all duration-300 rounded-lg group ${
                    isActive(href)
                      ? 'text-[#e6c887]'
                      : 'text-white/70 hover:text-white'
                  }`}
                >
                  {isActive(href) && (
                    <motion.span
                      layoutId="nav-active"
                      className="absolute inset-0 rounded-lg bg-white/5 border border-white/5"
                      transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative">{t(key as any)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Right actions */}
        <div className="flex items-center justify-end gap-3">
          <LanguageSwitcher locale={locale} />

          {profile ? (
            <div className="relative">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 hover:border-[#e6c887]/40 transition-all duration-300 text-sm"
              >
                {profile.avatar_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={profile.avatar_url}
                    alt={profile.pseudo || ''}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <User className="w-4 h-4" />
                )}
                <span className="hidden sm:block max-w-[100px] truncate">
                  {profile.pseudo || profile.first_name || 'Profil'}
                </span>
              </button>

              <AnimatePresence>
                {isUserMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute top-full mt-2 end-0 w-48 glass-card py-2 shadow-xl shadow-purple-900/30"
                  >
                    <Link
                      href="/profile"
                      onClick={() => setIsUserMenuOpen(false)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-white/80 hover:text-white hover:bg-white/5 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      {t('profile')}
                    </Link>
                    {profile.role === 'admin' && (
                      <Link
                        href="/admin"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-purple-300 hover:text-purple-200 hover:bg-purple-500/10 transition-colors"
                      >
                        <Settings className="w-4 h-4" />
                        {t('admin')}
                      </Link>
                    )}
                    <div className="cosmic-divider my-1" />
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-white/70 hover:text-white transition-colors"
              >
                {t('login')}
              </Link>
              <Link
                href="/register"
                className="btn-gold shadow-glow-sm h-10 flex items-center justify-center text-[10px] tracking-wider"
              >
                {t('start_here')}
              </Link>
            </div>
          )}

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="lg:hidden p-2 rounded-xl bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-all"
            aria-label="Toggle menu"
          >
            {isMobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden bg-black/95 backdrop-blur-xl border-b border-white/10"
          >
            <div className="container mx-auto px-4 py-6 space-y-1">
              {NAV_LINKS.map(({ key, href }) => (
                <Link
                  key={key}
                  href={href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(href)
                      ? 'bg-white/5 text-[#e6c887] border border-[#e6c887]/20'
                      : 'text-white/70 hover:text-white hover:bg-white/5'
                  }`}
                >
                  {t(key as any)}
                </Link>
              ))}
              {!profile && (
                <div className="pt-4 flex flex-col gap-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileOpen(false)}
                    className="block text-center px-4 py-3 rounded-xl text-sm font-medium text-white/70 border border-white/10 hover:bg-white/5 transition-all"
                  >
                    {t('login')}
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileOpen(false)}
                    className="btn-gold py-3 text-xs justify-center"
                  >
                    {t('start_here')}
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
