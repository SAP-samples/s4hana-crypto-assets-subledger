module.exports = {
    init: init,
    drop: drop,
    prepare: prepare,
	preparer: preparer,
	check_nick_exists: check_nick_exists,
	get_nick_from_pubkey: get_nick_from_pubkey,
    tenant_register: tenant_register,
    tenant_unregister: tenant_unregister,
    list_all: admin_list_all,
	push_accessToken: push_accessToken,
	fetchById: fetchById,
	checkSecret: checkSecret,
	fetchByToken: fetchByToken,
	getTenantByID: getTenantByID
};

const Database = require("better-sqlite3");
const db = new Database('data/crypto-rates.db', { verbose: console.log }); // or ':memory:'
db.pragma('synchronous = 2'); // Force write-through to file system

// https://sqlite.org/lang_createtable.html
function init() {
    console.log("do_DB_Init");
	//          1         2         3         4         5         6     6   7
	// 1234567890123456789012345678901234567890123456789012345678901234567890
	// 0334c29a37fe5d9d5ab8882855c75745f5b5d29cb2c6424fae138a29b248c6cd64
	var createstr = '';


	createstr  = 'CREATE TABLE IF NOT EXISTS planType (';
	createstr += 'type CHAR(1) PRIMARY KEY NOT NULL, ';
	createstr += 'name CHAR(8) NOT NULL, ';
	createstr += 'seq INTEGER';
	createstr += ')';

    stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	var insertstr = "";
	
	insertstr = "INSERT INTO planType(type, name, seq) VALUES ('F','Free',1)";		// Free plan
	stmt = db.prepare(insertstr);
	info = stmt.run();
	console.log(info.changes);

	insertstr = "INSERT INTO planType(type, name, seq) VALUES ('S','Standard',2)";	// Standard plan
	stmt = db.prepare(insertstr);
	info = stmt.run();
	console.log(info.changes);

	insertstr = "INSERT INTO planType(type, name, seq) VALUES ('X','Extra',3)";		// eXtra plan
	stmt = db.prepare(insertstr);
	info = stmt.run();
	console.log(info.changes);


	createstr  = 'CREATE TABLE IF NOT EXISTS tenantInfo (';
	createstr += 'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ';
	createstr += 'tenant CHAR(36), ';
	createstr += 'nick VARCHAR(20), ';
	createstr += 'pubkey CHAR(66), ';
	createstr += 'clientid CHAR(36), ';
	createstr += 'clientsecret CHAR(48), ';
	createstr += 'scope CHAR(512) NOT NULL, ';
	createstr += 'redirectUri CHAR(96), ';
	createstr += "plan CHAR(1) NOT NULL DEFAULT ('F') REFERENCES planType(type) , ";
	createstr += 'satoshi INTEGER DEFAULT 1000000 NOT NULL, ';
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL, ';
	createstr += 'modified DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += ')';
	
    stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);


	insertstr  = "INSERT INTO tenantInfo(";
	insertstr += 'tenant, ';
	insertstr += 'nick, ';
	insertstr += 'pubkey, ';
	insertstr += 'clientid, ';
	insertstr += 'clientsecret, ';
	insertstr += 'scope, ';
	insertstr += 'redirectUri ';
	insertstr += ') VALUES (';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?)';

	console.log("insertstr: " + insertstr);

	stmt = db.prepare(insertstr);

	info = stmt.run("0abbacab-0000-0000-0000-000000000000","client1","0334c29a37fe5d9d5ab8882855c75745f5b5d29cb2c6424fae138a29b248c6cd64","client1.id","client1.secret","uaa.resource","http://example.org/oauth2");
	console.log(info.changes);

	info = stmt.run("0abbacab-93b6-c0d6-70fe-711b8280fa0c","vacuum8","0334c29a37fe5d9d5ab8882855c75745f5b5d29cb2c6424fae138a29b248c6cd64","0abbacab-93b6-c0d6-70fe-711b8280fa0c","oYRbgIFYuc5IMLqGWJz3ASU9jwFmtYEepIW5","uaa.resource market-data-MRM-MRM_BYOD!b1736.marketdata","http://example.org/oauth2");
	console.log(info.changes);

	createstr  = 'CREATE TABLE IF NOT EXISTS rates (';
	createstr += 'tenant CHAR(36) NOT NULL, ';
	createstr += 'rate INTEGER, ';
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += ')';

    stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	// 'access_token', 'refresh_token', 'authorization_code', 'client', 'user'

	createstr  = 'CREATE TABLE IF NOT EXISTS access_token (';
	createstr += 'token CHAR(64) NOT NULL, ';
	createstr += 'userId CHAR(64), ';
	createstr += 'clientId CHAR(64) NOT NULL, ';
	createstr += 'scope CHAR(512) NOT NULL, ';
	createstr += 'ttl INTEGER, ';
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += ')';

	stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	createstr  = 'CREATE TABLE IF NOT EXISTS refresh_token (';
	createstr += 'tenant CHAR(36) NOT NULL, ';
	createstr += 'rate INTEGER, ';
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += '';
	createstr += ')';

	stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	createstr  = 'CREATE TABLE IF NOT EXISTS authorization_code (';
	createstr += 'tenant CHAR(36) NOT NULL, ';
	createstr += 'rate INTEGER, ';
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += ')';

	stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	createstr  = 'CREATE TABLE IF NOT EXISTS client (';
	createstr += 'id CHAR(36) NOT NULL, ';
	createstr += 'name CHAR(36) NOT NULL, ';
	createstr += 'secret CHAR(36) NOT NULL, ';
	createstr += 'redirectUri CHAR(36) NOT NULL, ';
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += ')';

	stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	createstr  = 'CREATE TABLE IF NOT EXISTS user (';
	createstr += 'tenant CHAR(36) NOT NULL, ';
	createstr += 'rate INTEGER, ';
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += ')';

	stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	createstr  = 'CREATE TABLE IF NOT EXISTS pending_payments (';
	createstr += 'tenant CHAR(36) NOT NULL, ';	// "1234567890123456789012345678901234567890123456789012345678901234"
	createstr += 'invoice CHAR(64) NOT NULL, ';	// "bfa5d543c695f89bfe75ac7fc8076be5ccb8811b3be5dddff9e1d97503425de3"
	createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL';
	createstr += ')';

    stmt = db.prepare(createstr);
    info = stmt.run();
    console.log(info.changes);

	// createstr  = 'CREATE TABLE IF NOT EXISTS socket_connections (';
	// createstr += 'id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, ';
	// createstr += 'nick VARCHAR(20), ';
	// createstr += 'pubkey CHAR(66), ';
	// createstr += 'created DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL ';
	// createstr += ')';
	
    // stmt = db.prepare(createstr);
    // info = stmt.run();
    // console.log(info.changes);


