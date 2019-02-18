var express = require('express');
var app = express();
var config = require('./config.json')[app.get('env')];

// Extending the console object with custom methods
console.debug = function(msg) {
    console.log(msg);
}
console.fatal = function(msg) {
    console.log(msg);
    process.exit(1);
}
 
// Initialising the output formatter
require('console-stamp')(console, {
    pattern: 'ddd, dd mmm yyyy HH:MM:ss Z',
    extend: {
        debug: 5,
        fatal: 0,
    },
    include: ['debug', 'info', 'warn', 'error', 'fatal'],
    level: config.log_level
});

module.exports = console;