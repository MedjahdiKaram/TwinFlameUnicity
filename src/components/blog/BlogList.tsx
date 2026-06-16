'use client'

import { useState, useCallback, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { useRouter, usePathname } from '@/i18n/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, SlidersHorizontal } from 'lucide-react'
import { ArticleCard } from './ArticleCard'
import type { ArticleCard as ArticleCardType, Category } from '@/types/database.types'
import { useInView } from 'react-intersection-observer'
import { fetchArticlesList } from '@/server/actions/articles'

interface Props {
  initialArticles: ArticleCardType[]
  categories: Pick<Category, 'id' | 'name_en' | 'name_ar' | 'slug' | 'color'>[]
  total: number
  page: number
  pageSize: number
  locale: 'en' | 'ar'
}

export function BlogList({ initialArticles, categories, total, page, pageSize, locale }: Props) {
  const t = useTranslations('blog')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [articles, setArticles] = useState(initialArticles)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(page)
  const [hasMore, setHasMore] = useState(articles.length < total)
  const [search, setSearch] = useState(searchParams.get('q') || '')
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '')

  // Sync state when props change due to URL parameter changes
  useEffect(() => {
    setArticles(initialArticles)
    setCurrentPage(page)
    setHasMore(initialArticles.length < total)
  }, [initialArticles, page, total])

  // Infinite scroll trigger
  const { ref: loadMoreRef } = useInView({
    threshold: 0.5,
    onChange: (inView) => {
      if (inView && hasMore && !isLoading) {
        loadMore()
      }
    },
  })

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return
    setIsLoading(true)
    try {
      const nextPage = currentPage + 1
      const { articles: newArticles, total: newTotal } = await fetchArticlesList({
        locale,
        page: nextPage,
        pageSize,
        activeCategory,
        search
      })

      if (newArticles.length > 0) {
        setArticles((prev) => [...prev, ...newArticles])
        setCurrentPage(nextPage)
        setHasMore(articles.length + newArticles.length < newTotal)
      } else {
        setHasMore(false)
      }
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, hasMore, currentPage, pageSize, locale, activeCategory, search, articles.length])

  const handleSearch = useCallback((value: string) => {
    setSearch(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value) params.set('q', value)
    else params.delete('q')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [searchParams, router, pathname])

  const handleCategory = useCallback((categoryId: string) => {
    const next = activeCategory === categoryId ? '' : categoryId
    setActiveCategory(next)
    const params = new URLSearchParams(searchParams.toString())
    if (next) params.set('category', next)
    else params.delete('category')
    params.delete('page')
    router.push(`${pathname}?${params.toString()}`)
  }, [activeCategory, searchParams, router, pathname])

  return (
    <div className="container mx-auto px-4 lg:px-8 py-12">
      {/* Filters */}
      <div className="mb-10 space-y-4">
        {/* Search bar */}
        <div className="relative max-w-md">
          <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder={t('search_placeholder')}
            className="input-cosmic ps-11 pe-10"
          />
          {search && (
            <button
              onClick={() => handleSearch('')}
              className="absolute end-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => handleCategory('')}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              !activeCategory
                ? 'bg-purple-600 text-white shadow-glow-sm'
                : 'bg-white/5 text-white/50 border border-white/10 hover:border-purple-500/30 hover:text-white/80'
            }`}
          >
            {t('all_categories')}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategory(cat.id)}
              className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                activeCategory === cat.id
                  ? 'text-white shadow-sm'
                  : 'bg-white/5 text-white/50 border border-white/10 hover:text-white/80'
              }`}
              style={
                activeCategory === cat.id
                  ? { background: cat.color, boxShadow: `0 0 12px ${cat.color}60` }
                  : activeCategory !== cat.id
                  ? { borderColor: `${cat.color}30` }
                  : {}
              }
            >
              {locale === 'ar' ? cat.name_ar : cat.name_en}
            </button>
          ))}
        </div>
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-24"
        >
          <p className="text-white/30 text-lg mb-2">{t('no_results')}</p>
          <p className="text-white/20 text-sm">{t('no_results_subtitle')}</p>
        </motion.div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {articles.map((article, i) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  locale={locale}
                  index={i}
                />
              ))}
            </AnimatePresence>
          </div>

          {/* Infinite scroll trigger */}
          {hasMore && (
            <div ref={loadMoreRef} className="flex justify-center py-12">
              {isLoading && (
                <div className="flex items-center gap-3 text-purple-400 text-sm">
                  <div className="w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                  {t('load_more')}
                </div>
              )}
            </div>
          )}

          {/* Total count */}
          <p className="text-center text-white/20 text-xs mt-6">
            {articles.length} / {total}
          </p>
        </>
      )}
    </div>
  )
}
