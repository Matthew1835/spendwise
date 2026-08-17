// Drives the shared add/edit budget modal (partials/budget-modal.ejs).
(function () {
    const form = document.getElementById('bg-form');
    if (!form) return;

    const title = document.getElementById('bg-modal-title');
    const submitBtn = document.getElementById('bg-submit-btn');

    const fields = {
        category_id: document.getElementById('bg_category_id'),
        budget_amount: document.getElementById('bg_budget_amount'),
        period_type: document.getElementById('bg_period_type'),
        start_date: document.getElementById('bg_start_date'),
        end_date: document.getElementById('bg_end_date'),
        alert_threshold: document.getElementById('bg_alert_threshold'),
    };

    function resetToAddMode() {
        form.action = '/budgets';
        title.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add budget';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add budget';
        form.reset();
        fields.alert_threshold.value = '0.8';
    }

    function populateForEdit(data) {
        form.action = `/budgets/${data.id}/edit`;
        title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit budget';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';

        fields.category_id.value = data.categoryId;
        fields.budget_amount.value = data.budgetAmount;
        fields.period_type.value = data.periodType;
        fields.start_date.value = data.startDate;
        fields.end_date.value = data.endDate;
        fields.alert_threshold.value = data.alertThreshold;
    }

    document.querySelectorAll('[data-bg-add]').forEach((btn) => btn.addEventListener('click', resetToAddMode));

    document.querySelectorAll('[data-bg-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            populateForEdit({
                id: btn.dataset.id,
                categoryId: btn.dataset.categoryId,
                budgetAmount: btn.dataset.budgetAmount,
                periodType: btn.dataset.periodType,
                startDate: btn.dataset.startDate,
                endDate: btn.dataset.endDate,
                alertThreshold: btn.dataset.alertThreshold,
            });
        });
    });
})();
