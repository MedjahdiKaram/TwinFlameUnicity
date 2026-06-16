import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { ar, enUS } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ============================================================
// Date utils
// ============================================================

export function formatDate(
  date: string | Date,
  locale: 'en' | 'ar' = 'en',
  formatStr = 'dd MMMM yyyy'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return format(dateObj, formatStr, {
    locale: locale === 'ar' ? ar : enUS,
  })
}

export function formatRelativeDate(
  date: string | Date,
  locale: 'en' | 'ar' = 'en'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return formatDistanceToNow(dateObj, {
    addSuffix: true,
    locale: locale === 'ar' ? ar : enUS,
  })
}

// ============================================================
// Slug utils
// ============================================================

export function slugify(text: string): string {
  const isArabic = /[\u0600-\u06FF]/.test(text)
  if (isArabic) {
    return text
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\u0600-\u06FFa-z0-9-]/gi, '')
      .replace(/-+/g, '-')
  }
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
}

export function generateUniqueSlug(title: string): string {
  const base = slugify(title)
  const timestamp = Date.now().toString(36)
  return `${base}-${timestamp}`
}

// ============================================================
// Reading time
// ============================================================

export function estimateReadingTime(content: string): number {
  const wordsPerMinute = 200
  const wordCount = content
    .replace(/<[^>]+>/g, '') // strip HTML
    .split(/\s+/)
    .filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / wordsPerMinute))
}

// ============================================================
// Truncate
// ============================================================

export function truncate(text: string, maxLength = 160): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength).trimEnd() + '...'
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim()
}

// ============================================================
// Image utils
// ============================================================

export function getSupabaseImageUrl(
  bucket: string,
  path: string,
  supabaseUrl: string
): string {
  return `${supabaseUrl}/storage/v1/object/public/${bucket}/${path}`
}

export function generateImagePath(
  bucket: string,
  filename: string,
  userId?: string
): string {
  const timestamp = Date.now()
  const ext = filename.split('.').pop()
  const base = filename.replace(/\.[^.]+$/, '').replace(/[^a-z0-9]/gi, '-')
  if (userId) {
    return `${userId}/${timestamp}-${base}.${ext}`
  }
  return `${timestamp}-${base}.${ext}`
}

// ============================================================
// Number format
// ============================================================

export function formatNumber(num: number, locale: 'en' | 'ar' = 'en'): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-MA' : 'en-US').format(num)
}

// ============================================================
// Color utils
// ============================================================

export function hexToRgba(hex: string, alpha = 1): string {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (!result) return `rgba(147, 51, 234, ${alpha})`
  return `rgba(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}, ${alpha})`
}

// ============================================================
// Validation
// ============================================================

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function isValidUrl(url: string): boolean {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

// ============================================================
// Array utils
// ============================================================

export function groupBy<T>(
  array: T[],
  key: keyof T
): Record<string, T[]> {
  return array.reduce(
    (groups, item) => {
      const groupKey = String(item[key])
      return {
        ...groups,
        [groupKey]: [...(groups[groupKey] || []), item],
      }
    },
    {} as Record<string, T[]>
  )
}
