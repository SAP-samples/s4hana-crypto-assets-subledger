/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	app.use("/rates", require("./routes/rates")());
	app.use("/admin", require("./routes/admin")());
	app.use("/spfi", require("./routes/spfi")());
	app.use("/oauth", require("./routes/oauth")());
};