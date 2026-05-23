const Category = require('../models/Category')
const Blog = require('../models/Blog')

 
const attachUsageCounts = async (categories) => {
  const names = categories.map((c) => c.name)

 
  const usageCounts = await Blog.aggregate([
    { $unwind: '$categories' },
    {
      $group: {
        _id: { $toLower: '$categories' },
        count: { $sum: 1 },
      },
    },
  ])

  const countMap = {}
  usageCounts.forEach(({ _id, count }) => {
    countMap[_id] = count
  })

  return categories.map((cat) => ({
    ...cat.toObject(),
    blogCount: countMap[cat.name.toLowerCase()] || 0,
  }))
}

// ─────────────────────────────────────────────────────────────────────────────
// GET /api/categories
// ─────────────────────────────────────────────────────────────────────────────
const getCategories = async (req, res) => {
  try {
    const { search } = req.query

    const query = {}
    if (search && search.trim()) {
      query.name = { $regex: search.trim(), $options: 'i' }
    }

    const categories = await Category.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })

    const withCounts = await attachUsageCounts(categories)

    res.status(200).json({
      success: true,
      categories: withCounts,
      total: withCounts.length,
    })
  } catch (error) {
    console.error('getCategories error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// POST /api/categories
// ─────────────────────────────────────────────────────────────────────────────
const createCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required.' })
    }

    // Check duplicate (case-insensitive)
    const existing = await Category.findOne({
      name: { $regex: `^${name.trim()}$`, $options: 'i' },
    })
    if (existing) {
      return res.status(409).json({ success: false, message: 'Category already exists.' })
    }

    const category = await Category.create({
      name: name.trim(),
      description: description?.trim() || null,
      color: color || '#f97316',
      createdBy: req.user._id,
    })

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: { ...category.toObject(), blogCount: 0 },
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category already exists.' })
    }
    console.error('createCategory error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PUT /api/categories/:id
// ─────────────────────────────────────────────────────────────────────────────
const updateCategory = async (req, res) => {
  try {
    const { name, description, color } = req.body

    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' })
    }

    // Check duplicate name (excluding this category)
    if (name && name.trim() !== category.name) {
      const existing = await Category.findOne({
        name: { $regex: `^${name.trim()}$`, $options: 'i' },
        _id: { $ne: req.params.id },
      })
      if (existing) {
        return res.status(409).json({ success: false, message: 'Category name already exists.' })
      }
    }

    if (name) {
      category.name = name.trim()
      // Regenerate slug
      category.slug = name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
    }
    if (description !== undefined) category.description = description?.trim() || null
    if (color) category.color = color

    await category.save()

    const [withCount] = await attachUsageCounts([category])

    res.status(200).json({
      success: true,
      message: 'Category updated successfully.',
      category: withCount,
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ success: false, message: 'Category name already exists.' })
    }
    console.error('updateCategory error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// DELETE /api/categories/:id
// ─────────────────────────────────────────────────────────────────────────────
const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
    if (!category) {
      return res.status(404).json({ success: false, message: 'Category not found.' })
    }

    // Check if any blogs use this category
    const blogCount = await Blog.countDocuments({
      categories: { $regex: `^${category.name}$`, $options: 'i' },
    })

    if (blogCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete — ${blogCount} blog${blogCount !== 1 ? 's' : ''} use this category.`,
      })
    }

    await category.deleteOne()

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully.',
    })
  } catch (error) {
    console.error('deleteCategory error:', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
}