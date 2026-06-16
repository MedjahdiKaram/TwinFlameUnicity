'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { usePathname } from '@/i18n/navigation'
import {
  LayoutDashboard, FileText, FolderOpen, Tag,
  Users, Image as ImageIcon, Settings, Menu, X, LogOut
} from 'lucide-react'
import Image from 'next/image'
import { Link } from '@/i18n/navigation'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from '@/i18n/navigation'

const NAV_ITEMS = [
  { key: 'dashboard' as const, href: '/admin', icon: LayoutDashboard },
  { key: 'articles' as const, href: '/admin/articles', icon: FileText },
  { key: 'categories' as const, href: '/admin/categories', icon: FolderOpen },
  { key: 'tags' as const, href: '/admin/tags', icon: Tag },
  { key: 'users' as const, href: '/admin/users', icon: Users },
  { key: 'media' as const, href: '/admin/media', icon: ImageIcon },
  { key: 'settings' as const, href: '/admin/settings', icon: Settings },
]

export function AdminSidebar({ locale }: { locale: string }) {
  const t = useTranslations('admin')
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}`)
  }

  const isActive = (href: string) => {
    const fullHref = `/${locale}${href}`
    if (href === '/admin') return pathname === fullHref
    return pathname.startsWith(fullHref)
  }

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
        <div className="relative w-8 h-8 flex items-center justify-center">
          <Image
            src="/images/logo_twin.png"
            alt="TwinFlame Unicity Logo"
            title="TwinFlame Unicity Logo"
            width={32}
            height={32}
            className="object-contain"
            priority
          />
        </div>
        <div>
          <div className="text-xs font-display font-bold text-white tracking-wider">TwinFlame</div>
          <div className="text-[10px] text-purple-400 font-semibold tracking-widest">ADMIN</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ key, href, icon: Icon }) => (
          <Link
            key={key}
            href={href as `/${string}`}
            onClick={() => setIsOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              isActive(href)
                ? 'sidebar-item-active text-purple-300'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            <Icon className={`w-4 h-4 flex-shrink-0 ${isActive(href) ? 'text-purple-400' : ''}`} />
            {t(key)}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-6 border-t border-white/5 pt-3">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/40 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
        >
          <LogOut className="w-4 h-4" />
          Déconnexion
        </button>
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-xl bg-black/60 backdrop-blur-sm border border-white/10 text-white"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 min-h-screen bg-black/40 backdrop-blur-xl border-e border-white/5 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 20, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-56 z-50 bg-black/90 backdrop-blur-xl border-e border-white/10 lg:hidden"
            >
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-4 right-4 p-2 text-white/40 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
