import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { Mail, Instagram, Facebook, Youtube, Gift, ArrowUp } from 'lucide-react'
import Image from 'next/image'

export function Footer({ locale }: { locale: string }) {
  const t = useTranslations('footer')
  const tNav = useTranslations('nav')
  const year = new Date().getFullYear()

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative overflow-hidden border-t border-white/5 bg-black/80 backdrop-blur-md">
      {/* Cosmic gradient top */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-px bg-gradient-to-r from-transparent via-[#e6c887]/30 to-transparent" />

      {/* Background glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-purple-950/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-950/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 lg:px-8 py-16 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand column */}
          <div className="lg:col-span-1 flex flex-col justify-between">
            <div>
              <Link href="/" className="inline-flex items-center gap-3 mb-6 group">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <Image
                    src="/images/logo_twin.png"
                    alt="TwinFlame Unicity Logo"
                    title="TwinFlame Unicity Logo"
                    width={40}
                    height={40}
                    className="object-contain"
                    priority
                  />
                </div>
                <div>
                  <div className="text-base font-display font-bold tracking-wider text-white">TwinFlame</div>
                  <div className="text-xs text-gold font-display font-semibold tracking-widest">UNICITY</div>
                </div>
              </Link>
              <p className="text-xs text-white/50 leading-relaxed max-w-xs mb-6">
                {t('tagline')}
              </p>
            </div>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4 text-white/40 mb-6">
              <a href="#" className="hover:text-white transition-colors" aria-label="Instagram"><Instagram className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Facebook"><Facebook className="w-4 h-4" /></a>
              <a href="#" className="hover:text-white transition-colors" aria-label="Youtube"><Youtube className="w-4 h-4" /></a>
            </div>
          </div>

          {/* Column 1: Explore */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#e6c887] mb-4">
              {t('sitemap')}
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('home')}</Link></li>
              <li><Link href="/categories/flammes-jumelles" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('twin_flames')}</Link></li>
              <li><Link href="/categories/ames-soeurs" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('soulmates')}</Link></li>
              <li><Link href="/categories/eveil-spirituel" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('awakening')}</Link></li>
              <li><Link href="/categories/guerison" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('healing')}</Link></li>
              <li><Link href="/blog" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('blog')}</Link></li>
              <li><Link href="/resources" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('resources')}</Link></li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#e6c887] mb-4">
              {t('quick_links')}
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/register" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('start_here')}</Link></li>
              <li><Link href="/about" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('about')}</Link></li>
              <li><Link href="/contact" className="text-xs text-white/50 hover:text-white transition-colors">{tNav('contact')}</Link></li>
              <li><Link href="/privacy" className="text-xs text-white/50 hover:text-white transition-colors">{t('privacy')}</Link></li>
              <li><Link href="/legal" className="text-xs text-white/50 hover:text-white transition-colors">{t('legal')}</Link></li>
            </ul>
          </div>

          {/* Column 3: Resources */}
          <div>
            <h3 className="text-[10px] font-semibold uppercase tracking-widest text-[#e6c887] mb-4">
              {t('resources')}
            </h3>
            <ul className="space-y-2.5">
              <li><Link href="/categories/flammes-jumelles" className="text-xs text-white/50 hover:text-white transition-colors">{t('stages')}</Link></li>
              <li><Link href="/categories/signes" className="text-xs text-white/50 hover:text-white transition-colors">{t('signs')}</Link></li>
              <li><Link href="/categories/test" className="text-xs text-white/50 hover:text-white transition-colors">{t('test')}</Link></li>
              <li><Link href="/blog" className="text-xs text-white/50 hover:text-white transition-colors">{t('journal')}</Link></li>
              <li><Link href="/resources" className="text-xs text-white/50 hover:text-white transition-colors">{t('books')}</Link></li>
            </ul>
          </div>

          {/* Column 4: Free Gift Box */}
          <div>
            <div className="border-gold-glow p-6 rounded-2xl flex flex-col items-center text-center">
              <Gift className="w-8 h-8 text-[#e6c887] mb-3 animate-pulse" />
              <h4 className="text-[10px] font-semibold uppercase tracking-widest text-white mb-2">{t('free_gift')}</h4>
              <p className="text-[10px] text-white/50 leading-relaxed mb-4">
                {t('gift_desc')}
              </p>
              <Link href="/resources" className="text-[10px] font-semibold tracking-wider text-[#e6c887] hover:text-white transition-colors">
                {t('get_it_now')}
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="cosmic-divider mt-12 mb-6" />
        <div className="flex items-center justify-between gap-4 text-[10px] text-white/30">
          <p>{t('copyright', { year })}</p>
          <button
            onClick={handleScrollToTop}
            className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-[#e6c887]/40 transition-all"
            aria-label="Back to top"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  )
}
