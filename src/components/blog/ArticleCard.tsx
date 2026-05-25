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
            <div className="absolute top-3 start-3 flex gap-2">
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
                className="absolute bottom-3 start-3 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-full backdrop-blur-sm"
                style={{ background: `${article.category?.color || '#9333ea'}40`, color: article.category?.color || '#c084fc', border: `1px solid ${article.category?.color || '#9333ea'}60` }}
              >
                {categoryName}
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`p-6 ${featured ? 'md:p-8 md:w-1/2 flex flex-col justify-center' : 'flex flex-col justify-between flex-1'}`}>
            <div>
              {/* Title */}
              <h3 className={`font-display font-bold text-white group-hover:text-purple-300 transition-colors mb-3 leading-snug ${featured ? 'text-2xl md:text-3xl' : 'text-lg'}`}>
                {article.title}
              </h3>
  
              {/* Excerpt */}
              {article.excerpt && (
                <p className={`text-white/60 text-sm leading-relaxed mb-4 ${featured ? 'line-clamp-3 md:line-clamp-4 text-base' : 'line-clamp-2'}`}>
                  {article.excerpt}
                </p>
              )}
  
              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-5">
                  {article.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag.id}
                      className="text-[10px] px-2.5 py-1 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/20 hover:bg-purple-500/20 transition-colors"
                    >
                      #{locale === 'ar' ? tag.name_ar : tag.name_fr}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-4">
              {/* Meta */}
              <div className="flex flex-wrap items-center gap-4 text-[11px] text-white/40 border-t border-white/5 pt-4">
                {article.reading_time && (
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-400" />
                    {article.reading_time} {t('reading_time')}
                  </span>
                )}
                {article.views > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-3.5 h-3.5 text-purple-400" />
                    {article.views}
                  </span>
                )}
                {article.likes > 0 && (
                  <span className="flex items-center gap-1.5">
                    <Heart className="w-3.5 h-3.5 text-pink-400" />
                    {article.likes}
                  </span>
                )}
                {article.published_at && (
                  <span className="ms-auto text-white/30">
                    {formatDate(article.published_at, locale)}
                  </span>
                )}
              </div>

              {/* Lire la suite CTA */}
              <div className="flex justify-end pt-1">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-purple-400 group-hover:text-purple-300 transition-colors">
                  {locale === 'ar' ? 'اقرأ المزيد ←' : 'Lire la suite →'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </motion.article>
  )
}
