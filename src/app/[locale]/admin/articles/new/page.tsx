import { createClient } from '@/lib/supabase/server'
import { ArticleForm } from '@/components/admin/ArticleForm'

type Props = { params: Promise<{ locale: string }> }

export default async function NewArticlePage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const [{ data: categories }, { data: tags }, { data: { user } }] = await Promise.all([
    supabase.from('categories').select('id, name_fr, name_ar').order('sort_order'),
    supabase.from('tags').select('id, name_fr, name_ar').order('name_fr'),
    supabase.auth.getUser(),
  ])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-display font-bold text-white mb-8">Nouvel Article</h1>
      <ArticleForm
        categories={categories || []}
        tags={tags || []}
        authorId={user?.id || ''}
        locale={locale as 'fr' | 'ar'}
      />
    </div>
  )
}
