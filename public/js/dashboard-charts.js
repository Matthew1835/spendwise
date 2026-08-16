(function () {
    const data = window.__DASHBOARD_DATA__;
    if (!data || typeof Chart === "undefined") return;

    const styles = getComputedStyle(document.documentElement);
    const income = styles.getPropertyValue("--color-income").trim() || "#2FAE72";
    const expense = styles.getPropertyValue("--color-expense").trim() || "#FF6B6E";
    const ink = styles.getPropertyValue("--color-ink").trim() || "#1A2E27";

    const trendCanvas = document.getElementById('trendChart');
    if (trendCanvas) {
        new Chart(trendCanvas, {
        type: 'line',
        data: {
            labels: data.trend.map((m) => m.label),
            datasets: [
            {
                label: 'Income',
                data: data.trend.map((m) => m.income),
                borderColor: income,
                backgroundColor: income + '33',
                tension: 0.35,
                fill: true,
                pointRadius: 4,
            },
            {
                label: 'Expense',
                data: data.trend.map((m) => m.expense),
                borderColor: expense,
                backgroundColor: expense + '33',
                tension: 0.35,
                fill: true,
                pointRadius: 4,
            },
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

    const categoryCanvas = document.getElementById('categoryChart');
    if (categoryCanvas && data.expenseByCategory.length > 0) {
        const palette = ['#FFD700', '#0A3D2E', '#2FAE72', '#FF6B6B', '#FFA94D', '#1B6B4D', '#E8C547', '#6B7D75'];
        new Chart(categoryCanvas, {
        type: 'doughnut',
        data: {
            labels: data.expenseByCategory.map((c) => c.name),
            datasets: [
            {
                data: data.expenseByCategory.map((c) => c.amount),
                backgroundColor: data.expenseByCategory.map((_, i) => palette[i % palette.length]),
                borderColor: '#FFFBEF',
                borderWidth: 2,
            },
            ],
        },
        options: {
            responsive: true,
            plugins: {
            legend: { position: 'bottom', labels: { color: ink, font: { family: 'Plus Jakarta Sans', size: 11 }, boxWidth: 12 } },
            },
        },
        });
    }
})();