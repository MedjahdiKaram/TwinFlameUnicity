'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion } from 'framer-motion'
import { Eye, EyeOff, User, Mail, Lock, AlertCircle, CheckCircle } from 'lucide-react'
import { Link } from '@/i18n/navigation'
import { registerSchema, type RegisterInput } from '@/lib/validations/auth'
import { registerAction } from '@/server/actions/auth'

export function RegisterForm({ locale }: { locale: 'en' | 'ar' }) {
  const t = useTranslations('auth')
  const [isPending, startTransition] = useTransition()
  const [showPassword, setShowPassword] = useState(false)
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { gender: 'prefer_not_to_say' },
  })

  const onSubmit = (data: RegisterInput) => {
    setServerError('')
    const formData = new FormData()
    Object.entries(data).forEach(([k, v]) => formData.set(k, v || ''))

    startTransition(async () => {
      const result = await registerAction(formData)
      if (result?.error) {
        setServerError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    })
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-12 text-center space-y-4"
      >
        <CheckCircle className="w-16 h-16 text-green-400 mx-auto" />
        <h2 className="text-xl font-display text-white">Compte créé !</h2>
        <p className="text-white/50 text-sm">{t('pending_message')}</p>
        <Link
          href="/login"
          className="inline-block mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          {t('have_account')} {t('login_btn')}
        </Link>
      </motion.div>
    )
  }

  const InputField = ({ name, label, type = 'text', icon: Icon, placeholder }: any) => (
    <div>
      <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
        {label}
      </label>
      <div className="relative">
        {Icon && <Icon className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />}
        <input
          {...register(name)}
          type={type}
          placeholder={placeholder}
          className={`input-cosmic ${Icon ? 'ps-11' : ''}`}
        />
      </div>
      {errors[name] && (
        <p className="text-red-400 text-xs mt-1">{(errors[name] as any)?.message}</p>
      )}
    </div>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 space-y-5"
    >
      {serverError && (
        <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl p-4 text-sm text-red-400">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <InputField name="first_name" label={t('first_name_label')} icon={User} />
          <InputField name="last_name" label={t('last_name_label')} icon={User} />
        </div>

        <InputField name="pseudo" label={t('pseudo_label')} icon={User} placeholder="@monpseudo" />

        {/* Gender */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('gender_label')}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: 'male', label: t('gender_male') },
              { value: 'female', label: t('gender_female') },
              { value: 'other', label: t('gender_other') },
              { value: 'prefer_not_to_say', label: t('gender_prefer_not') },
            ].map(({ value, label }) => (
              <label key={value} className="relative cursor-pointer">
                <input
                  {...register('gender')}
                  type="radio"
                  value={value}
                  className="peer sr-only"
                />
                <div className="text-center py-2.5 px-2 rounded-xl border border-white/10 text-xs text-white/50 transition-all duration-200 peer-checked:bg-purple-600/20 peer-checked:border-purple-500/50 peer-checked:text-purple-300 hover:border-white/20">
                  {label}
                </div>
              </label>
            ))}
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('bio_label')}
          </label>
          <textarea
            {...register('bio')}
            rows={3}
            placeholder={t('bio_placeholder')}
            className="input-cosmic resize-none"
          />
        </div>

        <div className="border-t border-white/5 pt-4">
          <InputField name="email" label={t('email_label')} type="email" icon={Mail} placeholder={t('email_placeholder')} />
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('password_label')}
          </label>
          <div className="relative">
            <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              className="input-cosmic ps-11 pe-11"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute end-3.5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
            {t('confirm_password_label')}
          </label>
          <div className="relative">
            <Lock className="absolute start-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
            <input
              {...register('confirm_password')}
              type={showPassword ? 'text' : 'password'}
              className="input-cosmic ps-11"
            />
          </div>
          {errors.confirm_password && <p className="text-red-400 text-xs mt-1">{errors.confirm_password.message}</p>}
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="w-full flex items-center justify-center gap-2 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-60 transition-all duration-300 shadow-glow-sm hover:shadow-glow"
        >
          {isPending ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : t('register_btn')}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-white/30">
          {t('have_account')}{' '}
          <Link href="/login" className="text-purple-400 hover:text-purple-300 transition-colors">
            {t('login_btn')}
          </Link>
        </p>
      </div>
    </motion.div>
  )
}
