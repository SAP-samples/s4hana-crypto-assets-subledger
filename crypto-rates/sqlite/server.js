const express = require('express');
const app = express();
var server = require("http").createServer();

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    // registry: { label: 'saas-registry' },
//    dest: { label: 'destination' },
    uaa: { label: 'xsuaa' }
});

const httpClient = require('@sap-cloud-sdk/http-client');
const { retrieveJwt } = require('@sap-cloud-sdk/connectivity');

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

global.gtid = 'aef487d1-0879-4fb1-a8f4-2384b71226c2';  // zone i.e. tenant ID of cryptorates subaccount

const axios = require('axios');

app.all("*", function (req, res, next) {

    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log("req: " + req.method + " " + hostname + req.url);
    next();

});

// Locally encoded favicon
// https://stackoverflow.com/questions/15463199/how-to-set-custom-favicon-in-express
// make an icon maybe here: http://www.favicon.cc/ or here :http://favicon-generator.org

// convert it to base64 maybe here: http://base64converter.com/

// then replace the icon base 64 value

const favicon = new Buffer.from('AAABAAEAEBAQAAAAAAAoAQAAFgAAACgAAAAQAAAAIAAAAAEABAAAAAAAgAAAAAAAAAAAAAAAEAAAAAAAAAAAAAAA/4QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEREQAAAAAAEAAAEAAAAAEAAAABAAAAEAAAAAAQAAAQAAAAABAAAAAAAAAAAAAAAAAAAAAAAAAAEAABAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD//wAA//8AAP//AAD8HwAA++8AAPf3AADv+wAA7/sAAP//AAD//wAA+98AAP//AAD//wAA//8AAP//AAD//wAA', 'base64'); 
app.get("/favicon.ico", function(req, res) {
 res.statusCode = 200;
 res.setHeader('Content-Length', favicon.length);
 res.setHeader('Content-Type', 'image/x-icon');
 res.setHeader("Cache-Control", "public, max-age=2592000");                // expiers after a month
 res.setHeader("Expires", new Date(Date.now() + 2592000000).toUTCString());
 res.end(favicon);
});

// app user info
app.get(['/noauth','/sqlite/noauth'], function (req, res) {
    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log(req.method + " " + hostname + req.url);
    let info = {
        'noauth': hostname + ":" + req.url
    };
    res.status(200).json(info);
});

app.get(["/","/links"], function (req, res) {
    console.log("served from adm.js");
    
    console.log(req.headers['x-forwarded-host']);

    var responseStr = "";
    responseStr += "<!DOCTYPE HTML><html><head><title>Crypto Rates ADM</title></head><body><h3>Crypto Rates ADM</h3><br />";
    responseStr += "<a href=\"/sqlite/links\">SQLite Links</a> requires authorization.<br />";
    responseStr += "<a href=\"/sqlite/noauth\">SQLite NoAuth</a> no authorization.<br />";
    responseStr += "<a href=\"/noauth\">NoAuth</a> no authorization.<br />";
    responseStr += "<br />";
    responseStr += "<a href=\"/\">Return to SQLite Root.</a><br />";
    responseStr += "</body></html>";
    res.status(200).send(responseStr);
});

// Require authorization for anything further
app.get("*", PassportAuthenticateMiddleware, function (req, res, next) {

    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log(req.method + " " + hostname + req.url);
    gtid = req.authInfo.getZoneId()
    console.log("tenantId: " + gtid);
    // console.log(util.inspect(req.authInfo, {depth: 1}));
    next();

});

// app user info
app.get('/sqlite/info', PassportAuthenticateMiddleware, function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        let info = {
            'userInfo': req.user,
            'subdomain': req.authInfo.getSubdomain(),
            'tenantId': req.authInfo.getZoneId()
        };
        res.status(200).json(info);
    } else {
        res.status(403).send('Forbidden');
    }
});


// destination reuse service
// app.get('/sqlite/destinations', async function (req, res) {
//     if (req.authInfo.checkScope('$XSAPPNAME.User')) {
//         try {
//             let res1 = await httpClient.executeHttpRequest(
//                 {
//                     destinationName: req.query.destination || '',
//                     jwt: retrieveJwt(req)
//                 },
//                 {
//                     method: 'GET',
//                     url: req.query.path || '/'
//                 }
//             );
//             res.status(200).json(res1.data);
//         } catch (err) {
//             console.log(err.stack);
//             res.status(500).send(err.message);
//         }
//     } else {
//         res.status(403).send('Forbidden');
//     }
// });

//Setup Routes
var router = require("./router")(app, server);

const port = process.env.PORT || 5003;
// app.listen(port, function () {
//     console.info('Listening on http://localhost:' + port);
// });
server.on("request", app);
server.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});
