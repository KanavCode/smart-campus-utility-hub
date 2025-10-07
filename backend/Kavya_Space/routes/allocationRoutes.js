import express from "express";
import { allocateElectives } from "../controllers/allocationController.js";

const router = express.Router();

// Admin triggers allocation
router.post("/allocate", allocateElectives);

export default router;
