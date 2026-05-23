 
import Link from "next/link";

export default function BlogNotFound() {
  return (
    <main
      role="main"
      aria-label="Blog post not found"
      className="min-h-[60vh] flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <p className="text-6xl font-black text-blue-100 mb-2" aria-hidden="true">404</p>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Blog post not found</h1>
        <p className="text-gray-500 text-sm mb-8">
          This article doesn&apos;t exist or may have been removed.
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link
            href="/blog"
            className="px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl
                       hover:bg-blue-700 transition-colors focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Browse all articles
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 text-gray-700 text-sm font-medium rounded-xl border border-gray-200
                       hover:bg-gray-50 transition-colors focus:outline-none
                       focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            Go home
          </Link>
        </div>
      </div>
    </main>
  );
}