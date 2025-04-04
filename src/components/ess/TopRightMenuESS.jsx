import { useState, useEffect } from "react";
import Tippy, { useSingleton } from "@tippyjs/react";
import "../../styles/TopRightMenu.css";
import useResourcesStore from "../../stores/resourcesStore";
import useGridStore from "../../stores/gridStore";
import useAudioStore from "../../stores/audioStore";
import DynamicChart from "../ui/DynamicChart";
import PieChart from "../ui/PieChart";
import { useSpring, animated } from "react-spring";
import useMeasure from "react-use-measure";

import WinConditionDetails from './WinConditionsESS';
import PopulationDetails from '../ui/top-right-menu/PopulationDetails';
import WildlifeDetails from '../ui/top-right-menu/WildlifeDetails';
import TempDetails from './TempDetails';
import DevelopmentDetails from '../ui/top-right-menu/DevelopmentDetails';
import EnergyDetails from '../ui/top-right-menu/EnergyDetails';
import WaterDetails from '../ui/top-right-menu/WaterDetails';
import AirPollutionDetails from '../ui/top-right-menu/AirPollutionDetails';
import FundingDetails from '../ui/top-right-menu/FundingDetails';

import trophyInactive from "../../assets/top-right-menu/sim-overview-inactive.svg";
import trophyActive from "../../assets/top-right-menu/sim-overview-active.svg";
import populationInactive from "../../assets/top-right-menu/population-inactive.svg";
import populationActive from "../../assets/top-right-menu/population-active.svg";

import sunInactive from "../../assets/ess/upper-right-menu/sun-inactive.svg";
import sunActive from "../../assets/ess/upper-right-menu/sun-active.svg";
import urbanInactive from "../../assets/top-right-menu/urbanization-inactive.svg";
import urbanActive from "../../assets/top-right-menu/urbanization-active.svg";
import energyInactive from "../../assets/top-right-menu/energy-inactive.svg";
import energyActive from "../../assets/top-right-menu/energy-active.svg";

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
		{ key: "win conditions", iconInactive: trophyInactive, iconActive: trophyActive },
		{ key: "population stats", iconInactive: populationInactive, iconActive: populationActive },
		// Removed "wildlife stats"
		// Removed "water stats"
		// Removed "air pollution stats"
		{ key: "temp and tree stats", iconInactive: sunInactive, iconActive: sunActive },
		{ key: "development stats", iconInactive: urbanInactive, iconActive: urbanActive },
		{ key: "energy stats", iconInactive: energyInactive, iconActive: energyActive },
		// Removed "funding and taxes"
	];

	const toggleChart = (key) => {
		setShowChart((prev) => ({ ...prev, [key]: !prev[key] }));
	};

	const showChartIcon = (category) => {
		return (
			category === "population stats" ||
			category === "temp and tree stats" ||
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
			case "temp and tree stats":
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
		<div className="top-right-menu ess">
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
		case "temp and tree stats":
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
		case "temp and tree stats":
			return <TempDetails trees={resources.trees} temperature={resources.temperature} />;
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