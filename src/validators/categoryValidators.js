import { body } from 'express-validator';

export const userCategoryValidator = [
    body('category_name')
        .trim()
        .notEmpty().withMessage('Category name is required')
        .isLength({ max: 50 }).withMessage('Category name is too long'),
    
    body('category_type')
        .isIn(['income', 'expense']).withMessage('Type must be income or expense'),
    
    body('color_code')
        .optional({ checkFalsy: true })
        .matches(/^#[0-9a-fA-F]{6}$/).withMessage('Color must be a hex code like #007bff'),
];
