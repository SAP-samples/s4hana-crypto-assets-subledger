/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const nunjucks = require('nunjucks');
const util = require('util');

// const Database = require("better-sqlite3");
// const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
// db.pragma('synchronous = 2'); // Force write-through to file system

const base_path = "/sqlite";

const db = require('../../library');

// https://github.com/TryGhost/node-sqlite3/wiki/API#allparam---callback

module.exports = () => {
	var app = express.Router();

	//SRV
	app.get("/", (req, res) => {
        console.log("served from sqlite.js");
        // console.log(util.inspect(req.hostname, {depth: 1}));
        //console.log(req.headers['x-forwarded-host']);
		res.setHeader('Content-Type', 'application/json');
		res.end(util.inspect(req.headers, {depth: 1}));
	});

	app.get("/links", function (req, res) {
		res.send(nunjucks.render('templates/links.njk', { 
			title: "SQLite Links",
			base: base_path,
			links: [
				{
					"title": "Links2",
					"path": base_path + "/links2"
				},
				{
					"title": "NoAuth",
					"path": base_path + "/noauth"
				},
				{
					"title": "Info",
					"path": base_path + "/info"
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
					"title": "DB Test",
					"path": base_path + "/db_test"
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
	
	app.get("/db_test", async function (req, res) {

		// let tid = req.authInfo.getZoneId();

		const stmt = db.prepare(`INSERT INTO rates (rate) VALUES (?)`);
		for (let i = 1; i <= 3; i++) {
			stmt.run("rate: " + i);
		}
	
		// // const rows = db.prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();
		const rows = db.prepare(`SELECT rate, timeStamp FROM rates`).all();

		var items = [];

		var ididx = 1;
		rows.forEach(row => {
			// console.log(row);
			var item = {id: ididx, name: row.rate, time: row.timeStamp};
			items.push(item);
			ididx++;
		});

		// Something not right here.  Async???

		// items.forEach(item => {
		// 	console.log(item);
		// });

		res.send(nunjucks.render('templates/items.njk', { 
			title: "SQLite DB List Items",
			base: base_path,
			items: items
		}));
	});
	
    // https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md

	return app;
};