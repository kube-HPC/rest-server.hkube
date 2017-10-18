'use strict';

var express = require('express');

var routes = function (swagger) {

    var router = express.Router();

    router.get('/', function (req, res) {
        res.setHeader('Content-Type', 'application/json');
        res.send(swagger);
    });

    return router;
};
module.exports = routes;
