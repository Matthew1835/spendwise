import { Router } from "express";
import { requireLogin, requireAdmin } from "../middleware/auth.js";
import * as adminController from "../controllers/adminController.js";
import { categoryValidator, keywordValidator } from "../validators/adminValidators.js";
import { handleValidationErrors } from "../middleware/validate.js";

const router = Router();

router.use(requireLogin, requireAdmin);

router.get("/dashboard", adminController.dashboard);

// Users
router.get("/users", adminController.listUsers);
router.post("/users/:id/toggle-status", adminController.toggleUserStatus);
router.post("/users/:id/delete", adminController.deleteUser);

// Categories
router.get("/categories", adminController.listCategories);
router.post("/categories",
    categoryValidator,
    handleValidationErrors("admin/categories", async () => ({
        categories: await adminController.loadCategoriesWithUsage(),
    })),
    adminController.createCategory,
);
router.post("/categories/:id",
    categoryValidator,
    handleValidationErrors("admin/categories", async () => ({
        categories: await adminController.loadCategoriesWithUsage(),
    })),
    adminController.updateCategory,
);
router.post("/categories/:id/delete", adminController.deleteCategory);

// Keyword rules
router.get("/keywords", adminController.listKeywords);
router.post("/keywords",
    keywordValidator,
    handleValidationErrors("admin/keywords", async () => ({
        ...(await adminController.loadKeywordsAndCategories()),
        filters: {},
    })),
    adminController.createKeyword,
);
router.post("/keywords/:id",
    keywordValidator,
    handleValidationErrors("admin/keywords", async () => ({
        ...(await adminController.loadKeywordsAndCategories()),
        filters: {},
    })),
    adminController.updateKeyword,
);
router.post("/keywords/:id/toggle-status", adminController.toggleKeywordStatus);
router.post("/keywords/:id/delete", adminController.deleteKeyword);

export default router;