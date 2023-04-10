/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");

const nunjucks = require('nunjucks');
const util = require('util');

var port = process.env.PORT || 8080;

// const Database = require("better-sqlite3");
// const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
// db.pragma('synchronous = 2'); // Force write-through to file system

const base_path = "/rates";

const db = require('../../library');

// https://github.com/TryGhost/node-sqlite3/wiki/API#allparam---callback

module.exports = () => {
	var app = express.Router();

	app.use(express.static('static'));

	//SRV
	app.get("/", (req, res) => {
        console.log("served from meter.js");
        // console.log(util.inspect(req.hostname, {depth: 1}));
        //console.log(req.headers['x-forwarded-host']);
		res.setHeader('Content-Type', 'application/json');
		res.end(util.inspect(req.headers, {depth: 1}));
	});

	app.get("/links", function (req, res) {
		console.log("links!");
		res.send(nunjucks.render('templates/links.njk', { 
			title: "Rates Links",
			base: base_path,
			links: [
				{
					"title": "SignUp",
					"path": base_path + "/signup"
				},
				{
					"title": "Chat",
					"path": base_path + "/chat"
				},
				{
					"title": "Chart",
					"path": base_path + "/chart"
				},
				{
					"title": "RT",
					"path": base_path + "/rt"
				},
				{
					"title": "Watch",
					"path": base_path + "/watch"
				},
				{
					"title": "Download",
					"path": base_path + "/downloadCryptoData"
				},
				{
					"title": "Info",
					"path": base_path + "/info"
				}
			]
		}));
	});
	
	var TYPE = process.env['npm_config_type'] || 'memory';

	TYPE = "sqlite";
	
	var oauth20     = require('./../../oauth20.js')(TYPE);

	app.get("/main.js", function (req, res) {
		var tenantid = "";
		console.log("req.query: " + JSON.stringify(req.query));
		tenantid = req.query.tenantid;

		var chatServerURL = "ws://localhost:" + port + "?tenantid=" + tenantid;
		//var chatServerURL = "wss://chat-srv.cfapps.us10.hana.ondemand.com";
	
		// If deployed in BTP CF then pick the first uri found in VCAP_APPLICATION
		if (typeof process !== 'undefined' && process) {
			if (typeof process.env !== 'undefined' && process.env) {
				if (typeof process.env.VCAP_APPLICATION !== 'undefined' && process.env.VCAP_APPLICATION) {
					const vcap_app = JSON.parse(process.env.VCAP_APPLICATION);
					if (typeof vcap_app.uris !== 'undefined' && vcap_app.uris) {
						chatServerURL = "wss://" + vcap_app.uris[0];
					}
				}
			}
		}
	
		// If deployed in BTP Kyma then derive hostname from KUBERNETES_SERVICE_HOST & HOSTNAME
		// Local testing of this logic
		// export KUBERNETES_SERVICE_HOST=api.fe879d9.kyma.internal.live.k8s.ondemand.com
		// export HOSTNAME=socketchat-68db7dcc66-c924m
		if (typeof process !== 'undefined' && process) {
			if (typeof process.env !== 'undefined' && process.env) {
				if (typeof process.env.KUBERNETES_SERVICE_HOST !== 'undefined' && process.env.KUBERNETES_SERVICE_HOST) {
					const service_host = process.env.KUBERNETES_SERVICE_HOST;
					if (typeof process.env.HOSTNAME !== 'undefined' && process.env.HOSTNAME) {
						const host_name = process.env.HOSTNAME;
	
						var svc_parts = service_host.split(".");
						var hst_parts = host_name.split("-");
						// chatServerURL = "wss://" + hst_parts[0] + service_host.substr(svc_parts[0].length, service_host.length - svc_parts[0].length);
						// chatServerURL = "wss://" + hst_parts[0] + "." + svc_parts[1] + ".kyma.shoot.live.k8s-hana.ondemand.com";
						chatServerURL = "wss://" + "socketchat" + "." + "cryptoassetssubledger.com";
	
					}
				}
			}
		}
	
		console.log("chatServerURL: " + chatServerURL);
		
		res.send(nunjucks.render('templates/main.njk', { 
			title: "SocketChat",
			chatServerURL: chatServerURL
		}));
	});
	
	app.get("/chat", function (req, res) {
		console.log("req.query: " + JSON.stringify(req.query));
		res.send(nunjucks.render('templates/socketchat.njk', { 
			title: "SocketChat",
			tenantid: req.query.tenantid,
			base: base_path
		}));
	});

	app.get("/authchat", oauth20.middleware.bearer, function (req, res) {
		res.send(nunjucks.render('templates/socketchat.njk', { 
			title: "SocketChat",
			base: base_path
		}));
	});

	app.get("/chart", function (req, res) {
		res.send(nunjucks.render('templates/chart.njk', { 
			title: "Real-Time",
			base: base_path
		}));
	});

	app.get("/rt", function (req, res) {
		res.send(nunjucks.render('templates/realtime.njk', { 
			title: "Real-Time",
			base: base_path
		}));
	});

	app.get("/watch", function (req, res) {
		var tenantid = "unknown";
		if (((typeof req.query) != "unknown") && ((typeof req.query.tenantid) != "unknown")) {
			console.log(JSON.stringify(req.query));
			tenantid = req.query.tenantid;
		}
		res.send(nunjucks.render('templates/watch.njk', { 
			title: "Meter Watch",
			base: base_path,
			tenantid: tenantid
		}));
	});

	app.get("/signup", function (req, res) {
		res.send(nunjucks.render('templates/signup.njk', { 
			title: "Sign Up",
			base: base_path
		}));
	});
	
	// app user info
	app.get('/info', function (req, res) {
		
		var user = "unknown";
		var subdomain = "unknown";
		var tenant = "unknown";

		if (((typeof req) == "object") && ((typeof req.authInfo) == "object")) {
			user = req.user;
			subdomain = req.authInfo.getSubdomain();
			tenant = req.authInfo.getZoneId();
		}

		let info = {
			'userInfo': user,
			'subdomain': subdomain,
			'tenantId': tenant
		};

		if (((typeof req) == "object") && ((typeof req.authInfo) == "object") && req.authInfo.checkScope('$XSAPPNAME.User')) {
			res.status(200).json(info);
		} else {
			res.status(403).send('Forbidden');
		}
	});

	
	app.get("/downloadCryptoData", function (req, res) {

        var headers = [
            {
                name: "Content-Type",
                value: "application/json"
            },
            {
                name: "Accept",
                value: "application/json"
            }
        ];

		var body = [
			{
			  "providerCode": "ECB",
			  "marketDataSource": "ECB",
			  "marketDataCategory": "01",
			  "marketDataKey": "EUR~USD",
			  "marketDataProperty": "CLO",
			  "fromDate": "0000-00-00",
			  "fromTime": "00:00:00",
			  "toDate": "0000-00-00",
			  "toTime": "00:00:00"
			}
		];

		// https://launchpad.support.sap.com/#/notes/2431370
		// https://help.sap.com/docs/SAP_S4HANA_CLOUD/e5ec5859d8e54df98492d80564a734c0/3c513ff5d5f1468d81dd84a7743256a2.html?locale=en-US
		// https://help.sap.com/docs/SAP_CP_BUS_REUSE_SERVICE_MRM_APP/64e0eccf2d424543be76606dd5e5e460/41ac38839ac44f90957a4e53e88ae860.html?q=market%20data

		res.send(nunjucks.render('templates/apitestbody.njk', { 
			title: "Download API Test JSON",
			base: base_path,
            path: "downloadCryptoData",
            docs: "https://help.sap.com/docs/SAP_CP_BUS_REUSE_SERVICE_MRM_APP/64e0eccf2d424543be76606dd5e5e460/41ac38839ac44f90957a4e53e88ae860.html?q=market%20data",
			params: "async=false",
            headers: headers,
			body: JSON.stringify(body, null, 2),
            expected_status: 200
		}));

	});

	var TYPE = process.env['npm_config_type'] || 'memory';

	TYPE = "sqlite";
	
	var oauth20     = require('./../../oauth20.js')(TYPE);

	app.post('/downloadCryptoData', oauth20.middleware.bearer, function (req, res) {
		
		// Check for valid access token
		if (!req.oauth2.accessToken) {
			return res.status(403).send('Forbidden');
		} else {
			var tenantID = req.oauth2.accessToken.clientId;

			// Check if the tenant_id exists.  
			var tenant = db.getTenantByID(tenantID);
			var quoteCost = 1000;	// Estimate of quote cost in satoshis

			if ((tenant) && (typeof tenant == "object")) {

				// Make an estimate of what the crypto rate request will cost
				// quoteCost = getQuoteCost(req.body);

				
				// What plan are they on?  Free, Monthly?
				if (tenant.plan == "F") {
					// Need to decide if we want to fetch first and invoice after or invoice first
					// Check if they have any satoshi credits
					if (tenant.satoshi >= quoteCost) {
						// Deduct from the tenant's satoshi total
						// Fetch the results
						// Return the results
						return res.status(200).json(tenant);
					} else {
						// Check if they have a lightning wallet registered
						if (tenant.pubkey !== "") {
							// Check if the last lightning invoice was paid properly

							// Check to see if this tenant has an established socket connection

							if (true) {
								// Fetch the results
								// Make the request to the Crypto backend(s)

								// Cause the invoice to be sent to the browser

								// Wait for payment confirmation

								// When paid, return the quotes
								// Return the results
								return res.status(200).json(tenant);
							} else {
								console.log("Problem: " + "Lightning payment require a connected Lightning wallet.");
								return res.status(403).send('Forbidden');
							}
						} else {
							console.log("Problem: " + "You need some satoshis or a Lightning wallet registered.");
							return res.status(403).send('Forbidden');
						}
					}

				} else {
					console.log("Problem: " + "Only supporting Free plan at this time.");
					return res.status(403).send('Forbidden');
				}

			} else {
				console.log("Problem: " + "getting tenant " + tenantID);
				return res.status(403).send('Forbidden');
			}


			
			
		}
	});

	app.get("/tenant", function (req, res) {

        var headers = [
            {
                name: "Content-Type",
                value: "application/json"
            },
            {
                name: "Accept",
                value: "application/json"
            }
        ];

		var body = 
			{
				"tenant": "0abbacab-5c48-4f38-120b-23495e40ec3e",
				"nick": "theGreek",
				"pubkey": "0334c29a37fe5d9d5ab8882855c75745f5b5d29cb2c6424fae138a29b248c6cd64"
			};

		res.send(nunjucks.render('templates/apitestbody.njk', { 
			title: "tenant API Test JSON",
			base: base_path,
            path: "tenant",
            docs: "",
			params: "async=false",
            headers: headers,
			body: JSON.stringify(body, null, 2),
            expected_status: 200
		}));

	});

	app.post('/tenant', function (req, res) {
	
		if (((typeof req) == "object") && ((typeof req.body) == "object")) {
			var result_obj = db.tenant_register(req.body.tenant, req.body.nick, req.body.pubkey);
			if ((typeof result_obj) == "object") {
				res.status(200).json(result_obj);
			} else {
				res.status(200).json({"status": "unexpected result."});
			}
		} else {

		}
	});

	app.get("/getNick", function (req, res) {

        var headers = [
            {
                name: "Content-Type",
                value: "application/json"
            },
            {
                name: "Accept",
                value: "application/json"
            }
        ];

		var body = 
			{
			  "nick": "theGreek"
			}
		;

		res.send(nunjucks.render('templates/apitestbody.njk', { 
			title: "getNick API Test JSON",
			base: base_path,
            path: "getNick",
            docs: "",
			params: "async=false",
            headers: headers,
			body: JSON.stringify(body, null, 2),
            expected_status: 200
		}));

	});

	app.post('/getNick', function (req, res) {
		
		if (((typeof req) == "object") && ((typeof req.body) == "object")) {
			if (db.check_nick_exists(req.body.nick)) {
				res.status(200).json({"result": true});
			} else {
				res.status(200).json({"result": false});
			}
		} else {
			res.status(200).json({"status": "unexpected body"});
		}
	});

    // https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md

	return app;
};