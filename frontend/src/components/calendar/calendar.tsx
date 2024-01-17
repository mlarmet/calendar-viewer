import { useEffect, useState } from "react";

import Swal from "sweetalert2";

import { AppointmentModel, SchedulerDateTime, ViewState } from "@devexpress/dx-react-scheduler";
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

import { styled, Theme } from "@mui/material/styles";
import Grid from "@mui/material/Grid";
import { Room, People, Lens, AccessTime, SvgIconComponent } from "@mui/icons-material";

import moment from "moment";

// Style import
import "./calendar.css";

// Custom types imports
import { CalendarProps, icalItem } from "./calendar.d";

const dayStartHour: number = 8;
const dayEndHour: number = 19;

const daysExcluded: number[] = [0, 6];
const cellDuraction: number = 45;

const todayButtonText: TodayButtonProps["messages"] = {
	today: "Aujourd'hui",
};

const pvpBackgroundColor: string = "#7A7A76";
const defaultBackgroundColor: string = "#4FC3F7";

const shadePreviousCells: boolean = true;
const shadePreviousAppointments: boolean = true;

const PREFIX = "calendar";

const classes = {
	flexibleSpace: `${PREFIX}-flexibleSpace`,
	prioritySelector: `${PREFIX}-prioritySelector`,
	content: `${PREFIX}-content`,
	contentContainer: `${PREFIX}-contentContainer`,
	text: `${PREFIX}-text`,
	title: `${PREFIX}-title`,
	icon: `${PREFIX}-icon`,
	contentItemIcon: `${PREFIX}-contentItemIcon`,
	grayIcon: `${PREFIX}-grayIcon`,
	colorfulContent: `${PREFIX}-colorfulContent`,
	lens: `${PREFIX}-lens`,
	textCenter: `${PREFIX}-textCenter`,
	dateAndTitle: `${PREFIX}-dateAndTitle`,
	titleContainer: `${PREFIX}-titleContainer`,
	container: `${PREFIX}-container`,
	bullet: `${PREFIX}-bullet`,
	prioritySelectorItem: `${PREFIX}-prioritySelectorItem`,
	priorityText: `${PREFIX}-priorityText`,
	priorityShortText: `${PREFIX}-priorityShortText`,
	cellLowPriority: `${PREFIX}-cellLowPriority`,
	cellMediumPriority: `${PREFIX}-cellMediumPriority`,
	cellHighPriority: `${PREFIX}-cellHighPriority`,
	headerCellLowPriority: `${PREFIX}-headerCellLowPriority`,
	headerCellMediumPriority: `${PREFIX}-headerCellMediumPriority`,
	headerCellHighPriority: `${PREFIX}-headerCellHighPriority`,
	line: `${PREFIX}-line`,
	circle: `${PREFIX}-circle`,
	nowIndicator: `${PREFIX}-nowIndicator`,
	shadedCell: `${PREFIX}-shadedCell`,
	shadedPart: `${PREFIX}-shadedPart`,
	appointment: `${PREFIX}-appointment`,
	shadedAppointment: `${PREFIX}-shadedAppointment`,
};

const createStyledIcon = (IconComponent: SvgIconComponent) =>
	styled(IconComponent)(({ theme: { palette } }) => ({
		// Common styling for the icons
		[`&.${classes.icon}`]: {
			color: palette.action.active,
		},
	}));

const StyledTime = createStyledIcon(AccessTime);
const StyledRoom = createStyledIcon(Room);
const StyledPeople = createStyledIcon(People);

const StyledGrid = styled(Grid)(() => ({
	[`&.${classes.textCenter}`]: {
		textAlign: "center",
	},
}));

