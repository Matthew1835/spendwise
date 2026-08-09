import rateLimit from "express-rate-limit";

// Block login/register to 10 attempts per 15 min per IP
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: "Too many attempts. Please try again in 15 minutes.",
});