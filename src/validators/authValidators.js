import { body } from "express-validator";

export const registerValidator = [
    body("username")
        .trim()
        .isLength({ min: 3, max: 30 }).withMessage("Username must be 3-30 characters")
        .matches(/^[a-zA-Z0-9_]+$/).withMessage("Username can only contain letters, numbers, and underscores"),
    
    body("email")
        .trim()
        .isEmail().withMessage("Enter a valid email")
        .normalizeEmail(),

    body("password")
        .isLength({ min: 8 }).withMessage("Password must be at least 8 characters"),

    body('confirm_password').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Passwords do not match');
        }
        return true;
    }),

    body("first_name")
        .trim()
        .notEmpty().withMessage("First name is required"),

    body("last_name")
        .trim()
        .notEmpty().withMessage("Last name is required"),

    body("monthly_budget")
        .optional({ checkFalsy: true })
        .isFloat({ min: 0 }).withMessage("Monthly budget must be a positive number"),

    body("currency")
        .optional()
        .trim()
        .isLength({ min: 3, max: 3 }).withMessage("Currency must be a 3-letter code"),
];

export const loginValidator = [
    body("username")
        .trim()
        .notEmpty().withMessage("Username or email is required"),

    body("password")
        .notEmpty().withMessage("Password is required"),
];