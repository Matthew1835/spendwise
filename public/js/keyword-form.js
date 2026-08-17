(function () {
    const form = document.getElementById('kw-form');
    if (!form) return;

    const title = document.getElementById('kw-modal-title');
    const submitBtn = document.getElementById('kw-submit-btn');
    const fields = {
        keyword: document.getElementById('kw_keyword'),
        category_id: document.getElementById('kw_category_id'),
        priority: document.getElementById('kw_priority'),
        rule_type: document.getElementById('kw_rule_type'),
    };

    function resetToAddMode() {
        form.action = '/admin/keywords';
        title.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add keyword rule';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add rule';
        form.reset();
        fields.priority.value = '1';
    }

    function populateForEdit(data) {
        form.action = `/admin/keywords/${data.id}`;
        title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit keyword rule';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';

        fields.keyword.value = data.keyword;
        fields.category_id.value = data.categoryId;
        fields.priority.value = data.priority;
        fields.rule_type.value = data.ruleType;
    }

    document.querySelectorAll('[data-kw-add]').forEach((btn) => btn.addEventListener('click', resetToAddMode));
    document.querySelectorAll('[data-kw-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            populateForEdit({
                id: btn.dataset.id,
                keyword: btn.dataset.keyword,
                categoryId: btn.dataset.categoryId,
                priority: btn.dataset.priority,
                ruleType: btn.dataset.ruleType,
            });
        });
    });
})();
