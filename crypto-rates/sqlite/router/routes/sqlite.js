/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const nunjucks = require('nunjucks');
const util = require('util');

const Database = require("better-sqlite3");
const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
db.pragma('synchronous = 2'); // Force write-through to file system

const base_path = "/sqlite";

// https://sqlite.org/lang_createtable.html
function do_DB_Init() {
    console.log("do_DB_Init");

    var stmt = db.prepare('CREATE TABLE IF NOT EXISTS lorem (info TEXT)');
    var info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('CREATE TABLE IF NOT EXISTS tenantInfo (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, tenant VARCHAR(256), timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('CREATE TABLE IF NOT EXISTS rates (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

// aef487d1-0879-4fb1-a8f4-2384b71226c2 CHAR(36)

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


	const rows = db.prepare(`SELECT tenant FROM tenantInfo`).all();

	var found = false;

	rows.forEach(row => {
		console.log(row);
		if (row.tenant == tenantID) {
			found = true;
		}
	});


	if (!found) {
		const stmt = db.prepare("INSERT INTO tenantInfo(tenant) VALUES (?)");
		stmt.run(tenantID);
	}

    //db.close();

	return found;
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

function db_prepare(sqlinput) {
	var sqlout = 'SELECT now()';

	if (true) {

		var sqlin = sqlinput.trim();

		console.log("  sqlin:" + sqlin + ":");

		switch((sqlin.substring(0,6)).toUpperCase()) {
			case "SELECT":
				console.log("SELECT!");
				// `SELECT rate, timeStamp FROM rates`
				sqlout = sqlin;
				// `SELECT rate, timeStamp FROM rates WHERE tenant = tenantID`
				sqlout += " WHERE tenant = '" + gtid + "'";
				break;
			case "INSERT":
				console.log("INSERT!");
				// `INSERT INTO rates (rate) VALUES (?)`
				var columnsLeftParamIdx = sqlin.indexOf('(');
				var valuesLeftParamIdx = sqlin.indexOf('(', (columnsLeftParamIdx + 1));

				sqlout = sqlin.substring(0,columnsLeftParamIdx); 
				sqlout += '(tenant,';
				sqlout += sqlin.substring((columnsLeftParamIdx+1),valuesLeftParamIdx);
				sqlout += "('" + gtid + "',";
				sqlout += sqlin.substring((valuesLeftParamIdx+1));
				// `INSERT INTO rates (tenant,rate) VALUES (tenantID,?)`
				break;
			case "DELETE":
				console.log("DELETE!");
				// `SELECT rate, timeStamp FROM rates`
				sqlout = sqlin;
				// `SELECT rate, timeStamp FROM rates WHERE tenant = tenantID`
				sqlout += " WHERE tenant = '" + gtid + "'";
				break;
			default:
				break;
		}
		console.log(" sqlout:" + sqlout + ":");
	}

	return db.prepare(sqlout);
}

// https://sqlite.org/lang_droptable.html
function do_DB_Drop() {
    console.log("do_DB_Drop");
 
    var stmt = db.prepare('DROP TABLE IF EXISTS lorem');
    var info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS tenantInfo');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS rates');
    info = stmt.run();
    console.log(info.changes);

}


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
			if (!(do_DB_Register_Tenant(tenant))) {
				res.status(200).json(info);
			} else {
				res.status(200).json('already_registered');
			}
		} else {
			res.status(403).send('Authentication required to know tenantId');
		}
    });

	app.get("/db_list", async function (req, res) {

		let tid = req.authInfo.getZoneId();

		// const rows = db.prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();
		const rows = db_prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();

		var items = [];

		rows.forEach(row => {
			console.log(row);
			var item = {id: row.id, name: row.tenant, time: row.timeStamp};
			items.push(item);
		});

		// Something not right here.  Async???

		items.forEach(item => {
			console.log(item);
		});

		res.send(nunjucks.render('templates/items.njk', { 
			title: "SQLite DB List Tenants",
			base: base_path,
			items: items
		}));
	});
	
	app.get("/db_test", async function (req, res) {

		// let tid = req.authInfo.getZoneId();

		const stmt = db_prepare(`INSERT INTO rates (rate) VALUES (?)`);
		for (let i = 0; i < 5; i++) {
			stmt.run("rate: " + i);
		}
	
		// // const rows = db.prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();
		const rows = db_prepare(`SELECT rate, timeStamp FROM rates`).all();

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