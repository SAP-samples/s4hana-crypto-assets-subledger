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
        console.log("served from admin.js");
        
        console.log(req.headers['x-forwarded-host']);

        var responseStr = "";
        responseStr += "<!DOCTYPE HTML><html><head><title>Crypto Rates Admin</title></head><body><h3>Crypto Rates Admin</h3><br />";
        responseStr += "<a href=\"" + base_path + "/db_init\">db_init</a><br />";
        responseStr += "<a href=\"" + base_path + "/db_drop\">db_drop</a><br />";
        responseStr += "<a href=\"" + base_path + "/db_list_all\">db_list_all</a><br />";
        responseStr += "<br />";
        responseStr += "<a href=\"" + base_path + "/\">Return to ADMIN Root.</a><br />";
        responseStr += "<a href=\"/\">Return to Root.</a><br />";
        responseStr += "</body></html>";
        res.status(200).send(responseStr);
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
        
            
	return app;
};