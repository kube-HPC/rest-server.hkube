/*
 * Created by nassi on 28/08/16.
 */

'use strict';

const chai = require('chai');
const expect = chai.expect;
const sinon = require('sinon');
const express = require('express');
const request = require('request');
const RestServer = require('../index');
const cors = require('../middlewares/cors');
let rest = null;

const options = {
    serviceName: 'test',
    port: 3000
};

function _request(options) {
    return new Promise((resolve, reject) => {
        request({
            method: options.method || 'GET',
            uri: options.uri,
            json: true,
            body: options.body
        }, (err, response, body) => {
            const error = err || body.error;
            if (error) {
                return reject(response);
            }
            return resolve(response);
        });
    });
}

describe('Jobs', function () {
    beforeEach(() => {
        rest = new RestServer();
        rest.on('error', (err) => {
        })
    });
    afterEach(async () => {
        if (rest) {
            await rest.stop();
        }
    });
    describe('Actions', function () {
        it('should reject with error missing: options', function (done) {
            rest.start().catch(function (error) {
                expect(error.message).to.equal('parameter missing: options');
                done();
            });
        });
        it('should reject with error missing: port', function (done) {
            rest.start({}).catch(function (error) {
                expect(error.message).to.equal('parameter missing: port');
                done();
            });
        });
        it('should reject with error positive port number', function (done) {
            rest.start({ port: -1 }).catch(function (error) {
                expect(error.message).to.equal('port must be a positive number');
                done();
            });
        });
        it('should start the app rest api', function (done) {

            var routes = [
                { route: '/catalog', router: null }
            ];
            var middlewares = [cors];
            rest.on('error', function (res) {
            });
            var opt = {
                swagger: { file: __dirname + '/swagger.json' },
                name: options.serviceName,
                middlewares: middlewares,
                routes: routes,
                port: options.port
            };
            rest.start(opt).then(function (result) {
                expect(result.message).to.equal('REST app is listening on port ' + options.port);
                done();
            });
        });
        it('should throw 429 Too Many Requests', function (done) {
            this.timeout(10000);
            const routers = (options) => {
                const router = express.Router();
                router.get('/', (req, res, next) => {
                    res.json({ message: `hello from api` });
                    next();
                });
                return router;
            };
            const routes = [
                { route: '/api/test', router: routers() }
            ];

            const opt = {
                name: options.serviceName,
                routes: routes,
                port: options.port,
                rateLimit: {
                    route: '/api',
                    ms: 2000,
                    max: 5,
                    delay: 0
                }
            };
            rest.start(opt).then(function (result) {
                const promises = [];
                for (let i = 0; i < 10; i++) {
                    promises.push(_request({ uri: 'http://localhost:3000/api/test' }))
                }
                Promise.all(promises).catch(response => {
                    expect(response.statusCode).to.equal(429);
                    expect(response.statusMessage).to.equal('Too Many Requests');
                    done();
                });
            });
        });
        it('should not throw 429 Too Many Requests on different route', function (done) {
            const msg = { message: `hello from api` };
            const routers = (options) => {
                const router = express.Router();
                router.get('/', (req, res, next) => {
                    res.json(msg);
                    next();
                });
                return router;
            };
            const routes = [
                { route: '/api2/test', router: routers() }
            ];

            const opt = {
                name: options.serviceName,
                routes: routes,
                port: options.port,
                rateLimit: {
                    route: '/api',
                    ms: 2000,
                    max: 5,
                    delay: 0
                }
            };
            rest.start(opt).then(function (result) {
                const promises = [];
                const results = [];
                for (var i = 0; i < 10; i++) {
                    results.push(msg)
                    promises.push(_request({ uri: 'http://localhost:3000/api2/test' }))
                }
                Promise.all(promises).then(response => {
                    expect(response.map(r => r.body)).to.deep.equal(results);
                    done();
                });
            });
        });
        it('should not throw 429 Too Many Requests when under max requests', function (done) {
            const msg = { message: `hello from api` };
            const routers = (options) => {
                const router = express.Router();
                router.get('/', (req, res, next) => {
                    res.json(msg);
                    next();
                });
                return router;
            };
            const routes = [
                { route: '/api/test', router: routers() }
            ];

            const opt = {
                name: options.serviceName,
                routes: routes,
                port: options.port,
                rateLimit: {
                    route: '/api',
                    ms: 2000,
                    max: 50,
                    delay: 0
                }
            };
            rest.start(opt).then(function (result) {
                const promises = [];
                const results = [];
                for (let i = 0; i < 10; i++) {
                    results.push(msg)
                    promises.push(_request({ uri: 'http://localhost:3000/api/test' }))
                }
                Promise.all(promises).then(response => {
                    expect(response.map(r => r.body)).to.deep.equal(results);
                    done();
                });
            });
        });
    });
});

