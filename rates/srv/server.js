const express = require('express');
const app = express();
var server = require("http").createServer();

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: { label: 'xsuaa' },
    registry: { label: 'saas-registry' },
    dest: { label: 'destination' }
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

const lib = require('./library');

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
app.get(['/','/noauth','/srv/noauth'], function (req, res) {
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

app.all("*", function (req, res, next) {

    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log(req.method + " " + hostname + req.url);
    next();

});

// subscribe/onboard a subscriber tenant
app.put('/callback/v1.0/tenants/*', PassportAuthenticateMiddleware, function (req, res) {
    if (!req.authInfo.checkLocalScope('Callback')) {
        console.log('Forbidden: Subscribe requires Callback scope!');
        res.status(403).send('Forbidden');
        return;
    }
    let tenantURL = 'https:\/\/' + req.body.subscribedSubdomain + '-' + services.registry.appName + '-app.' + process.env.clusterDomain;
    console.log('Subscribe:', req.body.subscribedSubdomain, req.body.subscribedTenantId, tenantURL);
    // create route
    lib.createRoute(req.body.subscribedSubdomain, services.registry.appName + '-app').then(
        function (result) {
            res.status(200).send(tenantURL);
        },
        function (err) {
            console.log(err.stack);
            res.status(500).send(err.message);
        });
});

// unsubscribe/offboard a subscriber tenant
app.delete('/callback/v1.0/tenants/*', PassportAuthenticateMiddleware, function (req, res) {
    if (!req.authInfo.checkLocalScope('Callback')) {
        console.log('Forbidden: Unsubscribe requires Callback scope!');
        res.status(403).send('Forbidden');
        return;
    }
    console.log('Unsubscribe:', req.body.subscribedSubdomain, req.body.subscribedTenantId);
    // delete route
    lib.deleteRoute(req.body.subscribedSubdomain, services.registry.appName + '-app').then(
        function (result) {
            res.status(200).send('');
        },
        function (err) {
            console.log(err.stack);
            res.status(500).send(err.message);
        });
});

// get reuse service dependencies
app.get('/callback/v1.0/dependencies', PassportAuthenticateMiddleware, function (req, res) {
    if (!req.authInfo.checkLocalScope('Callback')) {
        console.log('Forbidden: Dependencies requires Callback scope!');
        res.status(403).send('Forbidden');
        return;
    }
    let dependencies = [{
        'xsappname': services.dest.xsappname
    }];
    console.log('Dependencies:', dependencies);
    res.status(200).json(dependencies);
});

// app user info
app.get('/app/info', function (req, res) {
    let info = {
        'path': '/app/info'
    };
    res.status(200).json(info);
});

// app user info
app.get('/srv/info', PassportAuthenticateMiddleware, function (req, res) {
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

// app subscriptions
app.get('/srv/subscriptions', PassportAuthenticateMiddleware, function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
        lib.getSubscriptions(services.registry).then(
            function (result) {
                res.status(200).json(result);
            },
            function (err) {
                console.log(err.stack);
                res.status(500).send(err.message);
            });
    } else {
        res.status(403).send('Forbidden');
    }
});


// destination reuse service
app.get('/srv/destinations', PassportAuthenticateMiddleware, async function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.User')) {
        try {
            let res1 = await httpClient.executeHttpRequest(
                {
                    destinationName: req.query.destination || '',
                    jwt: retrieveJwt(req)
                },
                {
                    method: 'GET',
                    url: req.query.path || '/'
                }
            );
            res.status(200).json(res1.data);
        } catch (err) {
            console.log(err.stack);
            res.status(500).send(err.message);
        }
    } else {
        res.status(403).send('Forbidden');
    }
});

const port = process.env.PORT || 5001;
server.on("request", app);
server.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});