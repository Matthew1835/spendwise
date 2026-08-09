import { validationResult } from "express-validator";

export function handleValidationErrors(view, extraLocals = {}) {
    return async (req, res, next) => {
        const result = validationResult(req);
        if (result.isEmpty()) return next();

        const error = result.array()[0].msg;
        const resolvedExtras = 
            typeof extraLocals === "function" 
                ? await extraLocals(req) 
                : extraLocals;

        res.render(view, {
            error,
            formData: req.body,
            ...resolvedExtras,
        });
    };
}