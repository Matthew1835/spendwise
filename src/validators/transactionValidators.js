import { body } from "express-validator";

const createTransactionValidator = [
    body("amount")
        .isFloat({ gt: 0 }).withMessage("Amount must be a positive number"),

    body("description")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage("Description is too long"),

    body("transaction_date")
        .isISO8601().withMessage("Enter a valid date")
        .toDate(),

    body("transaction_type")
        .isIn(["income", "expense"]).withMessage("Type must be income or expense"),

    body("category_id")
        .optional({ checkFalsy: true })
        .isInt({ min: 1 }).withMessage("Invalid category"),

    body("payment_method")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage("Payment method is too long"),

    body("notes")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 500 }).withMessage("Notes are too long"),
];

const updateTransactionValidator = createTransactionValidator;

export { createTransactionValidator, updateTransactionValidator };