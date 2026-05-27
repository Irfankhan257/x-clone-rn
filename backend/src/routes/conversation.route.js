import express from "express";
import { fetchConversationsForUser } from "../controller/conversation.controller.js";

const router = express.Router();


router.get("/getConvo", fetchConversationsForUser);


export default router;