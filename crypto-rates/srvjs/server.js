const express = require('express');
const app = express();

const xsenv = require('@sap/xsenv');
xsenv.loadEnv();
const services = xsenv.getServices({
    uaa: { label: 'xsuaa' }
});

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

// app user info
app.get('/srvjs/info', function (req, res) {
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

// app user info
app.get('/adm/info', function (req, res) {
    if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
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

const port = process.env.PORT || 5002;
app.listen(port, function () {
    console.info('Listening on http://localhost:' + port);
});