import express from 'express';
import { validationResult } from 'express-validator';
import { requireLogin, blockAdmin } from '../middleware/auth.js';
import * as categoryController from '../controllers/categoryController.js';
import { userCategoryValidator } from '../validators/categoryValidators.js';

const router = express.Router();

router.use(requireLogin, blockAdmin);

async function handleCategoryValidationErrors(req, res, next) {
    const result = validationResult(req);
    if (result.isEmpty()) return next();

    const message = result.array()[0].msg;

    if (req.get('Accept') === 'application/json') {
        return res.status(400).json({ error: message });
    }

    const categories = await categoryController.loadMyCategoriesPageData(req.session.user.id);
    res.render('categories', { categories, error: message });
}

router.get('/', categoryController.listMyCategories);
router.post('/', userCategoryValidator, handleCategoryValidationErrors, categoryController.createMyCategory);
router.post('/:id/edit', userCategoryValidator, handleCategoryValidationErrors, categoryController.updateMyCategory);
router.post('/:id/delete', categoryController.deleteMyCategory);

export default router;
