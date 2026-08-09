import { Router } from "express";
import prisma from "../prismaClient.js";
import { requireLogin } from "../middleware/auth.js";
import * as savingsController from "../controllers/savingsController.js";
import { createGoalValidator, addContributionValidator } from "../validators/savingsValidator.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

router.use(requireLogin);

router.get("/", savingsController.listGoals);

router.post("/",
    createGoalValidator,
    handleValidationErrors("savings", async (req) => ({
        goals: await prisma.savingsGoal.findMany({
            where: { userId: req.session.user.id },
            orderBy: [{ isCompleted: "asc" }, { deadline: "asc" }],
        }),
    })),
    savingsController.createGoal,
);

router.post("/:id/contributions",
    addContributionValidator,
    handleValidationErrors("savings", async (req) => ({
        goals: await prisma.savingsGoal.findMany({
            where: { userId: req.session.user.id },
            orderBy: [{ isCompleted: "asc" }, { deadline: "asc" }],
        }),
    })),
    savingsController.addContribution,
);

router.post("/:id/delete", savingsController.deleteGoal);

export default router;