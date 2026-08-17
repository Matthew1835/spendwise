import { Router } from "express";
import { requireLogin } from "../middleware/auth.js";
import * as savingsController from "../controllers/savingsController.js";
import { createGoalValidator, updateGoalValidator, addContributionValidator } from "../validators/savingsValidator.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

router.use(requireLogin);

router.get("/", savingsController.listGoals);

router.post("/",
    createGoalValidator,
    handleValidationErrors("savings", savingsController.loadSavingsPageData),
    savingsController.createGoal,
);

router.post("/:id/edit", 
    updateGoalValidator,
    handleValidationErrors("savings", savingsController.loadSavingsPageData),
    savingsController.updateGoal,
)

router.post("/:id/contributions",
    addContributionValidator,
    handleValidationErrors("savings", savingsController.loadSavingsPageData),
    savingsController.addContribution,
);

router.post("/:id/delete", savingsController.deleteGoal);

export default router;