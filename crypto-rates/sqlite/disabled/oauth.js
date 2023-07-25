/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const nunjucks = require('nunjucks');
const util = require('util');

// const Database = require("better-sqlite3");
// const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
// db.pragma('synchronous = 2'); // Force write-through to file system

// Run tests via "npm --type=TYPE test" (types available: memory (default), sqlite are available)
var TYPE = process.env['npm_config_type'] || 'memory';

TYPE = "sqlite";

var query           = require('querystring');
var cookieParser    = require('cookie-parser');
var session         = require('express-session');
var bodyParser      = require('body-parser');

var oauth20     = require('../../oauth20.js')(TYPE);
var model       = require('./model/' + TYPE);

// Configuration for renewing refresh token in refresh token flow
oauth20.renewRefreshToken = true;


const base_path = "/oauth";

const db = require('../../library');

// https://github.com/TryGhost/node-sqlite3/wiki/API#allparam---callback

module.exports = () => {
	var app = express.Router();
	app.set('oauth2', oauth20);

	//SRV
	app.get("/", (req, res) => {
        console.log("served from oauth.js");
        // console.log(util.inspect(req.hostname, {depth: 1}));
        //console.log(req.headers['x-forwarded-host']);
		res.setHeader('Content-Type', 'application/json');
		res.end(util.inspect(req.headers, {depth: 1}));
	});

	app.get("/links", function (req, res) {
		console.log("links!");
		res.send(nunjucks.render('templates/links.njk', { 
			title: "SQLite Links",
			base: base_path,
			links: [
				{
					"title": "NoAuth",
					"path": base_path + "/noauth"
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

    // https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md

	return app;
};