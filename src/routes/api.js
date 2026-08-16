import { Router } from "express";
import prisma from "../prismaClient.js";
import { apiLimiter } from "../middleware/rateLimit.js";

const router = Router();

router.use(apiLimiter);

router.get("/check-username", async (req, res) => {
    const username = (req.query.username || "").trim();

    if (username.length < 3 || username.length > 30 || !/^[a-zA-Z0-9_]+$/.test(username)) {
        return res.json({
            available: false, 
            reason: "Username must be 3-30 characters, letters/numbers/underscores only." 
        });
    }

    const existing = await prisma.user.findFirst({ where: { username } });
    res.json({ available: !existing });
})

export default router;