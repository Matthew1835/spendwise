import { Router } from "express";
import prisma from "../prismaClient.js";
import { requireLogin } from "../middleware/auth.js";
import * as transactionController from "../controllers/transactionController.js";
import { createTransactionValidator } from "../validators/transactionValidators.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

router.use(requireLogin);

router.get("/", transactionController.listTransactions);

router.post("/",
    createTransactionValidator,
    handleValidationErrors("transactions", async (req) => ({
        transactions: await prisma.transaction.findMany({
            where: { userId: req.session.id },
            include: { category: true },
            orderBy: { transactionDate: "desc" },
        }),
        categories: await prisma.category.findMany(),
        filters: {},
    })),
    transactionController.createTransaction,
);

router.post("/:id/delete", transactionController.deleteTransaction);

export default router;