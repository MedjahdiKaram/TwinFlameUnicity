'use server'

import { createAdminClient } from '@/lib/supabase/server'
import type { ArticleCard } from '@/types/database.types'

export async function fetchArticlesList({
  locale,
  page,
  pageSize,
  activeCategory,
  search
}: {
  locale: string,
  page: number,
  pageSize: number,
  activeCategory?: string,
  search?: string
}) {
  const supabase = await createAdminClient()
  const from = (page - 1) * pageSize

  let query = supabase
    .from('articles')
    .select(`
      id, slug, title, excerpt, cover_url, cover_alt,
      is_vip, is_featured, language, reading_time, views, likes,
      published_at, category_id,
      category:categories(id, name_en, name_ar, slug, color),
      tags:article_tags(tag:tags(id, name_en, name_ar, slug))
    `, { count: 'exact' })
    .eq('status', 'published')
    .eq('language', locale)

  if (activeCategory) query = query.eq('category_id', activeCategory)
  if (search) query = query.or(`title.ilike.%${search}%,excerpt.ilike.%${search}%`)

  query = query
    .order('published_at', { ascending: false })
    .range(from, from + pageSize - 1)

  const { data, count } = await query

  const articles = (data || []).map((a: any) => ({
    ...a,
    tags: a.tags?.map((t: any) => t.tag) ?? [],
  })) as ArticleCard[]

  return { articles, total: count || 0 }
}