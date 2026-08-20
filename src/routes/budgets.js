import { Router } from "express";
import { requireLogin, blockAdmin } from "../middleware/auth.js";
import * as budgetController from "../controllers/budgetController.js";
import { createBudgetValidator, updateBudgetValidator } from "../validators/budgetValidators.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

router.use(requireLogin, blockAdmin);

router.get("/", budgetController.listBudgets);

router.post("/",
    createBudgetValidator,
    handleValidationErrors("budget", budgetController.loadBudgetsPageData),
    budgetController.createBudget,
);

router.post("/:id/edit",
    updateBudgetValidator,
    handleValidationErrors("budgets", budgetController.loadBudgetsPageData),
    budgetController.updateBudget,
);

router.post("/:id/delete", budgetController.deleteBudget);

export default router;