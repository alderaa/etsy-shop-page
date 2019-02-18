var express = require('express');
var app = express();
var config = require('../config.json')[app.get('env')];

const NodeCache = require("node-cache");

module.exports = new NodeCache({ stdTTL: config.cache_timeout_sec, checkperiod: config.cache_timeout_sec });