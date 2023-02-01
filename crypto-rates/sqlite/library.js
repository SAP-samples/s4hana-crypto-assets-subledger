module.exports = {
    init: init,
    drop: drop,
    prepare: prepare,
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

    stmt = db.prepare('CREATE TABLE IF NOT EXISTS tenantInfo (id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, tenant VARCHAR(256), timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('CREATE TABLE IF NOT EXISTS rates (tenant CHAR(36) NOT NULL, rate INTEGER, timeStamp DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL)');
    info = stmt.run();
    console.log(info.changes);

// aef487d1-0879-4fb1-a8f4-2384b71226c2 CHAR(36)

    //db.close();
}

// https://sqlite.org/lang_droptable.html
function drop() {
    console.log("do_DB_Drop");
 
    stmt = db.prepare('DROP TABLE IF EXISTS tenantInfo');
    info = stmt.run();
    console.log(info.changes);

    stmt = db.prepare('DROP TABLE IF EXISTS rates');
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

function tenant_register(tenantID) {
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
		const stmt = db.prepare("INSERT INTO tenantInfo(tenant) VALUES (?)");
		stmt.run(tenantID);
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
