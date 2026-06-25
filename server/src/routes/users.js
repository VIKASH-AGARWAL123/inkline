import express from "express";
import {
  getUser,
  getUserPosts,
  toggleFollow,
  searchUsers,
  updateProfile,
  getSuggestions,
} from "../controllers/userController.js";
import { protect } from "../middleware/auth.js";
import { uploadAvatar } from "../middleware/uploadAvatar.js";

const router = express.Router();

// Static routes first — must be above /:id
router.get("/search", searchUsers);
router.get("/suggestions", protect, getSuggestions);
router.put(
  "/me/profile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile,
);

// Dynamic :id routes
router.get("/:id", getUser);
router.get("/:id/posts", getUserPosts);
router.post("/:id/follow", protect, toggleFollow);

export default router;
