import express from "express";
import { getusers, signin, signout, signup } from "../controllers/authController.js";
import {isAdmin} from '../utils/authMiddleware.js';

const router = express.Router();

router.post("/signup", isAdmin, signup);
router.post("/signin", signin);
router.post("/signout", signout);

export default router;