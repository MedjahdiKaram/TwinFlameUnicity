'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <html>
      <body>
        <div className="min-h-screen flex flex-col items-center justify-center text-center px-4 bg-black">
          <h2 className="text-2xl font-bold text-white mb-4">Une erreur critique est survenue !</h2>
          <button
            className="px-6 py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl transition-colors"
            onClick={() => reset()}
          >
            Réessayer
          </button>
        </div>
      </body>
    </html>
  )
}
