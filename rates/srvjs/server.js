const express = require('express');
const app = express();
var server = require("http").createServer();

const util = require('util');

const xsenv = require('@sap/xsenv');
// xsenv.loadEnv("default-env-good.json");
// xsenv.loadEnv("default-env-bad.json");
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: { label: 'xsuaa' } //,
    // registry: { label: 'saas-registry' },
    // dest: { label: 'destination' }
});

// const httpClient = require('@sap-cloud-sdk/http-client');
// const { retrieveJwt } = require('@sap-cloud-sdk/connectivity');

const xssec = require('@sap/xssec');
const passport = require('passport');
passport.use('JWT', new xssec.JWTStrategy(services.uaa));
app.use(passport.initialize());

// app.use(passport.authenticate('JWT', {
//     session: false
// }));
var PassportAuthenticateMiddleware = passport.authenticate('JWT', {session:false});

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app user info
app.get(['/','/noauth','/srvjs/noauth'], function (req, res) {
    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log(req.method + " " + hostname + req.url);
    let info = {
        'path': hostname + ":" + req.url
    };
    res.status(200).json(info);
});

app.get("*", PassportAuthenticateMiddleware, function (req, res, next) {
// app.get("*", function (req, res, next) {

    var hostname = "localhost";
    var tennant = "no tennant";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log(req.method + " " + hostname + req.url);

    if (((typeof req) == "object") && ((typeof req.authInfo) == "object")) {
        tennant = req.authInfo.getZoneId();
    }

    console.log("tenantId: " + tennant);
    // console.log(util.inspect(req.authInfo, {depth: 1}));
    next();

});


//Setup Routes
var router = require("./router")(app, server);

const port = process.env.PORT || 5002;
server.on("request", app);
server.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});