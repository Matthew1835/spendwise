import { Router } from "express";
import * as authController from "../controllers/authController.js";
import { registerValidator, loginValidator } from "../validators/authValidators.js";
import { handleValidationErrors } from "../middleware/validate.js";
import { authLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.get("/register", authController.showRegister);
router.post("/register", 
    authLimiter,
    registerValidator,
    handleValidationErrors("register"),
    authController.register,
);

router.get("/login", authController.showLogin);
router.post("/login",
    authLimiter,
    loginValidator,
    handleValidationErrors("login"),
    authController.login,
);

router.post("/logout", authController.logout);

export default router;