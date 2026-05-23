 
const SITE_NAME =
  "BytePress";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://bytepress.dev";

const TWITTER =
  "@bytepress";

const DEFAULT_OG_IMAGE =
  `${SITE_URL}/images/og-default.png`;

const DEFAULT_DESCRIPTION =
  "Explore in-depth articles on AI, full-stack development, DevOps, and modern web technologies written by expert engineers.";

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function formatTitle(title = "") {
  if (!title) {
    return `${SITE_NAME} – Where Developers Share Ideas`;
  }

  return title.includes(SITE_NAME)
    ? title
    : `${title} | ${SITE_NAME}`;
}

function absoluteUrl(path = "") {
  if (!path) return DEFAULT_OG_IMAGE;

  return path.startsWith("http")
    ? path
    : `${SITE_URL}${path}`;
}

// ═════════════════════════════════════════════════════════════
// GENERIC METADATA
// ═════════════════════════════════════════════════════════════

export function buildMetadata({
  title = "",
  description = DEFAULT_DESCRIPTION,
  url = "/",
  image = DEFAULT_OG_IMAGE,
  type = "website",
  keywords = [],
  authors,
  publishedAt,
  modifiedAt,
  noIndex = false,
} = {}) {
  const fullTitle =
    formatTitle(title);

  const canonical =
    url.startsWith("http")
      ? url
      : `${SITE_URL}${url}`;

  const absImg =
    absoluteUrl(image);

  return {
    title: fullTitle,

    description,

    keywords,

    metadataBase: new URL(
      SITE_URL
    ),

    alternates: {
      canonical,
    },

    authors:
      authors ||
      [{ name: SITE_NAME }],

    robots: noIndex
      ? {
          index: false,
          follow: false,
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },

    openGraph: {
      title: fullTitle,
      description,

      url: canonical,

      siteName: SITE_NAME,

      type,

      locale: "en_US",

      images: [
        {
          url: absImg,
          width: 1200,
          height: 630,
          alt: fullTitle,
        },
      ],

      ...(publishedAt && {
        publishedTime:
          publishedAt,
      }),

      ...(modifiedAt && {
        modifiedTime:
          modifiedAt,
      }),

      ...(authors && {
        authors,
      }),
    },

    twitter: {
      card: "summary_large_image",

      site: TWITTER,

      creator: TWITTER,

      title: fullTitle,

      description,

      images: [absImg],
    },
  };
}

// ═════════════════════════════════════════════════════════════
// BLOG METADATA
// ═════════════════════════════════════════════════════════════

export function buildBlogMetadata(
  blog
) {
  if (!blog)
    return buildMetadata({});

  const title =
    blog.metaTitle ||
    blog.title;

  const description =
    blog.metaDescription ||
    blog.description ||
    DEFAULT_DESCRIPTION;

  const image =
    blog.ogImage ||
    blog.featureImage ||
    DEFAULT_OG_IMAGE;

  const canonical =
    blog.canonicalUrl ||
    `/blog/${blog.slug}`;

  const authorName =
    blog.author?.name ||
    SITE_NAME;

  const tags =
    Array.isArray(blog.tags)
      ? blog.tags
      : [];

  const categories =
    Array.isArray(
      blog.categories
    )
      ? blog.categories
      : [];

  return buildMetadata({
    title,

    description,

    image,

    url: canonical,

    type: "article",

    keywords: [
      ...tags,
      ...categories,
    ],

    authors: [
      {
        name: authorName,
      },
    ],

    publishedAt:
      blog.publishedAt,

    modifiedAt:
      blog.updatedAt,
  });
}

// ═════════════════════════════════════════════════════════════
// CATEGORY / TAG / AUTHOR METADATA
// ═════════════════════════════════════════════════════════════

export function buildCategoryMetadata(
  categoryName
) {
  return buildMetadata({
    title: `${categoryName} Articles`,

    description: `Browse all published articles about ${categoryName} on ${SITE_NAME}.`,

    url: `/category/${categoryName
      .toLowerCase()
      .replace(/\s+/g, "-")}`,
  });
}

