const db = require('../../../library');

var clients = require('../../data.js').clients;

module.exports.getId = function(client) {
    console.log("getId: " + JSON.stringify(client));
    return client.id;
};

module.exports.getRedirectUri = getRedirectUri;

module.exports.checkRedirectUri = checkRedirectUri;

module.exports.fetchById = function(clientId, cb) {
    console.log("fetchById: " + JSON.stringify(clientId));

    var useMemory = false;
    if (useMemory) {
        for (var i in clients) {
            if (clientId == clients[i].id) {
                // console.log("returning: " + JSON.stringify(clients[i]));
                return cb(null, clients[i]);
            }
        }
    } else {
        const tenant = db.fetchById(clientId);
        return cb(null, {"id": tenant.clientid, "name": tenant.nick, "secret": tenant.clientsecret, "redirectUri": tenant.redirectUri});
    }

    cb();
};

module.exports.checkSecret = function(client, secret, cb) {
    console.log("checkSecret: " + JSON.stringify(client) + JSON.stringify(secret));

    //NEXT STEP:  DO this in an SQLite way

    return cb(null, client.secret == secret);
};

function getRedirectUri(client) {
    return client.redirectUri;
};

function checkRedirectUri(client, redirectUri) {
    return (redirectUri.indexOf(getRedirectUri(client)) === 0 &&
            redirectUri.replace(getRedirectUri(client), '').indexOf('#') === -1);
};