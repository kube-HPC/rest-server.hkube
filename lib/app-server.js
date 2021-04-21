/*
 * Created by nassi on 12/04/16.
 * This module initialize express app server
 * including settings, middleware and routes.
 */

const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const EventEmitter = require('events');
const bodyParser = require('body-parser');
const RateLimit = require('express-rate-limit');
const poweredBy = require('../middlewares/powered-by');
const cors = require('../middlewares/cors');
const errors = require('../middlewares/errors');
const swaggerRoute = require('./swagger-route');

class RestServer extends EventEmitter {
    constructor() {
        super();
        this._server = null;
        this._app = express();
    }

    /**
     * Start the rest server with options
     * @param {Object} options
     * @param {int} options.port
     * @param {Array} options.routes
     * @param {Array} options.middlewares
     * @param {Array} options.beforeRoutesMiddlewares
     * @param {Array} options.afterRoutesMiddlewares
     * @param {bool} options.sslEnabled
     * @param {Object} options.credentials
     * @param {String} options.name
     * @param {Object} options.swagger
     * @returns {Promise}
     */
    start(options) {
        return new Promise((resolve, reject) => {
            if (!options) {
                return reject(new Error('parameter missing: options'));
            }
            if (!options.port) {
                return reject(new Error('parameter missing: port'));
            }
            if (options.port <= 0 || isNaN(options.port)) {
                return reject(new TypeError('port must be a positive number'));
            }

            options.routes = options.routes || [];
            options.middlewares = options.middlewares || [];
            options.beforeRoutesMiddlewares = options.beforeRoutesMiddlewares || [];
            options.afterRoutesMiddlewares = options.afterRoutesMiddlewares || [];
            if (options.sslEnabled && options.credentials) {
                this._server = https.createServer(options.credentials, this._app);
            }
            else {
                this._server = http.createServer(this._app);
            }

            this._app.enable('trust proxy');

            // rate-limit
            if (options.rateLimit) {
                const limiter = new RateLimit({
                    windowMs: options.rateLimit.ms,
                    max: options.rateLimit.max,
                    delayMs: options.rateLimit.delay,
                    headers: false,
                    handler: (req, res, next) => {
                        const error = new Error('Too Many Requests');
                        error.status = 429;
                        next(error);
                    }
                });
                this._app.use(options.rateLimit.route, limiter);
            }

            // middleware
            if (options.poweredBy) {
                this._app.use(poweredBy(options.poweredBy));
            }

            const bodySizeLimit = options.bodySizeLimit || '10mb';
            this._app.use(cors); // CORS middleware
            this._app.use(bodyParser.raw({ limit: bodySizeLimit }));
            this._app.use(bodyParser.json({ limit: bodySizeLimit }));
            this._app.use(bodyParser.urlencoded({ limit: bodySizeLimit, extended: true }));
            options.middlewares.forEach((r) => {
                this._app.use(r);
            });

            // routes
            if (options.name) {
                this._app.get('/' + (options.prefix || ''), (req, res) => {
                    res.json(options.versions || options.name + ' api');
                });
            }
            options.beforeRoutesMiddlewares.forEach((r) => {
                this._app.use(r);
            });
            options.routes.forEach((r) => {
                if (r.route && typeof r.router === 'function') {
                    this._app.use(r.route, r.router);
                }
            });
            options.afterRoutesMiddlewares.forEach((r) => {
                this._app.use(r);
            });
            // swagger
            if (options.swagger) {
                this._app.use('/swagger-api', swaggerRoute(options.swagger));
                this._app.use(express.static(path.join(__dirname, '../static')));
            }

            // errors middleware
            this._app.use(errors);
            this._app.use((err, req, res, next) => {
                this.emit('error', err);
            });

            // listen
            this._app.set('port', options.port);
            this._server.listen(this._app.get('port'), (err) => {
                if (err) {
                    return reject(err);
                }
                const assignPort = this._server.address().port;
                if (assignPort != options.port) {
                    return reject(new Error('the port ' + assignPort + ' is assigned instead of ' + options.port));
                }
                return resolve({
                    app: this._app,
                    server: this._server,
                    message: 'REST app is listening on port ' + assignPort
                });
            });
        });
    }
    /**
     * closes the server
     */
    stop() {
        return new Promise((resolve, reject) => {
            if (!this._server) {
                return resolve();
            }
            this._server.close((error) => {
                if (error) {
                    return reject(error);
                }
                this._server = null;
                return resolve();
            });
        });
    }

    static router() {
        return express.Router();
    }
}

module.exports = RestServer;

