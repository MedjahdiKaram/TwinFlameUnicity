import { Link } from '@/i18n/navigation'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-3xl font-bold text-white mb-4">Page Introuvable / Page Not Found (404)</h2>
      <p className="text-white/60 mb-8">La page que vous recherchez n'existe pas / The page you are looking for does not exist.</p>
      <Link
        href="/"
        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
      >
        Retour à l'accueil / Back to Home
      </Link>
    </div>
  )
}
