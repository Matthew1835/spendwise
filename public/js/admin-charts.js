(function () {
    const data = window.__ADMIN_DASHBOARD_DATA__;
    if (!data || typeof Chart === 'undefined') return;

    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue('--color-accent').trim() || '#FFD700';
    const ink = styles.getPropertyValue('--color-ink').trim() || '#1A2E27';

    const trendCanvas = document.getElementById('signupTrendChart');
    if (trendCanvas) {
        const trendChart = new Chart(trendCanvas, {
        type: 'bar',
        data: {
            labels: data.signupTrend.map((d) => d.label),
            datasets: [{ label: 'New signups', data: data.signupTrend.map((d) => d.count), backgroundColor: gold, borderRadius: 6, maxBarThickness: 36 }],
        },
        options: {
            responsive: true,
            aspectRatio: window.responsiveAspectRatio(1.4, 2.5),
            plugins: { legend: { display: false } },
            scales: {
                x: { ticks: { color: ink }, grid: { display: false } },
                y: { ticks: { color: ink, stepSize: 1 }, grid: { color: 'rgba(10,61,46,0.08)' }, beginAtZero: true },
            },
        },
        });
        window.bindResponsiveAspectRatio(trendChart, 1.4, 2.5);
    }
})();
