(function () {
    document.querySelectorAll('[data-modal-target]').forEach((btn) => {
        btn.addEventListener('click', () => {
            const modal = document.getElementById(btn.dataset.modalTarget);
            if (modal) modal.classList.add('open');
        });
    });

    document.querySelectorAll('[data-modal-close]').forEach((el) => {
        el.addEventListener('click', () => {
            const overlay = el.closest('.modal-overlay');
            if (overlay) overlay.classList.remove('open');
        });
    });

    document.querySelectorAll('.modal-overlay').forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.remove('open');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            document.querySelectorAll('.modal-overlay.open').forEach((m) => m.classList.remove('open'));
        }
    });
})();