import { Router } from "express";
import { requireLogin, blockAdmin } from "../middleware/auth.js"
import { showDashboard } from "../controllers/dashboardController.js";

const router = Router();

router.use(requireLogin, blockAdmin);
router.get("/", showDashboard);

export default router;