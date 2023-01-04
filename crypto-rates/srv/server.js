const express = require('express');
const app = express();

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
app.use(passport.authenticate('JWT', {
    session: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const lib = require('./library');

app.get("*", function (req, res, next) {

    var hostname = "localhost";

    if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
        hostname = req.headers['x-forwarded-host'];
    }
    console.log(req.method + " " + hostname + req.url);
    // console.log(util.inspect(req, {depth: 1}));
    next();

});

app.get('/callback/links', function (req, res) {
    console.log("served from srv/server.js");
    
    console.log(req.headers['x-forwarded-host']);

    var responseStr = "";
    responseStr += "<!DOCTYPE HTML><html><head><title>Crypto Rates SRV</title></head><body><h3>Crypto Rates SRV</h3><br />";
    responseStr += "<a href=\"/callback/links\">Callback Links.</a><br />";
    responseStr += "<a href=\"/srv/info\">SRV Invo</a><br />";
    responseStr += "<br />";
    responseStr += "<a href=\"/\">Return to Root.</a><br />";
    responseStr += "</body></html>";
    res.status(200).send(responseStr);
});

// subscribe/onboard a subscriber tenant
app.put('/callback/v1.0/tenants/*', function (req, res) {
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
app.delete('/callback/v1.0/tenants/*', function (req, res) {
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
app.get('/callback/v1.0/dependencies', function (req, res) {
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
app.get('/srv/info', function (req, res) {
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
app.get('/srv/subscriptions', function (req, res) {
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
app.get('/srv/destinations', async function (req, res) {
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
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});