/*
 * Created by nassi on 11/04/16.
 */

module.exports = require('./lib/app-server');
module.exports.swaggerUtils = {
    loader: require('./lib/swagger-loader'),
    builder: require('./lib/swagger-builder')
};

