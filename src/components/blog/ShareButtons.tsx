'use client'

import { useState } from 'react'
import { Link2, MessageCircle, Facebook, Send } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface Props {
  url: string
  title: string
  locale: 'en' | 'ar'
}

export function ShareButtons({ url, title, locale }: Props) {
  const [copied, setCopied] = useState(false)

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      'facebook-share-dialog',
      'width=800,height=600'
    )
  }

  const shareWhatsApp = () => {
    window.open(
      `https://wa.me/?text=${encodeURIComponent(title + ' ' + url)}`,
      '_blank'
    )
  }

  const shareMessenger = () => {
    const fbAppId = process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''
    if (fbAppId) {
      window.open(
        `https://www.facebook.com/dialog/send?link=${encodeURIComponent(url)}&app_id=${fbAppId}&redirect_uri=${encodeURIComponent(url)}`,
        'messenger-share-dialog',
        'width=800,height=600'
      )
    } else {
      window.open(
        `fb-messenger://share?link=${encodeURIComponent(url)}`,
        '_blank'
      )
    }
  }

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      toast({
        title: locale === 'ar' ? 'تم نسخ الرابط' : 'Lien copié !',
        description: locale === 'ar' ? 'يمكنك الآن مشاركته على انستغرام أو أي منصة أخرى.' : 'Vous pouvez maintenant le coller sur Instagram ou une autre plateforme.',
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast({
        title: 'Erreur',
        description: 'Impossible de copier le lien.',
        variant: 'destructive',
      })
    }
  }

  const labels = {
    fr: { share: 'Partager l\'article', fb: 'Facebook', wa: 'WhatsApp', msg: 'Messenger', insta: 'Instagram (Lien)' },
    ar: { share: 'مشاركة المقال', fb: 'فيسبوك', wa: 'واتساب', msg: 'ماسينجر', insta: 'انستغرام (نسخ)' }
  }
  const t = labels[locale] || labels.fr

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">
        {t.share}
      </span>
      <div className="flex flex-wrap gap-3">
        {/* Facebook */}
        <button
          onClick={shareFacebook}
          title={t.fb}
          className="flex items-center justify-center w-11 h-11 rounded-xl text-white bg-[#1877F2]/10 border border-[#1877F2]/20 hover:bg-[#1877F2] hover:border-[#1877F2] transition-all duration-300 hover:scale-105"
        >
          <Facebook className="w-5 h-5" />
        </button>

        {/* WhatsApp */}
        <button
          onClick={shareWhatsApp}
          title={t.wa}
          className="flex items-center justify-center w-11 h-11 rounded-xl text-white bg-[#25D366]/10 border border-[#25D366]/20 hover:bg-[#25D366] hover:border-[#25D366] transition-all duration-300 hover:scale-105"
        >
          <MessageCircle className="w-5 h-5" />
        </button>

        {/* Messenger */}
        <button
          onClick={shareMessenger}
          title={t.msg}
          className="flex items-center justify-center w-11 h-11 rounded-xl text-white bg-[#0084FF]/10 border border-[#0084FF]/20 hover:bg-[#0084FF] hover:border-[#0084FF] transition-all duration-300 hover:scale-105"
        >
          <Send className="w-5 h-5 -rotate-45 translate-x-0.5 -translate-y-0.5" />
        </button>

        {/* Instagram (Copy Link) */}
        <button
          onClick={copyLink}
          title={t.insta}
          className={`flex items-center justify-center w-11 h-11 rounded-xl text-white transition-all duration-300 hover:scale-105 ${
            copied
              ? 'bg-[#E1306C] text-white border border-[#E1306C]'
              : 'bg-[#E1306C]/10 border border-[#E1306C]/20 hover:bg-[#E1306C] hover:border-[#E1306C]'
          }`}
        >
          <Link2 className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
