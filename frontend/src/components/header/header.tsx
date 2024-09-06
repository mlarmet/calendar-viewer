import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

import { HeaderProps, Option } from "./header.d";

import "./header.css";

const classeOptions: Option[] = [
	{ value: "422", label: "M1 Info 1A" },
	{ value: "418", label: "M1 Info 1B" },
	{ value: "5705", label: "M1 Info 2A" },
	{ value: "5707", label: "M1 Info 2B" },
];

const pvpOptions: Option[] = [
	{ value: "7326", label: "PVP 1" },
	{ value: "7739", label: "PVP 2" },
	{ value: "7780", label: "PVP 3" },
];

const Header: React.FC<HeaderProps> = ({ startClasseCode, startPvpCode, onClasseChange, onPvpChange }) => {
	const startClasse = classeOptions.find((option) => option.value === startClasseCode) || classeOptions[0];
	const startPvp = pvpOptions.find((option) => option.value === startPvpCode) || pvpOptions[0];

	const [selectedClass, setSelectedClass] = useState(startClasse);
	const [selectedPvp, setSelectedPvp] = useState(startPvp);

	const handleClasseChange = (newOption: SingleValue<Option>) => {
		if (newOption === null || newOption?.value === null) {
			return;
		}

		setSelectedClass(newOption);
	};

	const handlePvpChange = (newOption: SingleValue<Option>) => {
		if (newOption === null || newOption?.value === null) {
			return;
		}

		setSelectedPvp(newOption);
	};

	useEffect(() => {
		onClasseChange(selectedClass.value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedClass]);

	useEffect(() => {
		onPvpChange(selectedPvp.value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedPvp]);

	return (
		<header>
			<h1>
				<span className="emoji">📅</span>Emplois du temps
			</h1>
			<div id="select-classe">
				<Select className="select" value={selectedClass} onChange={handleClasseChange} options={classeOptions} isSearchable={false} />
				<Select className="select" value={selectedPvp} onChange={handlePvpChange} options={pvpOptions} isSearchable={false} />
			</div>
		</header>
	);
};

export default Header;
