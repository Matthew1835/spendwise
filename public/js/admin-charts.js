(function () {
    const data = window.__ADMIN_DASHBOARD_DATA__;
    if (!data || typeof Chart === 'undefined') return;

    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue('--color-accent').trim() || '#FFD700';
    const primary = styles.getPropertyValue('--color-primary').trim() || '#0A3D2E';
    const ink = styles.getPropertyValue('--color-ink').trim() || '#1A2E27';

    const trendCanvas = document.getElementById('signupTrendChart');
    if (trendCanvas) {
        new Chart(trendCanvas, {
            type: 'bar',
            data: {
                labels: data.signupTrend.map((d) => d.label),
                datasets: [{ label: 'New signups', data: data.signupTrend.map((d) => d.count), backgroundColor: gold, borderRadius: 6, maxBarThickness: 36 }],
            },
            options: {
                responsive: true,
                plugins: { legend: { display: false } },
                scales: {
                x: { ticks: { color: ink }, grid: { display: false } },
                y: { ticks: { color: ink, stepSize: 1 }, grid: { color: 'rgba(10,61,46,0.08)' }, beginAtZero: true },
                },
            },
        });
    }

    const roleCanvas = document.getElementById('roleBreakdownChart');
    if (roleCanvas && data.roleBreakdown.length > 0) {
        new Chart(roleCanvas, {
            type: 'doughnut',
            data: {
                labels: data.roleBreakdown.map((r) => (r.role === 'admin' ? 'Admin' : 'User')),
                datasets: [{ data: data.roleBreakdown.map((r) => r.count), backgroundColor: [primary, gold], borderColor: '#FFFBEF', borderWidth: 2 }],
            },
            options: {
                responsive: true,
                plugins: { legend: { position: 'bottom', labels: { color: ink, font: { family: 'Plus Jakarta Sans' } } } },
            },
        });
    }
})();
