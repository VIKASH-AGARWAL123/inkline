import User from '../models/User.js'
import Post from '../models/Post.js'

export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: 'Could not load profile.', error: err.message })
  }
}

export async function getUserPosts(req, res) {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate('author', 'name username')
    res.json(posts)
  } catch (err) {
    res.status(500).json({ message: 'Could not load posts.', error: err.message })
  }
}

export async function searchUsers(req, res) {
  try {
    const q = (req.query.q || '').trim()
    if (!q) return res.json([])

    const users = await User.find({
      $or: [{ name: { $regex: q, $options: 'i' } }, { username: { $regex: q, $options: 'i' } }],
    })
      .select('-password')
      .limit(20)

    res.json(users)
  } catch (err) {
    res.status(500).json({ message: 'Search failed.', error: err.message })
  }
}

export async function toggleFollow(req, res) {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot follow yourself.' })
    }

    const targetUser = await User.findById(req.params.id)
    if (!targetUser) return res.status(404).json({ message: 'User not found.' })

    const currentUser = req.user
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString()
    )

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUser._id.toString()
      )
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser._id.toString()
      )
    } else {
      currentUser.following.push(targetUser._id)
      targetUser.followers.push(currentUser._id)
    }

    await currentUser.save()
    await targetUser.save()

    res.json(targetUser.toSafeObject())
  } catch (err) {
    res.status(500).json({ message: 'Could not update follow status.', error: err.message })
  }
}
