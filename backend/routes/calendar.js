"use strict";

//========= PACKAGE NPM ========//
const router = require("express").Router();

const ical2json = require("ical2json");
const moment = require("moment");
// const fs = require("fs");
// const path = require("path");
//=============================//

//======= IMPORT MODULE ====== //
//=============================//

//DEFAULT PATH IS /calendar

const ORIGIN = "https://ade.univ-brest.fr";
const PATH_NAME = "/jsp/custom/modules/plannings/anonymous_cal.jsp";

const year = new Date().getFullYear();

const defaultFirstDate = `${year}-09-1`;
const defaultLastDate = `${year + 1}-08-31`;

router.get("/", async (req, res) => {
	let resources = req.query.resources;

	if (resources == null) {
		return res.status(400).send({ success: false, code: -1, message: "invalid resources" });
	}

	// Debug when ade offline => read data from file
	/*
	const filePath = path.resolve("./ADECal.ics");
	const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });
	const data = ical2json.convert(fileData).VCALENDAR[0].VEVENT;

	return res.status(200).send({ success: true, code: 0, data: data || [], message: "success get file data" });
	*/

	let firstDate = defaultFirstDate;
	let lastDate = defaultLastDate;

	if (req.query.today === "true") {
		firstDate = lastDate = moment().format("YYYY-MM-DD");
	} else if (req.query.tomorrow === "true") {
		firstDate = lastDate = moment().add(1, "d").format("YYYY-MM-DD");
	}

	const search = `?resources=${resources}&projectId=5&calType=ical&firstDate=${firstDate}&lastDate=${lastDate}&displayConfigId=25`;

	const icsURL = `${ORIGIN}${PATH_NAME}${search}`;

	try {
		const results = await fetch(icsURL);

		if (!results.ok) {
			throw new Error("error request ade");
		}

		const icalData = await results.text();
		const calendar = ical2json.convert(icalData);

		if (!calendar.VCALENDAR || !calendar.VCALENDAR[0] || !calendar.VCALENDAR[0].VEVENT) {
			throw new Error("error request ade");
		}

		const cours = calendar.VCALENDAR[0].VEVENT;
		return res.status(200).send({ success: true, code: 0, data: cours, message: "success fetch ade" });
	} catch (error) {
		return res.status(400).send({ success: false, code: -2, message: "error request ade" });
	}
});

module.exports = router;
