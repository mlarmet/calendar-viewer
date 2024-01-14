"use strict";

//========= PACKAGE NPM ========//
const router = require("express").Router();
const moment = require("moment");
//=============================//

//======= IMPORT MODULE ====== //
//=============================//

//DEFAULT PATH IS /day

router.get("/", async (req, res) => {
	const date = moment();

	const weekDelta = parseInt(req.query.week);
	if (weekDelta) {
		if (weekDelta > 0) date.add(weekDelta, "w");
		else if (weekDelta < 0) date.subtract(Math.abs(weekDelta), "w");
	}

	const startOfTheWeek = date.startOf("week"); //.format("YYYY-MM-DD");
	//const endOfTheWeek = date.endOf("week").format("YYYY-MM-DD");

	let week = {};
	week.lundi = startOfTheWeek.add(1, "d").format("DD/MM");
	week.mardi = startOfTheWeek.add(1, "d").format("DD/MM");
	week.mercredi = startOfTheWeek.add(1, "d").format("DD/MM");
	week.jeudi = startOfTheWeek.add(1, "d").format("DD/MM");
	week.vendredi = startOfTheWeek.add(1, "d").format("DD/MM");

	res.send(week);
});

router.get("/:day", async (req, res) => {
	const day = req.params.day;

	const date = moment();

	const weekDelta = parseInt(req.query.week);
	if (weekDelta) {
		if (weekDelta > 0) date.add(weekDelta, "w");
		else if (weekDelta < 0) date.subtract(Math.abs(weekDelta), "w");
	}
	const startOfTheWeek = date.startOf("week");

	switch (day) {
		case "lundi":
			//nothing to do
			startOfTheWeek.add(1, "d");
			break;
		case "mardi":
			startOfTheWeek.add(2, "d");
			break;
		case "mercredi":
			startOfTheWeek.add(3, "d");
			break;
		case "jeudi":
			startOfTheWeek.add(4, "d");
			break;
		case "vendredi":
			startOfTheWeek.add(5, "d");
			break;
		default:
			res.send({ code: 400, message: "invalid day" });
			return;
	}

	res.send({ day: day, date: startOfTheWeek.format("DD/MM") });
	// let week = {};
	// week.lundi = startOfTheWeek.format("DD/MM");
	// week.mardi = startOfTheWeek.add(1, "d").format("DD/MM");
	// week.mercredi = startOfTheWeek.add(1, "d").format("DD/MM");
	// week.jeudi = startOfTheWeek.add(1, "d").format("DD/MM");
	// week.vendredi = startOfTheWeek.add(1, "d").format("DD/MM");

	// res.send(week);
});

module.exports = router;
