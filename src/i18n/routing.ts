import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['fr', 'ar'],
  defaultLocale: 'ar',
  localePrefix: 'always',
  pathnames: {
    '/': '/',
    '/blog': { fr: '/blog', ar: '/\u0645\u062f\u0648\u0646\u0629' },
    '/blog/[slug]': { fr: '/blog/[slug]', ar: '/\u0645\u062f\u0648\u0646\u0629/[slug]' },
    '/categories': { fr: '/categories', ar: '/\u062a\u0635\u0646\u064a\u0641\u0627\u062a' },
    '/categories/[slug]': { fr: '/categories/[slug]', ar: '/\u062a\u0635\u0646\u064a\u0641\u0627\u062a/[slug]' },
    '/tags': { fr: '/tags', ar: '/\u0648\u0633\u0648\u0645' },
    '/tags/[slug]': { fr: '/tags/[slug]', ar: '/\u0648\u0633\u0648\u0645/[slug]' },
    '/about': { fr: '/a-propos', ar: '/\u0645\u0646-\u0646\u062d\u0646' },
    '/contact': { fr: '/contact', ar: '/\u062a\u0648\u0627\u0635\u0644' },
    '/login': { fr: '/connexion', ar: '/\u062a\u0633\u062c\u064a\u0644-\u062f\u062e\u0648\u0644' },
    '/register': { fr: '/inscription', ar: '/\u0627\u0644\u062a\u0633\u062c\u064a\u0644' },
    '/profile': { fr: '/profil', ar: '/\u0627\u0644\u0645\u0644\u0641-\u0627\u0644\u0634\u062e\u0635\u064a' },
    '/admin': '/admin',
    '/admin/articles': '/admin/articles',
    '/admin/articles/new': '/admin/articles/new',
    '/admin/articles/[id]/edit': '/admin/articles/[id]/edit',
    '/admin/categories': '/admin/categories',
    '/admin/tags': '/admin/tags',
    '/admin/users': '/admin/users',
    '/admin/media': '/admin/media',
    '/admin/settings': '/admin/settings',
    '/legal': '/legal',
    '/privacy': '/privacy',
    '/resources': '/resources',
  },
})

export type Locale = (typeof routing.locales)[number]
