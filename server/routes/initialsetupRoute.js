import express from "express";
import { checkExistAdmin, checkIfSetupComplete, signupAdmin } from "../controllers/initialsetupController.js";

const router = express.Router();

router.get("/check-setup", checkIfSetupComplete);
router.post("/signupAdmin",checkExistAdmin, signupAdmin)

export default router;