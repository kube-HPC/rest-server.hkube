/*
 * Created by nassi on 7/11/17.
 * X-Powered-By middleware
 */

const powered = poweredBy => (req, res, next) => {
    res.setHeader('X-Powered-By', poweredBy);
    next();
};

module.exports = powered;
