const express = require('express');
const app = express();

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
app.use(passport.authenticate('JWT', {
    session: false
}));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// app user info
app.get('/srvjs/info', function (req, res) {
    console.log('srvjs info');
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

// app registration
app.get('/srvjs/reg', function (req, res) {
    console.log('srvjs registration');
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

//Setup Routes
// var router = require("./router")(app, server);

const port = process.env.PORT || 5002;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});