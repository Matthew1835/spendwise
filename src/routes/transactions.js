import { Router } from "express";
import { requireLogin } from "../middleware/auth.js";
import * as transactionController from "../controllers/transactionController.js";
import { createTransactionValidator, updateTransactionValidator } from "../validators/transactionValidators.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

router.use(requireLogin);

router.get("/", transactionController.listTransactions);

router.post("/",
    createTransactionValidator,
    handleValidationErrors("transactions", transactionController.loadTransactionsPageData),
    transactionController.createTransaction,
);

router.post("/:id/edit",
    updateTransactionValidator,
    handleValidationErrors("transactions", transactionController.loadTransactionsPageData),
    transactionController.updateTransaction,
)

router.post("/:id/delete", transactionController.deleteTransaction);

export default router;