export function buildTagMetadata(
  tagName
) {
  return buildMetadata({
    title: `#${tagName} Articles`,

    description: `All articles tagged with "${tagName}" on ${SITE_NAME}.`,

    url: `/tag/${tagName
      .toLowerCase()
      .replace(/\s+/g, "-")}`,
  });
}

export function buildAuthorMetadata(
  author
) {
  if (!author)
    return buildMetadata({});

  return buildMetadata({
    title: `${author.name} – Author`,

    description: `Articles written by ${author.name} on ${SITE_NAME}. ${author.postCount || 0} published posts.`,

    url: `/author/${author._id}`,
  });
}

// ═════════════════════════════════════════════════════════════
// JSON-LD SCHEMAS
// ═════════════════════════════════════════════════════════════

/**
 * Article Schema
 */
export function buildArticleJsonLd(
  blog
) {
  if (!blog) return null;

  return {
    "@context":
      "https://schema.org",

    "@type": "Article",

    headline: blog.title,

    description:
      blog.metaDescription ||
      blog.description,

    image:
      absoluteUrl(
        blog.featureImage ||
          DEFAULT_OG_IMAGE
      ),

    datePublished:
      blog.publishedAt,

    dateModified:
      blog.updatedAt,

    url: `${SITE_URL}/blog/${blog.slug}`,

    keywords:
      blog.tags?.join(", "),

    author: blog.author
      ? {
          "@type":
            "Person",

          name:
            blog.author.name,

          url: `${SITE_URL}/author/${blog.author._id}`,
        }
      : undefined,

    publisher: {
      "@type":
        "Organization",

      name: SITE_NAME,

      logo: {
        "@type":
          "ImageObject",

        url: `${SITE_URL}/images/logo.png`,
      },
    },

    mainEntityOfPage: {
      "@type":
        "WebPage",

      "@id": `${SITE_URL}/blog/${blog.slug}`,
    },
  };
}

/**
 * FAQ Schema
 */
export function buildFaqJsonLd(
  faqItems
) {
  if (
    !Array.isArray(faqItems) ||
    !faqItems.length
  ) {
    return null;
  }

  return {
    "@context":
      "https://schema.org",

    "@type":
      "FAQPage",

    mainEntity:
      faqItems.map(
        ({
          question,
          answer,
        }) => ({
          "@type":
            "Question",

          name: question,

          acceptedAnswer:
            {
              "@type":
                "Answer",

              text: answer,
            },
        })
      ),
  };
}

/**
 * Breadcrumb Schema
 */
export function buildBreadcrumbJsonLd(
  items
) {
  return {
    "@context":
      "https://schema.org",

    "@type":
      "BreadcrumbList",

    itemListElement:
      items.map(
        (
          item,
          index
        ) => ({
          "@type":
            "ListItem",

          position:
            index + 1,

          name: item.name,

          item: item.url
            ? `${SITE_URL}${item.url}`
            : undefined,
        })
      ),
  };
}

/**
 * Author Schema
 */
export function buildAuthorJsonLd(
  author
) {
  if (!author) return null;

  return {
    "@context":
      "https://schema.org",

    "@type": "Person",

    name: author.name,

    url: `${SITE_URL}/author/${author._id}`,

    image:
      author.avatar ||
      undefined,

    description:
      author.bio ||
      undefined,

    sameAs: [
      author.social
        ?.twitter &&
        `https://twitter.com/${author.social.twitter}`,

      author.social
        ?.linkedin &&
        `https://linkedin.com/in/${author.social.linkedin}`,

      author.social
        ?.github &&
        `https://github.com/${author.social.github}`,
    ].filter(Boolean),
  };
}

/**
 * Website Schema
 */
export function buildWebsiteJsonLd() {
  return {
    "@context":
      "https://schema.org",

    "@type": "WebSite",

    name: SITE_NAME,

    url: SITE_URL,

    potentialAction: {
      "@type":
        "SearchAction",

      target: `${SITE_URL}/search?q={search_term_string}`,

      "query-input":
        "required name=search_term_string",
    },
  };
}