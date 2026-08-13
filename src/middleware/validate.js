import { validationResult } from "express-validator";

export function handleValidationErrors(view, extraLocals = {}, errorField = "error") {
    return async (req, res, next) => {
        const result = validationResult(req);
        if (result.isEmpty()) return next();

        const error = result.array()[0].msg;
        const resolvedExtras = 
            typeof extraLocals === "function" 
                ? await extraLocals(req) 
                : extraLocals;

        res.render(view, {
            formData: req.body,
            ...resolvedExtras,
            [errorField]: error,
        });
    };
}