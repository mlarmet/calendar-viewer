//========= PACKAGE NPM ========//
const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();
//=============================//

//======= IMPORT MODULE ====== //
const routes = require("./routes/routes");
// const eventManager = require("./events/eventManager");
//=============================//

const PORT = process.env.PORT || 4000;

const app = express();

app.use(
	cors({
		origin: process.env.ORIGIN_URL,
	})
);
app.use(express.json());
app.use(express.static("public"));

for (const route of routes) {
	app.use(`/api/${route.path}`, require(`./routes/${route.router}`));
}

app.use(express.static(path.join(__dirname, "dist")));
app.get("/*", (req, res) => res.sendFile(path.resolve(__dirname, "dist", "index.html")));

// catch 404 and forward to error handler
app.use(function (req, res, _next) {
	res.status(404).send({
		code: 404,
		error: "route not found",
	});
});

app.listen(PORT);

console.log(`Server running on port ${PORT}`);
