import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'ar'],
  defaultLocale: 'fr',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/blog': { fr: '/blog', ar: '/مدونة' },
    '/blog/[slug]': { fr: '/blog/[slug]', ar: '/مدونة/[slug]' },
    '/categories': { fr: '/categories', ar: '/تصنيفات' },
    '/categories/[slug]': { fr: '/categories/[slug]', ar: '/تصنيفات/[slug]' },
    '/tags': { fr: '/tags', ar: '/وسوم' },
    '/tags/[slug]': { fr: '/tags/[slug]', ar: '/وسوم/[slug]' },
    '/about': { fr: '/a-propos', ar: '/من-نحن' },
    '/contact': { fr: '/contact', ar: '/تواصل' },
    '/login': { fr: '/connexion', ar: '/تسجيل-دخول' },
    '/register': { fr: '/inscription', ar: '/التسجيل' },
    '/profile': { fr: '/profil', ar: '/الملف-الشخصي' },
    '/admin': '/admin',
    '/admin/articles': '/admin/articles',
    '/admin/categories': '/admin/categories',
    '/admin/tags': '/admin/tags',
    '/admin/users': '/admin/users',
    '/admin/media': '/admin/media',
    '/admin/settings': '/admin/settings',
  },
})

export type Locale = (typeof routing.locales)[number]
