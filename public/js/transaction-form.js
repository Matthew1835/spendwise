(function () {
    const form = document.getElementById('tx-form');
    if (!form) return;

    const title = document.getElementById('tx-modal-title');
    const submitBtn = document.getElementById('tx-submit-btn');
    const blankCategoryOption = document.getElementById('tx_category_blank_option');

    const fields = {
        transaction_type: document.getElementById('tx_transaction_type'),
        amount: document.getElementById('tx_amount'),
        description: document.getElementById('tx_description'),
        transaction_date: document.getElementById('tx_transaction_date'),
        category_id: document.getElementById('tx_category_id'),
        payment_method: document.getElementById('tx_payment_method'),
        notes: document.getElementById('tx_notes'),
    };

    function filterCategoryOptions(type, preserveId) {
        const options = Array.from(fields.category_id.options);
        let stillValid = false;

        options.forEach((opt) => {
            if (!opt.value) return; // the blank option always stays
            const matches = opt.dataset.type === type;
            opt.hidden = !matches;
            if (matches && preserveId && opt.value === String(preserveId)) stillValid = true;
        });

        if (preserveId && stillValid) {
            fields.category_id.value = preserveId;
        } else if (fields.category_id.value && fields.category_id.options[fields.category_id.selectedIndex]?.hidden) {
            fields.category_id.value = '';
        }
    }

    fields.transaction_type.addEventListener('change', () => filterCategoryOptions(fields.transaction_type.value));

    function resetToAddMode() {
        form.action = '/transactions';
        title.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add transaction';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add transaction';
        blankCategoryOption.textContent = 'Auto-detect from description';
        form.reset();
        fields.payment_method.value = 'cash';
        fields.transaction_date.value = new Date().toISOString().slice(0, 10);
        filterCategoryOptions(fields.transaction_type.value);
    }

    function populateForEdit(data) {
        form.action = `/transactions/${data.id}/edit`;
        title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit transaction';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';
        blankCategoryOption.textContent = 'Uncategorized';

        fields.transaction_type.value = data.type;
        fields.amount.value = data.amount;
        fields.description.value = data.description || '';
        fields.transaction_date.value = data.date;
        fields.payment_method.value = data.paymentMethod || 'cash';
        fields.notes.value = data.notes || '';

        filterCategoryOptions(data.type, data.categoryId);
    }

    document.querySelectorAll('[data-tx-add]').forEach((btn) => {
        btn.addEventListener('click', resetToAddMode);
    });

    document.querySelectorAll('[data-tx-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            populateForEdit({
                id: btn.dataset.id,
                type: btn.dataset.type,
                amount: btn.dataset.amount,
                description: btn.dataset.description,
                date: btn.dataset.date,
                categoryId: btn.dataset.categoryId,
                paymentMethod: btn.dataset.paymentMethod,
                notes: btn.dataset.notes,
            });
        });
    });

    filterCategoryOptions(fields.transaction_type.value);
})();
