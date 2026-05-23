import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { blogAPI } from "../services/api";

// ─── Palette ──────────────────────────────────────────────────────────────────
const C = {
  bg: "#0d0f14",
  surface: "#13161e",
  card: "#1a1e2a",
  border: "#252a38",
  borderHover: "#3a4155",
  accent: "#6c63ff",
  accentDim: "#6c63ff22",
  green: "#22d3a5",
  greenDim: "#22d3a515",
  yellow: "#f5c542",
  yellowDim: "#f5c54215",
  red: "#ff5e7e",
  redDim: "#ff5e7e15",
  text: "#e8eaf0",
  textMuted: "#6b7494",
  textSub: "#9aa0bc",
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,wght@0,300;0,400;0,500;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  .eb-wrap {
    min-height: 100vh;
    background: ${C.bg};
    color: ${C.text};
    font-family: 'DM Sans', sans-serif;
    padding-bottom: 80px;
  }

  .eb-topbar {
    position: sticky; top: 0; z-index: 50;
    display: flex; align-items: center; justify-content: space-between;
    padding: 14px 32px;
    background: ${C.surface}cc;
    backdrop-filter: blur(16px);
    border-bottom: 1px solid ${C.border};
  }
  .eb-topbar-left { display: flex; align-items: center; gap: 14px; }
  .eb-logo {
    font-family: 'Syne', sans-serif; font-weight: 800; font-size: 20px;
    background: linear-gradient(135deg, ${C.accent}, ${C.green});
    -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    letter-spacing: -0.5px;
  }
  .eb-breadcrumb {
    font-size: 13px; color: ${C.textMuted};
    display: flex; align-items: center; gap: 6px;
  }
  .eb-breadcrumb span { color: ${C.textSub}; }
  .eb-back {
    background: none; border: none; color: ${C.accent}; cursor: pointer;
    font-size: 13px; font-family: 'DM Sans', sans-serif; padding: 0;
    display: flex; align-items: center; gap: 4px;
  }
  .eb-back:hover { color: #8b85ff; }

  .btn {
    display: inline-flex; align-items: center; gap: 7px;
    padding: 9px 18px; border-radius: 8px; font-size: 13px; font-weight: 500;
    cursor: pointer; border: none; transition: all .2s; font-family: 'DM Sans', sans-serif;
  }
  .btn:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost { background: transparent; color: ${C.textSub}; border: 1px solid ${C.border}; }
  .btn-ghost:hover:not(:disabled) { border-color: ${C.borderHover}; color: ${C.text}; background: ${C.card}; }
  .btn-green { background: ${C.green}; color: #0d1a16; }
  .btn-green:hover:not(:disabled) { background: #2eefbc; transform: translateY(-1px); box-shadow: 0 6px 20px ${C.green}44; }

  .eb-layout {
    display: grid; grid-template-columns: 1fr 320px; gap: 24px;
    max-width: 1300px; margin: 0 auto; padding: 28px 32px 0;
  }
  @media (max-width: 1000px) {
    .eb-layout { grid-template-columns: 1fr; }
    .eb-sidebar { order: -1; }
  }

  .section-card {
    background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px;
    overflow: hidden; margin-bottom: 20px; transition: border-color .2s;
  }
  .section-card:hover { border-color: ${C.borderHover}; }
  .section-head {
    display: flex; align-items: center; gap: 10px;
    padding: 16px 20px; border-bottom: 1px solid ${C.border};
  }
  .section-icon {
    width: 32px; height: 32px; border-radius: 8px;
    display: flex; align-items: center; justify-content: center; font-size: 15px;
  }
  .section-title {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; letter-spacing: 0.2px;
  }
  .section-body { padding: 20px; }

  .field { margin-bottom: 18px; }
  .field:last-child { margin-bottom: 0; }
  .field-label {
    display: flex; align-items: center; gap: 6px;
    font-size: 12px; font-weight: 500; color: ${C.textSub};
    margin-bottom: 7px; text-transform: uppercase; letter-spacing: 0.6px;
  }
  .field-req { color: ${C.red}; }
  .field-hint { font-size: 11px; color: ${C.textMuted}; font-weight: 400; text-transform: none; letter-spacing: 0; }

  .input, .textarea, .select {
    width: 100%; background: ${C.surface}; border: 1px solid ${C.border};
    border-radius: 8px; color: ${C.text}; font-family: 'DM Sans', sans-serif;
    font-size: 14px; transition: all .2s; outline: none;
  }
  .input { padding: 10px 14px; }
  .textarea { padding: 12px 14px; resize: vertical; line-height: 1.6; }
  .select { padding: 10px 14px; appearance: none; cursor: pointer; }
  .input:focus, .textarea:focus, .select:focus {
    border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accentDim};
  }
  .input::placeholder, .textarea::placeholder { color: ${C.textMuted}; }
  .select:disabled { opacity: 0.5; cursor: not-allowed; }

  .slug-row { display: flex; }
  .slug-prefix {
    padding: 10px 12px; background: ${C.border}22; border: 1px solid ${C.border};
    border-right: none; border-radius: 8px 0 0 8px; font-size: 13px; color: ${C.textMuted};
    white-space: nowrap; display: flex; align-items: center;
  }
  .slug-input { border-radius: 0 8px 8px 0 !important; }

  .input-wrapper { position: relative; }
  .char-count {
    position: absolute; right: 10px; top: 50%; transform: translateY(-50%);
    font-size: 11px; color: ${C.textMuted};
  }
  .char-count.warn { color: ${C.yellow}; }
  .char-count.over { color: ${C.red}; }

  .tags-wrap {
    display: flex; flex-wrap: wrap; gap: 8px; align-items: center;
    padding: 10px 12px; background: ${C.surface};
    border: 1px solid ${C.border}; border-radius: 8px; min-height: 44px;
  }
  .tags-wrap:focus-within { border-color: ${C.accent}; box-shadow: 0 0 0 3px ${C.accentDim}; }
  .tag-chip {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 4px 10px; border-radius: 20px;
    background: ${C.accentDim}; border: 1px solid ${C.accent}44;
    color: ${C.accent}; font-size: 12px; font-weight: 500;
  }
  .tag-remove {
    cursor: pointer; opacity: .7; border: none; background: none;
    color: currentColor; padding: 0; line-height: 1; transition: opacity .15s;
  }
  .tag-remove:hover { opacity: 1; }
  .tag-input {
    border: none; background: transparent; color: ${C.text};
    font-family: 'DM Sans', sans-serif; font-size: 13px;
    outline: none; flex: 1; min-width: 100px;
  }
  .tag-input::placeholder { color: ${C.textMuted}; }

  .sidebar-card {
    background: ${C.card}; border: 1px solid ${C.border}; border-radius: 14px;
    padding: 18px; margin-bottom: 16px;
  }
  .sidebar-label {
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 12px;
    text-transform: uppercase; letter-spacing: 0.8px; color: ${C.textMuted};
    margin-bottom: 14px;
  }

  .status-pill {
    display: inline-flex; align-items: center; gap: 6px;
    padding: 5px 12px; border-radius: 20px; font-size: 12px; font-weight: 500;
    border: 1px solid transparent;
  }
  .status-pill.draft             { background: ${C.yellowDim}; border-color: ${C.yellow}44; color: ${C.yellow}; }
  .status-pill.pending_review    { background: ${C.accentDim}; border-color: ${C.accent}44; color: ${C.accent}; }
  .status-pill.changes_requested { background: ${C.yellowDim}; border-color: ${C.yellow}44; color: ${C.yellow}; }
  .status-pill.published         { background: ${C.greenDim};  border-color: ${C.green}44;  color: ${C.green}; }
  .status-pill.approved          { background: ${C.greenDim};  border-color: ${C.green}44;  color: ${C.green}; }
  .status-pill.rejected          { background: ${C.redDim};    border-color: ${C.red}44;    color: ${C.red}; }
  .status-dot { width: 6px; height: 6px; border-radius: 50%; background: currentColor; }

  .rbac-notice {
    background: ${C.yellowDim}; border: 1px solid ${C.yellow}33;
    border-radius: 8px; padding: 10px 14px;
    font-size: 12px; color: ${C.yellow}; margin-bottom: 14px;
    line-height: 1.5;
  }

  .toast {
    position: fixed; bottom: 28px; left: 50%; transform: translateX(-50%);
    padding: 12px 22px; border-radius: 10px; font-size: 14px; font-weight: 500;
    z-index: 999; box-shadow: 0 8px 32px #0008;
    display: flex; align-items: center; gap: 9px; animation: toastIn .3s ease;
  }
  .toast.success { background: ${C.green}; color: #0d1a16; }
  .toast.error   { background: ${C.red};   color: #fff; }
  @keyframes toastIn {
    from { opacity: 0; transform: translateX(-50%) translateY(16px); }
    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
  }

  .eb-state {
    min-height: 60vh; display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px;
    font-family: 'DM Sans', sans-serif;
  }
  .eb-spinner {
    width: 40px; height: 40px; border-radius: 50%;
    border: 3px solid ${C.border}; border-top-color: ${C.accent};
    animation: spin .7s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const slugify = (t) =>
  t.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").trim();

// ─── Role-based status options ────────────────────────────────────────────────
// FIX: Authors can only set draft or pending_review.
// Editors can set all except — they shouldn't set draft (use changes_requested instead).
// Superadmin can set everything.
const getStatusOptions = (role, currentStatus) => {
  if (role === 'author') {
    return [
      { value: 'draft',          label: 'Draft' },
      { value: 'pending_review', label: 'Pending Review' },
    ]
  }
  if (role === 'editor') {
    return [
      { value: 'draft',             label: 'Draft' },
      { value: 'pending_review',    label: 'Pending Review' },
      { value: 'changes_requested', label: 'Changes Requested' },
      { value: 'approved',          label: 'Approved' },
      { value: 'published',         label: 'Published' },
      { value: 'rejected',          label: 'Rejected' },
    ]
  }
  // superadmin — full control
  return [
    { value: 'draft',             label: 'Draft' },
    { value: 'pending_review',    label: 'Pending Review' },
    { value: 'changes_requested', label: 'Changes Requested' },
    { value: 'approved',          label: 'Approved' },
    { value: 'published',         label: 'Published' },
    { value: 'rejected',          label: 'Rejected' },
  ]
}

// ─── CharCount ────────────────────────────────────────────────────────────────
function CharCount({ val, max }) {
  const n   = val.length
  const cls = n > max ? "over" : n > max * 0.85 ? "warn" : ""
  return <span className={`char-count ${cls}`}>{n}/{max}</span>
}

// ─── TagsInput ────────────────────────────────────────────────────────────────
function TagsInput({ tags, setTags }) {
  const [input, setInput] = useState("")
  const add = () => {
    const v = input.trim()
    if (v && !tags.includes(v)) setTags([...tags, v])
    setInput("")
  }
  const onKey = (e) => {
    if (e.key === "Enter" || e.key === ",") { e.preventDefault(); add() }
  }
  return (
    <div className="tags-wrap">
      {tags.map((t) => (
        <span className="tag-chip" key={t}>
          {t}
          <button className="tag-remove" type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>×</button>
        </span>
      ))}
      <input
        className="tag-input" value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={onKey} onBlur={add}
        placeholder={tags.length === 0 ? "react, node, mongodb…" : "Add more…"}
      />
    </div>
  )
}

// ─── SectionCard ──────────────────────────────────────────────────────────────
function SectionCard({ icon, iconBg, title, children }) {
  return (
    <div className="section-card">
      <div className="section-head">
        <div className="section-icon" style={{ background: iconBg }}>{icon}</div>
        <span className="section-title">{title}</span>
      </div>
      <div className="section-body">{children}</div>
    </div>
  )
}

// ─── EditBlog Main ────────────────────────────────────────────────────────────
export default function EditBlog() {
  const { id }      = useParams()
  const navigate    = useNavigate()
  const { role }    = useAuth()

  const [form, setForm] = useState({
    title:           "",
    slug:            "",
    content:         "",
    metaTitle:       "",
    metaDescription: "",
    canonicalUrl:    "",
    ogTitle:         "",
    ogDescription:   "",
    tags:            [],
    categories:      "",
    status:          "draft",
  })

  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [error,   setError]   = useState("")
  const [toast,   setToast]   = useState(null)

  // ── Role-based back path ───────────────────────────────────────────────────
  const backPath = role === 'superadmin' ? '/dashboard/admin/blogs'
    : role === 'editor' ? '/dashboard/editor/blogs'
    : '/dashboard/author/blogs'

  // ── Fetch blog ────────────────────────────────────────────────────────────
  const fetchBlog = useCallback(async () => {
    setLoading(true)
    setError("")
    try {
      // FIX: blogAPI.getById returns response.data already (axios interceptor unwraps)
      // so no need for .data on the result
      const blog = await blogAPI.getById(id)
      const b    = blog?.blog || blog?.data || blog

      setForm({
        title:           b.title           || "",
        slug:            b.slug            || "",
        content:         b.content         || "",
        metaTitle:       b.metaTitle       || "",
        metaDescription: b.metaDescription || "",
        canonicalUrl:    b.canonicalUrl    || "",
        ogTitle:         b.ogTitle         || "",
        ogDescription:   b.ogDescription   || "",
        tags:            Array.isArray(b.tags) ? b.tags : [],
        categories:      Array.isArray(b.categories)
          ? b.categories.join(", ")
          : (b.categories || ""),
        status: b.status || "draft",
      })
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load blog. Check the ID or your permissions.")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchBlog() }, [fetchBlog])

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleTitleChange = (v) => {
    setForm((f) => {
      const next = { ...f, title: v }
      if (!f.slug || f.slug === slugify(f.title)) next.slug = slugify(v)
      return next
    })
  }

  const showToast = (msg, type = "success") => {
    setToast({ msg, type })
    setTimeout(() => setToast(null), 2800)
  }

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) { showToast("Title is required", "error"); return }
    if (!form.content.trim()) { showToast("Content is required", "error"); return }

    setSaving(true)
    try {
      const payload = {
        title:           form.title.trim(),
        slug:            form.slug.trim()            || undefined,
        content:         form.content.trim(),
        metaTitle:       form.metaTitle.trim()       || undefined,
        metaDescription: form.metaDescription.trim() || undefined,
        canonicalUrl:    form.canonicalUrl.trim()    || undefined,
        ogTitle:         form.ogTitle.trim()         || undefined,
        ogDescription:   form.ogDescription.trim()   || undefined,
        tags:            form.tags,
        categories:      form.categories
          ? form.categories.split(",").map((c) => c.trim()).filter(Boolean)
          : [],
        status: form.status,
      }

      await blogAPI.update(id, payload)
      showToast("✅ Blog updated successfully!")
      // FIX: navigate to role-based path, not hardcoded /blogs
      setTimeout(() => navigate(backPath, { replace: true }), 1200)
    } catch (err) {
      showToast(err?.response?.data?.message || "Update failed. Try again.", "error")
    } finally {
      setSaving(false)
    }
  }

  const insertContent = (snippet) => set("content", form.content + snippet)

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <div className="eb-wrap">
          <div className="eb-state" style={{ color: C.textMuted }}>
            <div className="eb-spinner" />
            <span style={{ fontSize: 14, fontFamily: "'DM Sans', sans-serif" }}>Loading blog…</span>
          </div>
        </div>
      </>
    )
  }

  // ── Error ─────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <>
        <style>{styles}</style>
        <div className="eb-wrap">
          <div className="eb-state" style={{ color: C.textMuted }}>
            <span style={{ fontSize: 40 }}>⚠️</span>
            <p style={{ fontSize: 14, color: C.red, fontFamily: "'DM Sans', sans-serif" }}>{error}</p>
            <div style={{ display: "flex", gap: 10 }}>
              <button className="btn btn-ghost" onClick={() => navigate(backPath)}>← Back to Blogs</button>
              <button className="btn btn-green" onClick={fetchBlog}>Retry</button>
            </div>
          </div>
        </div>
      </>
    )
  }

  const statusPillClass = form.status.replace('_', '-') // css class safe

  // Author cannot edit blogs that are not draft/changes_requested
  const isReadOnly = role === 'author' && !['draft', 'changes_requested'].includes(form.status)

  const statusOptions = getStatusOptions(role, form.status)

  return (
    <>
      <style>{styles}</style>
      <div className="eb-wrap">

        {/* ── Top Bar ── */}
        <div className="eb-topbar">
          <div className="eb-topbar-left">
            <div className="eb-logo">BytePress CMS</div>
            <div className="eb-breadcrumb">
              <button className="eb-back" type="button" onClick={() => navigate(backPath)}>
                ← Blogs
              </button>
              <span>›</span>
              <span>Edit Post</span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {/* Current status pill */}
            <span className={`status-pill ${form.status}`}>
              <span className="status-dot" />
              {form.status.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}
            </span>
            <button type="button" className="btn btn-ghost" onClick={() => navigate(backPath)} disabled={saving}>
              Cancel
            </button>
            {!isReadOnly && (
              <button type="submit" form="edit-blog-form" className="btn btn-green" disabled={saving}>
                {saving ? "Saving…" : "💾 Save Changes"}
              </button>
            )}
          </div>
        </div>

        {/* Read-only warning for authors */}
        {isReadOnly && (
          <div style={{ maxWidth: 1300, margin: "16px auto 0", padding: "0 32px" }}>
            <div style={{
              background: C.yellowDim, border: `1px solid ${C.yellow}33`,
              borderRadius: 10, padding: "12px 18px",
              fontSize: 13, color: C.yellow, display: "flex", alignItems: "center", gap: 10,
            }}>
              ⚠️ This blog is currently <strong>{form.status.replace(/_/g, ' ')}</strong>.
              You cannot edit it until an editor requests changes or it is returned to draft.
            </div>
          </div>
        )}

        {/* ── Form ── */}
        <form id="edit-blog-form" className="eb-layout" onSubmit={handleSubmit}>

          {/* ─ Main ─ */}
          <div>

            {/* Basic Info */}
            <SectionCard icon="📝" iconBg="#6c63ff22" title="Basic Information">
              <div className="field">
                <label className="field-label">
                  Blog Title <span className="field-req">*</span>
                </label>
                <div className="input-wrapper">
                  <input
                    className="input" type="text" name="title" value={form.title}
                    placeholder="Enter blog title…"
                    onChange={(e) => handleTitleChange(e.target.value)}
                    disabled={isReadOnly}
                    required
                  />
                  <CharCount val={form.title} max={80} />
                </div>
              </div>

              <div className="field">
                <label className="field-label">
                  Slug <span className="field-hint">— auto-updates from title</span>
                </label>
                <div className="slug-row">
                  <span className="slug-prefix">yourdomain.com/blog/</span>
                  <input
                    className="input slug-input" type="text" name="slug" value={form.slug}
                    placeholder="your-blog-slug"
                    onChange={(e) => set("slug", slugify(e.target.value))}
                    disabled={isReadOnly}
                  />
                </div>
              </div>
            </SectionCard>

            {/* Content Editor */}
            <SectionCard icon="✏️" iconBg="#22d3a522" title="Content Editor">
              {!isReadOnly && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 2, padding: "10px 12px", background: C.surface, border: `1px solid ${C.border}`, borderBottom: "none", borderRadius: "8px 8px 0 0" }}>
                  {["H1","H2","H3"].map((h) => (
                    <button key={h} type="button"
                      style={{ padding: "5px 9px", borderRadius: 5, fontSize: 13, cursor: "pointer", border: "none", background: "transparent", color: C.textSub, fontWeight: 700, transition: "all .15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSub }}
                      onClick={() => insertContent(`\n${h === "H1" ? "#" : h === "H2" ? "##" : "###"} `)}
                    >{h}</button>
                  ))}
                  <span style={{ width: 1, background: C.border, margin: "2px 4px", alignSelf: "stretch" }} />
                  {[["B","**"],["I","_"]].map(([lbl, s]) => (
                    <button key={lbl} type="button"
                      style={{ padding: "5px 9px", borderRadius: 5, fontSize: 13, cursor: "pointer", border: "none", background: "transparent", color: C.textSub, fontWeight: lbl === "B" ? 700 : 400, fontStyle: lbl === "I" ? "italic" : "normal", transition: "all .15s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSub }}
                      onClick={() => insertContent(s + "text" + s)}
                    >{lbl}</button>
                  ))}
                  <span style={{ width: 1, background: C.border, margin: "2px 4px", alignSelf: "stretch" }} />
                  <button type="button" style={{ padding: "5px 9px", borderRadius: 5, fontSize: 13, cursor: "pointer", border: "none", background: "transparent", color: C.textSub, transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSub }}
                    onClick={() => insertContent("\n- item\n- item")}>• List</button>
                  <button type="button" style={{ padding: "5px 9px", borderRadius: 5, fontSize: 13, cursor: "pointer", border: "none", background: "transparent", color: C.textSub, transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSub }}
                    onClick={() => insertContent("\n> Blockquote")}>❝</button>
                  <button type="button" style={{ padding: "5px 9px", borderRadius: 5, fontSize: 13, cursor: "pointer", border: "none", background: "transparent", color: C.textSub, transition: "all .15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = C.accentDim; e.currentTarget.style.color = C.accent }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = C.textSub }}
                    onClick={() => insertContent("\n```\ncode\n```")}>{"</>"}</button>
                </div>
              )}
              <textarea
                className="textarea" name="content" value={form.content}
                style={{ borderRadius: isReadOnly ? "8px" : "0 0 8px 8px", minHeight: 280, fontSize: 15, lineHeight: 1.8 }}
                placeholder="Write your blog content in Markdown…"
                onChange={handleChange}
                disabled={isReadOnly}
                required
              />
            </SectionCard>

            {/* SEO Fields */}
            <SectionCard icon="🔍" iconBg="#ff5e7e22" title="SEO & Meta">
              <div className="field">
                <label className="field-label">Meta Title <span className="field-hint">— 50–60 chars ideal</span></label>
                <div className="input-wrapper">
                  <input className="input" type="text" name="metaTitle" value={form.metaTitle}
                    placeholder="Google search result title" onChange={handleChange} disabled={isReadOnly} />
                  <CharCount val={form.metaTitle} max={60} />
                </div>
              </div>
              <div className="field">
                <label className="field-label">Meta Description <span className="field-hint">— 140–160 chars ideal</span></label>
                <div style={{ position: "relative" }}>
                  <textarea className="textarea" name="metaDescription" value={form.metaDescription}
                    style={{ minHeight: 80 }} placeholder="Shown in search results…" onChange={handleChange} disabled={isReadOnly} />
                  <span style={{ position: "absolute", right: 10, bottom: 10, fontSize: 11, color: form.metaDescription.length > 160 ? C.red : form.metaDescription.length > 136 ? C.yellow : C.textMuted }}>
                    {form.metaDescription.length}/160
                  </span>
                </div>
              </div>
              <div className="field">
                <label className="field-label">Canonical URL</label>
                <input className="input" type="text" name="canonicalUrl" value={form.canonicalUrl}
                  placeholder="https://yourdomain.com/blog/slug" onChange={handleChange} disabled={isReadOnly} />
              </div>
              <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 16, marginTop: 4 }}>
                <div className="field">
                  <label className="field-label">OG Title</label>
                  <input className="input" type="text" name="ogTitle" value={form.ogTitle}
                    placeholder="Open Graph title for social sharing" onChange={handleChange} disabled={isReadOnly} />
                </div>
                <div className="field" style={{ marginBottom: 0 }}>
                  <label className="field-label">OG Description</label>
                  <textarea className="textarea" name="ogDescription" value={form.ogDescription}
                    style={{ minHeight: 72 }} placeholder="Description for social previews…" onChange={handleChange} disabled={isReadOnly} />
                </div>
              </div>
            </SectionCard>
          </div>

          {/* ─ Sidebar ─ */}
          <div className="eb-sidebar">

            {/* Status & Publish */}
            <div className="sidebar-card">
              <div className="sidebar-label">📋 Status & Publish</div>

              {/* Role info notice */}
              {role === 'author' && (
                <div className="rbac-notice">
                  As an author, you can only set status to <strong>Draft</strong> or submit for <strong>Pending Review</strong>.
                </div>
              )}

              <div className="field">
                <label className="field-label">Status</label>
                {/* FIX: Show only role-allowed status options */}
                <select
                  className="select"
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  disabled={isReadOnly}
                >
                  {statusOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {!isReadOnly && (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 14 }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    style={{ width: "100%", justifyContent: "center" }}
                    onClick={() => navigate(backPath)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    form="edit-blog-form"
                    className="btn btn-green"
                    style={{ width: "100%", justifyContent: "center" }}
                    disabled={saving}
                  >
                    {saving ? "Saving…" : "💾 Save Changes"}
                  </button>
                </div>
              )}
            </div>

            {/* Tags & Categories */}
            <div className="sidebar-card">
              <div className="sidebar-label">🏷️ Categorization</div>
              <div className="field">
                <label className="field-label">Tags <span className="field-hint">— Enter or comma</span></label>
                <TagsInput
                  tags={form.tags}
                  setTags={(v) => !isReadOnly && set("tags", v)}
                />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label">Categories <span className="field-hint">— comma separated</span></label>
                <input className="input" type="text" name="categories" value={form.categories}
                  placeholder="web development, tutorial" onChange={handleChange} disabled={isReadOnly} />
              </div>
            </div>

            {/* Google Preview */}
            <div className="sidebar-card">
              <div className="sidebar-label">🔍 Google Preview</div>
              <div style={{ background: C.surface, borderRadius: 8, padding: 14, border: `1px solid ${C.border}` }}>
                <div style={{ fontSize: 11, color: C.textMuted, marginBottom: 4 }}>
                  {form.canonicalUrl || `yourdomain.com › blog › ${form.slug || "post-slug"}`}
                </div>
                <div style={{ fontSize: 15, color: "#4d90fe", marginBottom: 4, fontWeight: 500 }}>
                  {form.metaTitle || form.title || "Your Blog Title"}
                </div>
                <div style={{ fontSize: 13, color: C.textSub, lineHeight: 1.5 }}>
                  {form.metaDescription
                    ? form.metaDescription.slice(0, 155) + (form.metaDescription.length > 155 ? "…" : "")
                    : "Your meta description will appear here…"}
                </div>
              </div>
            </div>

            {/* Debug Info */}
            <div className="sidebar-card">
              <div className="sidebar-label">🔧 Info</div>
              <div style={{ fontSize: 11, color: C.textMuted, lineHeight: 1.8, fontFamily: "monospace" }}>
                <div>ID: <span style={{ color: C.textSub }}>{id}</span></div>
                <div>Role: <span style={{ color: C.textSub }}>{role}</span></div>
                <div>PUT: <span style={{ color: C.textSub }}>/api/blogs/{id}</span></div>
              </div>
            </div>
          </div>
        </form>

        {/* Toast */}
        {toast && <div className={`toast ${toast.type}`}>{toast.msg}</div>}
      </div>
    </>
  )
}