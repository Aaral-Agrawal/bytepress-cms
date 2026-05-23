import React, { useState, useEffect, useCallback } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Save, Send, Eye, ArrowLeft, Loader2, CheckCircle,
  AlertCircle, FileText, Image as ImageIcon, Tag,
  Search, HelpCircle, ChevronRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { blogAPI, categoryAPI, tagAPI } from '../services/api'
import ImageUploader from '../components/blog/ImageUploader'
import TagInput from '../components/blog/TagInput'
import FAQSection from '../components/blog/FAQSection'
import SEOFields from '../components/blog/SEOFields'

// ─── Simple Toast ──────────────────────────────────────────────────────────────
const Toast = ({ toasts }) => (
  <div className="fixed bottom-6 right-6 z-[100] flex flex-col gap-2 pointer-events-none">
    <AnimatePresence>
      {toasts.map((t) => (
        <motion.div
          key={t.id}
          initial={{ opacity: 0, x: 40, scale: 0.9 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 40, scale: 0.9 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className={`flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg text-sm font-medium
            max-w-xs pointer-events-auto border
            ${t.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : t.type === 'error'
                ? 'bg-red-50 text-red-800 border-red-200'
                : 'bg-white text-ink-800 border-ink-200'
            }`}
        >
          {t.type === 'success' && <CheckCircle size={16} className="text-emerald-500 flex-shrink-0" />}
          {t.type === 'error' && <AlertCircle size={16} className="text-red-500 flex-shrink-0" />}
          {t.message}
        </motion.div>
      ))}
    </AnimatePresence>
  </div>
)

// ─── Slug generator ────────────────────────────────────────────────────────────
const generateSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()

// ─── Section wrapper ───────────────────────────────────────────────────────────
const Section = ({ icon: Icon, title, badge, children, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
    className="bg-white rounded-2xl border border-ink-100 shadow-sm overflow-hidden"
  >
    <div className="flex items-center justify-between px-6 py-4 border-b border-ink-100 bg-ink-50/30">
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 bg-white rounded-lg border border-ink-200 flex items-center justify-center shadow-sm">
          <Icon size={14} className="text-ink-600" />
        </div>
        <h3 className="text-sm font-semibold text-ink-800">{title}</h3>
      </div>
      {badge && (
        <span className="text-xs px-2 py-0.5 bg-ink-100 text-ink-500 rounded-full">{badge}</span>
      )}
    </div>
    <div className="p-6">{children}</div>
  </motion.div>
)

// ─── Field ─────────────────────────────────────────────────────────────────────
const Field = ({ label, required, error, children, hint }) => (
  <div className="space-y-1.5">
    {label && (
      <label className="block text-sm font-medium text-ink-700">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
    )}
    {children}
    {hint && !error && <p className="text-xs text-ink-400">{hint}</p>}
    {error && (
      <p className="text-xs text-red-500 flex items-center gap-1">
        <AlertCircle size={11} /> {error}
      </p>
    )}
  </div>
)

// ─── Skeleton ──────────────────────────────────────────────────────────────────
const SkeletonBlock = ({ h = 'h-10', className = '' }) => (
  <div className={`${h} ${className} bg-ink-100 rounded-xl animate-pulse`} />
)

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// MAIN COMPONENT
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const CreateBlog = () => {
  const navigate = useNavigate()
  const { id: editId } = useParams()        // present when editing existing blog
  const { role, user } = useAuth()
  const isEditing = Boolean(editId)

  // ── Form state ──────────────────────────────────────────────────────────────
  const [form, setForm] = useState({
    title: '',
    slug: '',
    content: '',
    featureImage: '',
    categories: [],
    tags: [],
    faq: [],
    // SEO
    metaTitle: '',
    metaDescription: '',
    canonicalUrl: '',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
  })

  const [errors, setErrors] = useState({})
  const [slugEdited, setSlugEdited] = useState(false)

  // ── UI state ────────────────────────────────────────────────────────────────
  const [toasts, setToasts] = useState([])
  const [savingDraft, setSavingDraft] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [pageLoading, setPageLoading] = useState(isEditing)
  const [activeSection, setActiveSection] = useState('content') // 'content' | 'seo' | 'faq'

  // ── Data ────────────────────────────────────────────────────────────────────
  const [categories, setCategories] = useState([])
  const [tagSuggestions, setTagSuggestions] = useState([])

  // ── Toast helper ────────────────────────────────────────────────────────────
  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4000)
  }, [])

  // ── Load categories and tags ─────────────────────────────────────────────────
  useEffect(() => {
    const fetchMeta = async () => {
      try {
        const [catRes, tagRes] = await Promise.allSettled([
          categoryAPI.getAll(),
          tagAPI.getAll(),
        ])
        if (catRes.status === 'fulfilled') {
          const cats = catRes.value?.categories || catRes.value?.data || catRes.value || []
          setCategories(Array.isArray(cats) ? cats : [])
        }
        if (tagRes.status === 'fulfilled') {
          const tags = tagRes.value?.tags || tagRes.value?.data || tagRes.value || []
          const tagNames = Array.isArray(tags)
            ? tags.map((t) => (typeof t === 'string' ? t : t.name || t.slug || t))
            : []
          setTagSuggestions(tagNames)
        }
      } catch { /* graceful fail — user can still type manually */ }
    }
    fetchMeta()
  }, [])

  // ── Load blog for editing ────────────────────────────────────────────────────
  useEffect(() => {
    if (!editId) return
    const fetchBlog = async () => {
      setPageLoading(true)
      try {
        const res = await blogAPI.getById(editId)
        const blog = res?.blog || res?.data || res
        if (!blog) throw new Error('Blog not found')
        setForm({
          title: blog.title || '',
          slug: blog.slug || '',
          content: blog.content || '',
          featureImage: blog.featureImage || '',
          categories: blog.categories || [],
          tags: blog.tags || [],
          faq: blog.faq || [],
          metaTitle: blog.metaTitle || '',
          metaDescription: blog.metaDescription || '',
          canonicalUrl: blog.canonicalUrl || '',
          ogTitle: blog.ogTitle || '',
          ogDescription: blog.ogDescription || '',
          ogImage: blog.ogImage || '',
          twitterCard: blog.twitterCard || 'summary_large_image',
          twitterTitle: blog.twitterTitle || '',
          twitterDescription: blog.twitterDescription || '',
          twitterImage: blog.twitterImage || '',
        })
        setSlugEdited(true) // don't overwrite slug on edit
      } catch {
        addToast('Failed to load blog for editing.', 'error')
      } finally {
        setPageLoading(false)
      }
    }
    fetchBlog()
  }, [editId, addToast])

  // ── Auto-generate slug from title ────────────────────────────────────────────
  useEffect(() => {
    if (slugEdited) return
    setForm((f) => ({ ...f, slug: generateSlug(f.title) }))
  }, [form.title, slugEdited])

  // ── Field change helpers ─────────────────────────────────────────────────────
  const setField = (field, value) => {
    setForm((f) => ({ ...f, [field]: value }))
    if (errors[field]) setErrors((e) => ({ ...e, [field]: '' }))
  }

  const setSEOField = (field, value) => setField(field, value)

  // ── Validation ───────────────────────────────────────────────────────────────
  const validate = () => {
    const e = {}
    if (!form.title.trim()) e.title = 'Title is required'
    if (!form.slug.trim()) e.slug = 'Slug is required'
    if (!form.content.trim()) e.content = 'Content is required'
    if (form.categories.length === 0) e.categories = 'Select at least one category'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  // ── Build payload ────────────────────────────────────────────────────────────
  const buildPayload = (status) => ({
    ...form,
    status,
    // FAQ: filter out empty items
    faq: form.faq.filter((f) => f.question.trim() && f.answer.trim()),
  })

  // ── Save as draft ────────────────────────────────────────────────────────────
  const handleDraft = async () => {
    if (!form.title.trim()) {
      addToast('Please enter a title before saving draft.', 'error')
      return
    }
    setSavingDraft(true)
    try {
      const payload = buildPayload('draft')
      const res = isEditing
        ? await blogAPI.update(editId, payload)
        : await blogAPI.create(payload)
      addToast('Draft saved successfully!', 'success')
      if (!isEditing) {
        const newId = res?.blog?._id || res?.data?._id || res?._id
        if (newId) {
          // Navigate to edit URL so further saves update instead of creating
          navigate(`/dashboard/${role === 'superadmin' ? 'admin' : role}/blogs/edit/${newId}`, { replace: true })
        }
      }
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to save draft.', 'error')
    } finally {
      setSavingDraft(false)
    }
  }

  // ── Publish ──────────────────────────────────────────────────────────────────
  const handlePublish = async () => {
    if (!validate()) {
      addToast('Please fix the errors before publishing.', 'error')
      return
    }
    setPublishing(true)
    try {
      // Authors can only submit for review; superadmin/editor can publish directly
      const targetStatus = role === 'author' ? 'pending_review' : 'published'
      const payload = buildPayload(targetStatus)

      if (isEditing) {
        await blogAPI.update(editId, payload)
      } else {
        await blogAPI.create(payload)
      }

      addToast(
        role === 'author' ? 'Blog submitted for review!' : 'Blog published successfully!',
        'success'
      )
      setTimeout(() => {
        const blogsPath = role === 'superadmin' ? '/dashboard/admin/blogs'
          : role === 'editor' ? '/dashboard/editor/blogs'
          : '/dashboard/author/blogs'
        navigate(blogsPath)
      }, 1200)
    } catch (err) {
      addToast(err?.response?.data?.message || 'Failed to publish.', 'error')
    } finally {
      setPublishing(false)
    }
  }

  // ── Preview ──────────────────────────────────────────────────────────────────
  const handlePreview = async () => {
    try {
      let blogId = editId

      if (!blogId) {
        const payload = buildPayload('draft')
        const res = await blogAPI.create(payload)
        blogId = res?.blog?._id || res?.data?._id || res?._id
      }

      if (!blogId) {
        addToast('Unable to generate preview.', 'error')
        return
      }

      const base =
        role === 'superadmin'
          ? '/dashboard/admin'
          : role === 'editor'
          ? '/dashboard/editor'
          : '/dashboard/author'

      navigate(`${base}/blogs/preview/${blogId}`)
    } catch (err) {
      addToast('Preview failed.', 'error')
    }
  }

  // ── Category toggle ──────────────────────────────────────────────────────────
  const toggleCategory = (cat) => {
    const name = typeof cat === 'string' ? cat : cat.name || cat.slug
    const current = form.categories
    const next = current.includes(name)
      ? current.filter((c) => c !== name)
      : [...current, name]
    setField('categories', next)
  }

  // ── Back path by role ────────────────────────────────────────────────────────
  const backPath = role === 'superadmin' ? '/dashboard/admin/blogs'
    : role === 'editor' ? '/dashboard/editor/blogs'
    : '/dashboard/author/blogs'

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // Skeleton loading state
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  if (pageLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <SkeletonBlock h="h-8" className="w-48" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <SkeletonBlock h="h-48" />
            <SkeletonBlock h="h-64" />
          </div>
          <div className="space-y-4">
            <SkeletonBlock h="h-40" />
            <SkeletonBlock h="h-32" />
          </div>
        </div>
      </div>
    )
  }

  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  // RENDER
  // ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  return (
    <div className="max-w-5xl mx-auto">
      <Toast toasts={toasts} />

      {/* ── Page header ─────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="flex items-center justify-between mb-6 flex-wrap gap-3"
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate(backPath)}
            className="p-2 text-ink-500 hover:text-ink-800 hover:bg-ink-100 rounded-xl
                       transition-colors"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-xl font-display font-bold text-ink-900">
              {isEditing ? 'Edit Blog Post' : 'Create Blog Post'}
            </h1>
            <p className="text-xs text-ink-400 mt-0.5">
              {isEditing ? 'Update your blog content and SEO' : 'Write, optimise, and publish your next post'}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePreview}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-700
                       bg-white border border-ink-200 hover:border-ink-300 hover:bg-ink-50
                       rounded-xl transition-all duration-200 shadow-sm"
          >
            <Eye size={15} />
            Preview
          </button>
          <button
            onClick={handleDraft}
            disabled={savingDraft || publishing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-ink-700
                       bg-white border border-ink-200 hover:border-ink-300 hover:bg-ink-50
                       rounded-xl transition-all duration-200 shadow-sm
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {savingDraft
              ? <Loader2 size={15} className="animate-spin" />
              : <Save size={15} />
            }
            {savingDraft ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            onClick={handlePublish}
            disabled={savingDraft || publishing}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white
                       bg-ink-900 hover:bg-ink-800 rounded-xl transition-all duration-200
                       shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {publishing
              ? <Loader2 size={15} className="animate-spin" />
              : <Send size={15} />
            }
            {publishing
              ? 'Publishing…'
              : role === 'author' ? 'Submit for Review' : (isEditing ? 'Update & Publish' : 'Publish')
            }
          </button>
        </div>
      </motion.div>

      {/* ── Section nav tabs ─────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.05 }}
        className="flex items-center gap-1 mb-5 bg-ink-100/60 rounded-xl p-1 w-fit"
      >
        {[
          { id: 'content', label: 'Content', icon: FileText },
          { id: 'seo',     label: 'SEO',     icon: Search   },
          { id: 'faq',     label: 'FAQ',      icon: HelpCircle },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveSection(id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium rounded-lg
                        transition-all duration-200
                        ${activeSection === id
                          ? 'bg-white text-ink-900 shadow-sm'
                          : 'text-ink-500 hover:text-ink-700'
                        }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </motion.div>

      {/* ── Main layout ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column — main editor ──────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-5">

          {/* Content section */}
          <AnimatePresence mode="wait">
            {activeSection === 'content' && (
              <motion.div
                key="content"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
                className="space-y-5"
              >
                {/* Title & Slug */}
                <Section icon={FileText} title="Post Details" delay={0.05}>
                  <div className="space-y-4">
                    <Field label="Title" required error={errors.title}>
                      <input
                        type="text"
                        value={form.title}
                        onChange={(e) => setField('title', e.target.value)}
                        placeholder="Enter your blog title…"
                        className={`w-full px-4 py-3 rounded-xl border text-ink-900 text-lg font-medium
                                   placeholder-ink-300 bg-white outline-none transition-all duration-200
                                   ${errors.title
                                     ? 'border-red-300 focus:ring-2 focus:ring-red-100'
                                     : 'border-ink-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100'
                                   }`}
                      />
                    </Field>

                    <Field
                      label="Slug"
                      required
                      error={errors.slug}
                      hint="Auto-generated from title. Edit to customise."
                    >
                      <div className="flex items-center gap-0 border border-ink-200 rounded-xl
                                      overflow-hidden focus-within:border-ink-400
                                      focus-within:ring-2 focus-within:ring-ink-100 transition-all">
                        <span className="px-3 py-3 bg-ink-50 text-ink-400 text-sm border-r border-ink-200
                                         flex-shrink-0 font-mono">
                          /blog/
                        </span>
                        <input
                          type="text"
                          value={form.slug}
                          onChange={(e) => {
                            setSlugEdited(true)
                            setField('slug', e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))
                          }}
                          className="flex-1 px-3 py-3 text-sm font-mono text-ink-700 bg-white
                                     outline-none"
                          placeholder="your-blog-slug"
                        />
                        {form.slug && (
                          <button
                            type="button"
                            onClick={() => { setSlugEdited(false); setField('slug', generateSlug(form.title)) }}
                            className="px-3 py-3 text-xs text-ink-400 hover:text-ink-700 bg-ink-50
                                       border-l border-ink-200 hover:bg-ink-100 transition-colors flex-shrink-0"
                          >
                            Reset
                          </button>
                        )}
                      </div>
                    </Field>
                  </div>
                </Section>

                {/* Content Editor */}
                <Section icon={FileText} title="Content" delay={0.1}>
                  <Field label="Blog Content" required error={errors.content}>
                    <textarea
                      value={form.content}
                      onChange={(e) => setField('content', e.target.value)}
                      placeholder="Write your blog content here… (HTML, Markdown, or plain text — depending on your frontend renderer)"
                      rows={18}
                      className={`w-full px-4 py-3 rounded-xl border text-sm text-ink-800
                                 placeholder-ink-300 bg-white outline-none font-mono leading-relaxed
                                 transition-all duration-200 resize-y
                                 ${errors.content
                                   ? 'border-red-300 focus:ring-2 focus:ring-red-100'
                                   : 'border-ink-200 focus:border-ink-400 focus:ring-2 focus:ring-ink-100'
                                 }`}
                    />
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-ink-400">
                        {form.content.split(/\s+/).filter(Boolean).length} words ·{' '}
                        {form.content.length} characters
                      </p>
                      {form.content.length > 0 && (
                        <p className="text-xs text-emerald-600 flex items-center gap-1">
                          <CheckCircle size={11} />
                          {Math.ceil(form.content.split(/\s+/).length / 200)} min read
                        </p>
                      )}
                    </div>
                  </Field>
                </Section>
              </motion.div>
            )}

            {/* SEO section */}
            {activeSection === 'seo' && (
              <motion.div
                key="seo"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <Section icon={Search} title="SEO & Social" delay={0}>
                  <SEOFields values={form} onChange={setSEOField} />
                </Section>
              </motion.div>
            )}

            {/* FAQ section */}
            {activeSection === 'faq' && (
              <motion.div
                key="faq"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.25 }}
              >
                <Section icon={HelpCircle} title="FAQ Section" delay={0} badge="Boosts SEO">
                  <FAQSection faqs={form.faq} onChange={(faq) => setField('faq', faq)} />
                </Section>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ── Right column — meta sidebar ────────────────────────────────────── */}
        <div className="space-y-5">

          {/* Feature Image */}
          <Section icon={ImageIcon} title="Feature Image" delay={0.08}>
            <ImageUploader
              value={form.featureImage}
              onChange={(url) => setField('featureImage', url)}
              label=""
              hint="1200×630px recommended"
              aspectRatio="aspect-video"
            />
          </Section>

          {/* Categories */}
          <Section icon={Tag} title="Categories" delay={0.12}>
            <Field error={errors.categories} hint="Select one or more categories">
              {categories.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {categories.map((cat) => {
                    const name = typeof cat === 'string' ? cat : cat.name || cat.slug
                    const isSelected = form.categories.includes(name)
                    return (
                      <button
                        key={name}
                        type="button"
                        onClick={() => toggleCategory(cat)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all
                          ${isSelected
                            ? 'bg-ink-900 text-white border-ink-900'
                            : 'bg-white text-ink-600 border-ink-200 hover:border-ink-400'
                          }`}
                      >
                        {name}
                      </button>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-ink-400 italic">
                    No categories found. You can add categories in the Categories section.
                  </p>
                  {/* Manual category input fallback */}
                  <TagInput
                    tags={form.categories}
                    onChange={(cats) => setField('categories', cats)}
                    placeholder="Type category name…"
                    label=""
                  />
                </div>
              )}
            </Field>
          </Section>

          {/* Tags */}
          <Section icon={Tag} title="Tags" delay={0.14}>
            <TagInput
              tags={form.tags}
              onChange={(tags) => setField('tags', tags)}
              suggestions={tagSuggestions}
              label=""
              placeholder="Add tags…"
              maxTags={15}
            />
          </Section>

          {/* Quick SEO score */}
          <Section icon={Sparkles} title="Quick Check" delay={0.16}>
            <div className="space-y-2">
              {[
                { label: 'Title',          ok: form.title.trim().length > 0 },
                { label: 'Content',        ok: form.content.trim().length > 100 },
                { label: 'Feature image',  ok: Boolean(form.featureImage) },
                { label: 'Meta title',     ok: form.metaTitle.trim().length >= 30 && form.metaTitle.trim().length <= 60 },
                {
                  label: 'Meta desc.',
                  ok:
                    form.metaDescription.trim().length >= 120 &&
                    form.metaDescription.trim().length <= 160,
                  warning:
                    form.metaDescription.trim().length > 0 &&
                    form.metaDescription.trim().length < 120,
                },
                { label: 'Categories',     ok: form.categories.length > 0 },
                { label: 'Tags',           ok: form.tags.length > 0 },
              ].map(({ label, ok, warning }) => (
                <div key={label} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-ink-600">{label}</span>
                    <span className={`flex items-center gap-1 font-medium ${ok ? 'text-emerald-600' : warning ? 'text-amber-600' : 'text-ink-400'}`}>
                      {ok ? <CheckCircle size={12} /> : <div className="w-3 h-3 rounded-full border-2 border-ink-300" />}
                      {ok ? 'Done' : warning ? 'Too Short' : 'Missing'}
                    </span>
                  </div>
                  {label === 'Meta desc.' && (
                    <p className="text-[11px] text-ink-400">
                      {form.metaDescription.trim().length} / 160 characters
                    </p>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={() => setActiveSection('seo')}
              className="mt-4 w-full text-xs text-center text-ink-500 hover:text-ink-800
                         flex items-center justify-center gap-1 transition-colors"
            >
              Open SEO fields <ChevronRight size={12} />
            </button>
          </Section>
        </div>
      </div>
    </div>
  )
}

export default CreateBlog