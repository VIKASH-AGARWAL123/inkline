import Post from '../models/Post.js'

export async function getPosts(req, res) {
  try {
    const posts = await Post.find().sort({ createdAt: -1 }).populate('author', 'name username')
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: 'Could not load posts.', error: err.message })
  }
}

export async function createPost(req, res) {
  try {
    const { title, content } = req.body
    if (!title || !content) {
      return res.status(400).json({ message: 'Title and content are required.' })
    }

    const post = await Post.create({ title, content, author: req.user._id })
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
