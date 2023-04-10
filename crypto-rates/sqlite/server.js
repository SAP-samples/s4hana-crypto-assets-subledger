const express = require('express');
const session = require('express-session');

const app = express();

app.use(express.static('static'));

var server = require("http").createServer();
const ws = require('ws');

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


// Run tests via "npm --type=TYPE test" (types available: memory (default), redis are available)
var TYPE = process.env['npm_config_type'] || 'memory';

var query           = require('querystring');
var cookieParser    = require('cookie-parser');
var bodyParser      = require('body-parser');

// var server      = express();    // server == app here
var oauth20     = require('./oauth20.js')(TYPE);
var model       = require('./model/' + TYPE);

// Configuration for renewing refresh token in refresh token flow
oauth20.renewRefreshToken = true;

app.set('oauth2', oauth20);

// Middleware
app.use(cookieParser());
// app.use(session({ secret: 'oauth20-provider-test-server', resave: false, saveUninitialized: false }));

// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());


app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(oauth20.inject());


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
app.get(['/noauth','/sqlite','/sqlite/noauth','/socket','/socket/noauth'], function (req, res) {
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
    responseStr += "<a href=\"/spfi/links\">SPFI Links</a> no authorization.<br />";
    responseStr += "<a href=\"/spfi/noauth\">SPFI NoAuth</a> no authorization.<br />";
    responseStr += "<a href=\"/socket/links\">Socket Links</a> no authorization.<br />";
    responseStr += "<a href=\"/socket/noauth\">Socket NoAuth</a> no authorization.<br />";
    responseStr += "<a href=\"/oauth/links\">oauth Links</a> no authorization.<br />";
    responseStr += "<a href=\"/noauth\">NoAuth</a> no authorization.<br />";
    responseStr += "<br />";
    responseStr += "<a href=\"/\">Return to SQLite Root.</a><br />";
    responseStr += "</body></html>";
    res.status(200).send(responseStr);
});


// These are now in routes/oauth.js

// Define OAuth2 Token Endpoint
// app.post('/oauth/token', oauth20.controller.token);

// Some secure client method
// app.get('/oauth/client', oauth20.middleware.bearer, function(req, res) {
//     if (!req.oauth2.accessToken) return res.status(403).send('Forbidden');
//     res.send('Hi! Dear client ' + req.oauth2.accessToken.clientId + '!');
// });


// No authorization for anything prefixed with /spfi/ or /socket/
app.all(["/spfi/*","/meter/*"], function (req, res, next) {
    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log("-" + req.method + " " + hostname + req.url);
    // console.log(util.inspect(req.authInfo, {depth: 1}));
    next();
});

// Require authorization for anything prefixed with /admin or /sqlite
// app.get(["^\/admin\/\/*","^\/sqlite\/\/*"], PassportAuthenticateMiddleware, function (req, res, next) {
app.get(["/sqlite*","/admin*"], PassportAuthenticateMiddleware, function (req, res, next) {
    console.log("Check for Auth...");
    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log("+" + req.method + " " + hostname + req.url);
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

// Set up a headless websocket server that prints any
// events that come in.
const wsServer = new ws.Server({ noServer: true });

var client_cnt = 0;

wsServer.on('connection', (socket, req) => {

    console.log('New Client Joining...');
    const searchParams = new URLSearchParams(req.url);
    console.log(searchParams.getAll("tenantid"));
    console.log('token: ' + JSON.stringify(req.url,null,2));
    const qparts = req.url.split("=");
    console.log('qparts: ' + JSON.stringify(qparts,null,2));

    if (qparts[0] == "/?tenantid") {
        socket['tenantid']= qparts[1];
    } else {
        socket['tenantid']= 'unknown';
    }

    client_cnt = 0;
    wsServer.clients.forEach(client => {
        client_cnt++;
    });
    console.log('number of clients: ' + client_cnt);

    // ----
    var deviceId = null;
    var deviceStatus = deviceStatus || null;
    // ----
  
    socket.on('message', message => {
        console.log('Received:' + message);
        var is_cmd = false;
        var parts = message.split(':');
        if (parts.length > 1) {
            console.log('parts: ' + JSON.stringify(parts,null,2));
            if (parts.length > 2) {
                if (parts[1] == "cmd") {
                    console.log('Is Command');
                    is_cmd = true;
                    switch (parts[2]) {
                        case "getnick":
                            console.log('GetNick!!');
                            break;
                        case "setnick":
                            if (parts.length > 3) {
                                console.log('SetNick: ' + parts[3]);
                                // Do the nickname setting logic
                            } else {
                                console.log('SetNick: ' + 'needs a nickname.');
                            }
                            break;
                        default:
                            console.log('Default!!');
                    }                    
                } else {
                    console.log('Not Command');
                }
            } else {
                console.log('Not Command');
            }
        } else {
            // console.log('Malformed Message');
            // ---
            console.log('Websocket Chart');
            deviceId = message;
            deviceStatus = (deviceStatus == "On") ? "Off" : "On";
            // ---
        }
        if (!is_cmd) {
            broadcast(message);
        }
    });

    // --- Uncomment for /socket/chart
    var intervalID = setInterval(myCallback, 2000);

    function myCallback() {
        getTemp(deviceId).then((t)=>{
        socket.send(JSON.stringify({
        "DeviceID": deviceId,
        "State": deviceStatus,
        "Temperature": t
        }))

    })
    }

    function getTemp(d) {
    return new Promise((resolve, reject) => {
        let t = null;
        if (deviceStatus == "On")
        t = Math.floor(Math.random()*100)/2 + 50;
        else t = "N/A";
        resolve(t);
    })
    }
    // ---
    
    socket.on('close', function close() {
        console.log('Disconnected...');
        client_cnt = 0;
        wsServer.clients.forEach(client => {
            client_cnt++;
        });
        console.log('number of clients: ' + client_cnt);    
    });
    
});

wsServer.on('error', error => {
    console.log('Server Error...' + error);
});

function broadcast(data) {

    var idx = 1;
    wsServer.clients.forEach(client => {
        // console.log("client: " + JSON.stringify(client, null, 2));
        console.log("client: " + idx + " " + client.tenantid);

        if (client.readyState === ws.OPEN) {
            client.send(data);
        }
        idx++;
    });
}

function notify_tenant(tenantid,data) {

    var idx = 1;
    wsServer.clients.forEach(client => {
        // console.log("client: " + JSON.stringify(client, null, 2));
        console.log("client: " + idx + " " + client.tenantid);

        if ((client.tenantid == tenantid) && (client.readyState === ws.OPEN)) {
            client.send(data);
        }
        idx++;
    });
}


// Function to generate random number
function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}

// --- Uncomment for /socket/chat
let myVar = setInterval(myTimer, (10 * 1000));

function myTimer() {
    const d = new Date();
    broadcast("SYS~" + d.toLocaleTimeString()+"~"+randomNumber(1,13));
}

server.on('upgrade', (request, socket, head) => {
    wsServer.handleUpgrade(request, socket, head, socket => {
      wsServer.emit('connection', socket, request);
    });
  });

const port = process.env.PORT || 5003;
// app.listen(port, function () {
//     console.info('Listening on http://localhost:' + port);
// });
server.on("request", app);
server.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});
