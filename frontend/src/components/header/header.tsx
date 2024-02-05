import { useEffect, useState } from "react";
import Select, { SingleValue } from "react-select";

import { HeaderProps, Option } from "./header.d";

import "./header.css";

const options: Option[] = [
	{ value: "7073", label: "M2 TIIL-A" },
	{ value: "35", label: "L3 IFA 3" },
];

const Header: React.FC<HeaderProps> = ({ startClasseCode, onClasseChange }) => {
	const startOption = options.find((option) => option.value === startClasseCode) || options[0];

	const [selectedOption, setSelectedOption] = useState(startOption);

	const handleClasseChange = (newOption: SingleValue<Option>) => {
		if (newOption === null || newOption?.value === null) {
			return;
		}

		setSelectedOption(newOption);
	};

	// Send the selected class to the parent component
	useEffect(() => {
		onClasseChange(selectedOption.value);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [selectedOption]);

	return (
		<header>
			<h1>
				<span className="emoji">📅</span>Emplois du temps
			</h1>
			<div id="select-classe">
				<Select className="select" value={selectedOption} onChange={handleClasseChange} options={options} isSearchable={false} />
			</div>
		</header>
	);
};

export default Header;
