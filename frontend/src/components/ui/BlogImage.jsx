"use client";

/**
 * components/ui/BlogImage.jsx
 * ────────────────────────────
 * Wrapper around next/image that:
 *  - Handles missing / broken image URLs gracefully
 *  - Shows a styled fallback placeholder
 *  - Maintains aspect ratio without layout shift
 *  - Accepts all standard img props + aspectRatio
 *
 * Usage:
 *   <BlogImage src={blog.featureImage} alt={blog.title} aspectRatio="16/9" />
 */

import Image from "next/image";
import { useState } from "react";

const FALLBACK_GRADIENT = null; // use CSS gradient instead of a file

export default function BlogImage({
  src,
  alt,
  aspectRatio = "16/9",
  className   = "",
  priority    = false,
  sizes       = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  fill        = false,
  width,
  height,
  ...rest
}) {
  const [error, setError] = useState(false);
  const hasSrc = src && !error;

  // ── Fallback placeholder (when no image or load error) ──────────
  if (!hasSrc) {
    return (
      <div
        className={`relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 ${className}`}
        style={{ aspectRatio: fill ? undefined : aspectRatio }}
        aria-hidden="true"
        role="img"
        aria-label={alt}
      >
        {/* Decorative pattern */}
        <svg
          className="absolute inset-0 w-full h-full opacity-10"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
              <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#6366f1" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>
        {/* Centre icon */}
        <div className="absolute inset-0 flex items-center justify-center">
          <svg
            className="w-12 h-12 text-indigo-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
        </div>
      </div>
    );
  }

  // ── Real image ────────────────────────────────────────────────────
  if (fill) {
    return (
      <div className={`relative overflow-hidden ${className}`} {...rest}>
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
          onError={() => setError(true)}
        />
      </div>
    );
  }

  // Aspect-ratio wrapper
  return (
    <div
      className={`relative overflow-hidden ${className}`}
      style={{ aspectRatio }}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        onError={() => setError(true)}
        {...rest}
      />
    </div>
  );
}