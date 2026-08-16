import { Router } from "express";
import { requireLogin } from "../middleware/auth.js"
import { showDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.use(requireLogin);
router.get("/", showDashboard);

export default router;