// aef487d1-0879-4fb1-a8f4-2384b71226c2 CHAR(36)

    //db.close();
}

// https://sqlite.org/lang_droptable.html
function drop() {
    console.log("do_DB_Drop");
 
    stmt = db.prepare('DROP TABLE IF EXISTS user');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS client');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS authorization_code');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS refresh_token');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS access_token');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS rates');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS tenantInfo');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS planType');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS pending_payments');
    info = stmt.run();
    console.log(info.changes);

    // stmt = db.prepare('DROP TABLE IF EXISTS socket_connections');
    // info = stmt.run();
    // console.log(info.changes);

}

// gtid = global tenant Id is set within the * handler in server.js approx Line 101 which is fortuitous for 1984 fans.
function prepare(sqlinput) {
	var sqlout = 'SELECT now()';

	if (true) {

		var sqlin = sqlinput.trim();

		// console.log("  sqlin:" + sqlin + ":");

		switch((sqlin.substring(0,6)).toUpperCase()) {
			case "SELECT":
				// console.log("SELECT!");
				// `SELECT rate, created FROM rates`
				sqlout = sqlin;
				// `SELECT rate, created FROM rates WHERE tenant = tenantID`
				sqlout += " WHERE tenant = '" + gtid + "'";
				break;
			case "INSERT":
				// console.log("INSERT!");
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
				// console.log("DELETE!");
				// `SELECT rate, created FROM rates`
				sqlout = sqlin;
				// `SELECT rate, created FROM rates WHERE tenant = tenantID`
				sqlout += " WHERE tenant = '" + gtid + "'";
				break;
            case "UPDATE":
				break;
            default:
				break;
		}
		// console.log(" sqlout:" + sqlout + ":");
	}

	return db.prepare(sqlout);
}

