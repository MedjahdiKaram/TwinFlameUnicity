'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, AlertCircle, Info } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { loginSchema, type LoginInput } from '@/lib/validations/auth'
import { loginAction } from '@/server/actions/auth'

export function LoginForm({ locale }: { locale: 'fr' | 'ar' }) {
  const t = useTranslations('auth')
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [isPending2, setIsPending2] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginInput) => {
    setServerError('')
    const formData = new FormData()
    formData.set('email', data.email)
    formData.set('password', data.password)

    startTransition(async () => {
      const result = await loginAction(formData)
      if (result?.error) {
        if (result.error === 'pending') {
          setServerError('pending')
        } else {
          setServerError(result.error)
        }
      } else if (result?.success) {
        router.push(`/${locale}`)
        router.refresh()
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 space-y-5"
    >
      {serverError === 'pending' ? (
        <div className="flex items-start gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
          <Info className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-300">{t('pending_message')}</p>
        </div>
      ) : serverError ? (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {serverError}
        </div>
      ) : null}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('email_label')}
          </label>
          <div className="relative">
            <Mail className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register('email')}
              type="email"
              placeholder={t('email_placeholder')}
              className="input-cosmic ps-11"
            />
          </div>
          {errors.email && (
            <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('password_label')}
          </label>
          <div className="relative">
            <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder={t('password_placeholder')}
              className="input-cosmic ps-11 pe-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 transition-all duration-300 shadow-glow-sm hover:shadow-glow"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : t('login_btn')}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-white/30">
          {t('no_account')}{' '}
          <Link href="/register" className="text-purple-400 hover:text-purple-300 transition-colors">
            {t('register_btn')}
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
