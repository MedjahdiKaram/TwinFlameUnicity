'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight, ArrowLeft, Clock } from 'lucide-react'
import Image from 'next/image'
import type { ArticleCard as ArticleCardType } from '@/types/database.types'

interface Props {
  articles: ArticleCardType[]
  locale: 'en' | 'ar'
}

const TEMPLATE_ARTICLES = [
  {
    title: "11 Powerful Signs You've Met Your Twin Flame",
    readTime: "7 min read",
    date: "May 20, 2024",
    category: "TWIN FLAMES",
    image: "/images/signs-portal.png",
    slug: "signs-twin-flame"
  },
  {
    title: "111, 222, 333 - What Are Angels Trying To Tell You?",
    readTime: "6 min read",
    date: "May 15, 2024",
    category: "SYNCHRONICITIES",
    image: "/images/hero-cosmic.jpg",
    slug: "angel-numbers"
  },
  {
    title: "Healing The Divine Feminine Within",
    readTime: "8 min read",
    date: "May 10, 2024",
    category: "SACRED FEMININE",
    image: "/images/hero-bg-new.png",
    slug: "healing-divine-feminine"
  },
  {
    title: "Understanding The Divine Masculine Energy",
    readTime: "6 min read",
    date: "May 08, 2024",
    category: "SACRED MASCULINE",
    image: "/images/masculine-energy.png",
    slug: "divine-masculine-energy"
  },
  {
    title: "How To Prepare For Twin Flame Union",
    readTime: "9 min read",
    date: "May 02, 2024",
    category: "DIVINE UNION",
    image: "/images/union-figures.png",
    slug: "twin-flame-union-preparation"
  }
]

export function BlogPreviewSection({ articles, locale }: Props) {
  const t = useTranslations('home')

  const displayArticles = TEMPLATE_ARTICLES.map((tpl, idx) => {
    const dbArt = articles[idx]
    return {
      title: dbArt ? dbArt.title : t(`featured_articles.list.${idx}.title`, { defaultValue: tpl.title }),
      slug: dbArt ? dbArt.slug : tpl.slug,
      readTime: dbArt ? `${dbArt.reading_time} min read` : tpl.readTime,
      category: dbArt && dbArt.category ? (locale === 'ar' ? dbArt.category.name_ar : dbArt.category.name_en) : t(`featured_articles.list.${idx}.category`, { defaultValue: tpl.category }),
      image: tpl.image,
    }
  })

  const [largeCard, ...smallCards] = displayArticles

  return (
    <section className="relative py-24 bg-[#06030c] overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.03)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-12 items-center">
          {/* Left Column: Heading & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-1 flex flex-col items-start text-start"
          >
            <span className="text-[9px] font-bold uppercase tracking-widest text-[#e6c887] mb-2">
              {t('featured_tag') || 'INSIGHTS & GUIDANCE'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-4 leading-tight">
              {t('blog_title') || 'Featured Articles'}
            </h2>
            <p className="text-white/40 text-xs leading-relaxed mb-8 max-w-xs">
              {t('blog_subtitle') || 'Dive into wisdom, real stories and spiritual insights to support your twin flame journey.'}
            </p>
            <Link
              href="/blog"
              className="px-6 py-3 rounded-full text-[10px] font-bold tracking-widest text-white border border-white/20 hover:bg-white/5 transition-all uppercase"
            >
              {t('blog_cta') || 'BROWSE ALL ARTICLES'}
            </Link>
          </motion.div>

          {/* Right Column: 5-Card Grid */}
          <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Large Featured Card */}
            {largeCard && (
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="md:col-span-1 relative rounded-2xl overflow-hidden border border-white/5 h-[420px] group cursor-pointer"
              >
                <Link href={`/blog/${largeCard.slug}`}>
                  <Image
                    src={largeCard.image}
                    alt={largeCard.title}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  
                  {/* Category */}
                  <span className="absolute top-4 start-4 text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm">
                    {largeCard.category}
                  </span>

                  {/* Content */}
                  <div className="absolute bottom-6 left-6 right-6 flex flex-col justify-end text-start">
                    <h3 className="font-display text-lg font-bold text-white group-hover:text-[#e6c887] transition-colors leading-snug mb-3">
                      {largeCard.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-white/40">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{largeCard.readTime}</span>
                    </div>
                  </div>
                </Link>
              </motion.div>
            )}

            {/* 2. Smaller Cards Grid (2 columns of 2 rows) */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
              {smallCards.map((card, i) => (
                <motion.div
                  key={card.slug}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: (i + 1) * 0.08 }}
                  className="relative rounded-2xl overflow-hidden border border-white/5 h-[200px] group cursor-pointer"
                >
                  <Link href={`/blog/${card.slug}`}>
                    <Image
                      src={card.image}
                      alt={card.title}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent" />

                    {/* Category */}
                    <span className="absolute top-4 start-4 text-[8px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-white/90 backdrop-blur-sm">
                      {card.category}
                    </span>

                    {/* Content */}
                    <div className="absolute bottom-4 left-4 right-4 text-start">
                      <h3 className="font-display text-xs font-bold text-white group-hover:text-[#e6c887] transition-colors leading-snug mb-2 line-clamp-2">
                        {card.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-[9px] text-white/40">
                        <Clock className="w-3 h-3" />
                        <span>{card.readTime}</span>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
