import { body } from "express-validator";

const categoryValidator = [
    body("category_name")
        .trim()
        .notEmpty().withMessage("Category name is required")
        .isLength({ max: 50 }).withMessage("Category name is too long"),

    body("category_type")
        .isIn(["income", "expense"]).withMessage("Type must be income or expense"),

    body("description")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 255 }).withMessage("Description is too long"),

    body("color_code")
        .optional({ checkFalsy: true })
        .matches(/^#[0-9a-fA-F]{6}$/).withMessage("Color must be a hex code like #007bff"),

    body("icon")
        .optional({ checkFalsy: true })
        .trim()
        .isLength({ max: 50 }).withMessage("Icon value is too long"),
];

const keywordValidator = [
    body("keyword")
        .trim()
        .notEmpty().withMessage("Keyword is required")
        .isLength({ max: 100 }).withMessage("Keyword is too long"),

    body("category_id")
        .isInt({ min: 1 })
        .withMessage("Category is required"),

    body("priority")
        .optional({ checkFalsy: true })
        .isInt({ min: 0, max: 100 }).withMessage("Priority must be 0-100"),

    body("rule_type")
        .optional({ checkFalsy: true })
        .isIn(["contains", "exact_match", "starts_with"]).withMessage("Invalid rule type"),
];

export { categoryValidator, keywordValidator };