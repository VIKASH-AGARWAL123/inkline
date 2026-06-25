import User from "../models/User.js";
import Post from "../models/Post.js";
import Notification from "../models/Notification.js";

export async function getUser(req, res) {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found." });
    res.json(user);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not load profile.", error: err.message });
  }
}

export async function getUserPosts(req, res) {
  try {
    const posts = await Post.find({ author: req.params.id })
      .sort({ createdAt: -1 })
      .populate("author", "name username avatar");
    res.json(posts);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not load posts.", error: err.message });
  }
}

export async function searchUsers(req, res) {
  try {
    const q = (req.query.q || "").trim();
    if (!q) return res.json([]);
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ],
    })
      .select("-password")
      .limit(20);
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed.", error: err.message });
  }
}

export async function toggleFollow(req, res) {
  try {
    if (req.params.id === req.user._id.toString())
      return res.status(400).json({ message: "You cannot follow yourself." });

    const targetUser = await User.findById(req.params.id);
    if (!targetUser)
      return res.status(404).json({ message: "User not found." });

    const currentUser = req.user;
    const isFollowing = currentUser.following.some(
      (id) => id.toString() === targetUser._id.toString(),
    );

    if (isFollowing) {
      currentUser.following = currentUser.following.filter(
        (id) => id.toString() !== targetUser._id.toString(),
      );
      targetUser.followers = targetUser.followers.filter(
        (id) => id.toString() !== currentUser._id.toString(),
      );
    } else {
      currentUser.following.push(targetUser._id);
      targetUser.followers.push(currentUser._id);
      // notify on follow
      try {
        const notif = await Notification.create({
          recipient: targetUser._id,
          sender: currentUser._id,
          type: "follow",
        });
        await notif.populate("sender", "name username avatar");
        if (req.io)
          req.io.to(`user:${targetUser._id}`).emit("new_notification", notif);
      } catch (_) {}
    }

    await currentUser.save();
    await targetUser.save();
    res.json(targetUser.toSafeObject());
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update follow status.", error: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { name, bio, username } = req.body;

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio.trim();

    // Check username uniqueness if changing
    if (username && username !== user.username) {
      const taken = await User.findOne({ username: username.toLowerCase() });
      if (taken)
        return res.status(400).json({ message: "Username is already taken." });
      user.username = username.toLowerCase().trim();
    }

    if (req.file) {
      user.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    await user.save();
    res.json(user.toSafeObject());
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not update profile.", error: err.message });
  }
}

export async function getSuggestions(req, res) {
  try {
    const me = await User.findById(req.user._id).select("following");
    const exclude = [...(me.following || []), req.user._id];

    const suggestions = await User.find({ _id: { $nin: exclude } })
      .select("name username avatar bio followers")
      .limit(6)
      .sort({ createdAt: -1 });

    res.json(suggestions);
  } catch (err) {
    res
      .status(500)
      .json({ message: "Could not load suggestions.", error: err.message });
  }
}
