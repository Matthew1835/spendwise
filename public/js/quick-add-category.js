(function () {
    const modal = document.getElementById('quick-add-category-modal');
    const form = document.getElementById('qac-form');
    if (!modal || !form) return;

    const typeField = document.getElementById('qac_category_type');
    const typeLabel = document.getElementById('qac-type-label');
    const nameField = document.getElementById('qac_category_name');
    const colorField = document.getElementById('qac_color_code');
    const errorEl = document.getElementById('qac-error');
    const submitBtn = document.getElementById('qac-submit-btn');

    let targetSelectId = null;

    function showError(message) {
        errorEl.textContent = message;
        errorEl.style.display = 'block';
    }

    function closeModal() {
        modal.classList.remove('open');
        form.reset();
        colorField.value = '#0A3D2E';
        errorEl.style.display = 'none';
    }

    document.querySelectorAll('[data-quick-add-category]').forEach((trigger) => {
        trigger.addEventListener('click', () => {
            targetSelectId = trigger.dataset.targetSelect;

            // Either a fixed type ("expense" for budgets, which only ever
            // track expenses) or "auto", meaning read the parent form's
            // currently-selected transaction type.
            const lockType = trigger.dataset.lockType;
            const type =
                lockType === 'auto' ? document.getElementById(trigger.dataset.typeSource).value : lockType;

            typeField.value = type;
            typeLabel.textContent = `Creating a new ${type} category.`;
            errorEl.style.display = 'none';
            nameField.focus();
        });
    });

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorEl.style.display = 'none';
        submitBtn.disabled = true;

        try {
            const res = await fetch('/categories', {
                method: 'POST',
                headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                Accept: 'application/json',
                },
                body: new URLSearchParams(new FormData(form)),
            });
            const data = await res.json();

            if (!res.ok) {
                showError(data.error || 'Could not create category.');
                return;
            }

            const targetSelect = targetSelectId ? document.getElementById(targetSelectId) : null;
            if (targetSelect) {
                const option = document.createElement('option');
                option.value = data.id;
                option.textContent = data.categoryName;
                option.dataset.type = data.categoryType;
                targetSelect.appendChild(option);
                targetSelect.value = data.id;
                // Let the parent form know a category was added, in case it needs
                // to refresh its own filtered-option visibility logic.
                targetSelect.dispatchEvent(new Event('change'));
            }

            closeModal();
        } catch (err) {
            showError('Something went wrong. Please try again.');
        } finally {
            submitBtn.disabled = false;
        }
    });
})();
