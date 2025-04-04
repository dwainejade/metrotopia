import { useState, useEffect } from "react";
import Tippy, { useSingleton } from "@tippyjs/react";
import "@src/styles/TopRightMenu.css";
import useResourcesStore from "@src/stores/resourcesStore";
import useGridStore from "@src/stores/gridStore";
import useAudioStore from "@src/stores/audioStore";
import DynamicChart from "../DynamicChart";
import PieChart from "../PieChart";
import { useSpring, animated } from "react-spring";
import useMeasure from "react-use-measure";

import WinConditionDetails from './WinConditions';
import PopulationDetails from './PopulationDetails';
import WildlifeDetails from './WildlifeDetails';
import LandscapeDetails from './LandscapeDetails';
import DevelopmentDetails from './DevelopmentDetails';
import EnergyDetails from './EnergyDetails';
import WaterDetails from './WaterDetails';
import AirPollutionDetails from './AirPollutionDetails';
import FundingDetails from './FundingDetails';

import trophyInactive from "@src/assets/top-right-menu/sim-overview-inactive.svg";
import trophyActive from "@src/assets/top-right-menu/sim-overview-active.svg";
import populationInactive from "@src/assets/top-right-menu/population-inactive.svg";
import populationActive from "@src/assets/top-right-menu/population-active.svg";
import wildlifeInactive from "@src/assets/top-right-menu/wildlife-inactive.svg";
import wildlifeActive from "@src/assets/top-right-menu/wildlife-active.svg";
import natureInactive from "@src/assets/top-right-menu/nature-inactive.svg";
import natureActive from "@src/assets/top-right-menu/nature-active.svg";
import urbanInactive from "@src/assets/top-right-menu/urbanization-inactive.svg";
import urbanActive from "@src/assets/top-right-menu/urbanization-active.svg";
import energyInactive from "@src/assets/top-right-menu/energy-inactive.svg";
import energyActive from "@src/assets/top-right-menu/energy-active.svg";
import waterInactive from "@src/assets/top-right-menu/water-inactive.svg";
import waterActive from "@src/assets/top-right-menu/water-active.svg";
import pollutionInactive from "@src/assets/top-right-menu/air-inactive.svg";
import pollutionActive from "@src/assets/top-right-menu/air-active.svg";
import fundingInactive from "@src/assets/top-right-menu/funding-inactive.svg";
import fundingActive from "@src/assets/top-right-menu/funding-active.svg";

const TopRightMenu = ({ expandedMenu, activeTab, selectTab }) => {
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
		if (activeFilter?.type === 'activePowerMod' && expandedMenu !== 'Energy Stats') {
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
		{ key: "win conditions", iconInactive: trophyInactive, iconActive: trophyActive, },
		{ key: "population stats", iconInactive: populationInactive, iconActive: populationActive, },
		{ key: "wildlife stats", iconInactive: wildlifeInactive, iconActive: wildlifeActive, },
		{ key: "landscape stats", iconInactive: natureInactive, iconActive: natureActive, },
		{ key: "development stats", iconInactive: urbanInactive, iconActive: urbanActive, },
		{ key: "energy stats", iconInactive: energyInactive, iconActive: energyActive, },
		{ key: "water stats", iconInactive: waterInactive, iconActive: waterActive, },
		{ key: "air pollution stats", iconInactive: pollutionInactive, iconActive: pollutionActive, },
		{ key: "funding and taxes", iconInactive: fundingInactive, iconActive: fundingActive, },
	];

	const toggleChart = (key) => {
		setShowChart((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const showChartIcon = (category) => {
		return (
			category === "population stats" ||
			category === "landscape stats" ||
			category === "wildlife stats" ||
			category === "development stats"
		);
	};

	const handleSelectEnergyType = (type) => {
		if (type === activeFilter?.value) {
			clearFilter();
			return;
		}
		setFilter('activePowerMod', type);
	};

	const getChartTooltip = (activeTab) => {
		switch (activeTab) {
			case "population stats":
				return "Display Population as a Graph";
			case "wildlife stats":
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
		<div className="top-right-menu">
			<Tippy singleton={source} moveTransition="transform 0.2s ease-out" animation="shift-away-subtle" />
			{menuItemsImgs.map(({ key, iconInactive, iconActive }) => (
				<Tippy key={key} singleton={target} content={getMenuItemTooltip(key)}>
					<button onClick={() => selectTab(key)} className={`btn ${expandedMenu === key ? "active" : ""}`}>
						<img src={expandedMenu === key ? iconActive : iconInactive} alt={key} className="top-right-icon" />
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
								animation="shift-away-subtle" >
								<button
									className={`toggle-chart-btn ${showChart[expandedMenu] ? "active" : ""
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
			return <DynamicChart metric="population" color="#8884d8" title="Population Over Time" />;
		case "wildlife stats":
			return <DynamicChart metric="wildlife" color="#82ca9d" title="Wildlife Population Over Time" />;
		case "landscape stats":
			return <DynamicChart metric="trees" color="#ffc658" title="Tree Count Over Time" />;
		case "development stats":
			return <PieChart metric="development stats" title="Urbanization Over Time" satisfaction={satisfaction} />;
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
			return <WinConditionDetails resources={resources} satisfaction={satisfaction} />;
		case "population stats":
			return <PopulationDetails population={resources.population} />;
		case "wildlife stats":
			return <WildlifeDetails wildlife={resources.wildlife} />;
		case "landscape stats":
			return <LandscapeDetails trees={resources.trees} temperature={resources.temperature} />;
		case "development stats":
			return <DevelopmentDetails urbanization={resources.urbanization} satisfaction={satisfaction} />;
		case "energy stats":
			return <EnergyDetails energy={resources.energy} handleSelectEnergyType={handleSelectEnergyType} selectedEnergyType={selectedEnergyType} />
		case "water stats":
			return <WaterDetails resources={resources} />;
		case "air pollution stats":
			return <AirPollutionDetails pollution={resources.pollution} traffic={resources.traffic} />;
		case "funding and taxes":
			return <FundingDetails funds={resources.funds} taxes={resources.taxes} />;
		default:
			return <p>Select a category to view details.</p>;
	}
};

export default TopRightMenu;