'use client'

import { motion } from 'framer-motion'
import { FileText, Users, Eye, Clock, Globe, Crown } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { formatDate, formatNumber } from '@/lib/utils'

interface Stats {
  totalArticles: number
  totalUsers: number
  pendingUsers: number
  totalViews: number
}

interface Props {
  stats: Stats
  recentArticles: any[]
  pendingUsers: any[]
  locale: 'fr' | 'ar'
}

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  glow,
  index,
}: {
  icon: any
  label: string
  value: number | string
  gradient: string
  glow: string
  index: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="glass-card p-6 border border-white/5 hover:border-purple-500/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center`}
          style={{ boxShadow: `0 0 15px ${glow}` }}
        >
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
      <div className="text-3xl font-bold text-white mb-1">{value}</div>
      <div className="text-sm text-white/40">{label}</div>
    </motion.div>
  )
}

export function AdminDashboardStats({ stats, recentArticles, pendingUsers, locale }: Props) {
  const statCards = [
    { icon: FileText, label: 'Total Articles', value: stats.totalArticles, gradient: 'from-purple-600 to-violet-700', glow: 'rgba(147,51,234,0.4)' },
    { icon: Users, label: 'Total Utilisateurs', value: stats.totalUsers, gradient: 'from-pink-600 to-rose-700', glow: 'rgba(236,72,153,0.4)' },
    { icon: Eye, label: 'Total Vues', value: formatNumber(stats.totalViews), gradient: 'from-indigo-600 to-blue-700', glow: 'rgba(99,102,241,0.4)' },
    { icon: Clock, label: 'En attente', value: stats.pendingUsers, gradient: 'from-amber-500 to-orange-600', glow: 'rgba(245,158,11,0.4)' },
  ]

  return (
    <div className="space-y-8">
      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <StatCard key={i} {...card} index={i} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent articles */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white text-sm">Articles récents</h2>
            <Link href="/admin/articles" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Voir tout →
            </Link>
          </div>
          <div className="space-y-3">
            {recentArticles.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">Aucun article</p>
            ) : (
              recentArticles.map((article) => (
                <div key={article.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                    article.status === 'published' ? 'bg-green-400' :
                    article.status === 'draft' ? 'bg-amber-400' : 'bg-white/20'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">{article.title}</p>
                    <p className="text-xs text-white/30">
                      {formatDate(article.created_at, locale)} · {article.views} vues
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-white/30" />
                    <span className="text-xs text-white/30 uppercase">{article.language}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Pending users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6 border border-white/5"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display font-semibold text-white text-sm">
              Utilisateurs en attente
              {stats.pendingUsers > 0 && (
                <span className="ms-2 inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-[10px] font-bold">
                  {stats.pendingUsers}
                </span>
              )}
            </h2>
            <Link href="/admin/users" className="text-xs text-purple-400 hover:text-purple-300 transition-colors">
              Gérer →
            </Link>
          </div>
          <div className="space-y-3">
            {pendingUsers.length === 0 ? (
              <p className="text-white/30 text-sm text-center py-6">Aucun utilisateur en attente</p>
            ) : (
              pendingUsers.map((user) => (
                <div key={user.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <div className="w-8 h-8 rounded-full bg-purple-600/30 flex items-center justify-center text-xs text-purple-300 font-semibold flex-shrink-0">
                    {(user.pseudo || user.first_name || user.email || '?')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white/80 truncate">
                      {user.pseudo || `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email}
                    </p>
                    <p className="text-xs text-white/30">{user.email}</p>
                  </div>
                  <Link
                    href={`/admin/users` as `/${string}`}
                    className="text-xs px-2 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors"
                  >
                    Activer
                  </Link>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>
    </div>
  )
}
