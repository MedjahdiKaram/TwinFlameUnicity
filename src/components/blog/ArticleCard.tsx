'use client'

import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Clock, Eye, Heart, Crown, Star } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { formatDate } from '@/lib/utils'
import type { ArticleCard as ArticleCardType } from '@/types/database.types'

interface Props {
  article: ArticleCardType
  locale: 'fr' | 'ar'
  index?: number
  featured?: boolean
}

export function ArticleCard({ article, locale, index = 0, featured = false }: Props) {
  const t = useTranslations('blog')

  const categoryName = locale === 'ar'
    ? article.category?.name_ar
    : article.category?.name_fr

  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      className={`group relative ${featured ? 'col-span-full md:col-span-2' : ''}`}
    >
      <Link href={`/blog/${article.slug}` as `/${string}`}>
        <div className={`glass-card-hover overflow-hidden ${featured ? 'flex flex-col md:flex-row gap-0' : ''}`}>
          {/* Cover image */}
          <div
            className={`relative overflow-hidden ${
              featured
                ? 'md:w-1/2 aspect-video md:aspect-auto'
                : 'aspect-video'
            }`}
          >
            {article.cover_url ? (
              <Image
                src={article.cover_url}
                alt={article.cover_alt || article.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                sizes={featured ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 33vw'}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-purple-900/50 to-indigo-900/50 flex items-center justify-center">
                <Star className="w-12 h-12 text-purple-400/40" />
              </div>
            )}

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

            {/* Badges */}
            <div className="absolute top-3 left-3 flex gap-2">
              {article.is_premium && (
                <span className="badge-premium flex items-center gap-1">
                  <Crown className="w-2.5 h-2.5" />
                  {t('premium_badge')}
                </span>
              )}
              {article.is_featured && (
                <span className="flex items-center gap-1 bg-purple-500/80 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2 py-1 rounded-full">
                  <Star className="w-2.5 h-2.5" />
                </span>
              )}
            </div>

            {/* Category */}
            {categoryName && (
              <div
                className="absolute bottom-3 left-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm"
                style={{ background: `${article.category?.color || '#9333ea'}40`, color: article.category?.color || '#c084fc', border: `1px solid ${article.category?.color || '#9333ea'}60` }}
              >
                {categoryName}
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`p-5 ${featured ? 'md:w-1/2 flex flex-col justify-center' : ''}`}>
            {/* Title */}
            <h3 className={`font-display font-semibold text-white/90 group-hover:text-white transition-colors mb-2 leading-snug ${featured ? 'text-xl md:text-2xl' : 'text-base'}`}>
              {article.title}
            </h3>

            {/* Excerpt */}
            {article.excerpt && (
              <p className={`text-white/50 text-sm leading-relaxed mb-4 ${featured ? 'line-clamp-3' : 'line-clamp-2'}`}>
                {article.excerpt}
              </p>
            )}

            {/* Tags */}
            {article.tags && article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {article.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag.id}
                    className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20"
                  >
                    #{locale === 'ar' ? tag.name_ar : tag.name_fr}
                  </span>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="flex items-center gap-4 text-[11px] text-white/35">
              {article.reading_time && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {article.reading_time} {t('reading_time')}
                </span>
              )}
              {article.views > 0 && (
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  {article.views}
                </span>
              )}
              {article.likes > 0 && (
                <span className="flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  {article.likes}
                </span>
              )}
              {article.published_at && (
                <span className="ms-auto">
                  {formatDate(article.published_at, locale)}
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
