(function () {
    document.querySelectorAll('[data-toggle-edit]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.toggleEdit;
            const viewEl = document.getElementById(`${target}-view`);
            const formEl = document.getElementById(`${target}-form`);
            if (!viewEl || !formEl) return;
            viewEl.classList.add('hidden');
            formEl.classList.remove('hidden');
        });
    });

    document.querySelectorAll('[data-toggle-cancel]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const target = btn.dataset.toggleCancel;
            const viewEl = document.getElementById(`${target}-view`);
            const formEl = document.getElementById(`${target}-form`);
            if (!viewEl || !formEl) return;
            formEl.classList.add('hidden');
            viewEl.classList.remove('hidden');
        });
    });
})();