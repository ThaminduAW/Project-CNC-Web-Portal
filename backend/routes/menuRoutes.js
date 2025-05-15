import express from "express";
import { getPartnerMenu, addMenuItem, editMenuItem, deleteMenuItem } from "../controllers/menuController.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authMiddleware, getPartnerMenu); // ?tour=TOUR_ID
router.post("/", authMiddleware, addMenuItem);
router.put("/:id", authMiddleware, editMenuItem);
router.delete("/:id", authMiddleware, deleteMenuItem);

export default router; 