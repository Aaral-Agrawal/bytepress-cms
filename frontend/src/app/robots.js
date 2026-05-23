 
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://bytepress.dev";

export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow:     ["/"],
        disallow:  ["/admin/", "/api/", "/_next/"],
      },
    ],
    sitemap:  `${SITE_URL}/sitemap.xml`,
    host:     SITE_URL,
  };
}