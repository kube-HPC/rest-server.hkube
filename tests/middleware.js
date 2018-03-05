/*
 * Created by nassi on 28/08/16.
 */

const { expect } = require("chai");
const sinon = require('sinon');
const express = require('express');
const RestServer = require('../index');
const request = require('supertest');
const cors = require('../middlewares/cors');
let rest = null;

const options = {
    serviceName: 'test',
    port: 3000
};

describe('middlewares', function () {
    beforeEach(() => {
        rest = new RestServer();
    });
    afterEach(async () => {
        if (rest) {
            await rest.stop();
        }
    });
    describe('before and after', () => {
        it('should run without before middleware', (done) => {
            let whatToReturn = 'test1';
            const emptyRoute = (req, res, next) => { res.send(whatToReturn); next(); };
            const routes = [
                {
                    route: '/test1',
                    router: express.Router().get('/', emptyRoute)
                }
            ];
            const opt = {
                name: options.serviceName,
                routes: routes,
                port: options.port
            };
            rest.start(opt).then((result) => {
                request(rest._app)
                    .get('/test1')
                    .expect(200, 'test1')
                    .then((res) => {
                        done()
                    })
            });
        });
        it('should run with before middleware', (done) => {
            let whatToReturn = 'test1';
            const emptyRoute = (req, res, next) => { res.send(whatToReturn); next(); };
            const beforeMiddle = (req, res, next) => { whatToReturn = 'test2'; next(); };
            var routes = [
                {
                    route: '/test1',
                    router: express.Router().get('/', emptyRoute)
                }
            ];
            var opt = {
                name: options.serviceName,
                // middlewares: middlewares,
                routes: routes,
                port: options.port,
                beforeRoutesMiddlewares: [beforeMiddle]
            };
            rest.start(opt).then((result) => {
                request(rest._app)
                    .get('/test1')
                    .expect(200, 'test2')
                    .then((res) => {
                        done()
                    })
            });
        });
        it('should run with after middleware', (done) => {
            let whatToReturn = 'test1';
            const emptyRoute = (req, res, next) => { res.send(whatToReturn); next(); };
            const afterMiddle = (req, res, next) => { whatToReturn = 'test2'; next(); };
            const afterSpy = sinon.spy(afterMiddle);
            var routes = [
                {
                    route: '/test1',
                    router: express.Router().get('/', emptyRoute)
                }
            ];
            var opt = {
                name: options.serviceName,
                // middlewares: middlewares,
                routes: routes,
                port: options.port,
                afterRoutesMiddlewares: [afterSpy]
            };
            rest.start(opt).then((result) => {
                request(rest._app)
                    .get('/test1')
                    .expect(200, 'test1')
                    .then((res) => {
                        expect(afterSpy.callCount).to.eq(1);
                        done()
                    })
            });
        });
        it('should run with before and after middleware', (done) => {
            let whatToReturn = 'test1';
            const emptyRoute = (req, res, next) => { res.send(whatToReturn); next(); };
            const beforeMiddle = (req, res, next) => { whatToReturn = 'test2'; next(); };
            const afterMiddle = (req, res, next) => { whatToReturn = 'test3'; next(); };
            const afterSpy = sinon.spy(afterMiddle);
            var routes = [
                {
                    route: '/test1',
                    router: express.Router().get('/', emptyRoute)
                }
            ];
            var opt = {
                name: options.serviceName,
                // middlewares: middlewares,
                routes: routes,
                port: options.port,
                afterRoutesMiddlewares: [afterSpy],
                beforeRoutesMiddlewares: [beforeMiddle]

            };
            rest.start(opt).then((result) => {
                request(rest._app)
                    .get('/test1')
                    .expect(200, 'test2')
                    .then((res) => {
                        expect(afterSpy.callCount).to.eq(1);
                        done()
                    })
            });
        });
    });
});

