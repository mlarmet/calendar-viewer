"use strict";

//========= PACKAGE NPM ========//
const router = require("express").Router();

const ical2json = require("ical2json");
const moment = require("moment");
const fs = require("fs");
const path = require("path");
//=============================//

//======= IMPORT MODULE ====== //
//=============================//

//DEFAULT PATH IS /calendar

const DEFAULT_FIRST_DATE = "2023-09-1";
const DEFAULT_LAST_DATE = "2024-08-31";

router.get("/", async (req, res) => {
	let classe = req.query.classe;

	if (classe == null) {
		return res.status(400).send({ success: false, code: -1, message: "invalid classe" });
	}

	// Debug when ade offline => read data from file
	/*
	const filePath = path.resolve("./ADECal.ics");
	const fileData = fs.readFileSync(filePath, { encoding: "utf-8" });
	const data = ical2json.convert(fileData).VCALENDAR[0].VEVENT;

	return res.status(200).send({ success: true, code: 0, data: data || [], message: "success get file data" });
	*/

	let resources = classe;
	// if (req.query.pvp) {
	// 	resources += `,${req.query.pvp}`;
	// }

	// if (req.query.alternance == "true") {
	// 	//8738 previous alternance
	// 	resources += `,2639`;
	// }

	let firstDate = DEFAULT_FIRST_DATE;
	let lastDate = DEFAULT_LAST_DATE;

	if (req.query.today == "true") {
		firstDate = lastDate = moment().format("YYYY-MM-DD");
	} else if (req.query.tomorrow == "true") {
		firstDate = lastDate = moment().add(1, "d").format("YYYY-MM-DD");
	}

	// const icsURL = `https://ade.univ-brest.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resources}&projectId=12&calType=ical&firstDate=${firstDate}&lastDate=${lastDate}`;
	//const icsURL = `https://ade.univ-brest.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resources}&projectId=6&calType=ical&nbWeeks=4&displayConfigId=172`;
	const icsURL = `https://ade.univ-brest.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resources}&projectId=13&calType=ical&displayConfigId=25&firstDate=${firstDate}&lastDate=${lastDate}`;

	const results = await fetch(icsURL);

	if (!results.ok) {
		return res.status(400).send({ success: false, code: -2, message: "error request ade" });
	}

	const icalData = await results.text();
	const calendar = ical2json.convert(icalData);

	if (!calendar.VCALENDAR || !calendar.VCALENDAR[0] || !calendar.VCALENDAR[0].VEVENT) {
		return res.status(400).send({ success: false, code: -2, message: "error request ade" });
	}

	const cours = calendar.VCALENDAR[0].VEVENT;
	return res.status(200).send({ success: true, code: 0, data: cours, message: "success fetch ade" });
});

module.exports = router;
