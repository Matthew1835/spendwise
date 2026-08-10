import { body } from "express-validator";

const createGoalValidator = [
    body("goal_name")
        .trim()
        .notEmpty().withMessage("Goal name is required")
        .isLength({ max: 100 }).withMessage("Goal name must be less than 100 characters"),

    body("target_amount")
        .notEmpty().withMessage("Target amount must be greater than 0")
        .isFloat({ gt: 0, max: 1000000 }).withMessage("Target amount must be greater than 0 and no more than 1,000,000"),

    body("current_amount")
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 }).withMessage("Starting amount cannot be negative")
        .custom((value, { req }) => {
            if (Number(value) > Number(req.body.target_amount)) {
                throw new Error("Starting amount cannot exceed target amount");
            }
            return true;
        }),
    
    body("deadline")
        .notEmpty().withMessage("Deadline is required")
        .isISO8601().withMessage("Invalid deadline")
        .custom((deadline) => {
            const d = new Date(deadline);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const maxFuture = new Date();
            maxFuture.setFullYear(maxFuture.getFullYear() + 10);
            if (d < today) throw new Error("Deadline cannot be in the past");
            if (d > maxFuture) throw new Error("Deadline is too far in the future");
            return true;
        }),
    
    body("priority")
        .optional({ checkFalsy: true })
        .isIn([ "low", "medium", "high" ]).withMessage("Invalid priority"),

    body("category")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage("Category is too long"),

    body("description")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 300 }).withMessage("Description must be less than 300 characters"),
];

const addContributionValidator = [
    body("amount")
        .isFloat({ gt: 0 }).withMessage("Contribution amount must be greater than 0"),

    body("contribution_date")
        .isISO8601().withMessage("Enter a valid date"),

    body("notes")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 300 }).withMessage("Notes are too long"),
];

export { createGoalValidator, addContributionValidator };