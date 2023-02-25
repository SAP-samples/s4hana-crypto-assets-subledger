/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");

const nunjucks = require('nunjucks');
const util = require('util');

var port = process.env.PORT || 8080;

// const Database = require("better-sqlite3");
// const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
// db.pragma('synchronous = 2'); // Force write-through to file system

const base_path = "/meter";

const db = require('../../library');

// https://github.com/TryGhost/node-sqlite3/wiki/API#allparam---callback

module.exports = () => {
	var app = express.Router();

	app.use(express.static('static'));

	//SRV
	app.get("/", (req, res) => {
        console.log("served from socket.js");
        // console.log(util.inspect(req.hostname, {depth: 1}));
        //console.log(req.headers['x-forwarded-host']);
		res.setHeader('Content-Type', 'application/json');
		res.end(util.inspect(req.headers, {depth: 1}));
	});

	app.get("/links", function (req, res) {
		console.log("links!");
		res.send(nunjucks.render('templates/links.njk', { 
			title: "Meter Links",
			base: base_path,
			links: [
				{
					"title": "Chat",
					"path": base_path + "/chat"
				},
				{
					"title": "Chart",
					"path": base_path + "/chart"
				},
				{
					"title": "Watch",
					"path": base_path + "/watch"
				},
				{
					"title": "Info",
					"path": base_path + "/info"
				},
				{
					"title": "DB ADMIN",
					"path": "/admin" + "/links"
				}
			]
		}));
	});
	
	app.get("/main.js", function (req, res) {

		var chatServerURL = "ws://localhost:" + port;
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
		res.send(nunjucks.render('templates/socketchat.njk', { 
			title: "SocketChat",
			base: base_path
		}));
	});

	app.get("/rt", function (req, res) {
		res.send(nunjucks.render('templates/realtime.njk', { 
			title: "Real-Time",
			base: base_path
		}));
	});

	app.get("/chart", function (req, res) {
		res.send(nunjucks.render('templates/chart.njk', { 
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

    // https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md

	return app;
};