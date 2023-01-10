/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const util = require('util');

const Database = require("better-sqlite3");
const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
db.pragma('synchronous = 2'); // Force write-through to file system

// https://sqlite.org/lang_createtable.html
function do_DB_Init() {
    console.log("do_DB_Init");

    const stmt = db.prepare('CREATE TABLE IF NOT EXISTS lorem (info TEXT)');
    const info = stmt.run();
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
 
    const stmt = db.prepare('DROP TABLE IF EXISTS lorem');
    const info = stmt.run();
    console.log(info.changes);

}

module.exports = () => {
	var app = express.Router();

	//ADM Router
	// app.get("/", (req, res) => {
    //     console.log("served from adm.js");
    //     // console.log(util.inspect(req.hostname, {depth: 1}));
    //     console.log(req.headers['x-forwarded-host']);
	// 	res.send(util.inspect(req.headers, {depth: 1}));
	// });

    app.get(["/","/links"], function (req, res) {
        console.log("served from adm.js");
        
        console.log(req.headers['x-forwarded-host']);

        var responseStr = "";
        responseStr += "<!DOCTYPE HTML><html><head><title>Crypto Rates ADM</title></head><body><h3>Crypto Rates ADM</h3><br />";
        responseStr += "<a href=\"/adm/user\">User Details.</a><br />";
        responseStr += "<a href=\"/adm/db_init\">db_init</a><br />";
        responseStr += "<a href=\"/adm/db_fill\">db_fill</a><br />";
        responseStr += "<a href=\"/adm/db_dump\">db_dump</a><br />";
        responseStr += "<a href=\"/adm/db_drop\">db_drop</a><br />";
        responseStr += "<br />";
        responseStr += "<a href=\"/\">Return to SRV Root.</a><br />";
        responseStr += "</body></html>";
        res.status(200).send(responseStr);
    });

    app.get('/user', function (req, res) {
        // x_Disable
        // if (req.authInfo.checkScope('$XSAPPNAME.Admin')) {
            res.status(200).json(req.user);
        // } else {
            // res.status(403).send('Forbidden');
        // }
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