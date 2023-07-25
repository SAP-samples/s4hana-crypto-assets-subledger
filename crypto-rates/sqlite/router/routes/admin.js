/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const util = require('util');
const nunjucks = require('nunjucks');

const base_path = "/admin";

const db = require('../../library');

module.exports = () => {
	var app = express.Router();

    app.get(["/","/links"], function (req, res) {
		console.log("links!");
		res.send(nunjucks.render('templates/links.njk', { 
			title: "Admin Links",
			base: base_path,
			links: [
				{
					"title": "Info",
					"path": base_path + "/info"
				},
//				{
//					"title": "DB Reg",
//					"path": base_path + "/db_reg"
//				},
                {
                    "title": "DB Init",
                    "path": base_path + "/db_init"
                },
                {
                    "title": "DB Drop",
                    "path": base_path + "/db_drop"
                },
                {
					"title": "DB List All",
					"path": base_path + "/db_list_all"
				},
                {
					"title": "DB List",
					"path": base_path + "/db_list"
				},
				{
					"title": "DB Test",
					"path": base_path + "/db_test"
				}
			]
		}));
	});

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

	app.get('/db_init', function (req, res) {
        // x_Disable
        // if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            db.init();
            res.status(200).send('db_init');
        // } else {
            // res.status(403).send('Forbidden');
        // }
    });

    app.get('/db_drop', function (req, res) {
        // x_Disable
        // if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            db.drop();
            res.status(200).send('db_drop');
        // } else {
            // res.status(403).send('Forbidden');
        // }
    });

    app.get('/db_list_all', function (req, res) {
        // x_Disable
        if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            const rows = db.list_all();
    
            var items = [];
    
            rows.forEach(row => {
                console.log(row);
                var item = {id: row.id, name: row.tenant, time: row.timeStamp};
                items.push(item);
            });
    
            res.send(nunjucks.render('templates/items.njk', { 
                title: "SQLite DB List Tenants",
                base: base_path,
                items: items
            }));
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

		const rows = db.preparer(`SELECT id, tenant, created FROM tenantInfo`).all();
		// const rows = db_prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();

		var items = [];

		rows.forEach(row => {
			console.log(row);
			var item = {id: row.id, name: row.tenant, time: row.created};
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