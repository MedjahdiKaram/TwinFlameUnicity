import { createClient } from '@/lib/supabase/server'
import { AdminUsersTable } from '@/components/admin/AdminUsersTable'

type Props = { params: Promise<{ locale: string }> }

export default async function AdminUsersPage({ params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, first_name, last_name, pseudo, gender, role, status, is_vip, created_at, avatar_url')
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-white mb-8">Utilisateurs</h1>
      <AdminUsersTable users={users || []} locale={locale as 'en' | 'ar'} />
    </div>
  )
}
