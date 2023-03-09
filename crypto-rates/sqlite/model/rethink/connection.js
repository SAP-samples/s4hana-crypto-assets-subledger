// var config = require('./config.js');
// var RethinkDb = require('rethinkdb');

// Using only one active connection for test purposes
var _connection;

const db = require('../../library');

module.exports.acquire = function(cb) {
    if (_connection) return cb(null, _connection);

    // RethinkDb.connect(config, function(err, connection) {
    //     if (err) cb(err);
    //     else {
    //         _connection = connection;
    //         cb(null, _connection);
    //     }
    // });

    _connection = db;
    cb(null, _connection);

};

module.exports.close = function(cb) {
    if (!_connection) return cb();

    // _connection.close(cb);
    _connection = null;
};