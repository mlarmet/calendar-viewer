import { useState } from "react";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Calendar from "../../components/calendar/calendar";

import "./home.css";

const Home = () => {
	const [classeCode, setClasseCode] = useState<string>(localStorage.getItem("classeCode") || "");

	const handleClasseChange = (code: string) => {
		setClasseCode(code);

		localStorage.setItem("classeCode", code);
	};

	return (
		<div id="viewer">
			<Header startClasseCode={classeCode} onClasseChange={handleClasseChange} />

			<div id="container">
				<Calendar classeCode={classeCode} />
			</div>
			<Footer />
		</div>
	);
};

export default Home;
