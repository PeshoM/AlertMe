import express, { Router } from "express";
import combinationsController from "../controllers/combinations.controller";

const router: Router = express.Router();

router.post("/getCombinations", combinationsController.getCombinations);
router.post("/addCombination", combinationsController.addCombination);
router.post("/deleteCombination", combinationsController.deleteCombination);

export default router;
