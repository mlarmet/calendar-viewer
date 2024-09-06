import { AppointmentModel } from "@devexpress/dx-react-scheduler";

const BACKGROUND_COLOR = {
	DEFAULT: "#4FC3F7",
	PVP: "#7A7A76",
	CONFERENCE: "#e53332",
};

const COLORS = [
	{ hex: "#f0932b", selected: false },
	{ hex: "#4caf50", selected: false },
	{ hex: "#2f469e", selected: false },
	{ hex: "#1abc9c", selected: false },
	{ hex: "#00a5e0", selected: false },
	{ hex: "#a65ec2", selected: false },
	{ hex: "#7353b6", selected: false },
	{ hex: "#1abc9c", selected: false },
	{ hex: "#d1ac10", selected: false },
	{ hex: "#e67e22", selected: false },
	{ hex: "#3498db", selected: false },
	{ hex: "#9b59b6", selected: false },
	{ hex: "#2ecc71", selected: false },
];

const colorsTitleMap = new Map<string, string>();

const PREFIX = "calendar";

export const classes = {
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

const getCleanTitle = (title: string) => {
	return title.replace(/([1-2][A-B]|[1-2]\*?|CM|\*)$/, "").trim();
};

export const getBackgroundColor = (data: AppointmentModel): string => {
	if (!data.title) {
		return BACKGROUND_COLOR.DEFAULT;
	}

	if (data.isPvp) {
		return BACKGROUND_COLOR.PVP;
	}

	if (data.isConference) {
		return BACKGROUND_COLOR.CONFERENCE;
	}

	return colorsTitleMap.get(getCleanTitle(data.title)) || BACKGROUND_COLOR.DEFAULT;
};

export const setBackgroundColor = (data: AppointmentModel[]) => {
	if (!data) {
		return;
	}

	const appointments = structuredClone(data).filter((appointment) => !appointment.isPvp && !appointment.isConference);

	// Compter l'occurrence des événements basés sur le champ SUMMARY
	const occurrences = appointments.reduce((acc, appointment) => {
		const title = getCleanTitle(appointment.title || "");

		acc[title] = (acc[title] || 0) + 1;
		return acc;
	}, {} as { [key: string]: number });

	// Trier par ordre décroissant selon les occurrences
	const sortedOccurrences = Object.entries(occurrences)
		.sort(([, a], [, b]) => b - a)
		.map(([title, count]) => ({ title, count }));

	// Assigner les couleurs selon les occurrences
	sortedOccurrences.forEach((event, index) => {
		colorsTitleMap.set(event.title, COLORS[index]?.hex ?? BACKGROUND_COLOR.DEFAULT);
	});
};

export const resetColors = () => {
	colorsTitleMap.clear();
	COLORS.forEach((c) => (c.selected = false));
};
