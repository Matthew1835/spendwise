// Drives the "My Categories" page's add/edit modal (partials/my-category-modal.ejs).
(function () {
    const form = document.getElementById('my-cat-form');
    if (!form) return;

    const title = document.getElementById('my-cat-modal-title');
    const submitBtn = document.getElementById('my-cat-submit-btn');
    const fields = {
        category_name: document.getElementById('my_cat_name'),
        category_type: document.getElementById('my_cat_type'),
        color_code: document.getElementById('my_cat_color'),
    };

    function resetToAddMode() {
        form.action = '/categories';
        title.innerHTML = '<i class="fa-solid fa-circle-plus"></i> New category';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Add category';
        form.reset();
        fields.color_code.value = '#0A3D2E';
    }

    function populateForEdit(data) {
        form.action = `/categories/${data.id}/edit`;
        title.innerHTML = '<i class="fa-solid fa-pen"></i> Edit category';
        submitBtn.innerHTML = '<i class="fa-solid fa-check"></i> Save changes';

        fields.category_name.value = data.categoryName;
        fields.category_type.value = data.categoryType;
        fields.color_code.value = data.colorCode || '#0A3D2E';
    }

    document.querySelectorAll('[data-my-cat-add]').forEach((btn) => btn.addEventListener('click', resetToAddMode));
    document.querySelectorAll('[data-my-cat-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            populateForEdit({
                id: btn.dataset.id,
                categoryName: btn.dataset.categoryName,
                categoryType: btn.dataset.categoryType,
                colorCode: btn.dataset.colorCode,
            });
        });
    });
})();
