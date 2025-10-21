import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
  createComment,
  deleteComment,
  getComments,
} from "../controller/comment.controller.js";

const router = express.Router();

router.get("/post/:postId", getComments);

router.post("/post/:postId", protectRoute, createComment);
router.post(":commentId", protectRoute, deleteComment);

export default router;
