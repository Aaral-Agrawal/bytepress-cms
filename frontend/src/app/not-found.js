 

import Link from "next/link";

export const metadata = {
  title: "Page Not Found – BytePress",
};

export default function NotFound() {
  return (
    <main
      role="main"
      aria-label="Page not found"
      className="min-h-[70vh] flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">
        <p className="text-8xl font-black text-blue-50 select-none" aria-hidden="true">404</p>
        <div className="-mt-6 relative z-10">
          <h1 className="text-2xl font-bold text-gray-900 mb-3">Page not found</h1>
          <p className="text-gray-500 text-sm mb-8 leading-relaxed">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <Link
              href="/"
              className="px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl
                         hover:bg-blue-700 transition-colors focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Go home
            </Link>
            <Link
              href="/blog"
              className="px-6 py-2.5 text-gray-700 text-sm font-medium rounded-xl border border-gray-200
                         hover:bg-gray-50 transition-colors focus:outline-none
                         focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
            >
              Browse articles
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}