import { Component } from "react";

import Header from "../../components/header/header";
import Footer from "../../components/footer/footer";
import Calendar from "../../components/calendar/calendar";

import "./home.css";

export default class Home extends Component {
	render() {
		return (
			<div id="viewer">
				<Header />
				<div id="container">
					<Calendar />
				</div>
				<Footer />
			</div>
		);
	}
}
