/*
 * Created by nassi on 22/11/15.
 * Error handler middleware
 */

const errors = (error, req, res, next) => {
    const status = error.status || 500;
    res.status(status);
    res.json({
        error: {
            code: status,
            message: error.message
        }
    });
    next({ error, status, req, res });
};

module.exports = errors;
