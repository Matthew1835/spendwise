(function () {
    const input = document.getElementById("new_password") || document.getElementById("password_field");
    const meter = document.getElementById("strength-meter");
    const label = document.getElementById("strength-label");
    const checklist = document.getElementById("strength-checklist");

    if (!input || !meter) return;

    const rules = [
        { key: "length", test: (v) => v.length >= 8, text: "At least 8 characters" },
        { key: "lower", test: (v) => /[a-z]/.test(v), text: "One lowercase letter" },
        { key: "upper", test: (v) => /[A-Z]/.test(v), text: "One uppercase letter" },
        { key: "digit", test: (v) => /\d/.test(v), text: "One number" },
        { key: "special", test: (v) => /[^a-zA-Z\d]/.test(v), text: "One special character" },
    ];

    const labels = ["Too weak", "Weak", "Fair", "Good", "Strong"];

    input.addEventListener("input", () => {
        const value = input.value;
        const results = rules.map((r) => ({ ...r, met: r.test(value) }));
        const metCount = results.filter((r) => r.met).length;
        const level = value.length === 0 ? 0 : Math.min(4, metCount);

        meter.dataset.level = String(level);

        if (label) label.textContent = value.length === 0 ? "" : labels[level];

        if (checklist) {
            checklist.innerHTML = results
                .map((r) => `<li class="${r.met ? 'met' : ''}">${r.text}</li>`)
                .join("");
        }
    });
})();