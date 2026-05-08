import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { queryChatbot } from "../controllers/chatbot.controller.js";

const router = express.Router();

router.post("/query", protectRoute, queryChatbot);

export default router;
