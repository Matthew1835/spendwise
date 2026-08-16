(function () {
    const input = document.getElementById("username_field");
    const hint = document.getElementById("username-hint");

    if (!input || !hint) return;

    let timer = null;
    let lastRequestId = 0;

    function setHint(message, state) {
        hint.textContent = message;
        hint.className = "field-hint " + (state === "ok" ? "hint-ok" : state === "bad" ? "hint-bad" : "hint-neutral");
        input.classList.remove("input-valid", "input-invalid");
        if (state === "ok") input.classList.add("input-valid");
        if (state === "bad") input.classList.add("input-invalid");
    }

    input.addEventListener("input", () => {
        const value = input.value.trim();
        clearTimeout(timer);

        if (value.length === 0) {
            setHint("", "neutral");
            return;
        }

        if (value.length < 3) {
            setHint("Username must be at least 3 characters.", "bad");
            return;
        }

        setHint("Checking availability...", "neutral");
        const requestId = ++lastRequestId;

        timer = setTimeout(async () => {
            try {
                const res = await fetch(`/api/check-username?username=${encodeURIComponent(value)}`);
                const data = await res.json();

                if (requestId !== lastRequestId) return;

                if (data.available) {
                    setHint("Username is available.", "ok");
                } else {
                    setHint(data.reason || "That username is already taken.", "bad");
                }
            } catch (err) {
                if (requestId !== lastRequestId) return;
                setHint("Could not check availability right now.", "neutral");
            }
        }, 400);
    });
})();