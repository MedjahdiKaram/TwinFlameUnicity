'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
      <h2 className="text-2xl font-bold text-white mb-4">Une erreur est survenue !</h2>
      <button
        className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
        onClick={() => reset()}
      >
        Réessayer
      </button>
    </div>
  )
}