const StyledTooltipContent = styled("div")(({ theme: { spacing, typography, palette } }) => ({
	[`&.${classes.content}`]: {
		padding: spacing(3, 1),
		paddingTop: 0,
		backgroundColor: palette.background.paper,
		boxSizing: "border-box",
		width: "400px",
	},
	[`& .${classes.contentContainer}`]: {
		paddingBottom: spacing(1.5),
	},
	[`& .${classes.text}`]: {
		...typography.body2,
		display: "inline-block",
	},
	[`& .${classes.title}`]: {
		...typography.h6,
		color: palette.text.secondary,
		fontWeight: typography.fontWeightBold,
		overflow: "hidden",
		textOverflow: "ellipsis",
		whiteSpace: "normal",
	},
	[`& .${classes.icon}`]: {
		verticalAlign: "middle",
	},
	[`& .${classes.contentItemIcon}`]: {
		textAlign: "center",
	},
	[`& .${classes.grayIcon}`]: {
		color: palette.action.active,
	},
	[`& .${classes.lens}`]: {
		width: spacing(4.5),
		height: spacing(4.5),
		verticalAlign: "super",
	},
	[`& .${classes.textCenter}`]: {
		textAlign: "center",
	},
	[`& .${classes.dateAndTitle}`]: {
		lineHeight: 1.1,
	},
	[`& .${classes.titleContainer}`]: {
		paddingBottom: spacing(2),
	},
	[`& .${classes.container}`]: {
		paddingBottom: spacing(1.5),
	},
}));

const StyledDiv = styled("div", {
	shouldForwardProp: (prop) => prop !== "top",
})(({ theme, top }: { theme: Theme; top?: string }) => ({
	[`& .${classes.line}`]: {
		height: "2px",
		borderTop: `2px ${theme.palette.primary.main} dotted`,
		width: "100%",
		transform: "translate(0, -1px)",
	},
	[`& .${classes.circle}`]: {
		width: theme.spacing(1.5),
		height: theme.spacing(1.5),
		borderRadius: "50%",
		transform: "translate(-50%, -50%)",
		background: theme.palette.primary.main,
	},
	[`& .${classes.nowIndicator}`]: {
		position: "absolute",
		zIndex: 1,
		left: 0,
		top,
	},
}));

const AppointementTooltipContent = ({ appointmentData, formatDate }: AppointmentTooltip.ContentProps) => {
	if (!appointmentData) {
		return <></>;
	}

	let bgColor = defaultBackgroundColor;

	if (appointmentData.isPvp) {
		bgColor = pvpBackgroundColor;
	}

	return (
		<StyledTooltipContent className={classes.content}>
			<Grid container alignItems="flex-start" className={classes.titleContainer}>
				<Grid item xs={2} className={classes.textCenter}>
					<Lens style={{ color: bgColor }} className={classes.lens + " " + classes.colorfulContent} />
				</Grid>
				<Grid item xs={10}>
					<div>
						<div className={classes.title + " " + classes.dateAndTitle}>{appointmentData.title}</div>
						<div className={classes.text + " " + classes.dateAndTitle}>
							{formatDate(appointmentData.startDate, { day: "numeric", weekday: "long", year: "numeric", month: "long" })}
						</div>
					</div>
				</Grid>
			</Grid>

			<Grid container alignItems="center" className={classes.contentContainer}>
				<Grid item xs={2} className={classes.textCenter}>
					<StyledTime className={classes.icon} />
				</Grid>
				<Grid item xs={10}>
					<div className={classes.text}>
						{`${formatDate(appointmentData.startDate, { hour: "numeric", minute: "numeric" })}
          - ${formatDate(appointmentData.endDate, { hour: "numeric", minute: "numeric" })}`}
					</div>
				</Grid>
			</Grid>

			<Grid container className={classes.contentContainer}>
				<StyledGrid item xs={2} className={classes.textCenter}>
					<StyledRoom className={classes.icon} />
				</StyledGrid>
				<Grid item xs={10}>
					<span>{appointmentData.salle}</span>
				</Grid>
			</Grid>
			<Grid container className={classes.contentContainer}>
				<StyledGrid item xs={2} className={classes.textCenter}>
					<StyledPeople className={classes.icon} />
				</StyledGrid>
				<Grid item xs={10}>
					<span>{appointmentData.prof}</span>
				</Grid>
			</Grid>
		</StyledTooltipContent>
	);
};

