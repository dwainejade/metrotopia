import { useState, useEffect } from "react";
import Tippy, { useSingleton } from "@tippyjs/react";
import "../../styles/TopRightMenu.css";
import useResourcesStore from "../../stores/lwlResourcesStore";
import useGridStore from "../../stores/gridStore";
import useAudioStore from "../../stores/audioStore";
import DynamicChart from "../ui/DynamicChart";
import PieChart from "../ui/PieChart";
import { useSpring, animated } from "react-spring";
import useMeasure from "react-use-measure";

import WinConditionDetails from "./WinConditionsLWL";
import PopulationDetails from "../ui/top-right-menu/PopulationDetails";
import LizardDetails from "./LizardDetails";
import DevelopmentDetails from "../ui/top-right-menu/DevelopmentDetails";
import EnergyDetails from "../ui/top-right-menu/EnergyDetails";
import WaterDetails from "../ui/top-right-menu/WaterDetails";
import AirPollutionDetails from "../ui/top-right-menu/AirPollutionDetails";
import FundingDetails from "../ui/top-right-menu/FundingDetails";
import LandscapeDetails from "../ui/top-right-menu/LandscapeDetails";

import trophyInactive from "../../assets/top-right-menu/sim-overview-inactive.svg";
import trophyActive from "../../assets/top-right-menu/sim-overview-active.svg";
import populationInactive from "../../assets/top-right-menu/population-inactive.svg";
import populationActive from "../../assets/top-right-menu/population-active.svg";
import wildlifeInactive from "../../assets/top-right-menu/wildlife-inactive.svg";
import wildlifeActive from "../../assets/top-right-menu/wildlife-active.svg";
import natureInactive from "../../assets/top-right-menu/nature-inactive.svg";
import natureActive from "../../assets/top-right-menu/nature-active.svg";
import urbanInactive from "../../assets/top-right-menu/urbanization-inactive.svg";
import urbanActive from "../../assets/top-right-menu/urbanization-active.svg";
import energyInactive from "../../assets/top-right-menu/energy-inactive.svg";
import energyActive from "../../assets/top-right-menu/energy-active.svg";
import waterInactive from "../../assets/top-right-menu/water-inactive.svg";
import waterActive from "../../assets/top-right-menu/water-active.svg";
import pollutionInactive from "../../assets/top-right-menu/air-inactive.svg";
import pollutionActive from "../../assets/top-right-menu/air-active.svg";
import fundingInactive from "../../assets/top-right-menu/funding-inactive.svg";
import fundingActive from "../../assets/top-right-menu/funding-active.svg";

