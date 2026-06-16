'use client'

import { useState, useCallback, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTranslations } from 'next-intl'
import { Link } from '@/i18n/navigation'
import Image from 'next/image'
import { Clock, Eye, Heart, ArrowLeft, ArrowRight, Crown, ChevronRight, ChevronLeft } from 'lucide-react'
import { formatDate, formatRelativeDate } from '@/lib/utils'
import { ArticleCard } from './ArticleCard'
import { createClient } from '@/lib/supabase/client'
import type { ArticleCard as ArticleCardType } from '@/types/database.types'
import { ShareButtons } from './ShareButtons'

interface Props {
  article: any
  related: ArticleCardType[]
  locale: 'en' | 'ar'
}

export function ArticleDetail({ article, related, locale }: Props) {
  const t = useTranslations('blog')
  const [likes, setLikes] = useState(article.likes || 0)
  const [liked, setLiked] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')

  useEffect(() => {
    setCurrentUrl(window.location.href)
  }, [])

  const handleLike = useCallback(async () => {
    if (liked) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('article_likes').insert({ article_id: article.id, user_id: user.id })
    setLikes((l: number) => l + 1)
    setLiked(true)
  }, [liked, article.id])

  const categoryName = locale === 'ar'
    ? article.category?.name_ar
    : article.category?.name_en

  return (
    <article className="container mx-auto px-4 lg:px-8 py-12 max-w-4xl">
      {/* Breadcrumb */}
      <motion.nav
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 text-xs text-white/30 mb-8"
      >
        <Link href="/" className="hover:text-white/60 transition-colors">
          {locale === 'ar' ? 'الرئيسية' : 'Home'}
        </Link>
        {locale === 'ar' ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
        <Link href="/blog" className="hover:text-white/60 transition-colors">
          {locale === 'ar' ? 'المدونة' : 'Blog'}
        </Link>
        {categoryName && (
          <>
            {locale === 'ar' ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
            <span className="text-purple-400">{categoryName}</span>
          </>
        )}
      </motion.nav>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {article.is_premium && (
            <span className="badge-premium flex items-center gap-1">
              <Crown className="w-2.5 h-2.5" /> Premium
            </span>
          )}
          {categoryName && (
            <span
              className="text-xs font-medium px-3 py-1 rounded-full"
              style={{
                background: `${article.category?.color || '#9333ea'}20`,
                color: article.category?.color || '#c084fc',
                border: `1px solid ${article.category?.color || '#9333ea'}40`,
              }}
            >
              {categoryName}
            </span>
          )}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-display font-black text-white leading-tight mb-6">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="text-lg text-white/60 leading-relaxed mb-6 border-s-2 border-purple-500/40 ps-4">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-white/40">
          {article.author && (
            <div className="flex items-center gap-2">
              {article.author.avatar_url ? (
                <Image
                  src={article.author.avatar_url}
                  alt={article.author.pseudo || ''}
                  width={28}
                  height={28}
                  className="rounded-full"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-purple-600/40 flex items-center justify-center text-xs text-purple-300">
                  {(article.author.pseudo || article.author.first_name || '?')[0].toUpperCase()}
                </div>
              )}
              <span className="text-white/60">
                {article.author.pseudo || `${article.author.first_name || ''} ${article.author.last_name || ''}`.trim()}
              </span>
            </div>
          )}
          {article.published_at && (
            <time dateTime={article.published_at}>
              {formatDate(article.published_at, locale)}
            </time>
          )}
          {article.reading_time && (
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.reading_time} {t('reading_time')}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Eye className="w-3.5 h-3.5" />
            {article.views} {t('views')}
          </span>
        </div>
      </motion.header>

      {/* Cover image */}
      {article.cover_url && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          className="relative aspect-video rounded-2xl overflow-hidden mb-12"
        >
          <Image
            src={article.cover_url}
            alt={article.cover_alt || article.title}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        </motion.div>
      )}

      {/* Article body */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="prose-cosmic mb-12"
        dangerouslySetInnerHTML={{ __html: article.content }}
      />

      {/* Tags */}
      {article.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          {article.tags.map((tag: any) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}` as `/${string}`}
              className="text-xs px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20 hover:border-purple-500/40 transition-colors"
            >
              #{locale === 'ar' ? tag.name_ar : tag.name_en}
            </Link>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 py-6 border-y border-white/5 mb-16">
        <div className="flex items-center gap-4">
          <button
            onClick={handleLike}
            disabled={liked}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm transition-all duration-300 ${
              liked
                ? 'bg-pink-500/20 text-pink-400 border border-pink-500/30 cursor-default'
                : 'bg-white/5 text-white/50 border border-white/10 hover:bg-pink-500/10 hover:text-pink-400 hover:border-pink-500/30'
            }`}
          >
            <Heart className={`w-4 h-4 ${liked ? 'fill-current' : ''}`} />
            {likes}
          </button>
          <Link
            href="/blog"
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300 transition-colors"
          >
            {locale === 'ar' ? <ArrowRight className="w-4 h-4" /> : <ArrowLeft className="w-4 h-4" />}
            {t('back')}
          </Link>
        </div>

        {currentUrl && (
          <ShareButtons
            url={currentUrl}
            title={article.title}
            locale={locale}
          />
        )}
      </div>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="mb-16">
          <h2 className="text-xl font-display font-bold text-white mb-6">
            {t('related')}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {related.map((article, i) => (
              <ArticleCard key={article.id} article={article} locale={locale} index={i} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
