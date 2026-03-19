import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-4xl font-bold text-gray-900">404</h1>
      <p className="text-gray-500">The page you are looking for does not exist.</p>
      <Link href="/dashboard" className="text-indigo-600 hover:underline">
        Go to Dashboard
      </Link>
    </div>
  )
}
