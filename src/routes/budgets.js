import { Router } from "express";
import prisma from "../prismaClient.js";
import { requireLogin } from "../middleware/auth.js";
import * as budgetController from "../controllers/budgetController.js";
import { createBudgetValidator } from "../validators/budgetValidators.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

router.use(requireLogin);

router.get("/", budgetController.listBudgets);

router.post("/",
    createBudgetValidator,
    handleValidationErrors("budget", async (req) => ({
        budgets: await prisma.budget.findMany({
            where: { userId: req.session.user.id },
            include: { category: true },
            orderBy: { startDate: "desc" },
        }),
        categories: await prisma.category.findMany({ where: { categoryType: "expense" } }),
    })),
    budgetController.createBudget,
);

router.post("/:id/delete", budgetController.deleteBudget);

export default router;