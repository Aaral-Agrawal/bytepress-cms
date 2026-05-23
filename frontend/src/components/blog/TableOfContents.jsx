'use client';
 
import { useState, useMemo } from 'react';

function extractHeadings(html = '') {
  const matches = [...html.matchAll(/<h([23])[^>]*(?:id="([^"]*)")?[^>]*>(.*?)<\/h\1>/gi)];
  return matches.map((m, i) => {
    const level = parseInt(m[1]);
    // Strip inner HTML tags to get plain text
    const text = m[3].replace(/<[^>]+>/g, '');
    // Use existing id or generate one
    const id = m[2] || text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `heading-${i}`;
    return { level, text, id };
  });
}

export default function TableOfContents({ content = '' }) {
  const [open, setOpen] = useState(true);
  const headings = useMemo(() => extractHeadings(content), [content]);

  if (headings.length < 2) return null;

  return (
    <nav
      className="my-8 bg-blue-50/70 border border-blue-100 rounded-2xl overflow-hidden"
      aria-label="Table of contents"
    >
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-6 py-4
          text-left font-bold text-gray-900 hover:bg-blue-50 transition-colors"
      >
        <span className="flex items-center gap-2 text-sm">
          <span className="text-blue-600">📋</span>
          Table of Contents
        </span>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <ol className="px-6 pb-5 space-y-1.5">
          {headings.map((h, i) => (
            <li key={i} className={h.level === 3 ? 'ml-5' : ''}>
              <a
                href={`#${h.id}`}
                className="text-sm text-blue-700 hover:text-blue-900 hover:underline
                  transition-colors leading-relaxed flex items-start gap-2"
              >
                <span className="text-blue-300 font-mono text-xs mt-0.5 flex-shrink-0">
                  {h.level === 2 ? '§' : '·'}
                </span>
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </nav>
  );
}