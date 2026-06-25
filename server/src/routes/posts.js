import express from "express";
import {
  getPosts,
  createPost,
  getPost,
  updatePost,
  deletePost,
  toggleLike,
  toggleBookmark,
  getBookmarks,
  addComment,
  searchPosts,
} from "../controllers/postController.js";
import { protect } from "../middleware/auth.js";
import { upload } from "../middleware/upload.js";

const router = express.Router();

router.get("/", getPosts);
router.post("/", protect, upload.single("image"), createPost);
router.get("/search", searchPosts);
router.get("/bookmarks", protect, getBookmarks);
router.get("/:id", getPost);
router.put("/:id", protect, upload.single("image"), updatePost);
router.delete("/:id", protect, deletePost);
router.post("/:id/like", protect, toggleLike);
router.post("/:id/bookmark", protect, toggleBookmark);
router.post("/:id/comments", protect, addComment);

export default router;
