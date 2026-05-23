"use client";

/**
 * components/ui/Pagination.jsx
 * ─────────────────────────────
 * Fully accessible, reusable pagination component.
 *
 * Props:
 *   currentPage  {number}   — active page (1-based)
 *   totalPages   {number}   — total pages
 *   onPageChange {Function} — callback(newPage)
 *   className    {string}   — optional wrapper class
 *
 * Features:
 *   - ARIA roles + labels on every button
 *   - Keyboard navigable
 *   - Ellipsis for large page counts
 *   - Prev / Next buttons disabled at boundaries
 */

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className = "",
}) {
  if (!totalPages || totalPages <= 1) return null;

  // ── Build page number list with ellipsis ──────────────────────
  function getPageNumbers() {
    const delta  = 2;           // pages each side of current
    const range  = [];
    const result = [];
    let   last;

    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Always include first & last
    if (currentPage - delta > 2)       range.unshift("...");
    if (currentPage + delta < totalPages - 1) range.push("...");
    range.unshift(1);
    range.push(totalPages);

    // Deduplicate
    for (const item of range) {
      if (last) {
        if (item === "..." && last === "...") continue;
        if (typeof item === "number" && item === last) continue;
      }
      result.push(item);
      last = item;
    }

    return result;
  }

  const pages = getPageNumbers();

  // ── Button helpers ────────────────────────────────────────────
  const btnBase =
    "inline-flex items-center justify-center min-w-[2.5rem] h-10 px-3 text-sm font-medium rounded-lg transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed";

  const btnActive  = "bg-blue-600 text-white shadow-sm";
  const btnDefault = "text-gray-700 hover:bg-gray-100 border border-gray-200";
  const btnDisabled= "text-gray-300 border border-gray-100";

  return (
    <nav
      aria-label="Pagination navigation"
      className={`flex items-center justify-center gap-1.5 ${className}`}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Go to previous page"
        className={`${btnBase} ${currentPage === 1 ? btnDisabled : btnDefault}`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span className="sr-only">Previous</span>
      </button>

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "..." ? (
          <span
            key={`ellipsis-${idx}`}
            className="inline-flex items-center justify-center w-10 h-10 text-sm text-gray-400"
            aria-hidden="true"
          >
            …
          </span>
        ) : (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            aria-label={`Go to page ${page}`}
            aria-current={page === currentPage ? "page" : undefined}
            className={`${btnBase} ${page === currentPage ? btnActive : btnDefault}`}
          >
            {page}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Go to next page"
        className={`${btnBase} ${currentPage === totalPages ? btnDisabled : btnDefault}`}
      >
        <span className="sr-only">Next</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}