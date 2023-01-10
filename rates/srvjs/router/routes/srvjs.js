/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const nunjucks = require('nunjucks');
const util = require('util');
const base_path = "/srvjs";

module.exports = () => {
	var app = express.Router();

	//SRV
	app.get("/", (req, res) => {
        console.log("served from srv.js");
        // console.log(util.inspect(req.hostname, {depth: 1}));
        //console.log(req.headers['x-forwarded-host']);
		res.setHeader('Content-Type', 'application/json');
		res.end(util.inspect(req.headers, {depth: 1}));
	});

	app.get("/links", function (req, res) {
		res.send(nunjucks.render('templates/links.njk', { 
			title: "SRV Links",
			base: base_path,
			links: [
				{
					"title": "Links",
					"path": base_path + "/links"
				},
				{
					"title": "Links2",
					"path": base_path + "/links2"
				}
			]
		}));
	});
	
	app.get("/links2", function (req, res) {
		res.send(nunjucks.render('templates/links.njk', { 
			title: "SRV Links2",
			base: base_path,
			links: [
				{
					"title": "Links1",
					"path": base_path + "/links"
				},
				{
					"title": "Links2",
					"path": base_path + "/links2"
				},
				{
					"title": "Info",
					"path": base_path + "/info"
				}
			]
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

	return app;
};