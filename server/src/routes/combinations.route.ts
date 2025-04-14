import express, { Router, RequestHandler } from "express";
import combinationsController from "../controllers/combinations.controller";

const router: Router = express.Router();

router.post(
  "/getCombinations",
  combinationsController.getCombinations as RequestHandler
);
router.post(
  "/addCombination",
  combinationsController.addCombination as RequestHandler
);
router.post(
  "/deleteCombination",
  combinationsController.deleteCombination as RequestHandler
);
router.post(
  "/updateCombination",
  combinationsController.updateCombination as RequestHandler
);
router.post(
  "/triggerCombination",
  combinationsController.triggerCombination as RequestHandler
);

export default router;
