import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Mail } from 'lucide-react'
import Image from 'next/image'

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const year = new Date().getFullYear()

  const columns = [
    {
      title: t('sitemap'),
      links: [
        { label: tNav('home'), href: '/' as const },
        { label: tNav('blog'), href: '/blog' as const },
        { label: tNav('categories'), href: '/categories' as const },
        { label: tNav('about'), href: '/about' as const },
      ],
    },
    {
      title: t('legal'),
      links: [
        { label: t('legal'), href: '/legal' as const },
        { label: t('privacy'), href: '/privacy' as const },
      ],
    },
    {
      title: t('resources'),
      links: [
        { label: t('resources'), href: '/resources' as const },
        { label: t('guidance'), href: '/categories/guidance-spirituelle' as const },
      ],
    },
  ]

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-black/40 backdrop-blur-sm">
      {/* Cosmic gradient top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-900/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-900/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-2">
            <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <Image
                  src="/images/logo_twin.png"
                  alt="TwinFlame Unicity Logo"
                  width={40}
                  height={40}
                  className="object-contain"
                  priority
                />
              </div>
              <div>
                <div className="text-base font-display font-bold tracking-wider text-white">TwinFlame</div>
                <div className="text-xs text-cosmic font-display font-semibold tracking-widest">UNICITY</div>
              </div>
            </Link>
            <p className="text-sm text-white/50 leading-relaxed max-w-xs mb-6">
              {t('tagline')}
            </p>
            <a
              href="mailto:contact@twinflameunicity.com"
              className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
            >
              <Mail className="w-4 h-4" />
              contact@twinflameunicity.com
            </a>
          </div>

          {/* Link columns */}
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xs font-semibold uppercase tracking-widest text-purple-400/80 mb-4">
                {col.title}
              </h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white/80 transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          {/* Contact column */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-purple-400/80 mb-4">
              {t('contact')}
            </h3>
            <Link
              href="/contact"
              className="text-sm text-white/50 hover:text-white/80 transition-colors block mb-2"
            >
              {t('contact')}
            </Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="cosmic-divider mt-12 mb-6" />
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/30">
          <p>{t('copyright', { year })}</p>
          <p>{t('made_with')}</p>
        </div>
      </div>
    </footer>
  )
}
