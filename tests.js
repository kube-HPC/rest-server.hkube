/*
 * Created by nassi on 28/08/16.
 */

'use strict';

var chai = require("chai");
var expect = chai.expect;
var sinon = require('sinon');
var mockery = require('mockery');
var RestServer = require('./index');
var cors = require('./middlewares/cors');
var rest = new RestServer();

var options = {
    serviceName: 'test',
    port: 3000
};

describe('Jobs', function () {

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
            rest.start({port: -1}).catch(function (error) {
                expect(error.message).to.equal('port must be a positive number');
                done();
            });
        });
        it('should start the app rest api', function (done) {

            var routes = [
                {route: '/catalog', router: null}
            ];
            var middlewares = [cors];
            rest.on('error', function (res) {
            });
            var opt = {
                swagger: {file: __dirname + '/swagger.json'},
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

    });
});

