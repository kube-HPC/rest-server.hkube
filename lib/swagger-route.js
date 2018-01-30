'use strict';

const express = require('express');

const routes = (swagger) => {

    const router = express.Router();

    router.get('/', (req, res) => {
        res.setHeader('Content-Type', 'application/json');
        res.send(swagger);
    });

    return router;
};
module.exports = routes;
