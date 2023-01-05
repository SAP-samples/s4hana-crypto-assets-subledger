/*eslint-env node, es6 */
"use strict";

module.exports = (app, server) => {
	// app.use("/", require("./routes/root")());
	// app.use("/ex1", require("./routes/ex1")());
	// app.use("/static", require("./routes/static")());
	// app.use("/dynamic", require("./routes/dynamic")());
	// app.use("/adm", require("./routes/adm")());
	app.use("/srvjs", require("./routes/srvjs")());
	// app.use("/saas", require("./routes/saas")());
};