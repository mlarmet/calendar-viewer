import moment from "moment";

import { AccessTime, Lens, People, Room, SvgIconComponent } from "@mui/icons-material";
import Grid from "@mui/material/Grid";
import { styled, Theme } from "@mui/material/styles";

import { Appointments, AppointmentTooltip, CurrentTimeIndicator } from "@devexpress/dx-react-scheduler-material-ui";

import { classes, getBackgroundColor } from "./calendar-property";

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

export const AppointementTooltipContent = ({ appointmentData, formatDate }: AppointmentTooltip.ContentProps) => {
	if (!appointmentData) {
		return <></>;
	}

	const bgColor = getBackgroundColor(appointmentData);

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

export const AppointmentComponent = ({ children, ...restProps }: Appointments.AppointmentProps) => {
	if (!restProps.data) {
		return <></>;
	}

	const bgColor = getBackgroundColor(restProps.data);

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

export const AppointmentContent = ({ data, formatDate, ...restProps }: Appointments.AppointmentContentProps) => {
	return (
		<Appointments.AppointmentContent className={classes.container} {...restProps} data={data} formatDate={formatDate}>
			<div className="event-text">
				<p style={{ fontWeight: "bold" }}>{data.title}</p>
				<p>
					{formatDate(data.startDate, { hour: "numeric", minute: "numeric" })} - {formatDate(data.endDate, { hour: "numeric", minute: "numeric" })}
				</p>
				<p className="description">{data.salle}</p>
				<p className="description">{data.prof}</p>
			</div>
		</Appointments.AppointmentContent>
	);
};

export const TimeIndicator = ({ ...restProps }: CurrentTimeIndicator.IndicatorProps) => {
	return (
		<StyledDiv {...restProps}>
			<div className={classes.nowIndicator + " " + classes.circle} />
			<div className={classes.nowIndicator + " " + classes.line} />
		</StyledDiv>
	);
};