const AppointmentComponent = ({ children, ...restProps }: Appointments.AppointmentProps) => {
	if (!restProps.data) {
		return <></>;
	}

	let bgColor = defaultBackgroundColor;

	if (restProps.data.isPvp) {
		bgColor = pvpBackgroundColor;
	}

	const endDate = restProps.data.endDate;
	const isPassed = endDate ? moment(endDate.toString(), "YYYYMMDDTHHmmss[Z]").isBefore(moment()) : false;

	return (
		<Appointments.Appointment
			{...restProps}
			style={{
				backgroundColor: bgColor,
				opacity: isPassed ? 0.7 : 1,
			}}
			draggable={false}
		>
			{children}
		</Appointments.Appointment>
	);
};

const AppointmentContent = ({ data, ...restProps }: Appointments.AppointmentContentProps) => {
	return (
		<Appointments.AppointmentContent className={classes.container} {...restProps} data={data}>
			<div className="event-text">
				<p style={{ fontWeight: "bold" }}>{data.title}</p>
				<p>
					{getFormatedHours(data.startDate)} - {getFormatedHours(data.endDate || "")}
				</p>
				<p className="description">{data.salle}</p>
				<p className="description">{data.prof}</p>
			</div>
		</Appointments.AppointmentContent>
	);
};

const TimeIndicator = ({ ...restProps }: CurrentTimeIndicator.IndicatorProps) => {
	return (
		<StyledDiv {...restProps}>
			<div className={classes.nowIndicator + " " + classes.circle} />
			<div className={classes.nowIndicator + " " + classes.line} />
		</StyledDiv>
	);
};

const getFormatedHours = (dateTime: SchedulerDateTime): string => {
	if (dateTime === "") {
		return "";
	}

	const date = moment(dateTime.toString(), "YYYYMMDDTHHmmss[Z]").add(2, "hour").toDate();

	return date.getUTCHours().toString().padStart(2, "0") + "h" + date.getUTCMinutes().toString().padStart(2, "0");
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
	allowEnterKey: false,
});

const errorSwal = Swal.mixin({
	icon: "error",
	title: "Erreur lors de la récupération !",
	confirmButtonText: "Réesayer",
	confirmButtonColor: "var(--blue)",
	reverseButtons: true,
	allowOutsideClick: false,
	allowEscapeKey: false,
	allowEnterKey: false,
});

const getData = (icalData: icalItem[]): AppointmentModel[] => {
	const data: AppointmentModel[] = [];

	if (icalData && icalData.length > 0) {
		for (let i = 0; i < icalData.length; i++) {
			const icalDataItem = icalData[i];

			const startDate = icalData[i].DTSTART;
			const endDate = icalData[i].DTEND;

			const description = icalDataItem.DESCRIPTION.split("\\n");

			const title = icalDataItem.SUMMARY;

			// "Période en entreprise" doesn't have a prof
			const prof = description.length > 6 ? description[4] : "";
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
		if (loading) {
			loadingSwal.fire();
		} else if (error) {
			const cache = localStorage.getItem(classeCode);

			if (cache) {
				const dataCache = JSON.parse(cache);

				const dateCache = moment(dataCache.date);

				errorSwal
					.fire({
						text: `Il existe une sauvegarde du ${dateCache.format("DD/MM/YYYY")} à ${dateCache.format("HH:mm")}.`,
						cancelButtonText: "Backup",
						cancelButtonColor: "var(--red)",
						showCancelButton: true,
					})
					.then((result) => {
						if (result.isConfirmed) {
							fetchData();
						} else if (result.dismiss === Swal.DismissReason.cancel) {
							loadCache();
						}
					});
			} else {
				errorSwal.fire().then((result) => {
					if (result.isConfirmed) {
						fetchData();
					}
				});
			}
		} else {
			Swal.close();
		}
	};

	const loadCache = () => {
		const cache = localStorage.getItem(classeCode);

		if (cache) {
			const dataCache = JSON.parse(cache);

			setListCours(dataCache.cours);
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
	);
};

export default Calendar;
