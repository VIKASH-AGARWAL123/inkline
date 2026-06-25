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

router.get("/search", searchUsers);
router.put(
  "/me/profile",
  protect,
  uploadAvatar.single("avatar"),
  updateProfile,
);
router.get("/:id", getUser);
router.get("/:id/posts", getUserPosts);
router.post("/:id/follow", protect, toggleFollow);

export default router;
