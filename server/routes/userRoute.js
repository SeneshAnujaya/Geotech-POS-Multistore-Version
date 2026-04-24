import express from "express";
import { deleteuser, getusers, updateUser, updateUserAccount } from "../controllers/userController.js";
import {isAdmin} from '../utils/authMiddleware.js';

const router = express.Router();


router.get("/getusers", getusers);
router.delete("/deleteuser/:id", isAdmin, deleteuser);
router.put("/updateuser/:id", isAdmin,  updateUser);
router.post("/updateUserAccount", updateUserAccount)


export default router;