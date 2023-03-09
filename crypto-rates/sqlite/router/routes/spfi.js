/*eslint no-console: 0, no-unused-vars: 0, no-shadow: 0, new-cap: 0*/
"use strict";
var express = require("express");
const util = require('util');
const nunjucks = require('nunjucks');


const base_path = "/spfi";

const db = require('../../library');

module.exports = () => {
	var app = express.Router();

    app.get(["/","/links"], function (req, res) {
        console.log("served from spfi.js");
        
        // console.log(req.headers['x-forwarded-host']);

        var responseStr = "";
        responseStr += "<!DOCTYPE HTML><html><head><title>Crypto Rates SPFI</title></head><body><h3>Crypto Rates SPFI</h3><br />";
        responseStr += "<a href=\"" + base_path + "/notify\">notify</a><br />";
        responseStr += "<br />";
        responseStr += "<a href=\"" + base_path + "/\">Return to ADMIN Root.</a><br />";
        responseStr += "<a href=\"/\">Return to Root.</a><br />";
        responseStr += "</body></html>";
        res.status(200).send(responseStr);
    });

    app.get(['/noauth',base_path + '/noauth'], function (req, res) {
        var hostname = "localhost";
    
        if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
            hostname = req.headers['x-forwarded-host'];
        }
        console.log(req.method + " " + hostname + req.url);
        let info = {
            'noauth': hostname + ":" + req.url
        };
        res.status(200).json(info);
    }); 

	app.get("/testpost", async function (req, res) {
        var inputs = [
            {
                id: "yo1",
                name: "x-sap-saasfulfillment-notification-id",
                desc: "This id is required to identify a notification in SAP Unified Provisioning. It has to be passed when calling the SaaS Operation API (here resolve and status request).",
                type: "text",
                size: 36,
                default: "aaa",
                required: true,
                header: true
            },
            {
                id: "yo2",
                name: "x-sap-saasfulfillment-callback-url",
                desc: "This parameter contains the base URL to be used by the SaaS Providers / SPFI Reference application when calling the SaaS Operation API (here resolve and status request).",
                type: "text",
                size: 64,
                default: "bbb",
                required: true,
                header: true
            }
        ];        

        var headers = [
            {
                name: "Content-Type",
                value: "application/json"
            },
            {
                name: "Accept",
                value: "application/json"
            }
        ];

		res.send(nunjucks.render('templates/apitest2.njk', { 
			title: "DoPost API Test",
			base: base_path,
            path: "dopost",
            docs: "https://github.wdf.sap.corp/pages/SPC-Cloud-Native-Provisioning/SPFI/sap_spfi_notify_apidoc.html#/",
            headers: headers,
			inputs: inputs,
            expected_status: 200
		}));

    });

    app.post("/dopost", function (req, res) {
        var hostname = "localhost";
    
        if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
            hostname = req.headers['x-forwarded-host'];
        }
        console.log(req.method + " " + hostname + req.url);
        let info = {
            'dopost': hostname + ":" + req.url
        };
        res.status(200).json(info);
    }); 

    // Implementing SPSI APIs and Interaction
    // https://pages.github.tools.sap/atom-cfs/atom-docs/docs/providing-services/registering-services/unified-provisioning/onboarding-application/implement_spfi/implementing-spfi-api/

	app.get("/notify", async function (req, res) {

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

// curl -X 'POST' \
// 'https://github.wdf.sap.corp/spfi/notify' \
//  -H 'accept: */*' \
//  -H 'x-sap-saasfulfillment-notification-id: aaa' \
//  -H 'x-sap-saasfulfillment-callback-url: bbb' \
//  -d ''

        var inputs = [
            {
                id: "yo1",
                name: "x-sap-saasfulfillment-notification-id",
                desc: "This id is required to identify a notification in SAP Unified Provisioning. It has to be passed when calling the SaaS Operation API (here resolve and status request).",
                type: "text",
                size: 36,
                default: "aaa",
                required: true,
                header: true
            },
            {
                id: "yo2",
                name: "x-sap-saasfulfillment-callback-url",
                desc: "This parameter contains the base URL to be used by the SaaS Providers / SPFI Reference application when calling the SaaS Operation API (here resolve and status request).",
                type: "text",
                size: 64,
                default: "bbb",
                required: true,
                header: true
            }
        ];        

		res.send(nunjucks.render('templates/apitest.njk', { 
			title: "Notify API Test",
			base: base_path,
            path: "notify",
            docs: "https://github.wdf.sap.corp/pages/SPC-Cloud-Native-Provisioning/SPFI/sap_spfi_notify_apidoc.html#/",
			inputs: inputs,
            items: items
		}));
	});

    app.post("/notify", function (req, res) {
        var hostname = "localhost";
    
        if (((typeof req) == "object") && ((typeof req.headers) == "object") && ((typeof req.headers['x-forwarded-host']) == "string")) {
            hostname = req.headers['x-forwarded-host'];
        }
        console.log(req.method + " " + hostname + req.url);
        let info = {
            'noauth': hostname + ":" + req.url
        };
        res.status(200).json(info);
    }); 

    // "/resolve"
    //  GET "/saasfulfillment/v1/resolve"
    // POST "/saasfulfillment/v1/command/status"
    // "/status"
    // SaaS Provider Fulfillment Interface API
    // https://github.wdf.sap.corp/pages/SPC-Cloud-Native-Provisioning/SPFI/sap_spfi_apidoc.html#/
    
	return app;
};