export async function verifyRecaptcha(token, remoteIp) {
    if (!token) return { success: false, reason: "missing-token" };

    const params = new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
    });
    if (remoteIp) params.append("remoteip", remoteIp);

    try {
        const res = await fetch(
            "https://www.google.com/recaptcha/api/siteverify", 
            {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: params,
            }
        );
        const data = await res.json();
        return { success: !!data.success, reason: data["error-codes"]?.[0] };
    } catch (err) {
        console.error("reCAPTCHA verification request failed:", err);
        return { success: false, reason: "network-error" };
    }
}