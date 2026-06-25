import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

// helper — fire-and-forget notification
async function createNotification(io, { recipient, sender, type, post }) {
  if (String(recipient) === String(sender)) return; // don't notify yourself
  try {
    const notif = await Notification.create({
      recipient,
      sender,
      type,
      post: post || null,
    });
    await notif.populate("sender", "name username avatar");
    await notif.populate("post", "title");
    if (io) io.to(`user:${recipient}`).emit("new_notification", notif);
  } catch (_) {}
}

export async function getPosts(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;
    const filter = {};
    if (req.query.topic && req.query.topic !== "all")
      filter.topic = req.query.topic;

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("author", "name username avatar"),
      Post.countDocuments(filter),
    ]);
    res.json({ posts, page, hasMore: skip + posts.length < total });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not load posts.", error: err.message });
  }
}

export async function searchPosts(req, res) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);
    const posts = await Post.find({
      $or: [
        { title: { $regex: q, $options: "i" } },
        { content: { $regex: q, $options: "i" } },
      ],
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("author", "name username avatar");
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: "Search failed.", error: err.message });
  }
}

export async function createPost(req, res) {
  try {
    const { title, content, topic } = req.body;
    if (!title || !content)
      return res
        .status(400)
        .json({ message: "Title and content are required." });
    const image = req.file ? `/uploads/${req.file.filename}` : null;
    const post = await Post.create({
      title,
      content,
      image,
      topic: topic || "general",
      author: req.user._id,
    });
    await post.populate("author", "name username avatar");
    res.status(201).json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not publish your post.", error: err.message });
  }
}

export async function getPost(req, res) {
  try {
    const post = await Post.findById(req.params.id)
      .populate("author", "name username avatar")
      .populate("comments.author", "name username avatar");
    if (!post) return res.status(404).json({ message: "Post not found." });
    res.json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not load post.", error: err.message });
  }
}

export async function updatePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.author) !== String(req.user._id))
      return res.status(403).json({ message: "Not allowed." });

    const { title, content, topic } = req.body;
    if (title) post.title = title;
    if (content) post.content = content;
    if (topic) post.topic = topic;
    if (req.file) post.image = `/uploads/${req.file.filename}`;

    await post.save();
    await post.populate("author", "name username avatar");
    res.json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update post.", error: err.message });
  }
}

export async function deletePost(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    if (String(post.author) !== String(req.user._id))
      return res.status(403).json({ message: "Not allowed." });
    await post.deleteOne();
    res.json({ message: "Post deleted." });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not delete post.", error: err.message });
  }
}

export async function toggleLike(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const userId = req.user._id.toString();
    const hasLiked = post.likes.some((id) => id.toString() === userId);
    post.likes = hasLiked
      ? post.likes.filter((id) => id.toString() !== userId)
      : [...post.likes, req.user._id];
    await post.save();
    await post.populate("author", "name username avatar");
    await post.populate("comments.author", "name username avatar");

    // notify on like (not on unlike)
    if (!hasLiked) {
      createNotification(req.io, {
        recipient: post.author._id,
        sender: req.user._id,
        type: "like",
        post: post._id,
      });
    }
    res.json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update like.", error: err.message });
  }
}

export async function toggleBookmark(req, res) {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    const userId = req.user._id.toString();
    const hasBookmarked = post.bookmarks.some((id) => id.toString() === userId);
    post.bookmarks = hasBookmarked
      ? post.bookmarks.filter((id) => id.toString() !== userId)
      : [...post.bookmarks, req.user._id];
    await post.save();
    res.json({ bookmarked: !hasBookmarked, count: post.bookmarks.length });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update bookmark.", error: err.message });
  }
}

export async function getBookmarks(req, res) {
  try {
    const posts = await Post.find({ bookmarks: req.user._id })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatar");
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not load bookmarks.", error: err.message });
  }
}

export async function addComment(req, res) {
  try {
    const { text } = req.body;
    if (!text?.trim())
      return res.status(400).json({ message: "Comment cannot be empty." });
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found." });
    post.comments.push({ text, author: req.user._id });
    await post.save();
    await post.populate("author", "name username avatar");
    await post.populate("comments.author", "name username avatar");

    createNotification(req.io, {
      recipient: post.author._id,
      sender: req.user._id,
      type: "comment",
      post: post._id,
    });
    res.status(201).json(post);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not add comment.", error: err.message });
  }
}
