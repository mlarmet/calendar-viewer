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

router.get("/", async (req, res) => {
	let classe = req.query.classe;

	if (classe == null) {
		res.status(400).send({ code: 400, message: "invalid classe" });
		return;
	}

	//debug when ade offline
	//read file
	const filePath = path.join("C:/Users/maxen/Downloads/ADECal.ics");
	const icalData = fs.readFileSync(filePath, { encoding: "utf-8" });
	const calendar = ical2json.convert(icalData);
	const cours = calendar.VCALENDAR[0].VEVENT;

	return res.status(200).send(cours || []);

	let resources = classe;
	// if (req.query.pvp) {
	// 	resources += `,${req.query.pvp}`;
	// }

	// if (req.query.alternance == "true") {
	// 	//8738 previous alternance
	// 	resources += `,2639`;
	// }

	let firstDate = "2023-09-1";
	let lastDate = "2024-08-31";

	if (req.query.today == "true") {
		firstDate = lastDate = moment().format("YYYY-MM-DD");
	} else if (req.query.tomorrow == "true") {
		firstDate = lastDate = moment().add(1, "d").format("YYYY-MM-DD");
	}

	// const icsURL = `https://ade.univ-brest.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resources}&projectId=12&calType=ical&firstDate=${firstDate}&lastDate=${lastDate}`;
	//const icsURL = `https://ade.univ-brest.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resources}&projectId=6&calType=ical&nbWeeks=4&displayConfigId=172`;
	const icsURL = `https://ade.univ-brest.fr/jsp/custom/modules/plannings/anonymous_cal.jsp?resources=${resources}&projectId=13&calType=ical&displayConfigId=25&firstDate=${firstDate}&lastDate=${lastDate}`;

	let results = await fetch(icsURL);

	if (results.ok) {
		const icalData = await results.text();
		const calendar = ical2json.convert(icalData);

		if (!calendar.VCALENDAR || !calendar.VCALENDAR[0] || !calendar.VCALENDAR[0].VEVENT) {
			console.log(icsURL);

			return res.status(400).send({ res: false, message: "error request ade" });
		}

		const cours = calendar.VCALENDAR[0].VEVENT;
		return res.status(200).send(cours);
	} else {
		return res.status(400).send({ code: 400, message: "error request ade" });
	}
});

module.exports = router;
