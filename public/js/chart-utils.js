(function () {
    const MOBILE_QUERY = '(max-width: 640px)';

    window.responsiveAspectRatio = function (mobile, desktop) {
        return window.matchMedia(MOBILE_QUERY).matches ? mobile : desktop;
    };

    // Keeps the aspect ratio correct if the viewport crosses the mobile
    // breakpoint without a page reload (window resize, device rotation).
    window.bindResponsiveAspectRatio = function (chart, mobile, desktop) {
        const mql = window.matchMedia(MOBILE_QUERY);
        const handler = () => {
        chart.options.aspectRatio = mql.matches ? mobile : desktop;
        chart.resize();
        };
        if (mql.addEventListener) mql.addEventListener('change', handler);
        else mql.addListener(handler); // Safari <14 fallback
    };
})();