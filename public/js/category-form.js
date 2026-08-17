(function () {
    const form = document.getElementById('cat-form');
    if (!form) return;

    const title = document.getElementById('cat-modal-title');
    const submitBtn = document.getElementById('cat-submit-btn');
    const fields = {
        category_name: document.getElementById('cat_category_name'),
        category_type: document.getElementById('cat_category_type'),
        description: document.getElementById('cat_description'),
        color_code: document.getElementById('cat_color_code'),
        icon: document.getElementById('cat_icon'),
    };

    function resetToAddMode() {
        form.action = '/admin/categories';
        title.innerHTML = '<i class="fa-solid fa-circle-plus"></i> Add category';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add category';
        form.reset();
        fields.color_code.value = '#0A3D2E';
        fields.icon.value = 'fa-solid fa-tag';
    }

    function populateForEdit(data) {
        form.action = `/admin/categories/${data.id}`;
        title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit category';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';

        fields.category_name.value = data.categoryName;
        fields.category_type.value = data.categoryType;
        fields.description.value = data.description || '';
        fields.color_code.value = data.colorCode || '#0A3D2E';
        fields.icon.value = data.icon || 'fa-solid fa-tag';
    }

    document.querySelectorAll('[data-cat-add]').forEach((btn) => btn.addEventListener('click', resetToAddMode));
    document.querySelectorAll('[data-cat-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            populateForEdit({
                id: btn.dataset.id,
                categoryName: btn.dataset.categoryName,
                categoryType: btn.dataset.categoryType,
                description: btn.dataset.description,
                colorCode: btn.dataset.colorCode,
                icon: btn.dataset.icon,
            });
        });
    });
})();
