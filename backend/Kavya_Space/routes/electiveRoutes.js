import express from "express";
import { createElective, getAllElectives } from "../controllers/electiveController.js";

const router = express.Router();

router.post("/", createElective);
router.get("/", getAllElectives);

export default router;
