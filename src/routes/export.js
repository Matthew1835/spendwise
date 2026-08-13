import { Router } from "express";
import { requireLogin } from "../middleware/auth.js";
import * as exportController from "../controllers/exportController.js";

const router = Router();

router.use(requireLogin);

router.get("/transactions", exportController.exportTransactions);
router.get("/summary", exportController.exportMonthlySummary);

export default router;