function preparer(sqlinput) {
	var sqlout = 'SELECT now()';

	if (true) {

		var sqlin = sqlinput.trim();

		// console.log("  sqlin:" + sqlin + ":");

		sqlout = sqlin;

		// console.log(" sqlout:" + sqlout + ":");
	}

	return db.prepare(sqlout);
}

function check_nick_exists(nick) {
    console.log("check_nick_exists: " + nick);


	const rows = db.prepare(`SELECT nick FROM tenantInfo`).all();

	var found = false;

	rows.forEach(row => {
		console.log(row);
		if (row.nick == nick) {
			found = true;
		}
	});

    //db.close();

	return found;
}

function get_nick_from_pubkey(pubkey) {
    console.log("get_nick_from_pubkey: " + pubkey);


	const rows = db.prepare(`SELECT nick,tenant FROM tenantInfo WHERE pubkey = '` + pubkey + `'`).all();

	var lastnick = "unregistered";
	var lasttenant = "unknown";

	rows.forEach(row => {
		// console.log(row);
		lastnick = row.nick;
		lasttenant = row.tenant;
	});

    //db.close();
	console.log(lastnick);
	return({"nick": lastnick, "tenant": lasttenant});
}


function fetchById(clientid) {
    console.log("fetchById: " + clientid);

	const tenant = db.prepare(`SELECT clientid,nick,clientsecret,scope,redirectUri FROM tenantInfo WHERE clientid = ?`).get(clientid);

	console.log("tenant: " + JSON.stringify(tenant,null,2));

	return tenant;
}

function fetchByToken(token) {
    console.log("fetchByToken: " + token);

	const access_token = db.prepare(`SELECT token,userId,clientId,scope,ttl FROM access_token WHERE token = ?`).get(token);

	if ((access_token) && (typeof access_token == "object")) {

		// Scope isn't valid JSON at times for some reason.  Skip for now
		access_token.scope = JSON.parse(access_token.scope);

		return access_token;
	} else {
		return null;
	}
}

function checkSecret(client, secret) {
    console.log("checkSecret: " + secret);

	const tenant = db.prepare(`SELECT clientid,clientsecret FROM tenantInfo WHERE clientid = ?`).get(client.id);

	console.log("tenant: " + JSON.stringify(tenant,null,2));

	if ((tenant) && (typeof tenant == "object") && (typeof tenant.clientsecret == "string") && (tenant.clientsecret == secret)) {
		console.log("Secret Matches " + secret);
		return true;
	} else {
		console.log("Secret DOES NOT Match " + secret);
		return false;
	}
}

function getTenantByID(tenantID) {
    console.log("getTenantByID: " + tenantID);

	const tenant = db.prepare(`SELECT tenant,nick,pubkey,clientid,scope,redirectUri,plan,satoshi FROM tenantInfo WHERE tenant = ?`).get(tenantID);

	if ((tenant) && (typeof tenant == "object")) {

		// console.log("tenant: " + JSON.stringify(tenant,null,2));
		return tenant;

	} else {
		return null;
	}
}

var crypto = require('crypto');

function generatePassword() {
	// var	length = 48;
	var	length = 36;
	// var wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz~!@-#$';
	var wishlist = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
	return Array.from(crypto.randomFillSync(new Uint32Array(length)))
	  .map((x) => wishlist[x % wishlist.length])
	  .join('');
}

