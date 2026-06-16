'use client'

import { useState, useTransition } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from '@/i18n/navigation'
import { Link } from '@/i18n/navigation'
import {
  Edit2, Trash2, Eye, Globe, Crown, Star,
  CheckCircle, XCircle, Archive, Filter
} from 'lucide-react'
import { formatDate } from '@/lib/utils'
import { createClient } from '@/lib/supabase/client'

interface Article {
  id: string
  slug: string
  title: string
  status: 'draft' | 'published' | 'archived'
  language: 'en' | 'ar'
  is_premium: boolean
  is_featured: boolean
  views: number
  likes: number
  created_at: string
  published_at: string | null
  category?: { name_en: string; name_ar: string; color: string } | null
}

interface Props {
  articles: Article[]
  locale: 'en' | 'ar'
}

const STATUS_CONFIG = {
  published: { color: 'text-green-400 bg-green-400/10 border-green-400/30', label: 'Publié', icon: CheckCircle },
  draft: { color: 'text-amber-400 bg-amber-400/10 border-amber-400/30', label: 'Brouillon', icon: Archive },
  archived: { color: 'text-white/30 bg-white/5 border-white/10', label: 'Archivé', icon: XCircle },
}

export function AdminArticlesTable({ articles: initialArticles, locale }: Props) {
  const router = useRouter()
  const [articles, setArticles] = useState(initialArticles)
  const [isPending, startTransition] = useTransition()
  const [filterLang, setFilterLang] = useState<'all' | 'en' | 'ar'>('all')
  const [filterStatus, setFilterStatus] = useState<'all' | 'published' | 'draft' | 'archived'>('all')

  const filtered = articles.filter((a) => {
    if (filterLang !== 'all' && a.language !== filterLang) return false
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    return true
  })

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cet article ?')) return
    const supabase = createClient()
    await supabase.from('articles').delete().eq('id', id)
    setArticles((prev) => prev.filter((a) => a.id !== id))
  }

  const handleToggleStatus = async (article: Article) => {
    const newStatus = article.status === 'published' ? 'draft' : 'published'
    const supabase = createClient()
    await supabase.from('articles').update({ status: newStatus }).eq('id', article.id)
    setArticles((prev) =>
      prev.map((a) => (a.id === article.id ? { ...a, status: newStatus } : a))
    )
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-3 glass-card p-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/30" />
          <span className="text-xs text-white/40">Filtrer:</span>
        </div>
        <div className="flex gap-2">
          {(['all', 'en', 'ar'] as const).map((l) => (
            <button
              key={l}
              onClick={() => setFilterLang(l)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterLang === l
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
              }`}
            >
              {l === 'all' ? 'All' : l.toUpperCase()}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          {(['all', 'published', 'draft', 'archived'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                filterStatus === s
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/40'
                  : 'bg-white/5 text-white/40 border border-white/10 hover:border-white/20'
              }`}
            >
              {s === 'all' ? 'Tous' : STATUS_CONFIG[s].label}
            </button>
          ))}
        </div>
        <span className="ms-auto text-xs text-white/30">{filtered.length} articles</span>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/5">
                <th className="text-start px-5 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Titre</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Statut</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Lang</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Vues</th>
                <th className="text-start px-4 py-3.5 text-xs font-semibold text-white/40 uppercase tracking-wider">Date</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-white/20 text-sm">
                    Aucun article
                  </td>
                </tr>
              ) : (
                filtered.map((article, i) => {
                  const status = STATUS_CONFIG[article.status]
                  const StatusIcon = status.icon
                  return (
                    <motion.tr
                      key={article.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.03 }}
                      className="border-b border-white/5 last:border-0 hover:bg-white/2 transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <p className="text-sm text-white/80 font-medium max-w-xs truncate">{article.title}</p>
                          {article.is_premium && <Crown className="w-3 h-3 text-amber-400 flex-shrink-0" />}
                          {article.is_featured && <Star className="w-3 h-3 text-purple-400 flex-shrink-0" />}
                        </div>
                        {article.category && (
                          <span
                            className="text-[10px] px-1.5 py-0.5 rounded-full mt-1 inline-block"
                            style={{ background: `${article.category.color}20`, color: article.category.color }}
                          >
                            {locale === 'ar' ? article.category.name_ar : article.category.name_en}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4">
                        <button
                          onClick={() => handleToggleStatus(article)}
                          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded-full border transition-all duration-200 hover:opacity-80 ${status.color}`}
                        >
                          <StatusIcon className="w-3 h-3" />
                          {status.label}
                        </button>
                      </td>
                      <td className="px-4 py-4">
                        <Globe className="w-3 h-3 text-white/30 inline me-1" />
                        <span className="text-xs text-white/40 uppercase">{article.language}</span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 text-xs text-white/40">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-xs text-white/30">
                        {formatDate(article.created_at, locale, 'dd/MM/yyyy')}
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Link
                            href={`/admin/articles/${article.id}/edit` as `/${string}`}
                            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-purple-400 hover:bg-purple-500/10 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </Link>
                          <a
                            href={`/${locale}/blog/${article.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </a>
                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 rounded-lg bg-white/5 text-white/50 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
