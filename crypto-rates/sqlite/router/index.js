/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	app.use("/socket", require("./routes/socket")());
	app.use("/sqlite", require("./routes/sqlite")());
	app.use("/admin", require("./routes/admin")());
	app.use("/spfi", require("./routes/spfi")());
};