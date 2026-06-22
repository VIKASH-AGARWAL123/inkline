import Post from '../models/Post.js'

export async function getPosts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1)
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50)
    const skip = (page - 1) * limit

    const [posts, total] = await Promise.all([
      Post.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('author', 'name username'),
      Post.countDocuments(),
    ])

    res.json({ posts, page, hasMore: skip + posts.length < total })
  } catch (err) {
    res.status(500).json({ message: 'Could not load posts.', error: err.message })
  }
}

export async function searchPosts(req, res) {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return res.json([])

    const posts = await Post.find({
      $or: [{ title: { $regex: q, $options: 'i' } }, { content: { $regex: q, $options: 'i' } }],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('author', 'name username')

    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: 'Search failed.', error: err.message })
  }
}

export async function createPost(req, res) {
  try {
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' })
    }

    const image = req.file ? `/uploads/${req.file.filename}` : null
    const post = await Post.create({ title, content, image, author: req.user._id })
    await post.populate('author', 'name username')

    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Could not publish your post.', error: err.message })
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id)
      .populate('author', 'name username')
      .populate('comments.author', 'name username')

    if (!post) return res.status(404).json({ message: 'Post not found.' })
    res.json(post)
  } catch (err) {
    res.status(500).json({ message: 'Could not load post.', error: err.message })
  }
}

export async function toggleLike(req, res) {
  try {
    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    const userId = req.user._id.toString()
    const hasLiked = post.likes.some((id) => id.toString() === userId)

    post.likes = hasLiked
      ? post.likes.filter((id) => id.toString() !== userId)
      : [...post.likes, req.user._id]

    await post.save()
    await post.populate('author', 'name username')
    await post.populate('comments.author', 'name username')

    res.json(post)
  } catch (err) {
    res.status(500).json({ message: 'Could not update like.', error: err.message })
  }
}

export async function addComment(req, res) {
  try {
    const { text } = req.body
    if (!text?.trim()) {
      return res.status(400).json({ message: 'Comment cannot be empty.' })
    }

    const post = await Post.findById(req.params.id)
    if (!post) return res.status(404).json({ message: 'Post not found.' })

    post.comments.push({ text, author: req.user._id })
    await post.save()
    await post.populate('author', 'name username')
    await post.populate('comments.author', 'name username')

    res.status(201).json(post)
  } catch (err) {
    res.status(500).json({ message: 'Could not add comment.', error: err.message })
  }
}
