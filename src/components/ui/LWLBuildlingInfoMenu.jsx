import React, { useState, useEffect, useRef } from "react";
import gameObjects, { greenModMetrics } from "../../data/lwlGameObjects";
import { greenModCosts } from "../../data/gameObjects";
import { useSpring, animated } from "react-spring";
import "../../styles/BuildingInfoMenu.css";
import {
	spaceEachWord,
	capitalizeEachWord,
} from "../../helpers/capitalizeEachWord";
import RoundedButton from "../ui/RoundedButton";
import useLwlGridStore from "../../stores/lwlGridStore";
import useLwlResourcesStore from "../../stores/lwlResourcesStore";
import useTextureStore from "../../stores/textureStore";
import useAudioStore from "../../stores/audioStore";
import Tippy from "@tippyjs/react";

const availableUpgrades = {
	structuralUpgrades: {
		singleFamilyHomes: ["coolRoof", "solarRoof"],
		apartmentComplex: ["greenRoof", "coolRoof", "solarRoof"],
		retailCenter: ["greenRoof", "coolRoof", "solarRoof"],
		mediumOfficeBuildings: ["greenRoof", "coolRoof", "solarRoof"],
		tallOfficeBuilding: ["greenRoof", "coolRoof", "solarRoof"],
		hotels: ["greenRoof", "coolRoof", "solarRoof"],
		hospital: ["greenRoof", "coolRoof", "solarRoof"],
		governmentBuilding: ["greenRoof", "coolRoof", "solarRoof"],
		warehouse: ["greenRoof", "coolRoof", "solarRoof"],
		factory: ["coolRoof", "solarRoof"],
	},
	streetUpgrades: {
		singleFamilyHomes: ["treeLinedStreets"],
		apartmentComplex: ["treeLinedStreets"],
		retailCenter: ["treeLinedStreets"],
		mediumOfficeBuildings: ["treeLinedStreets"],
		tallOfficeBuilding: ["treeLinedStreets"],
		hotels: ["treeLinedStreets"],
		hospital: ["treeLinedStreets"],
		governmentBuilding: ["treeLinedStreets"],
		warehouse: ["treeLinedStreets"],
		factory: ["treeLinedStreets"],
	},
};

const buildingTypes = {
	singleFamilyHomes: "residential-info",
	apartmentComplex: "residential-info",
	factory: "industrial-info",
	warehouse: "industrial-info",
	governmentBuilding: "services-info",
	hospital: "services-info",
	hotels: "commercial-info",
	mediumOfficeBuildings: "commercial-info",
	retailCenter: "commercial-info",
	tallOfficeBuilding: "commercial-info",
};

const buildingTypeColors = {
	"residentail-info": "#4a6537",
	"commercial-info": "#779de0",
	"services-info": "#c78e67",
	"industrial-info": "#8d5999",
};

const greenModToolTip = {
	greenRoof:
		"Reduces air pollution greatly and some surface temperature; adds trees and increases bird population",
	coolRoof: "Reduces surface temperature greatly and some air pollution",
	solarRoof: "Carbon neutral energy, but increases surface temperature",
	treeLinedStreets:
		"Adds trees, reduces air pollution, and increase bird and small mammal populations",
};

const calculateMidpoint = (range) => {
	if (Array.isArray(range)) {
		return (range[0] + range[1]) / 2;
	}
	return range;
};

const calculateTotalTemperatureChange = (metrics) => {
	const baseChange = metrics.temperature - metrics.prevMetrics.temperature;
	const greenModChange = metrics.greenModMetrics?.temperature || 0;
	return baseChange + greenModChange;
};

