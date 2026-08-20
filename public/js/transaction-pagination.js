// Transactions table shows 10 rows at a time; "See more" reveals 10 more.
(function () {
    let PAGE_SIZE = 10;
    const btn = document.getElementById('tx-see-more');
    if (!btn) return;

    const rows = Array.prototype.slice.call(document.querySelectorAll('[data-tx-row]'));
    const shownEl = document.getElementById('tx-shown');
    let shown = Math.min(PAGE_SIZE, rows.length);

    function update() {
        rows.forEach(function (row, i) {
            row.classList.toggle('is-hidden-row', i >= shown);
        });
        if (shownEl) shownEl.textContent = String(shown);
        if (shown >= rows.length) btn.remove();
    }

    btn.addEventListener('click', function () {
        shown = Math.min(shown + PAGE_SIZE, rows.length);
        update();
    });

    update();
})();
