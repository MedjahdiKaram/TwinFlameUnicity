// ============================================================
// JSON-LD Schema.org generators
// ============================================================

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'

export function generateWebsiteSchema(locale: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'TwinFlameUnicity',
    url: `${BASE_URL}/${locale}`,
    description:
      locale === 'ar'
        ? 'رحلة روحانية للتوجيه والتواصل والصحوة الداخلية لأرواح التوأم'
        : 'Un voyage spirituel de guidance, connexion et éveil intérieur pour les Flammes Jumelles',
    inLanguage: locale === 'ar' ? 'ar' : 'fr',
    potentialAction: {
      '@type': 'SearchAction',
      target: `${BASE_URL}/${locale}/blog?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateArticleSchema(article: {
  title: string
  excerpt?: string | null
  content?: string
  cover_url?: string | null
  slug: string
  language: 'fr' | 'ar'
  published_at?: string | null
  updated_at?: string
  author?: { pseudo?: string | null; first_name?: string | null; last_name?: string | null }
  category?: { name_fr?: string; name_ar?: string }
}) {
  const url = `${BASE_URL}/${article.language}/${article.language === 'fr' ? 'blog' : 'مدونة'}/${article.slug}`
  const authorName = article.author?.pseudo
    || `${article.author?.first_name || ''} ${article.author?.last_name || ''}`.trim()
    || 'TwinFlameUnicity'

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: article.title,
    description: article.excerpt,
    image: article.cover_url,
    url,
    inLanguage: article.language,
    datePublished: article.published_at,
    dateModified: article.updated_at,
    author: {
      '@type': 'Person',
      name: authorName,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TwinFlameUnicity',
      logo: {
        '@type': 'ImageObject',
        url: `${BASE_URL}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
    articleSection: article.category
      ? (article.language === 'ar' ? article.category.name_ar : article.category.name_fr)
      : undefined,
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'TwinFlameUnicity',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    sameAs: [
      'https://www.instagram.com/twinflameunicity',
      'https://www.facebook.com/twinflameunicity',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      email: 'contact@twinflameunicity.com',
      contactType: 'customer service',
    },
  }
}

export function generatePageMetadata({
  title,
  description,
  locale,
  path,
  image,
}: {
  title: string
  description: string
  locale: string
  path: string
  image?: string
}) {
  const url = `${BASE_URL}/${locale}${path}`
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: 'TwinFlameUnicity',
      locale: locale === 'ar' ? 'ar_MA' : 'fr_FR',
      type: 'website' as const,
      images: image ? [{ url: image }] : [],
    },
    twitter: {
      card: 'summary_large_image' as const,
      title,
      description,
      images: image ? [image] : [],
    },
  }
}

export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  }
}
