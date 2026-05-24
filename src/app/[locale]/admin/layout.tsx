import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminSidebar } from '@/components/admin/AdminSidebar'

type Props = {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}

export default async function AdminLayout({ children, params }: Props) {
  const { locale } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/${locale}/login`)

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, status')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
    redirect(`/${locale}`)
  }

  return (
    <div className="min-h-screen bg-cosmic-gradient flex">
      <AdminSidebar locale={locale} />
      <div className="flex-1 min-w-0 overflow-auto p-4 lg:p-6">
        {children}
      </div>
    </div>
  )
}
