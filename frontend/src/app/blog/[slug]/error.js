"use client";
 
import Link from "next/link";

export default function BlogError({
  error,
  reset,
}) {
  return (
    <main
      role="alert"
      aria-live="assertive"
      className="min-h-[60vh] flex items-center justify-center px-4"
    >
      <div className="text-center max-w-md">

        {/* Error icon */}
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">

          <svg
            className="w-8 h-8 text-red-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>

        {/* Title */}
        <h1
          className="text-2xl font-black text-gray-900 mb-3"
          style={{
            fontFamily:
              "var(--font-display)",
          }}
        >
          Something went wrong
        </h1>

        {/* Message */}
        <p className="text-gray-500 text-sm leading-relaxed mb-8">

          {error?.message ||
            "We couldn't load this article. The server may be temporarily unavailable."}

        </p>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 flex-wrap">

          <button
            onClick={reset}
            className="
              px-5 py-2.5
              bg-blue-600 text-white
              text-sm font-medium
              rounded-xl
              hover:bg-blue-700
              transition-colors
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              focus-visible:ring-offset-2
            "
          >
            Try again
          </button>

          <Link
            href="/"
            className="
              px-5 py-2.5
              text-gray-700
              text-sm font-medium
              rounded-xl
              border border-gray-200
              hover:bg-gray-50
              transition-colors
              focus:outline-none
              focus-visible:ring-2
              focus-visible:ring-blue-500
              focus-visible:ring-offset-2
            "
          >
            Back to Home
          </Link>

        </div>
      </div>
    </main>
  );
}