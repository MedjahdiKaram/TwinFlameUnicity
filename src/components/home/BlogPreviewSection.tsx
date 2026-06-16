'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { ArticleCard } from '@/components/blog/ArticleCard'
import type { ArticleCard as ArticleCardType } from '@/types/database.types'

interface Props {
  articles: ArticleCardType[]
  locale: 'en' | 'ar'
}

export function BlogPreviewSection({ articles, locale }: Props) {
  const t = useTranslations('home')
  const tBlog = useTranslations('blog')

  if (articles.length === 0) return null

  const [featured, ...rest] = articles

  return (
    <section className="relative py-24 overflow-hidden">
      {/* BG */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-indigo-950/15 to-transparent pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.05)_0%,transparent_70%)] pointer-events-none" />

      <div className="container mx-auto px-4 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-end justify-between mb-12"
        >
          <div>
            <h2 className="text-3xl sm:text-4xl font-display font-bold text-white mb-2">
              <span className="text-cosmic">{t('blog_title')}</span>
            </h2>
            <p className="text-white/40 text-sm">{t('blog_subtitle')}</p>
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent mt-4" />
          </div>
          <Link
            href="/blog"
            className="hidden sm:flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors group"
          >
            {t('blog_cta')}
            {locale === 'ar' ? (
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
            ) : (
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            )}
          </Link>
        </motion.div>

        {/* Featured article */}
        {featured && (
          <div className="mb-8">
            <ArticleCard article={featured} locale={locale} index={0} featured />
          </div>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {rest.slice(0, 6).map((article, i) => (
              <ArticleCard key={article.id} article={article} locale={locale} index={i + 1} />
            ))}
          </div>
        )}

        {/* Mobile CTA */}
        <div className="sm:hidden text-center">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {t('blog_cta')}
            {locale === 'ar' ? (
              <ArrowLeft className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </Link>
        </div>
      </div>
    </section>
  )
}
