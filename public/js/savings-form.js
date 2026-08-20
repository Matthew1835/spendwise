// Drives both the goal add/edit modal and the per-goal contribution modal.
(function () {
    // ---- Goal add/edit ----
    const goalForm = document.getElementById('goal-form');
    if (goalForm) {
        const title = document.getElementById('goal-modal-title');
        const submitBtn = document.getElementById('goal-submit-btn');
        const currentAmountField = document.getElementById('goal_current_amount_field');

        const fields = {
            goal_name: document.getElementById('goal_name'),
            target_amount: document.getElementById('goal_target_amount'),
            current_amount: document.getElementById('goal_current_amount'),
            deadline: document.getElementById('goal_deadline'),
            priority: document.getElementById('goal_priority'),
            description: document.getElementById('goal_description'),
        };

        function resetToAddMode() {
            goalForm.action = '/savings';
            title.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add savings goal';
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add goal';
            currentAmountField.style.display = '';
            goalForm.reset();
            fields.current_amount.value = '0';
        }

        function populateForEdit(data) {
            goalForm.action = `/savings/${data.id}/edit`;
            title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit savings goal';
            submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';
            // current_amount isn't editable directly — only contributions change it.
            currentAmountField.style.display = 'none';

            fields.goal_name.value = data.goalName;
            fields.target_amount.value = data.targetAmount;
            fields.deadline.value = data.deadline;
            fields.priority.value = data.priority;
            fields.description.value = data.description || '';
        }

        document.querySelectorAll('[data-goal-add]').forEach((btn) => btn.addEventListener('click', resetToAddMode));

        document.querySelectorAll('[data-goal-edit]').forEach((btn) => {
            btn.addEventListener('click', () => {
                populateForEdit({
                    id: btn.dataset.id,
                    goalName: btn.dataset.goalName,
                    targetAmount: btn.dataset.targetAmount,
                    deadline: btn.dataset.deadline,
                    priority: btn.dataset.priority,
                    description: btn.dataset.description,
                });
            });
        });
    }

    // ---- Add contribution ----
    const contribForm = document.getElementById('contribution-form');
    if (contribForm) {
        const nameLabel = document.getElementById('contribution-goal-name');
        document.querySelectorAll('[data-contrib-add]').forEach((btn) => {
            btn.addEventListener('click', () => {
                contribForm.action = `/savings/${btn.dataset.goalId}/contributions`;
                nameLabel.textContent = `Toward: ${btn.dataset.goalName}`;
                contribForm.reset();
                document.getElementById('contrib_date').value = new Date().toISOString().slice(0, 10);
            });
        });
    }
})();
