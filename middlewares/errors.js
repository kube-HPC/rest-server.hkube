/*
 * Created by nassi on 22/11/15.
 * Error handler middleware
 */

const errors = (err, req, res, next) => {
    const status = err.status || 500;
    res.status(status);
    res.json({
        error: {
            code: status,
            message: err.message
        }
    });
    const error = {error: err, status: status};
    next(error);
};

module.exports = errors;
