import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { ArticleForm } from '@/components/admin/ArticleForm'

interface Props {
  params: Promise<{ locale: string; id: string }>
}

export default async function EditArticlePage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('*, categories(*), article_tags(tag_id, tags(*))')
    .eq('id', id)
    .single()

  if (!article) notFound()

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('name_en')

  const { data: tags } = await supabase
    .from('tags')
    .select('*')
    .order('name_en')

  const selectedTagIds = article.article_tags?.map((at: { tag_id: string }) => at.tag_id) || []

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Modifier l&apos;article</h1>
        <p className="text-white/50 mt-1">Éditer : {article.title || article.title_ar}</p>
      </div>
      <ArticleForm
        categories={categories || []}
        tags={tags || []}
        authorId={article.author_id}
        locale={locale as 'en' | 'ar'}
        initialData={{
          id: article.id,
          title: article.title,
          slug: article.slug,
          language: article.language,
          excerpt: article.excerpt,
          content: article.content,
          cover_url: article.cover_url,
          cover_alt: article.cover_alt,
          status: article.status,
          is_premium: article.is_premium,
          is_featured: article.is_featured,
          category_id: article.category_id,
          meta_title: article.meta_title,
          meta_description: article.meta_description,
          selected_tags: selectedTagIds,
        }}
      />
    </div>
  )
}
