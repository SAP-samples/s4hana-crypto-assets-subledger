/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	app.use("/sqlite", require("./routes/sqlite")());
	// app.use("/adm", require("./routes/adm")());
};