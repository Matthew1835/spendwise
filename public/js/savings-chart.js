// Horizontal bar chart: current saved vs. target, per goal.
(function () {
    const canvas = document.getElementById('savingsChart');
    const data = window.__SAVINGS_CHART_DATA__;
    if (!canvas || !data || data.length === 0 || typeof Chart === 'undefined') return;

    const styles = getComputedStyle(document.documentElement);
    const gold = styles.getPropertyValue('--color-accent').trim() || '#FFD700';
    const primary = styles.getPropertyValue('--color-primary').trim() || '#0A3D2E';
    const ink = styles.getPropertyValue('--color-ink').trim() || '#1A2E27';

    new Chart(canvas, {
        type: 'bar',
        data: {
            labels: data.map((g) => g.name),
            datasets: [
                { label: 'Saved', data: data.map((g) => g.current), backgroundColor: gold, borderRadius: 6 },
                { label: 'Target', data: data.map((g) => g.target), backgroundColor: primary, borderRadius: 6 },
            ],
            },
            options: {
            indexAxis: 'y',
            responsive: true,
            plugins: { legend: { labels: { color: ink, font: { family: 'Plus Jakarta Sans' } } } },
            scales: {
                x: { ticks: { color: ink, callback: (v) => '$' + v }, grid: { color: 'rgba(10,61,46,0.08)' } },
                y: { ticks: { color: ink }, grid: { display: false } },
            },
        },
    });
})();
