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

    function resetToAddMode() {
        form.action = "/transactions";
        title.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add transaction';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add transaction';
        blankCategoryOption.textContent = 'Auto-detect from description';
        form.reset();
        fields.payment_method.value = 'cash';
        fields.transaction_date.value = new Date().toISOString().slice(0, 10);
    };

    function populateForEdit(data) {
        form.action = `/transactions/${data.id}/edit`;
        title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit transaction';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';
        blankCategoryOption.textContent = 'Uncategorized';

        fields.transaction_type.value = data.type;
        fields.amount.value = data.amount;
        fields.description.value = data.description || '';
        fields.transaction_date.value = data.date;
        fields.category_id.value = data.categoryId || '';
        fields.payment_method.value = data.paymentMethod || 'cash';
        fields.notes.value = data.notes || '';
    };

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
})();