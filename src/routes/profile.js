import { Router } from "express";
import prisma from "../prismaClient.js";
import { requireLogin } from "../middleware/auth.js";
import * as profileController from "../controllers/profileController.js";
import { updateProfileValidator, changePasswordValidator, deleteAccountValidator } from "../validators/profileValidators.js";
import { handleValidationErrors } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.use(requireLogin);

async function loadUser(req) {
    return {
        user: await prisma.user.findUnique({ where: { id: req.session.user.id } }),
        ...profileController.emptyMessages,
    };
}

router.get("/", profileController.showProfile);

router.post("/",
    updateProfileValidator,
    handleValidationErrors("profile", loadUser, "profileError"),
    profileController.updateProfile,
);

router.post("/password",
    authLimiter,
    changePasswordValidator,
    handleValidationErrors("profile", loadUser, "passwordError"),
    profileController.changePassword,
);

router.post("/delete",
    authLimiter,
    deleteAccountValidator,
    handleValidationErrors("profile", loadUser, "deleteError"),
    profileController.deleteAccount,
);

export default router;