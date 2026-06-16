import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/fr/connexion', '/fr/inscription', '/ar/تسجيل-دخول', '/ar/التسجيل'],
        crawlDelay: 2,
      },
      {
        // Autoriser explicitement les moteurs de recherche IA et crawlers LLM
        userAgent: ['GPTBot', 'ChatGPT-User', 'ClaudeBot', 'anthropic-ai', 'Google-Extended', 'PerplexityBot', 'CCBot'],
        allow: '/',
        disallow: ['/admin/', '/api/', '/fr/connexion', '/fr/inscription', '/ar/تسجيل-دخول', '/ar/التسجيل'],
      }
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
