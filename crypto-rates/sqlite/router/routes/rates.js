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

const ln = require('../../libln');

const exchange = require('../../libexchange');

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
				},
				{
					"title": "(Right-click on link and Save Link As... SecuritiesIDs.txt)",
					"path": base_path + "/downloadSupportedSecuritiesIDs"
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

	
	app.get("/downloadCryptoDataJSON", function (req, res) {

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
            // docs: "https://help.sap.com/docs/SAP_CP_BUS_REUSE_SERVICE_MRM_APP/64e0eccf2d424543be76606dd5e5e460/41ac38839ac44f90957a4e53e88ae860.html?q=market%20data",
            docs: "/rates/downloadCryptoData",
			params: "async=false",
            headers: headers,
			body: JSON.stringify(body, null, 2),
            expected_status: 200
		}));

	});
	
	app.get("/downloadCryptoData", function (req, res) {

        var headers = [
            {
                name: "Content-Type",
                value: "text/plain"
            },
            {
                name: "Accept",
                value: "text/plain"
            }
        ];

		var body = "";

		// body += '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 //EN">\n';                                
		// body += '<html>\n'; 
		// body += '<head>\n'; 
		// body += '<title>SAP Market Data Datafeed Interface Version 1.0</title>\n';
		// body += '<meta name="SAP_Internet_Market_Data_Request_Format_Version" content="text/html 1.0">\n';
		// body += '</head>\n';
		// body += '<body>\n';
		// body += 'EUR~USD:01          ECB            C              0000000000000000000000000000			\n';
		// body += '</body>\n';
		// body += '</html>\n';

		body += '<!DOCTYPE HTML PUBLIC "-//W3C//DTD HTML 3.2 //EN">\n';
		body += '<html>\n';
		body += '<head>\n';
		body += '<title>SAP Market Data Datafeed Interface Version 1.0</title>\n';
		body += '<meta name="SAP_Internet_Market_Data_Request_Format_Version" content="text/html 1.0">\n';
		body += '<meta name="TableRow1" content="RINID1    Instrument Name">\n';
		body += '<meta name="TableRow1_Length" content="20">\n';
		body += '<meta name="TableRow2" content="RINID2    Data Source">\n';
		body += '<meta name="TableRow2_Length" content="15">\n';
		body += '<meta name="TableRow3" content="SPRPTY    Instrument Property">\n';
		body += '<meta name="TableRow3_Length" content="15">\n';
		body += '<meta name="TableRow4" content="DFROMDATE Historical Data Start Date">\n';
		body += '<meta name="TableRow4_Length" content="8">\n';
		body += '<meta name="TableRow5" content="DFROMTIME Historical Data Start Time">\n';
		body += '<meta name="TableRow5_Length" content="6">\n';
		body += '<meta name="TableRow6" content="DTODATE Historical Data End Date">\n';
		body += '<meta name="TableRow6_Length" content="8">\n';
		body += '<meta name="TableRow7" content="DTOTIME Historical Data End Time">\n';
		body += '<meta name="TableRow7_Length" content="6">\n';
		body += '<meta name="TableRow8" content="UNAME     SAP User Requesting">\n';
		// body += '<meta name="TableRow8_Length" content="12">\n';
		// body += '<meta name="SAP_Internet_Market_Data_Answer_Format_Version" content="text/plain 1.0">\n';
		// body += '<meta name="TableRow1" content="RINID1    Instrument Name">\n';
		// body += '<meta name="TableRow1_Length" content="20">\n';
		// body += '<meta name="TableRow2" content="RINID2    Data Source">\n';
		// body += '<meta name="TableRow2_Length" content="15">\n';
		// body += '<meta name="TableRow3" content="SPRPTY    Instrument Property">\n';
		// body += '<meta name="TableRow3_Length" content="15">\n';
		// body += '<meta name="TableRow4" content="SSTATS Request Status: Blanks, if ok ">\n';
		// body += '<meta name="TableRow4_Length" content="2">\n';
		// body += '<meta name="TableRow5" content="ERROR Error Message relating to STATUS ">\n';
		// body += '<meta name="TableRow5_Length" content="80">\n';
		// body += '<meta name="TableRow6" content="RSUPID Data source">\n';
		// body += '<meta name="TableRow6_Length" content="10">\n';
		// body += '<meta name="TableRow7" content="RCONID Contributor Identification">\n';
		// body += '<meta name="TableRow7_Length" content="10">\n';
		// body += '<meta name="TableRow8" content="RCONCN Contributor Country Identification">\n';
		// body += '<meta name="TableRow8_Length" content="5">\n';
		// body += '<meta name="TableRow9" content="DATE Date in YYYYMMDD Format">\n';
		// body += '<meta name="TableRow9_Length" content="8">\n';
		// body += '<meta name="TableRow10" content="TIME Time in HHMMSS Format">\n';
		// body += '<meta name="TableRow10_Length" content="6">\n';
		// body += '<meta name="TableRow11" content="VALUE Value with decimal point optionally">\n';
		// body += '<meta name="TableRow11_Length" content="20">\n';
		// body += '<meta name="TableRow12" content="CURRENCY Currency Information for security prices">\n';
		// body += '<meta name="TableRow12_Length" content="5">\n';
		// body += '<meta name="TableRow13" content="MKIND Market Indicator for security prices">\n';
		// body += '<meta name="TableRow13_Length" content="5">\n';
		// body += '<meta name="TableRow14" content="CFFACT Currency: From factor">\n';
		// body += '<meta name="TableRow14_Length" content="7">\n';
		// body += '<meta name="TableRow15" content="CTFACT Currency: To factor">\n';
		// body += '<meta name="TableRow15_Length" content="7">\n';
		// body += '<meta name="TableRow16" content="UNAME Currency: User Name">\n';
		// body += '<meta name="TableRow16_Length" content="12">\n';
		// body += '<meta name="TableRow17" content="RZUSATZ Volatilities: Number of Days">\n';
		// body += '<meta name="TableRow17_Length" content="10">\n';
		body += '<meta name="TableRow18" content="NEWLINE Line Feed Character/Newline">\n';
		body += '<meta name="TableRow18_Length" content="1">\n';
		body += '</head>\n';
		body += '<body>\n';
		body += 'EUR~USD:01          ST             CLOSE          0000000000000000000000000000ALUNDE\n';
		body += '</body>\n';
		body += '</html>\n';

		// https://launchpad.support.sap.com/#/notes/2431370
		// https://help.sap.com/docs/SAP_S4HANA_CLOUD/e5ec5859d8e54df98492d80564a734c0/3c513ff5d5f1468d81dd84a7743256a2.html?locale=en-US
		// https://help.sap.com/docs/SAP_CP_BUS_REUSE_SERVICE_MRM_APP/64e0eccf2d424543be76606dd5e5e460/41ac38839ac44f90957a4e53e88ae860.html?q=market%20data

		res.send(nunjucks.render('templates/apitestbody.njk', { 
			title: "Download API Test JSON",
			base: base_path,
            path: "downloadCryptoData",
			// docs: "https://help.sap.com/docs/SAP_CP_BUS_REUSE_SERVICE_MRM_APP/64e0eccf2d424543be76606dd5e5e460/41ac38839ac44f90957a4e53e88ae860.html?q=market%20data",
            docs: "/rates/downloadCryptoDataJSON",
			params: "async=false",
            headers: headers,
			body: body,
            expected_status: 200
		}));

	});
	
	app.get("/downloadSupportedSecuritiesIDs", function (req, res) {

		// Ensure that you have authorizations for transaction TBD2 at the start of the program. To import data via the application server (that is, no PC upload), you need authorizations to access files from ABAP/4 programs.

		// File with the following file format:

		// Name	Type	Length	Example
		// Instrument name	CHAR	20	=FSAG
		// Data source/Producer/Source	CHAR	15	QFRecord
		// Securities price type/no.	CHAR	13	716460
		// Note:
		
		// This file is supplied by the support department of the datafeed provider. All file lines in the file supplied must have this structure. Other file lines are not permitted! Each of the fields must be filled, and the field length must be filled with blank characters if the entry does not fill the field entirely. Tabs are not permitted. The datafeed provider is responsible for the correct structure of this file. You should contact the datafeed provider first if you have problems relating to this report.
		
		
		var responseBody = "";

		var instrumentName = '=FSAG 78901234567890';	// CHAR 20
		var dataSource     = 'QFRecord 012345'; 		// CHAR 15
		var securitiesPriceNo = '716460 890123';		// CHAR 13

		responseBody += instrumentName + dataSource + securitiesPriceNo + '\n';

		// Grayscale Bitcoin Trust (BTC) (GBTC) https://finance.yahoo.com/quote/GBTC?p=GBTC&.tsrc=fin-srch
		// 19.24 As of 03:14PM EDT. 2023-08-04
		//instrumentName    '12345678901234567890';	// CHAR 20
		instrumentName    = '=GBTC               ';	// CHAR 20
		//dataSource        '123456789012345'; 		// CHAR 15
		dataSource        = 'Yahoo          '; 		// CHAR 15
		//securitiesPriceNo '1234567890123';		// CHAR 13
		securitiesPriceNo = '716460       ';		// CHAR 13

		responseBody += instrumentName + dataSource + securitiesPriceNo + '\n';

		console.log("Returning TEXT: \n" + responseBody + "\n");
		res.setHeader('Content-Type','text/plain');
		return res.status(200).send(responseBody);
	});

	var TYPE = process.env['npm_config_type'] || 'memory';

	TYPE = "sqlite";
	
	var oauth20     = require('./../../oauth20.js')(TYPE);
	const srv = require('../../server');

	const sleep = (waitTimeInMs) => new Promise(resolve => setTimeout(resolve, waitTimeInMs));

	app.post('/downloadCryptoData', oauth20.middleware.bearer, async function (req, res) {
		
		// Check for valid access token
		if (!req.oauth2.accessToken) {
			return res.status(403).send('Forbidden');
		} else {
			var tenantID = req.oauth2.accessToken.clientId;

			// Check if the tenant_id exists.  
			var tenant = db.getTenantByID(tenantID);
			var quoteCost = 1000;	// Estimate of quote cost in satoshis
			var httpTimeoutMSecs = (29 * 1000); 
			const httpTimeoutStart = new Date();
			// Simulate a delay in generating the response
			// const simsecs = 30	// Usually times out
			// const simsecs = 29	// Just under normal browser timeout

			// const simsecs = 3	// A reasonable round trip time. Overhead is about 0.45 seconds
			// console.log("Waiting " + simsecs + " seconds.");
			// await sleep(simsecs * 1000); // sleep for simsecs seconds
			// res.setHeader('Server-Timing', 'delay;dur=' + (simsecs * 1000) + ', ' + 'app;dur=' + '1984' + ', ' + 'other;dur=' + '101');
			// console.log(simsecs + " seconds later.");

			const contentTypeHdr = req.headers["content-type"];

			const contentTypeParts = contentTypeHdr.split(";")
			
			const contentType = contentTypeParts[0].trim();

			console.log("Request Content-Type: " + contentType);

			var dataSource = "";
			var fstKey = "";
			var secKey = "";
			var instClass = "";
			var instProp = "";
			var instName = "";
			var fromDate = "";
			var fromTime = "";
			var toDate = "";
			var toTime = "";
			var reqUser = "";

			if (contentType == "application/json") {
				console.log("Requesting JSON: " + JSON.stringify(req.body,null, 2));
			} else {
				console.log("contentType: " + contentType);
				if (contentType == "text/plain") {
					const reqbody = req.body;
					console.log("Requesting TEXT: ");
					// console.log(reqbody);
					var reqLines = reqbody.split("\n");
					var processing = false;
					var fieldoff = 0;
					var fieldlen = 0;
					reqLines.forEach(line => {
						// console.log(line);
						if (line == "</body>") {
							processing = false;
						}
						if (processing) {
							console.log(line);
							//0         1         2         3         4         5         6         7         8         9   
							//0123456789012345678901234567890123456789012345678901234567890123456789012345678901234567890
							//EUR~USD:01          BINANCE        CLOSE          0000000000000000000000000000ALUNDE

							fieldoff = 0;
							fieldlen = 0;
							// <meta name="TableRow1" content="RINID1    Instrument Name">
							// <meta name="TableRow1_Length" content="20">
							fieldoff += fieldlen;
							fieldlen = 20;
							instName = line.substring(fieldoff, fieldoff+fieldlen-1).trim();
							console.log("instName: " + instName);
							const instParts = instName.split(":");
							instClass = instParts[1];
							const keyParts = instParts[0].split("~");
							fstKey = keyParts[0];
							secKey = keyParts[1];

							// <meta name="TableRow2" content="RINID2    Data Source">
							// <meta name="TableRow2_Length" content="15">
							fieldoff += fieldlen;
							fieldlen = 15;
							dataSource = line.substring(fieldoff, fieldoff+fieldlen-1).trim();
							console.log("dataSource: " + dataSource);
							// <meta name="TableRow3" content="SPRPTY    Instrument Property">
							// <meta name="TableRow3_Length" content="15">
							fieldoff += fieldlen;
							fieldlen = 15;
							instProp = line.substring(fieldoff, fieldoff+fieldlen-1).trim();
							console.log("instProp: " + instProp);
							// <meta name="TableRow4" content="DFROMDATE Historical Data Start Date">
							// <meta name="TableRow4_Length" content="8">
							fieldoff += fieldlen;
							fieldlen = 8;
							fromDate = line.substring(fieldoff, fieldoff+fieldlen-1);
							console.log("fromDate: " + fromDate);
							// <meta name="TableRow5" content="DFROMTIME Historical Data Start Time">
							// <meta name="TableRow5_Length" content="6">
							fieldoff += fieldlen;
							fieldlen = 6;
							fromTime = line.substring(fieldoff, fieldoff+fieldlen-1);
							console.log("fromTime: " + fromTime);
							// <meta name="TableRow6" content="DTODATE Historical Data End Date">
							// <meta name="TableRow6_Length" content="8">
							fieldoff += fieldlen;
							fieldlen = 8;
							toDate = line.substring(fieldoff, fieldoff+fieldlen-1);
							console.log("toDate: " + toDate);
							// <meta name="TableRow7" content="DTOTIME Historical Data End Time">
							// <meta name="TableRow7_Length" content="6">
							fieldoff += fieldlen;
							fieldlen = 6;
							toTime = line.substring(fieldoff, fieldoff+fieldlen-1);
							console.log("toTime: " + toTime);
							// <meta name="TableRow8" content="UNAME     SAP User Requesting">
							// <meta name="TableRow8_Length" content="12">
							fieldoff += fieldlen;
							fieldlen = 12;
							reqUser = line.substring(fieldoff, fieldoff+fieldlen-1).trim();
							console.log("reqUser: " + reqUser);

						}
						if (line == "<body>") {
							processing = true;
						}
					});
				
				} else {
					console.log("Returning 415 Unexpected Content-Type: " + contentType);
					return res.status(415).send("Unexpected Content-Type: " + contentType);
				}
			}

			if ((tenant) && (typeof tenant == "object")) {

				var serverTiming = "";

				// Make an estimate of what the crypto rate request will cost
				// quoteCost = getQuoteCost(req.body);
				const startdate = new Date()
				
				// const nodeinfo = await ln.getNodeInfo();
				// console.log(`ln: ${JSON.stringify(nodeinfo.alias, null, 2)}`);

				const enddate = new Date();
				const duration = enddate - startdate;

				serverTiming += 'ln;dur=' + duration;

				const quote = await exchange.getQuote("EUR~USD");
				console.log(`quote: ${JSON.stringify(quote, null, 2)}`);
				
				const enddate2 = new Date();
				const duration2 = enddate2 - enddate;

				serverTiming += ', ' + 'ex;dur=' + duration2;


				// tenant.satoshi = quote;

				// What plan are they on?  Free, Monthly?
				if (tenant.plan == "F") {
					// Need to fetch first and invoice after
					// Check if they have any satoshi credits
					if (false) {
						// Deduct from the tenant's satoshi total
						// Return the results
						tenant.satoshi = quote;
						return res.status(200).json(tenant);
					} else {
						// Check if they have a lightning wallet registered
						if (tenant.pubkey !== "") {

							// Check if the last lightning invoice was paid properly

							// Check to see if this tenant has an established socket connection

							if (true) {
								
								var pending = false;

								if (false) {
									// Calculate the invoice cost

									// Create the invoice

									const newInvoice = await ln.getNewInvoiceInfo({lnd: lnd, tokens: 19, description: "next invoice 19"});
									console.log(`newInvoice: ${JSON.stringify(newInvoice, null, 2)}`);

									if (typeof newInvoice == "object") {
										const deletedPayments = ln.delPendingPayments(tenantID);
										console.log(`deletedPayments: ${JSON.stringify(deletedPayments, null, 2)}`);

										const addedPayment = ln.addPendingPayment(tenantID,newInvoice.id);
										console.log(`addedPayment: ${JSON.stringify(addedPayment, null, 2)}`);

									} else {
										console.log("Unable to create a new invoice.  Is LND available?");
									}
									const enddate3 = new Date()
									const duration3 = enddate3 - enddate2;
									serverTiming += ', ' + 'in;dur=' + duration3;
									
									const httpTimeoutEnd = new Date();
									const mSecsLeftToWaitForPayment = httpTimeoutMSecs - (httpTimeoutEnd - httpTimeoutStart);
									console.log("mSecsLeftToWaitForPayment: " + mSecsLeftToWaitForPayment);

									// Need to figure out how to block and wait
									// Wait for payment confirmation

									// Cause the invoice to be sent to the browser
									pending = false;
									const waitInterval = 1000;
									var secsLeftToWait = Math.floor(mSecsLeftToWaitForPayment / waitInterval);
									console.log("secsLeftToWait: " + secsLeftToWait);

									console.log("\n\n" + "Pay this invoice quickly:\n\n");
									console.log(newInvoice.request);
									console.log("\n\n");
									srv.sendInvoice(newInvoice.request);

									process.stdout.write("sleep: ");

									for (var i=0; i<secsLeftToWait; i++) {
										pending = ln.isPaymentPending(tenantID,newInvoice.id);
										if (!pending) {
											break;
										}

										// process.stdout.write("\b" + (secsLeftToWait - i));
										console.log("Secs to timeout: " + (secsLeftToWait - i));
										await sleep(waitInterval); // sleep for a second
									}

									console.log("\n");

									const enddate4 = new Date()
									const duration4 = enddate4 - enddate3;
									serverTiming += ', ' + 'py;dur=' + duration4;
								}
								
								if (pending) {	// i.e. timed out while still pending
									console.log("...timed out");
									// When paid, return the quotes
									tenant.satoshi = 0;
									// Return the results
									res.setHeader('Server-Timing', serverTiming);
									return res.status(408).send("timed out");
								} else {
									// When paid, return the quotes
									tenant.satoshi = quote;
									// Return the results
									var responseBody = "";

									// responseBody += 'BTC'; // fstKey
									responseBody += fstKey; 
									responseBody += '~';
									// responseBody += 'USD';
									responseBody += secKey;
									responseBody += ':';
									// responseBody += '01';// instClass
									responseBody += instClass;
									responseBody += '          ';
									// responseBody += 'ECB            ';
									// responseBody += 'ST             ';
									// responseBody += 'BINANCE        ';
									responseBody += dataSource.padEnd(15, ' ');
									// responseBody += 'CLOSE                                                                                                                     ';
									responseBody += instProp.padEnd(122, ' ');; // Pad to 123
									responseBody += '20230801';
									responseBody += '000000';
									responseBody += '9040.23000';
									responseBody += '                                                      ';
console.log('EUR~USD:01          ECB            CLO                                                                                                                       201805010000001.2310000000                                                      ');
console.log(responseBody);
									res.setHeader('Server-Timing', serverTiming);
									if (contentType == "application/json") {
										console.log("Returning JSON: " + JSON.stringify(tenant,null, 2));
										return res.status(200).json(tenant);
									} else {
										console.log("contentType: " + contentType);
										if (contentType == "text/plain") {
											console.log("Returning TEXT: \n" + responseBody);
											return res.status(200).send(responseBody);
										} else {
											console.log("Returning 415 Unsupported Content-Type: " + contentType);
											return res.status(415).send("Unsupported Content-Type: " + contentType);
										}
									}
								}
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

	app.post('/getNickFromPubKey', function (req, res) {
		
		if (((typeof req) == "object") && ((typeof req.body) == "object")) {
			const resobj = db.get_nick_from_pubkey(req.body.pubkey);
			res.status(200).json({"result": true, "nick": resobj.nick, "tenant": resobj.tenant});
		} else {
			res.status(200).json({"status": "unexpected body"});
		}
	});

    // https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md

	return app;
};