import { body } from "express-validator";

export const createBudgetValidator = [
    body("category_id")
        .notEmpty().withMessage("Category is required")
        .isInt({ min: 1 }).withMessage("Invalid category"),

    body("budget_amount")
        .notEmpty().withMessage("Budget amount is required")
        .isFloat({ gt: 0, max: 1000000 }).withMessage("Budget amount must be greater than 0 and no more than 1,000,000"),

    body("period_type")
        .optional({ checkFalsy: true })
        .isIn(["weekly", "monthly", "yearly" ]).withMessage("Invalid period type"),

    body("start_date")
        .notEmpty().withMessage("Start date is required")
        .isISO8601().withMessage("Invalid start date"),

    body("end_date")
        .notEmpty().withMessage("End date is required")
        .isISO8601().withMessage("Invalid end date")
        .custom((endDate, { req }) => {
            if (req.body.start_date && new Date(endDate) <= new Date(req.body.start_date)) {
                throw new Error("End date must be after start date");
            }
            return true;
        }),

    body("alert_threshold")
        .optional({ checkFalsy: true })
        .isFloat({ min: 0, max: 1 }).withMessage("Alert threshold must be between 0 and 1"),
];