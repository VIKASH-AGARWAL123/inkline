import express from "express";
import {
  getUser,
  getUserPosts,
  toggleFollow,
  searchUsers,
  updateProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/uploadAvatar.js";

const router = express.Router();

// ⚠️ Static routes MUST come before /:id routes
router.get("/search", searchUsers);
router.put(
  "/me/profile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile,
);

// Dynamic :id routes below
router.get("/:id", getUser);
router.get("/:id/posts", getUserPosts);
router.post("/:id/follow", protect, toggleFollow);

export default router;
