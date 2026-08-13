import { body } from "express-validator";

const updateProfileValidator = [
    body("first_name")
        .trim()
        .notEmpty().withMessage("First name cannot be empty"),

    body("last_name")
        .trim()
        .notEmpty().withMessage("Last name cannot be empty"),

    body("email")
        .trim()
        .notEmpty().withMessage("Email cannot be empty")
        .isEmail().withMessage("Invalid email format")
        .normalizeEmail(),

    body("monthly_budget")
        .notEmpty().withMessage("Monthly budget cannot be empty")
        .isFloat({ min: 0, max: 999999.99 }).withMessage("Monthly budget must be between 0 and 999,999.99"),
];

const changePasswordValidator = [
    body("current_password")
        .notEmpty().withMessage("Current password is required"),
    
    body("new_password")
        .isLength({ min: 8 }).withMessage("New password must be at least 8 characters long")
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^a-zA-Z\d]).+$/)
        .withMessage("Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"),
    
    body("confirm_password")
        .custom((value, { req }) => {
            if (value !== req.body.new_password) {
                throw new Error("Password do not match");
            }
            return true;
        }),
];

const deleteAccountValidator = [
    body("password")
        .notEmpty().withMessage("Enter your password to confirm account deletion"),

    body("confirm_text")
        .equals("DELETE").withMessage("Type DELETE to confirm"),
];

export { updateProfileValidator, changePasswordValidator, deleteAccountValidator };