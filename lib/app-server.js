/*
 * Created by nassi on 12/04/16.
 * This module initialize express app server
 * including settings, middleware and routes.
 */

'use strict';

const http = require('http');
const https = require('https');
const path = require('path');
const express = require('express');
const app = express();
const EventEmitter = require('events').EventEmitter;
const bodyParser = require('body-parser');
const poweredBy = require('../middlewares/powered-by');
const cors = require('../middlewares/cors');
const errors = require('../middlewares/errors');
const swaggerRoute = require('./swagger-route');

class RestServer extends EventEmitter {
    constructor() {
        super();
    }

    /**
     * Start the rest server with options
     * @param {Object} options
     * @param {int} options.port
     * @param {Array} options.routes
     * @param {Array} options.middlewares
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

            let server;
            options.routes = options.routes || [];
            options.middlewares = options.middlewares || [];

            if (options.sslEnabled && options.credentials) {
                server = https.createServer(options.credentials, app);
            }
            else {
                server = http.createServer(app);
            }

            // middleware
            if (options.poweredBy) {
                app.use(poweredBy(options.poweredBy));
            }
            app.use(cors);                                                      // CORS middleware
            app.use(bodyParser.urlencoded({ extended: true }));                 // parse application/x-www-form-urlencoded
            app.use(bodyParser.json());                                         // parse application/json
            options.middlewares.forEach((r) => {                                // add middleware
                app.use(r);
            });

            // routes
            if (options.name) {
                app.get('/' + (options.prefix || ''), (req, res) => {
                    res.json(options.versions || options.name + ' api');
                });
            }
            options.routes.forEach((r) => {
                if (r.route && typeof r.router === 'function') {
                    app.use(r.route, r.router);
                }
            });

            // swagger
            if (options.swagger) {
                app.use('/swagger-api', swaggerRoute(options.swagger));
                app.use(express.static(path.join(__dirname, '../static')));
            }

            // errors middleware
            app.use(errors);
            app.use((err, req, res, next) => {
                this.emit('error', err);
            });

            // listen
            app.set('port', options.port);
            server.listen(app.get('port'), (err) => {
                if (err) {
                    return reject(err);
                }
                const assignPort = server.address().port;
                if (assignPort != options.port) {
                    return reject(new Error('the port ' + assignPort + ' is assigned instead of ' + options.port));
                }
                return resolve({
                    app: app,
                    server: server,
                    message: 'REST app is listening on port ' + assignPort
                });
            })
        });
    }
}

module.exports = RestServer;

