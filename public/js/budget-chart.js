(function () {
    const canvas = document.getElementById('budgetChart');
    const data = window.__BUDGETS_CHART_DATA__;
    if (!canvas || !data || typeof Chart === 'undefined') return;

    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue('--color-accent').trim() || '#FFD700';
    const primary = styles.getPropertyValue('--color-primary').trim() || '#0A3D2E';
    const ink = styles.getPropertyValue('--color-ink').trim() || '#1A2E27';

    let chart = null;

    function render(items) {
        if (chart) chart.destroy();
        chart = new Chart(canvas, {
            type: 'bar',
            data: {
                labels: items.map((b) => b.label),
                datasets: [
                    { label: 'Budgeted', data: items.map((b) => b.budgetAmount), backgroundColor: gold, borderRadius: 6 },
                    { label: 'Spent', data: items.map((b) => b.spentAmount), backgroundColor: primary, borderRadius: 6 },
                ],
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: ink, font: { family: 'Plus Jakarta Sans' } } } },
                scales: {
                x: { ticks: { color: ink }, grid: { display: false } },
                y: { ticks: { color: ink, callback: (v) => '$' + v }, grid: { color: 'rgba(10,61,46,0.08)' } },
                },
            },
        });
    }

    render(data);

    const select = document.getElementById('budget-chart-category');
    const resetBtn = document.getElementById('budget-chart-reset');
    if (select) {
        select.addEventListener('change', () => {
            const value = select.value;
            render(value ? data.filter((b) => String(b.categoryId) === value) : data);
        });
    }
    if (resetBtn) {
        resetBtn.addEventListener('click', () => {
            if (select) select.value = '';
            render(data);
        });
    }
})();