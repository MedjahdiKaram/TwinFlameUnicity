import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'TwinFlameUnicity — Éveil Spirituel & Flammes Jumelles',
    template: '%s | TwinFlameUnicity',
  },
  description:
    'Découvrez votre voie vers l\'Unité. Guidance spirituelle, éveil de la conscience et connexion pour les Flammes Jumelles.',
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'https://twinflameunicity.com'
  ),
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
