import express from "express";
import {
    followUser,
    getCurrentUser,
  getuserProfile,
  syncUser,
  updateProfile,
} from "../controller/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile/:username", getuserProfile);

router.put("/profile", protectRoute, updateProfile);
router.post("/sync", protectRoute, syncUser);
router.post("/me", protectRoute, getCurrentUser)
router.post("/follow/:targetUserId", protectRoute, followUser)
export default router;