const TopRightMenuLWL = ({ expandedMenu, activeTab, selectTab }) => {
	const { resources, satisfaction } = useResourcesStore();
	const { setFilter, clearFilter, activeFilter } = useGridStore();
	const { playSound } = useAudioStore();
	const [showChart, setShowChart] = useState({ "development stats": true });
	const [localExpandedMenu, setLocalExpandedMenu] = useState(null);
	const [ref, { height }] = useMeasure();

	useEffect(() => {
		if (expandedMenu) {
			setLocalExpandedMenu(expandedMenu);
		}
		if (
			activeFilter?.type === "activePowerMod" &&
			expandedMenu !== "Energy Stats"
		) {
			clearFilter();
		}
	}, [expandedMenu]);

	const menuAnimation = useSpring({
		height: expandedMenu ? height + 10 : 0,
		config: {
			mass: 1,
			tension: 250,
			friction: 25,
			clamp: true,
		},
		onRest: () => {
			if (!expandedMenu) {
				setLocalExpandedMenu(null);
			}
		},
	});

	// capitalize first letter of each word
	const toTitleCase = (str) => {
		return str.replace(
			/\w\S*/g,
			(word) => word.charAt(0).toUpperCase() + word.substr(1).toLowerCase()
		);
	};

	const menuItemsImgs = [
		{
			key: "win conditions",
			iconInactive: trophyInactive,
			iconActive: trophyActive,
		},
		{
			key: "anole lizard stats",
			iconInactive: wildlifeInactive,
			iconActive: wildlifeActive,
		},
		{
			key: "landscape stats",
			iconInactive: natureInactive,
			iconActive: natureActive,
		},
		{
			key: "development stats",
			iconInactive: urbanInactive,
			iconActive: urbanActive,
		},
	];

	const toggleChart = (key) => {
		setShowChart((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const showChartIcon = (category) => {
		return (
			category === "population stats" ||
			category === "landscape stats" ||
			category === "anole lizard stats" ||
			category === "development stats"
		);
	};

	const handleSelectEnergyType = (type) => {
		if (type === activeFilter?.value) {
			clearFilter();
			return;
		}
		setFilter("activePowerMod", type);
	};

	const getChartTooltip = (activeTab) => {
		switch (activeTab) {
			case "population stats":
				return "Display Population as a Graph";
			case "anole lizard stats":
				return "Display Wildlife as a Graph";
			case "landscape stats":
				return "Display Tree Count as a Graph";
			case "development stats":
				return "Display Development as a Graph";
			default:
				return "";
		}
	};

	const getMenuItemTooltip = (key) => {
		return toTitleCase(key);
	};

	const handleChartToggle = () => {
		toggleChart(expandedMenu);
		playSound("popUpSound2");
	};

	const [source, target] = useSingleton();

	return (
		<div className="top-right-menu lwl">
			<Tippy
				singleton={source}
				moveTransition="transform 0.2s ease-out"
				animation="shift-away-subtle"
			/>
			{menuItemsImgs.map(({ key, iconInactive, iconActive }) => (
				<Tippy key={key} singleton={target} content={getMenuItemTooltip(key)}>
					<button
						onClick={() => selectTab(key)}
						className={`btn ${expandedMenu === key ? "active" : ""}`}
					>
						<img
							src={expandedMenu === key ? iconActive : iconInactive}
							alt={key}
							className="top-right-icon"
						/>
					</button>
				</Tippy>
			))}

			<animated.div
				className={`expanded-menu ${expandedMenu ? "open" : "closed"}`}
				style={menuAnimation}
			>
				<div ref={ref}>
					<div className="details-header">
						<h2>{localExpandedMenu ? localExpandedMenu.toUpperCase() : ""}</h2>

						{localExpandedMenu && showChartIcon(expandedMenu) && (
							<Tippy
								content={
									showChart[expandedMenu]
										? "Close Graph"
										: getChartTooltip(expandedMenu)
								}
								animation="shift-away-subtle"
							>
								<button
									className={`toggle-chart-btn ${
										showChart[expandedMenu] ? "active" : ""
									}`}
									onClick={handleChartToggle}
									aria-label="toggle chart"
								/>
							</Tippy>
						)}
					</div>
					{localExpandedMenu &&
						resources &&
						(showChart[localExpandedMenu] ? (
							<ChartContent
								category={localExpandedMenu}
								satisfaction={satisfaction}
							/>
						) : (
							<DetailsContent
								category={localExpandedMenu}
								resources={resources}
								handleSelectEnergyType={handleSelectEnergyType}
								selectedEnergyType={activeFilter?.value}
								satisfaction={satisfaction}
							/>
						))}
				</div>
			</animated.div>
		</div>
	);
};

const ChartContent = ({ category, satisfaction }) => {
	switch (category) {
		case "population stats":
			return (
				<DynamicChart
					metric="population"
					color="#8884d8"
					title="Population Over Time"
				/>
			);
		case "anole lizard stats":
			return (
				<DynamicChart
					metric="wildlife"
					color="#82ca9d"
					title="Lizard Population Over Time"
					xLabel="Buildings"
					yLabel="Anole Lizard Population"
				/>
			);
		case "landscape stats":
			return (
				<DynamicChart
					metric="trees"
					color="#ffc658"
					title="Tree Count Over Time"
					xLabel="Buildings"
				/>
			);
		case "development stats":
			return (
				<PieChart
					metric="development stats"
					title="Urbanization Over Time"
					satisfaction={satisfaction}
				/>
			);
		default:
			return null;
	}
};

const DetailsContent = ({
	category,
	resources,
	handleSelectEnergyType,
	selectedEnergyType,
	satisfaction,
}) => {
	if (!resources) return null;
	switch (category) {
		case "win conditions":
			return (
				<WinConditionDetails
					resources={resources}
					satisfaction={satisfaction}
				/>
			);
		case "population stats":
			return <PopulationDetails population={resources.population} />;
		case "anole lizard stats":
			return <LizardDetails wildlife={resources.wildlife} />;
		case "landscape stats":
			return (
				<LandscapeDetails
					trees={resources.trees}
					temperature={resources.temperature}
				/>
			);
		case "development stats":
			return (
				<DevelopmentDetails
					urbanization={resources.urbanization}
					satisfaction={satisfaction}
				/>
			);
		case "energy stats":
			return (
				<EnergyDetails
					energy={resources.energy}
					handleSelectEnergyType={handleSelectEnergyType}
					selectedEnergyType={selectedEnergyType}
				/>
			);
		case "water stats":
			return <WaterDetails resources={resources} />;
		case "air pollution stats":
			return (
				<AirPollutionDetails
					pollution={resources.pollution}
					traffic={resources.traffic}
				/>
			);
		case "funding and taxes":
			return <FundingDetails funds={resources.funds} taxes={resources.taxes} />;
		default:
			return <p>Select a category to view details.</p>;
	}
};

export default TopRightMenuLWL;
