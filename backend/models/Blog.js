const mongoose = require("mongoose");
const slugify = require("slugify");

const faqSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer:   { type: String, required: true },
});

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      unique: true,
      lowercase: true,
      index: true,
    },

    content: {
      type: String,
      required: true,
    },

    // ── SEO fields ────────────────────────────────────────────────
    metaTitle:       { type: String },
    metaDescription: { type: String },
    canonicalUrl:    { type: String },

    // ── Images ───────────────────────────────────────────────────
    featureImage: { type: String },  // main blog image URL
    ogImage:      { type: String },
    twitterImage: { type: String },

    // ── OpenGraph ─────────────────────────────────────────────────
    ogTitle:          { type: String },
    ogDescription:    { type: String },
    twitterTitle:     { type: String },
    twitterDescription: { type: String },

    // ── Taxonomy ─────────────────────────────────────────────────
    tags:       [{ type: String }],
    categories: [{ type: String }],

    // ── Content extras ────────────────────────────────────────────
    faq:           [faqSchema],
    internalLinks: [{ type: String }],
    externalLinks: [{ type: String }],

    // ── Featured flag (used by /api/blogs/featured) ───────────────
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // ── Relations ─────────────────────────────────────────────────
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ── Status workflow ───────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "draft",
        "pending_review",
        "changes_requested",
        "approved",
        "published",
        "rejected",
      ],
      default: "draft",
    },

    reviewedBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    reviewComment: { type: String },
    publishedAt:   { type: Date },
  },
  {
    timestamps: true,
  }
);

// ── Auto-generate unique slug from title ──────────────────────────
blogSchema.pre("save", async function () {
  if (!this.isModified("title")) return;

  let slug = slugify(this.title, { lower: true, strict: true });
  let existingBlog = await mongoose.models.Blog.findOne({ slug });
  let counter = 1;

  while (existingBlog) {
    slug = `${slugify(this.title, { lower: true, strict: true })}-${counter}`;
    existingBlog = await mongoose.models.Blog.findOne({ slug });
    counter++;
  }

  this.slug = slug;
});

module.exports = mongoose.model("Blog", blogSchema);