function tenant_register(tenantID,nick,pubKey) {
    console.log("tenant_register: " + tenantID);


	const rows = db.prepare(`SELECT tenant FROM tenantInfo`).all();

	var found = false;

	rows.forEach(row => {
		console.log(row);
		if (row.tenant == tenantID) {
			found = true;
		}
	});

	var retobj = {
		"status": "exists"
	};

	if (!found) {

		// Generate a clientid
		var clientid = tenantID; // Use tenantID for now
		// Generate a secret
		var clientsecret = generatePassword();
		// Generate a download URL
		// Insert the clientid into the client table
		// Maybe combine the tenant table and the client table???

		var insertstr  = "INSERT INTO tenantInfo(";
		insertstr += 'tenant, ';
		insertstr += 'nick, ';
		insertstr += 'pubkey, ';
		insertstr += 'clientid, ';
		insertstr += 'clientsecret, ';
		insertstr += 'scope, ';
		insertstr += 'redirectUri ';
		insertstr += ') VALUES (';
		insertstr += '?,';
		insertstr += '?,';
		insertstr += '?,';
		insertstr += '?,';
		insertstr += '?,';
		insertstr += '?)';
	
		console.log("insertstr: " + insertstr);
	
		const stmt = db.prepare(insertstr);
	
		stmt.run(tenantID,nick,pubKey,clientid,clientsecret,"uaa.resource market-data-MRM-MRM_BYOD!b1736.marketdata","http://example.org/oauth2");

		retobj = 
		{
			"status": "registered",
			"credentials": {
				// "LPSCallbackDependencyName": "market-data-MRM-MRM_BYOD",
				"downloadUrl": "https://https://cryptorates-crypto-rates-app.cryptoassetssubledger.com/rates/downloadCryptoData",
				// "uploadUrl": "https://mrmawsus10-mrm-mrm-byod-market-data-upload.cfapps.us10.hana.ondemand.com/uploadMarketData",
				// "saasregistryappname": "market-data-MRM-MRM_BYOD",
				// "saasregistryenabled": true,
				"uaa": {
					// "apiurl": "https://api.authentication.us10.hana.ondemand.com",
					"clientid": clientid,
					"clientsecret": clientsecret,
					"credential-type": "binding-secret",
					// "identityzone": "cryptorates",
					// "identityzoneid": "aef487d1-0879-4fb1-a8f4-2384b71226c2",
					// "sburl": "https://internal-xsuaa.authentication.us10.hana.ondemand.com",
					// "subaccountid": "aef487d1-0879-4fb1-a8f4-2384b71226c2",
					"tenantid": tenantID,
					"tenantmode": "dedicated",
					// "uaadomain": "authentication.us10.hana.ondemand.com",
					// "url": "https://cryptorates.authentication.us10.hana.ondemand.com",
					// "verificationkey": "-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA+8Nrbx6bRV4sHy7/lWDVeSuvV+Rj9quxC3zuTlmaoALvGPhMxghtWfD25/a8pXYUxfXTVGBvx/rWL8kJ1ywaTpgYORQy4yvQUI5c5pc7nXX4f6PN5uZF2Hw4s1Y0+PGu9STkqGiDlisw331UuEyShi18L2oz6SNo7gWBwynDt7mYmYt6wH0SJNmeV9VQN8fuKNmto3oanJqLchPDfEzyh4+21JcTq6upfXBVHClwEKrc0qDowCtjxHb7uOxvvHhTn9VSb3G1pFMdhvnSIYVOa9bWMesVxIqwi+A1wDxeDENZAIvSvTl3A1/x56aPYaNI1P4T8f7vg4Qj3ViVHq/RkQIDAQAB-----END PUBLIC KEY-----",
					// "xsappname": "6d979d34-f4c0-4b90-8629-15201dc0d138!b64971|market-data-MRM-MRM_BYOD!b1736",
					// "zoneid": "aef487d1-0879-4fb1-a8f4-2384b71226c2"
				}
			}
		};

	}

    //db.close();
	return retobj;

}

function tenant_unregister(tenantID) {
    console.log("tenant_unregister: " + tenantID + " is not implemented yet!");
	var found = false;
	return found;
}

function admin_list_all(tenantID) {
    console.log("admin_list_all: ");
    const rows = db.prepare(`SELECT id, tenant, timeStamp FROM tenantInfo`).all();
    return rows;
}

function push_accessToken(token,userId,clientId,scope,ttl) {
    console.log("push_accessToken: " + token);

	var insertstr  = "INSERT INTO access_token(";
	insertstr += 'token, ';
	insertstr += 'userId, ';
	insertstr += 'clientId, ';
	insertstr += 'scope, ';	//JSON.stringify(scope)
	insertstr += 'ttl ';
	insertstr += ') VALUES (';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?,';
	insertstr += '?)';

	console.log("insertstr: " + insertstr);

	const stmt = db.prepare(insertstr);
	stmt.run(token,userId,clientId,JSON.stringify(scope),ttl);
}