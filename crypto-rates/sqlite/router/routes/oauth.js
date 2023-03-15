/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const nunjucks = require('nunjucks');
const util = require('util');

// const Database = require("better-sqlite3");
// const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
// db.pragma('synchronous = 2'); // Force write-through to file system

const base_path = "/oauth";

const db = require('../../library');

// https://github.com/TryGhost/node-sqlite3/wiki/API#allparam---callback

module.exports = () => {
	var app = express.Router();

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
			title: "oauth Links",
			base: base_path,
			links: [
				{
					"title": "NoAuth",
					"path": base_path + "/noauth"
				},
				{
					"title": "Test Token",
					"path": base_path + "/test-token"
				},
				{
					"title": "Test Client",
					"path": base_path + "/test-client"
				},
				{
					"title": "DB Reg",
					"path": base_path + "/db_reg"
				},
				{
					"title": "DB List",
					"path": base_path + "/db_list"
				},
				{
					"title": "DB ADMIN",
					"path": "/admin" + "/links"
				}
			]
		}));
	});

	var TYPE = process.env['npm_config_type'] || 'memory';

	TYPE = "sqlite";
	
	var oauth20     = require('./../../oauth20.js')(TYPE);

	app.post('/token', oauth20.controller.token);

	app.get("/test-token", async function (req, res) {
        var inputs = [
            {
                id: "username",
                name: "Basic Auth username",
                desc: ".",
                type: "text",
                size: 36,
                default: "client1.id",
                required: true,
				disabled: false,
                header: true
            },
            {
                id: "password",
                name: "Basic Auth username",
                desc: ".",
                type: "text",
                size: 36,
                default: "client1.secret",
                required: true,
				disabled: false,
                header: true
            },
            {
                id: "grant_type",
                name: "Grant Type",
                desc: ".",
                type: "text",
                size: 24,
                default: "client_credentials",
                required: true,
				disabled: true,
                header: false
            }
        ];        

        var headers = [
            {
                name: "Content-Type",
                value: "application/x-www-form-urlencoded"
            },
            {
                name: "Authorization",
                value: "Basic"
            }
        ];

		res.send(nunjucks.render('templates/apitestform.njk', { 
			title: "Token API Test",
			base: base_path,
            path: "token",
            docs: "",
            headers: headers,
			inputs: inputs,
            expected_status: 200
		}));

    });

	app.get('/test-client', function(req, res) {
		res.send(nunjucks.render('templates/apitestget.njk', { 
			title: "Test Client with Authorization",
			base: base_path,
            path: "client",
            docs: "",
			params: "",
            headers: [],
			body: "",
            expected_status: 200
		}));
	});

	app.get('/client', oauth20.middleware.bearer, function(req, res) {
		if (!req.oauth2.accessToken) return res.status(403).send('Forbidden');
		res.send('Hi! Dear client ' + req.oauth2.accessToken.clientId + '!');
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

    app.get('/db_reg', function (req, res) {
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
			'action': "Register",
			'tenantId': tenant
		};

		if (((typeof req) == "object") && ((typeof req.authInfo) == "object") && req.authInfo.checkScope('$XSAPPNAME.User')) {
			if (!(db.tenant_register(tenant))) {
				res.status(200).json(info);
			} else {
				res.status(200).json('already_registered');
			}
		} else {
			res.status(403).send('Authentication required to know tenantId');
		}
    });

	app.get("/db_list", async function (req, res) {

		const rows = db.prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();
		// const rows = db_prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();

		var items = [];

		rows.forEach(row => {
			console.log(row);
			var item = {id: row.id, name: row.tenant, time: row.timeStamp};
			items.push(item);
		});

		// Something not right here.  Async???

		// items.forEach(item => {
		// 	console.log(item);
		// });

		res.send(nunjucks.render('templates/items.njk', { 
			title: "SQLite DB List Tenants",
			base: base_path,
			items: items
		}));
	});
	
    // https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md

	return app;
};