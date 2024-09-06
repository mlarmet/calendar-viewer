import { useState } from "react";

import Calendar from "../../components/calendar/calendar";
import Footer from "../../components/footer/footer";
import Header from "../../components/header/header";

import "./home.css";

const Home = () => {
	const [classeCode, setClasseCode] = useState<string>(localStorage.getItem("classeCode") || "");
	const [pvpCode, setPvpCode] = useState<string>(localStorage.getItem("pvpCode") || "");

	const handleClasseChange = (code: string) => {
		setClasseCode(code);

		localStorage.setItem("classeCode", code);
	};

	const handlePvpChange = (code: string) => {
		setPvpCode(code);

		localStorage.setItem("pvpCode", code);
	};

	return (
		<div id="viewer">
			<Header startClasseCode={classeCode} startPvpCode={pvpCode} onClasseChange={handleClasseChange} onPvpChange={handlePvpChange} />

			<div id="container">
				<Calendar classeCode={classeCode} pvpCode={pvpCode} />
			</div>
			<Footer />
		</div>
	);
};

export default Home;
