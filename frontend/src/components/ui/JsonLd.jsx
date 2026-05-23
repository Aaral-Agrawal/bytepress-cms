/**
 * components/ui/JsonLd.jsx
 * ─────────────────────────
 * Server component that safely injects one or more JSON-LD
 * structured-data scripts into the page <head>.
 *
 * Usage:
 *   import JsonLd from '@/components/ui/JsonLd';
 *   import { buildArticleSchema } from '@/lib/seo';
 *
 *   <JsonLd schemas={[buildArticleSchema(blog), buildFaqSchema(blog.faq)]} />
 */

export default function JsonLd({ schemas = [] }) {
  const valid = schemas.filter(Boolean); // drop null / undefined (e.g. empty FAQ)
  if (!valid.length) return null;

  return (
    <>
      {valid.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Next.js server component — dangerouslySetInnerHTML is fine here
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
    </>
  );
}