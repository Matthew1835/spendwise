import { verifyRecaptcha } from "../services/recaptcha.js";

export function requireRecaptcha(view, extraLocals = {}, errorField = "error") {
    return async (req, res, next) => {
        const token = req.body["g-recaptcha-response"];
        const result = await verifyRecaptcha(token, req.ip);

        if (result.success) return next();

        const message = 
            result.reason === "missing-token"
                ? "Please complete the reCAPTCHA check."
                : "reCAPTCHA verification failed. Please try again.";

        const resolvedExtras = 
            typeof extraLocals === "function" 
            ? await extraLocals(req) 
            : extraLocals;

        res.render(view, { 
                formData: req.body, 
                ...resolvedExtras, 
                [errorField]: message,
            }
        );
    }
}