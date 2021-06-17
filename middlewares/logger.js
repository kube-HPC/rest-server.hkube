
const now = require('performance-now');

const logger = (options) => {
    const { filterRoutes = [], onRequest, onResponse } = options;

    return (req, res, next) => {
        const { method, url } = req;

        if (filterRoutes.some(f => url.startsWith(f))) {
            return next();
        }
        if (onRequest) {
            onRequest({ method, url });
        }
        if (onResponse) {
            const start = now();
            res.on('close', () => {
                const end = now();
                const status = res.statusCode;
                const duration = (end - start).toFixed(2);
                onResponse({ method, url, status, duration });
            });
        }
        return next();
    };
};

module.exports = logger;
