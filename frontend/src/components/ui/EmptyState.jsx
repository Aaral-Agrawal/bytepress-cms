/**
 * components/ui/EmptyState.jsx
 * ─────────────────────────────
 * Covers three visual states:
 *   "empty"  — no content found
 *   "error"  — API / network failure
 *   "404"    — resource does not exist
 *
 * Props:
 *   type       {"empty"|"error"|"404"}
 *   title      {string}   — headline
 *   message    {string}   — body text
 *   action     {object}   — { label, href, onClick } optional CTA
 */

import Link from "next/link";

const CONFIGS = {
  empty: {
    icon: (
      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    bg: "bg-gray-50",
  },
  error: {
    icon: (
      <svg className="w-16 h-16 text-red-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    bg: "bg-red-50",
  },
  "404": {
    icon: (
      <svg className="w-16 h-16 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    bg: "bg-blue-50",
  },
};

export default function EmptyState({
  type    = "empty",
  title   = "Nothing here yet",
  message = "Check back later.",
  action,
}) {
  const config = CONFIGS[type] ?? CONFIGS.empty;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`${config.bg} rounded-2xl py-20 px-8 flex flex-col items-center text-center gap-4`}
    >
      {config.icon}

      <h2 className="text-xl font-semibold text-gray-700">{title}</h2>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed">{message}</p>

      {action && (
        action.href ? (
          <Link
            href={action.href}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {action.label}
          </Link>
        ) : (
          <button
            onClick={action.onClick}
            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
          >
            {action.label}
          </button>
        )
      )}
    </div>
  );
}
