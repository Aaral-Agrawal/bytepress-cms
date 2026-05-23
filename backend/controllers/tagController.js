const Tag = require('../models/Tag')
const Blog = require('../models/Blog')

// ─── Helper: attach usage count ───────────────────────────────────────────────
const attachUsageCounts = async (tags) => {
  const usageCounts = await Blog.aggregate([
    { $unwind: '$tags' },
    {
      $group: {
        _id: { $toLower: '$tags' },
        count: { $sum: 1 },
      },
    },
  ])

  const countMap = {}
  usageCounts.forEach(({ _id, count }) => {
    countMap[_id] = count
  })

  return tags.map((tag) => ({
    ...tag.toObject(),
    blogCount: countMap[tag.name.toLowerCase()] || 0,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/tags
// ─────────────────────────────────────────────────────────────────────────────
const getTags = async (req, res) => {
  try {
    const { search } = req.query

    const query = {}
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' }
    }

    const tags = await Tag.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    const withCounts = await attachUsageCounts(tags)

    res.status(200).json({
      success: true,
      tags: withCounts,
      total: withCounts.length,
    })
  } catch (error) {
    console.error('getTags error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/tags
// ─────────────────────────────────────────────────────────────────────────────
const createTag = async (req, res) => {
  try {
    const { name, description, color } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tag name is required.' })
    }

    // Check duplicate (case-insensitive)
    const existing = await Tag.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Tag already exists.' })
    }

    const tag = await Tag.create({
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#6366f1',
      createdBy: req.user._id,
    })

    res.status(201).json({
      success: true,
      message: 'Tag created successfully.',
      tag: { ...tag.toObject(), blogCount: 0 },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Tag already exists.' })
    }
    console.error('createTag error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/tags/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateTag = async (req, res) => {
  try {
    const { name, description, color } = req.body

    const tag = await Tag.findById(req.params.id)
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found.' })
    }

    // Check duplicate name (excluding this tag)
    if (name && name.trim() !== tag.name) {
      const existing = await Tag.findOne({
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: req.params.id },
      })
      if (existing) {
        return res.status(409).json({ success: false, message: 'Tag name already exists.' })
      }
    }

    if (name) {
      tag.name = name.trim()
      tag.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    }
    if (description !== undefined) tag.description = description?.trim() || null
    if (color) tag.color = color

    await tag.save()

    const [withCount] = await attachUsageCounts([tag])

    res.status(200).json({
      success: true,
      message: 'Tag updated successfully.',
      tag: withCount,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Tag name already exists.' })
    }
    console.error('updateTag error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/tags/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id)
    if (!tag) {
      return res.status(404).json({ success: false, message: 'Tag not found.' })
    }

    // Check if any blogs use this tag
    const blogCount = await Blog.countDocuments({
      tags: { $regex: `^${tag.name}$`, $options: 'i' },
    })

    if (blogCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${blogCount} blog${blogCount !== 1 ? 's' : ''} use this tag.`,
      })
    }

    await tag.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Tag deleted successfully.',
    })
  } catch (error) {
    console.error('deleteTag error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  getTags,
  createTag,
  updateTag,
  deleteTag,
}