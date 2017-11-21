/*
 * Created by nassi on 28/08/16.
 */

'use strict';

const chai = require("chai");
const expect = chai.expect;
const sinon = require('sinon');
const mockery = require('mockery');
const RestServer = require('../index');
const cors = require('../middlewares/cors');
let rest = null;

const options = {
    serviceName: 'test',
    port: 3000
};

describe('Jobs', function () {
    beforeEach(() => {
        rest = new RestServer();
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

    });
});

