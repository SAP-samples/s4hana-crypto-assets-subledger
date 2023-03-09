var crypto = require('crypto'),
    accessTokens = require('../../data.js').accessTokens,
    moment = require('moment');

module.exports.getToken = function(accessToken) {
    console.log("getToken: " + JSON.stringify(accessToken.token));
    return accessToken.token;
};

module.exports.create = function(userId, clientId, scope, ttl, cb) {
    var token = crypto.randomBytes(64).toString('hex');
    var obj = {token: token, userId: userId, clientId: clientId, scope: scope, ttl: new Date().getTime() + ttl * 1000};
    console.log("create: " + JSON.stringify(obj));
    accessTokens.push(obj);
    cb(null, token);
};

module.exports.fetchByToken = function(token, cb) {
    console.log("fetchByToken: " + token);
    for (var i in accessTokens) {
        if (accessTokens[i].token == token) return cb(null, accessTokens[i]);
    }
    cb();
};

module.exports.checkTTL = function(accessToken) {
    console.log("checkTTL: " + JSON.stringify(accessToken));
    return (accessToken.ttl > new Date().getTime());
};

module.exports.getTTL = function(accessToken, cb) {
    console.log("getTTL: " + JSON.stringify(accessToken));
    var ttl = moment(accessToken.ttl).diff(new Date(),'seconds');
    return cb(null, ttl>0?ttl:0);
};

module.exports.fetchByUserIdClientId = function(userId, clientId, cb) {
    console.log("fetchByUserIdClientId: userId: " + userId + " clientId: " + clientId);
    for (var i in accessTokens) {
        if (accessTokens[i].userId == userId && accessTokens[i].clientId == clientId) {
            console.log("fetched: " + JSON.stringify(accessToken[i]));
            return cb(null, accessTokens[i]);
        }
    };
    cb();
};

