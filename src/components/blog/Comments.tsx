'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from '@/hooks/use-toast'
import Image from 'next/image'
import { formatRelativeDate } from '@/lib/utils'
import { Trash2, MessageCircle, Reply, LogIn } from 'lucide-react'
import { Link } from '@/i18n/navigation'

interface CommentProps {
  articleId: string
  locale: 'en' | 'ar'
  currentUser: any
  isAdmin: boolean
}

export function Comments({ articleId, locale, currentUser, isAdmin }: CommentProps) {
  const [comments, setComments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  
  const supabase = createClient()

  const fetchComments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('comments')
        .select(`
          id, content, created_at, parent_id,
          user:profiles!comments_user_id_fkey(id, pseudo, first_name, last_name, avatar_url)
        `)
        .eq('article_id', articleId)
        .order('created_at', { ascending: true })

      if (error) throw error
      
      // Build tree
      const map: any = {}
      const roots: any[] = []
      
      data.forEach(c => {
        map[c.id] = { ...c, replies: [] }
      })
      
      data.forEach(c => {
        if (c.parent_id) {
          if (map[c.parent_id]) {
            map[c.parent_id].replies.push(map[c.id])
          }
        } else {
          roots.push(map[c.id])
        }
      })
      
      setComments(roots)
    } catch (e: any) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [articleId, supabase])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  const totalComments = comments.reduce((acc, c) => acc + 1 + c.replies.length, 0)

  const handlePostComment = async (parentId = null) => {
    const content = parentId ? replyContent : newComment
    if (!content.trim() || !currentUser) return

    try {
      const { error } = await supabase.from('comments').insert({
        article_id: articleId,
        user_id: currentUser.id,
        parent_id: parentId,
        content: content.trim()
      })

      if (error) throw error

      toast({ title: locale === 'ar' ? 'تمت الإضافة' : 'Comment posted!' })
      setNewComment('')
      setReplyContent('')
      setReplyingTo(null)
      fetchComments()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(locale === 'ar' ? 'هل أنت متأكد؟' : 'Are you sure?')) return
    try {
      const { error } = await supabase.from('comments').delete().eq('id', id)
      if (error) throw error
      toast({ title: locale === 'ar' ? 'تم الحذف' : 'Deleted' })
      fetchComments()
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' })
    }
  }

  const renderComment = (comment: any, isReply = false) => {
    const isOwner = currentUser?.id === comment.user?.id
    const canDelete = isOwner || isAdmin

    return (
      <div key={comment.id} className={`flex gap-4 ${isReply ? 'ml-8 md:ml-12 mt-4' : 'mt-6'}`}>
        <div className="flex-shrink-0 mt-1">
          {comment.user?.avatar_url ? (
            <Image src={comment.user.avatar_url} alt="" width={32} height={32} className="rounded-full object-cover w-8 h-8" />
          ) : (
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-purple-600/30 text-purple-300 font-medium text-xs">
              {(comment.user?.pseudo || comment.user?.first_name || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <div className="bg-white/5 rounded-2xl p-4 shadow-sm border border-white/5 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="font-semibold text-white/80 text-sm">
                {comment.user?.pseudo || `${comment.user?.first_name || ''} ${comment.user?.last_name || ''}`.trim() || 'Anonymous'}
              </span>
              <span className="text-xs text-white/30">{formatRelativeDate(comment.created_at, locale)}</span>
            </div>
            <p className="text-sm text-white/70 whitespace-pre-wrap">{comment.content}</p>
            
            <div className="flex items-center gap-4 mt-3">
              {!isReply && currentUser && (
                <button
                  onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-purple-400 transition-colors"
                >
                  <Reply className="w-3.5 h-3.5" />
                  {locale === 'ar' ? 'رد' : 'Reply'}
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="flex items-center gap-1.5 text-xs text-white/40 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  {locale === 'ar' ? 'حذف' : 'Delete'}
                </button>
              )}
            </div>
          </div>
          
          {replyingTo === comment.id && (
            <div className="mt-3 flex gap-3 ml-2">
              <div className="flex-shrink-0 pt-1">
                <Reply className="w-4 h-4 text-white/20 rotate-180" />
              </div>
              <div className="flex-1">
                <textarea
                  value={replyContent}
                  onChange={e => setReplyContent(e.target.value)}
                  placeholder={locale === 'ar' ? 'اكتب ردك...' : 'Write your reply...'}
                  rows={2}
                  className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-purple-500/50 resize-none"
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setReplyingTo(null)} className="px-3 py-1.5 text-xs text-white/50 hover:text-white transition-colors">
                    {locale === 'ar' ? 'إلغاء' : 'Cancel'}
                  </button>
                  <button onClick={() => handlePostComment(comment.id)} className="px-4 py-1.5 text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white rounded-lg transition-colors">
                    {locale === 'ar' ? 'رد' : 'Reply'}
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {comment.replies?.map((r: any) => renderComment(r, true))}
        </div>
      </div>
    )
  }

  if (loading) {
    return <div className="animate-pulse w-full h-24 bg-white/5 rounded-xl"></div>
  }

  if (!currentUser) {
    return (
      <div className="mt-16 border-t border-white/10 pt-8">
        <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
          <MessageCircle className="w-5 h-5 text-purple-400" />
          {locale === 'ar' ? 'التعليقات' : 'Comments'}
          <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full ml-2">
            {totalComments}
          </span>
        </h3>
        
        <div className="bg-white/2 border border-white/5 rounded-2xl p-6 text-center">
          <MessageCircle className="w-10 h-10 text-white/20 mx-auto mb-3" />
          <h4 className="text-white/60 font-medium mb-4">
            {locale === 'ar' ? 'تسجيل الدخول للمشاركة في النقاش' : 'Log in to join the discussion'}
          </h4>
          <Link href="/login" className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 hover:bg-white/15 border border-white/10 rounded-xl text-sm font-medium text-white transition-colors">
            <LogIn className="w-4 h-4" />
            {locale === 'ar' ? 'تسجيل الدخول' : 'Sign in'}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="mt-16 border-t border-white/10 pt-8">
      <h3 className="text-xl font-semibold text-white mb-8 flex items-center gap-2">
        <MessageCircle className="w-5 h-5 text-purple-400" />
        {locale === 'ar' ? 'التعليقات' : 'Comments'}
        <span className="bg-purple-500/20 text-purple-300 text-xs px-2 py-0.5 rounded-full ml-2">
          {totalComments}
        </span>
      </h3>

      {/* Main Comment Input */}
      <div className="flex gap-4 mb-10">
        <div className="flex-shrink-0 mt-1">
          {currentUser?.user_metadata?.avatar_url ? (
            <Image src={currentUser.user_metadata.avatar_url} alt="" width={40} height={40} className="rounded-full object-cover w-10 h-10 ring-2 ring-purple-500/30" />
          ) : (
            <div className="w-10 h-10 flex items-center justify-center rounded-full bg-purple-600/30 text-purple-300 font-medium border border-purple-500/30">
              {(currentUser?.user_metadata?.pseudo || currentUser?.user_metadata?.first_name || currentUser?.email || '?')[0].toUpperCase()}
            </div>
          )}
        </div>
        <div className="flex-1">
          <textarea
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder={locale === 'ar' ? 'ما رأيك في هذا المقال؟' : 'What do you think about this article?'}
            rows={3}
            className="w-full bg-white/5 border border-white/10 focus:border-purple-500/50 rounded-2xl p-4 text-sm text-white resize-none transition-all placeholder:text-white/20"
          />
          <div className="flex justify-end mt-3">
            <button 
              onClick={() => handlePostComment(null)}
              disabled={!newComment.trim()}
              className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl shadow-lg shadow-purple-500/20 transition-all active:scale-95"
            >
              {locale === 'ar' ? 'نشر التعليق' : 'Post Comment'}
            </button>
          </div>
        </div>
      </div>

      {comments.length === 0 ? (
        <div className="text-center py-10 bg-white/2 rounded-2xl border border-white/5 border-dashed">
          <p className="text-white/40 text-sm">
            {locale === 'ar' ? 'كن أول من يعلق!' : 'Be the first to comment!'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map(c => renderComment(c))}
        </div>
      )}
    </div>
  )
}
