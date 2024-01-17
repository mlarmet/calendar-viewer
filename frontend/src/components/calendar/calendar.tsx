import React, { useEffect, useState } from "react";

import Swal from "sweetalert2";

import { AppointmentModel, ViewState } from "@devexpress/dx-react-scheduler";
import {
	Scheduler,
	Toolbar,
	DateNavigator,
	Appointments,
	WeekView,
	TodayButton,
	TodayButtonProps,
	AppointmentTooltip,
	CurrentTimeIndicator,
} from "@devexpress/dx-react-scheduler-material-ui";

import moment from "moment";

import { AppointmentComponent, AppointmentContent, AppointementTooltipContent, TimeIndicator } from "./calendar-property";

// Custom types imports
import { CalendarProps, icalItem } from "./calendar.d";

// Style import
import "./calendar.css";

const dayStartHour: number = 8;
const dayEndHour: number = 19;

const daysExcluded: number[] = [0, 6];
const cellDuraction: number = 45;

const todayButtonText: TodayButtonProps["messages"] = {
	today: "Aujourd'hui",
};

const shadePreviousCells: boolean = true;
const shadePreviousAppointments: boolean = true;

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
	allowEnterKey: false,
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

			const startDate = icalDataItem.DTSTART;
			const endDate = icalDataItem.DTEND;

			// Remove the date from the description, prevent display it in the tooltip
			const pattern = /Exporté le:(\d{2}\/\d{2}\/\d{4} \d{2}:\d{2})/;
			const description = icalDataItem.DESCRIPTION.replace(pattern, "").split("\\n");

			const title = icalDataItem.SUMMARY;

			// "Période en entreprise" doesn't have a prof
			const prof = description[description.length - 3];

			const salle = icalDataItem.LOCATION;

			data.push({
				title,
				startDate,
				endDate,
				prof,
				salle,
				isPvp: title.toLocaleLowerCase().includes("communication") || title.toLocaleLowerCase().includes("anglais"),
			});
		}
	}

	return data;
};

const getDate = (): string => {
	return moment().format("YYYY-MM-DD");
};

const Calendar: React.FC<CalendarProps> = ({ classeCode }) => {
	const [dateCache, setDateCache] = useState<string | undefined>(undefined);
	const [listCours, setListCours] = useState<AppointmentModel[]>([]);
	const [currentDate, setCurrentDate] = useState<string>(moment().format("YYYY-MM-DD"));

	// Update hours of the week when currentDate change (change week) or when listCours updated
	useEffect(() => {
		let hours = 0;

		const date = moment(currentDate);

		const weekStart = date.clone().startOf("week");
		const weekEnd = date.clone().endOf("week");

		listCours.forEach((cours) => {
			const coursDate = moment(cours.startDate.toString(), "YYYYMMDDTHHmmss[Z]");
			if (coursDate.isBetween(weekStart, weekEnd)) {
				hours += moment(cours.endDate?.toString(), "YYYYMMDDTHHmmss[Z]").diff(coursDate, "hours", true);
			}
		});

		const timeElement = document.getElementById("time-number");

		if (timeElement) {
			timeElement.textContent = hours + "h";
		}
	}, [currentDate, listCours]);

	const handleDateChange = (currentDate: Date) => {
		const dateStr = moment(currentDate).format("YYYY-MM-DD");
		setCurrentDate(dateStr);
	};

	const displaySwal = (loading: boolean, error: boolean) => {
		if (!loading && !error) {
			Swal.close();
		}

		if (loading) {
			loadingSwal.fire();
		} else if (error) {
			if (localStorage.getItem(classeCode)) {
				loadCache();
				Swal.close();
			} else {
				errorSwal.fire().then((result) => {
					if (result.isConfirmed) {
						fetchData();
					}
				});
			}
		}
	};

	const loadCache = () => {
		const cache = localStorage.getItem(classeCode);

		if (cache) {
			const dataCache = JSON.parse(cache);

			setListCours(dataCache.cours);
			setDateCache(moment(dataCache.date).format("DD/MM/YYYY à HH:mm"));
		}
	};

	const saveCache = (cours: AppointmentModel[]) => {
		const data = {
			date: moment(),
			cours: cours,
		};

		localStorage.setItem(classeCode, JSON.stringify(data));
	};

	const fetchData = async () => {
		try {
			setDateCache(undefined);

			displaySwal(true, false);

			if (classeCode === "") {
				return;
			}

			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}calendar?classe=${classeCode}`, {
				headers: {
					"Access-Control-Allow-Origin": import.meta.env.VITE_ORIGIN_URL,
				},
			});

			const result = await response.json();

			if (!result.success) {
				displaySwal(false, true);

				return;
			}

			const cours = getData(result.data);

			setListCours(cours);
			saveCache(cours);

			displaySwal(false, false);
		} catch (err) {
			if (err) {
				displaySwal(false, true);
			}
		}
	};

	// Get all data when the component is mounted
	useEffect(() => {
		setListCours([]);

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

		fetchData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [classeCode]);

	return (
		<React.Fragment>
			{dateCache !== undefined ? (
				<div id="cache-warning">
					<h3>⚠️ Données du {dateCache}</h3>
					<button type="button" onClick={fetchData}>
						Rafraîchir
					</button>
				</div>
			) : (
				""
			)}
			<Scheduler data={listCours} height="auto" locale="fr-FR">
				<ViewState defaultCurrentDate={getDate()} onCurrentDateChange={handleDateChange} />
				<Toolbar />
				<DateNavigator />
				<TodayButton messages={todayButtonText} />
				<WeekView startDayHour={dayStartHour} endDayHour={dayEndHour} excludedDays={daysExcluded} cellDuration={cellDuraction} />

				<Appointments appointmentComponent={AppointmentComponent} appointmentContentComponent={AppointmentContent} />
				<AppointmentTooltip contentComponent={AppointementTooltipContent} />

				<CurrentTimeIndicator
					indicatorComponent={TimeIndicator}
					shadePreviousCells={shadePreviousCells}
					shadePreviousAppointments={shadePreviousAppointments}
				/>
			</Scheduler>
		</React.Fragment>
	);
};

export default Calendar;