const LWLBuildingInfoMenu = ({ onCancel }) => {
	const {
		tiles,
		selectedTile,
		setSelectedTile,
		setCurrentModal,
		setPreviewTile,
		getTileInfo,
		clearPreview,
		updatePreviewUpgrade,
		previewTile,
		applyMods,
		updatePowerMod,
		setShowCellHighlighter,
		usingKeyboard,
	} = useLwlGridStore();
	const { updateFunds, resources } = useLwlResourcesStore();
	const { preloadedUIImages } = useTextureStore();
	const { playSound } = useAudioStore();

	const { urbanStructures, naturalFeatures } = gameObjects;

	const hasSetPreviewTile = useRef(false);
	const selectedTileData = selectedTile ? tiles[selectedTile] : null;
	const tileType = selectedTileData ? selectedTileData.type : null;
	const [hideColumn, setHideColumn] = useState({
		structuralUpgrades: false,
		streetUpgrades: false,
	});
	const tileInfo = selectedTile ? getTileInfo(selectedTile) : null;

	const [availableEnergySources, setAvailableEnergySources] = useState([]);
	const [originalPowerMod, setOriginalPowerMod] = useState(null); // Store the original power mod when component mounts
	const [hasSolarRoof, setHasSolarRoof] = useState(false);
	const revertPowerModRef = useRef(false);
	const menuRef = useRef(null);

	const [previewValues, setPreviewValues] = useState({
		airPollution: 0,
		temperature: 0,
		treeCount: 0,
	});

	useEffect(() => {
		if (usingKeyboard) {
			menuRef.current.focus();
		}
	}, [usingKeyboard, selectedTile]);

	useEffect(() => {
		if (selectedTile && selectedTileData) {
			const connectedMods = selectedTileData?.upgrades.connectionMods;
			setAvailableEnergySources([
				...connectedMods.power,
				...connectedMods.transportation,
			]);
		}
	}, [selectedTile, selectedTileData]);

	useEffect(() => {
		const currentPowerMod = selectedTileData.upgrades.activeMods?.power;
		setOriginalPowerMod(currentPowerMod);

		return () => {
			if (revertPowerModRef.current === false) {
				return;
			}
			updatePowerMod(selectedTile, originalPowerMod);
		};
	}, [selectedTile, revertPowerModRef.current]);

	useEffect(() => {
		if (selectedTile && selectedTileData && !hasSetPreviewTile.current) {
			setPreviewTile(selectedTile, tileType, selectedTileData.upgrades);
			hasSetPreviewTile.current = true;
		}
		return () => {
			clearPreview();
			hasSetPreviewTile.current = false;
		};
	}, [selectedTile, tileType, setPreviewTile, clearPreview]);

	if (!selectedTileData.metrics) return null;

	const getMergedTileInfo = () => {
		if (!tileInfo) return null;

		const baseObject =
			naturalFeatures[tileInfo.type] || urbanStructures[tileInfo.type] || {};

		const mergedMetrics = {
			...baseObject.metrics,
			...tileInfo.metrics,
			wildlife: {
				...baseObject.metrics?.wildlife,
				...tileInfo.metrics?.wildlife,
			},
			water: {
				...resources.water,
			},
		};
		return {
			...baseObject,
			...tileInfo,
			metrics: mergedMetrics,
		};
	};

	const handleBuild = () => {
		revertPowerModRef.current = false;

		if (selectedTile && previewTile) {
			playSound("confirmModsSound");
			// Apply all green mods and power mod from the preview
			const upgradesToApply = {
				...previewTile.data.upgrades,
			};

			setOriginalPowerMod(selectedTileData.upgrades.activeMods?.power);

			applyMods(selectedTile, upgradesToApply);
			// subtract green mods cost from funds
			updateFunds(-calculateGreenModCosts());

			setSelectedTile(null);
			setCurrentModal(null);
			setShowCellHighlighter(false);
		}
	};

	const handleCancel = () => {
		// revert power mod
		if (originalPowerMod && hasSolarRoof) {
			updatePowerMod(selectedTile, originalPowerMod);
		}
		onCancel();
	};

	const handleKeyDown = (e) => {
		e.stopPropagation();
		if (e.key === "Escape") {
			onCancel();
		}
	};

	const displayData = selectedTileData ? selectedTileData : null;

	if (!displayData) {
		return <div>Loading...</div>;
	}

	const calculateGreenModCosts = () => {
		if (!previewTile) return 0;
		const { upgrades } = previewTile.data;
		let totalCost = 0;

		Object.keys(upgrades).forEach((key) => {
			// Ignore power and connectionMods
			if (key !== "power" && key !== "connectionMods") {
				if (upgrades[key] === true && greenModCosts[key]) {
					totalCost += greenModCosts[key];
				}
			}
		});

		return totalCost;
	};

	// Animation for the menu appearance
	const menuAnimation = useSpring({
		from: { opacity: 0, transform: "translateX(-80px)" },
		to: { opacity: 1, transform: "translateX(0px)" },
		config: { tension: 300, friction: 20 },
	});

	return (
		<animated.div
			className={`upgrade-menu ${buildingTypes[tileType]}`}
			style={menuAnimation}
			ref={menuRef}
			tabIndex={0}
			onKeyDown={handleKeyDown}
		>
			<div className="header-wrapper">
				<div className="header">
					<div className={`building-icon ${buildingTypes[tileType]}`}>
						{/* <House className="icon" size={30} /> */}
					</div>
					<div className="title-wrapper">
						<h3 className="title">Building Information</h3>
					</div>
				</div>
			</div>
			<div className="content">
				<div className="upgrades-wrapper">
					<div className="top-con">
						<h4 className="upgrade-title">
							{urbanStructures[tileType]?.name || "Unknown Structure"}
						</h4>
						<div className="cost">
							<p>Total Cost:</p>

							<p className="cost-bubble">
								${selectedTileData.metrics.cost.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				<div className="details-wrapper">
					<div className="structure-details">
						<div className="post-lizards-lwl">
							<p>Anole lizards</p>
							<p>{displayData.metrics.wildlife.reptilesAndAmphibians}</p>
						</div>
						<div className="post-lizards-lost-lwl">
							<p>Anole lizards Lost</p>
							<p>
								{displayData.metrics.prevMetrics.wildlife
									.reptilesAndAmphibians -
									displayData.metrics.wildlife.reptilesAndAmphibians}
							</p>
						</div>

						<div className="post-tree-lwl">
							<p>Trees Removed</p>
							<p>
								{Math.max(
									0,
									displayData.metrics.prevMetrics.treeCount -
										displayData.metrics.treeCount
								)}
							</p>
						</div>
						<div className="post-temp-lwl">
							<p>Surface Temp Increase</p>
							<p>{displayData.metrics.temperature}°F</p>
						</div>
						<div className="post-water-lwl">
							<p>Surface Water Lost</p>
							<p>
								{displayData.metrics.prevMetrics.waterChange === 0
									? 0
									: displayData.metrics.waterChange}{" "}
								Gallons
							</p>
						</div>
					</div>
				</div>
			</div>

			<div className="footer">
				<div className="info">
					<p>
						Confirm adding one or more green modifications? Once added, you
						cannot make further green modification changes.
					</p>
				</div>
				<RoundedButton
					text="Close"
					color={buildingTypeColors[buildingTypes[tileType]]}
					size={"small"}
					onClick={handleCancel}
					fontSize={12}
				/>
			</div>
		</animated.div>
	);
};

export default LWLBuildingInfoMenu;
