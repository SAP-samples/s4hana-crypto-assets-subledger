module.exports = {
    init: init,
    drop: drop,
    prepare: prepare,
	check_nick_exists: check_nick_exists,
    tenant_register: tenant_register,
    tenant_unregister: tenant_unregister,
    list_all: admin_list_all
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
    stmt = db.prepare('CREATE TABLE IF NOT EXISTS tenantInfo (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, tenant CHAR(36), nick VARCHAR(20), pubkey CHAR(66), timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('CREATE TABLE IF NOT EXISTS rates (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

	// 'access_token', 'refresh_token', 'authorization_code', 'client', 'user'

	stmt = db.prepare('CREATE TABLE IF NOT EXISTS access_token (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

	stmt = db.prepare('CREATE TABLE IF NOT EXISTS refresh_token (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

	stmt = db.prepare('CREATE TABLE IF NOT EXISTS authorization_code (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

	stmt = db.prepare('CREATE TABLE IF NOT EXISTS client (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

	stmt = db.prepare('CREATE TABLE IF NOT EXISTS user (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);



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

}

// gtid = global tenant Id is set within the * handler in server.js approx Line 101 which is fortuitous for 1984 fans.
function prepare(sqlinput) {
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
            case "UPDATE":
				break;
            default:
				break;
		}
		console.log(" sqlout:" + sqlout + ":");
	}

	return db.prepare(sqlout);
}

function check_nick_exists(newnick) {
    console.log("check_nick_exists: " + nick);


	const rows = db.prepare(`SELECT nick FROM tenantInfo`).all();

	var found = false;

	rows.forEach(row => {
		console.log(row);
		if (row.nick == newnick) {
			found = true;
		}
	});

    //db.close();

	return found;
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


	if (!found) {
		const stmt = db.prepare("INSERT INTO tenantInfo(tenant,nick,pubkey) VALUES (?,?,?)");
		stmt.run(tenantID,nick,pubKey);
	}

    //db.close();

	return found;
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
