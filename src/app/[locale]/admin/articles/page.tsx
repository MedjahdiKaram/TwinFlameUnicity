import { createClient } from '@/lib/supabase/server'
import { AdminArticlesTable } from '@/components/admin/AdminArticlesTable'
import { Link } from '@/i18n/navigation'
import { Plus } from 'lucide-react'

type Props = { params: Promise<{ locale: string }> }

export default async function AdminArticlesPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: articles } = await supabase
    .from('articles')
    .select(`
      id, slug, title, status, language, is_vip, is_featured,
      views, likes, created_at, published_at,
      category:categories(name_en, name_ar, color)
    `)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-bold text-white">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 transition-all duration-300 shadow-glow-sm"
        >
          <Plus className="w-4 h-4" />
          Nouvel article
        </Link>
      </div>
      <AdminArticlesTable articles={articles || []} locale={locale as 'en' | 'ar'} />
    </div>
  )
}
