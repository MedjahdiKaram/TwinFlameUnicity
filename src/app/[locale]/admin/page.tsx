import { getTranslations } from 'next-intl/server'
import { createClient } from '@/lib/supabase/server'
import { AdminDashboardStats } from '@/components/admin/AdminDashboardStats'

type Props = { params: Promise<{ locale: string }> }

async function getStats() {
  const supabase = await createClient()

  const [
    { count: totalArticles },
    { count: totalUsers },
    { count: pendingUsers },
    { data: viewsData },
  ] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('articles').select('views').eq('status', 'published'),
  ])

  const totalViews = viewsData?.reduce((sum, a) => sum + (a.views || 0), 0) || 0

  return {
    totalArticles: totalArticles || 0,
    totalUsers: totalUsers || 0,
    pendingUsers: pendingUsers || 0,
    totalViews,
  }
}

async function getRecentArticles() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('articles')
    .select('id, title, status, language, views, created_at')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

async function getPendingUsersList() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, pseudo, created_at')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export default async function AdminDashboard({ params }: Props) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'admin' })
  const [stats, recentArticles, pendingUsers] = await Promise.all([
    getStats(),
    getRecentArticles(),
    getPendingUsersList(),
  ])

  return (
    <div className="p-6 lg:p-8">
      <h1 className="text-2xl font-display font-bold text-white mb-8">
        {t('dashboard')}
      </h1>
      <AdminDashboardStats
        stats={stats}
        recentArticles={recentArticles}
        pendingUsers={pendingUsers}
        locale={locale as 'fr' | 'ar'}
      />
    </div>
  )
}
