import React, { useEffect, useState } from "react";

import moment from "moment";
import Swal from "sweetalert2";

import { AppointmentModel, ViewState } from "@devexpress/dx-react-scheduler";
import {
	AppointmentTooltip,
	Appointments,
	CurrentTimeIndicator,
	DateNavigator,
	Scheduler,
	TodayButton,
	TodayButtonProps,
	Toolbar,
	WeekView,
} from "@devexpress/dx-react-scheduler-material-ui";
import { CssBaseline, Paper, ThemeProvider, createTheme, useMediaQuery } from "@mui/material";

import { AppointementTooltipContent, AppointmentComponent, AppointmentContent, TimeIndicator } from "./calendar-appointment";
import { resetColors, setBackgroundColor } from "./calendar-property";

// Custom types imports
import { CalendarProps, icalItem } from "./calendar.d";

// Style import
import "./calendar.css";

const Calendar: React.FC<CalendarProps> = ({ classeCode, pvpCode }) => {
	const darkMode = useMediaQuery("(prefers-color-scheme: dark)");

	const [dateOfCache, setDateOfCache] = useState<string | undefined>(undefined);

	const [currentDate, setCurrentDate] = useState<string>(moment().format("YYYY-MM-DD"));

	const [listClasse, setListClasse] = useState<AppointmentModel[]>([]);
	const [listPvp, setListPvp] = useState<AppointmentModel[]>([]);

	const [combinedList, setCombinedList] = useState<AppointmentModel[]>([]);

	const DAY_START_HOUR: number = 8;
	const DAY_END_HOUR: number = 19;

	const DAYS_EXCLUDED: number[] = [0, 6];
	const CELL_DURATION: number = 45;

	const SHADE_PREVIOUS_CELL: boolean = true;
	const SHADE_PREVIOUS_APPOINTMENTS: boolean = true;

	const TODAY_BUTTON_TEXT: TodayButtonProps["messages"] = {
		today: "Aujourd'hui",
	};

	const loadingSwal = Swal.mixin({
		title: "Récupération en cours...",
		didOpen() {
			Swal.showLoading();
		},
		didClose() {
			Swal.hideLoading();
		},
		allowOutsideClick: false,
		allowEscapeKey: false,
	});

	const errorSwal = Swal.mixin({
		icon: "error",
		title: "Erreur lors de la récupération !",
		confirmButtonText: "Réesayer",
		confirmButtonColor: "var(--blue)",
		showCloseButton: true,
	});

	const getData = (icalData: icalItem[]): AppointmentModel[] => {
		const data: AppointmentModel[] = [];

		if (icalData && icalData.length > 0) {
			for (let i = 0; i < icalData.length; i++) {
				const icalDataItem = icalData[i];

				const title = icalDataItem.SUMMARY;

				// Remove the date from the description, prevent display it in the tooltip
				const pattern = /\(Exporté le:\d{2}\/\d{2}\/\d{4} \d{2}:\d{2}\)/;
				const description = icalDataItem.DESCRIPTION.replace(pattern, "").split("\\n");

				// "Période en entreprise" doesn't have a prof
				const prof = description[description.length - 3];

				const salle = icalDataItem.LOCATION.replaceAll("\\,", ", ");

				data.push({
					title,
					startDate: icalDataItem.DTSTART,
					endDate: icalDataItem.DTEND,
					uid: icalDataItem.UID,
					prof,
					salle,
					isPvp: ["communication", "anglais", "pvp"].some((element) => title.toLocaleLowerCase().includes(element)),
					isConference: ["conférence", "conference"].some((element) => title.toLocaleLowerCase().includes(element)),
				});
			}
		}

		return data;
	};

	const getDate = (): string => {
		return moment().format("YYYY-MM-DD");
	};

	const handleDateChange = (currentDate: Date) => {
		const dateStr = moment(currentDate).format("YYYY-MM-DD");
		setCurrentDate(dateStr);
	};

	const displaySwal = (loading: boolean, error: boolean) => {
		if (loading) {
			loadingSwal.fire();
			return;
		}

		if (error) {
			if (loadCache()) {
				Swal.close();
			} else {
				errorSwal.fire().then((result: { isConfirmed: boolean }) => {
					if (result.isConfirmed) {
						fetchClasseData();
					}
				});
			}

			return;
		}

		Swal.close();
	};

	const clearCache = () => {
		// remove all item in cache but not classCode and classData :

		Object.keys(localStorage).forEach((key) => {
			if (key !== "classeCode" && key !== "pvpCode" && key !== "coursData") {
				localStorage.removeItem(key);
			}
		});
	};

	const loadCache = (): boolean => {
		const coursCache = localStorage.getItem("coursData");

		if (!coursCache) {
			return false;
		}

		const coursDataCache = JSON.parse(coursCache);

		if (!coursDataCache[classeCode]) {
			return false;
		}

		if (!coursDataCache[pvpCode]) {
			return false;
		}

		const classeData = coursDataCache[classeCode].cours;
		const pvpData = coursDataCache[pvpCode].cours;

		setListClasse(classeData);
		setListPvp(pvpData);

		setDateOfCache(moment(coursDataCache[classeCode].date).format("DD/MM/YYYY à HH:mm"));

		return true;
	};

	const saveCache = () => {
		const date = moment();

		const classeData = JSON.parse(localStorage.getItem("coursData") || "{}");

		classeData[classeCode] = { date, cours: listClasse };
		classeData[pvpCode] = { date, cours: listPvp };

		localStorage.setItem("coursData", JSON.stringify(classeData));

		clearCache();
	};

	const fetchData = async (code: string, setListFunction: React.Dispatch<React.SetStateAction<AppointmentModel[]>>) => {
		try {
			setDateOfCache(undefined);

			displaySwal(true, false);

			if (code === "") {
				return;
			}

			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}calendar?resources=${code}`, {
				headers: {
					"Access-Control-Allow-Origin": import.meta.env.VITE_ORIGIN_URL,
				},
				signal: AbortSignal.timeout(5000),
			});

			const result = await response.json();

			if (!result.success) {
				throw new Error("Error while fetching data");
			}

			const data = getData(result.data);

			if (!data) {
				throw new Error("Error while parsing data");
			}

			setListFunction(data);
			setBackgroundColor(data);

			saveCache();

			displaySwal(false, false);
		} catch (err) {
			if (err) {
				displaySwal(false, true);
				loadCache();
			}
		}
	};

	const fetchClasseData = () => fetchData(classeCode, setListClasse);
	const fetchPvpData = () => fetchData(pvpCode, setListPvp);

	// Update hours of the week when currentDate change (change week) or when listCours updated
	useEffect(() => {
		const timeElement = document.getElementById("time-number");

		if (!timeElement) {
			return;
		}

		let hours = 0;

		const date = moment(currentDate);

		const weekStart = date.clone().startOf("week");
		const weekEnd = date.clone().endOf("week");

		combinedList?.forEach((cours) => {
			const coursDate = moment(cours.startDate.toString(), "YYYYMMDDTHHmmss[Z]");
			if (coursDate.isBetween(weekStart, weekEnd)) {
				hours += moment(cours.endDate?.toString(), "YYYYMMDDTHHmmss[Z]").diff(coursDate, "hours", true);
			}
		});

		const minutes = Math.round((hours % 1) * 60);
		hours = Math.floor(hours);

		timeElement.textContent = `${hours}h${minutes === 0 ? "" : minutes}`;
	}, [currentDate, combinedList]);

	const filterDuplicates = () => {
		const uidSet = new Set(listClasse.map((item) => item.uid));

		const filteredPvp = listPvp.filter((item) => !uidSet.has(item.uid));

		return [...listClasse, ...filteredPvp];
	};

	const darkTheme = createTheme({
		palette: {
			mode: darkMode ? "dark" : "light",
		},
	});

	// Get all data when the component is mounted
	useEffect(() => {
		resetColors();

		const toolBar = document.querySelector(".MuiToolbar-root.MuiToolbar-gutters.MuiToolbar-regular.Toolbar-toolbar");

		if (toolBar && toolBar.querySelector("#time") === null) {
			const timeElement = document.createElement("p");
			timeElement.id = "time";

			const timeTextElement = document.createElement("span");
			timeTextElement.id = "time-text";
			timeTextElement.textContent = "Temps de cours cette semaine ";

			const timeNumberElement = document.createElement("span");
			timeNumberElement.id = "time-number";
			timeNumberElement.textContent = "0h";

			timeElement.append(timeTextElement, timeNumberElement);

			toolBar.append(timeElement);
		}
	}, []);

	useEffect(() => {
		setCombinedList(filterDuplicates());

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [listClasse, listPvp]);

	useEffect(() => {
		setBackgroundColor(combinedList);
	}, [combinedList]);

	useEffect(() => {
		fetchClasseData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [classeCode]);

	useEffect(() => {
		fetchPvpData();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [pvpCode]);

	return (
		<React.Fragment>
			{dateOfCache !== undefined ? (
				<div id="cache-warning">
					<h3>
						<span className="emoji">⚠️</span>Données du {dateOfCache}
					</h3>
					<button
						type="button"
						onClick={() => {
							fetchClasseData();
							fetchPvpData();
						}}
					>
						Rafraîchir
					</button>
				</div>
			) : (
				""
			)}

			<ThemeProvider theme={darkTheme}>
				<CssBaseline />
				<Paper variant="outlined" square style={{ borderBottomColor: "var(--grey)" }}>
					<Scheduler data={combinedList} height="auto" locale="fr-FR">
						<ViewState defaultCurrentDate={getDate()} onCurrentDateChange={handleDateChange} />
						<Toolbar />
						<DateNavigator />
						<TodayButton messages={TODAY_BUTTON_TEXT} />
						<WeekView startDayHour={DAY_START_HOUR} endDayHour={DAY_END_HOUR} excludedDays={DAYS_EXCLUDED} cellDuration={CELL_DURATION} />

						<Appointments appointmentComponent={AppointmentComponent} appointmentContentComponent={AppointmentContent} />
						<AppointmentTooltip contentComponent={AppointementTooltipContent} />

						<CurrentTimeIndicator
							indicatorComponent={TimeIndicator}
							shadePreviousCells={SHADE_PREVIOUS_CELL}
							shadePreviousAppointments={SHADE_PREVIOUS_APPOINTMENTS}
						/>
					</Scheduler>
				</Paper>
			</ThemeProvider>
		</React.Fragment>
	);
};

export default Calendar;
