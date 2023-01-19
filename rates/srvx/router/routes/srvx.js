/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const nunjucks = require('nunjucks');
const util = require('util');

const Database = require("better-sqlite3");
const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
db.pragma('synchronous = 2'); // Force write-through to file system

const base_path = "/srvx";

// https://sqlite.org/lang_createtable.html
function do_DB_Init() {
    console.log("do_DB_Init");

    var stmt = db.prepare('CREATE TABLE IF NOT EXISTS lorem (info TEXT)');
    var info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('CREATE TABLE IF NOT EXISTS tenant (tenantID TEXT)');
    info = stmt.run();
    console.log(info.changes);

    //db.close();
}
    
function do_DB_Fill() {
    console.log("do_DB_Fill");

    const stmt = db.prepare("INSERT INTO lorem VALUES (?)");
    for (let i = 0; i < 10; i++) {
        stmt.run("Ipsum " + i);
    }
    
    //db.close();
}

function do_DB_Register_Tenant(tenantID) {
    console.log("do_DB_Register_Tenant: " + tenantID);

    const stmt = db.prepare("INSERT INTO tenant VALUES (?)");
    stmt.run(tenantID);
    
    //db.close();
}


// https://github.com/TryGhost/node-sqlite3/wiki/API#allparam---callback
async function do_DB_Dump() {
    db.all("SELECT rowid AS id, info FROM lorem", (err, rows) => {
        if (err) {
            throw err;
        }
        else {
            var output = "";
            rows.forEach(row => {
                console.log(row.id + ": " + row.info);
                // output += row.id + ": " + row.info + "<br />\n";
                output += ".";
            });
            return output;
        }
    });
}


// https://sqlite.org/lang_droptable.html
function do_DB_Drop() {
    console.log("do_DB_Drop");
 
    var stmt = db.prepare('DROP TABLE IF EXISTS lorem');
    var info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS tenant');
    info = stmt.run();
    console.log(info.changes);

}


module.exports = () => {
	var app = express.Router();

	//SRV
	app.get("/", (req, res) => {
        console.log("served from srvx.js");
        // console.log(util.inspect(req.hostname, {depth: 1}));
        //console.log(req.headers['x-forwarded-host']);
		res.setHeader('Content-Type', 'application/json');
		res.end(util.inspect(req.headers, {depth: 1}));
	});

	app.get("/links", function (req, res) {
		res.send(nunjucks.render('templates/links.njk', { 
			title: "SRVX Links",
			base: base_path,
			links: [
				{
					"title": "Links",
					"path": base_path + "/links"
				},
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
					"title": "DB Init",
					"path": base_path + "/db_init"
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
					"title": "DB Fill",
					"path": base_path + "/db_fill"
				},
				{
					"title": "DB Dump",
					"path": base_path + "/db_dump"
				},
				{
					"title": "DB Drop",
					"path": base_path + "/db_drop"
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

	app.get('/db_init', function (req, res) {
        // x_Disable
        // if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            do_DB_Init();
            res.status(200).send('db_init');
        // } else {
            // res.status(403).send('Forbidden');
        // }
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
			do_DB_Register_Tenant(tenant);
			res.status(200).json(info);
		} else {
			res.status(403).send('Authentication required to know tenantId');
		}
    });

	app.get("/db_list", async function (req, res) {


		const rows = db.prepare(`SELECT rowid AS id, tenantID FROM tenant`).all();

		let items = [];
		var item = {id: '', other: ''};

		rows.forEach(row => {
			console.log(row);
			item.id = row.tenantID;
			item.other = row.id;
			items.push(item);
		});

		// Something not right here.  Async???

		items.forEach(item => {
			console.log(item);
		});

		res.send(nunjucks.render('templates/items.njk', { 
			title: "SRVX DB List Tenants",
			base: base_path,
			items: items
		}));
	});
	

    app.get('/db_fill', function (req, res) {
        // x_Disable
        // if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            do_DB_Fill();
            res.status(200).send('db_fill');
        // } else {
            // res.status(403).send('Forbidden');
        // }
    });

    // https://github.com/WiseLibs/better-sqlite3/blob/HEAD/docs/api.md
    app.get('/db_dump', async function (req, res) {
        // x_Disable
        // if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            var responseStr = "";
            responseStr += "<!DOCTYPE HTML><html><head><title>Crypto Rates ADM</title></head><body><h3>Crypto Rates ADM</h3><br />";
            responseStr += "DB DUMP<br />";
            const rows = db.prepare(`SELECT rowid AS id, info FROM lorem`).all();
            rows.forEach(row => {
                responseStr += row.info + "<br />";
            });
            //const dumpstuff = await do_DB_Dump();
            //responseStr += dumpstuff + "<br />";
            responseStr += "<br />";
            responseStr += "<a href=\"/\">Return to SRV Root.</a><br />";
            responseStr += "</body></html>";
            res.status(200).send(responseStr);
        // } else {
            // res.status(403).send('Forbidden');
        // }
    });

    app.get('/db_drop', function (req, res) {
        // x_Disable
        // if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            do_DB_Drop();
            res.status(200).send('db_drop');
        // } else {
            // res.status(403).send('Forbidden');
        // }
    });

	return app;
};