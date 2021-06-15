
const now = require('performance-now');

const logger = emitter => (req, res, next) => {
    const start = now();
    const { method, url } = req.method;
    res.on('finish', () => {
        const end = now();
        const status = res.statusCode;
        const duration = (end - start).toFixed(2);
        emitter.emit('request', { method, url, status, duration });
    });
    next();
};

module.exports = logger;
