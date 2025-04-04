import React, { useState, useEffect, useRef } from "react";
import gameObjects, { greenModMetrics } from "../../data/gameObjects";
import { greenModCosts } from "../../data/gameObjects";
import { useSpring, animated } from "react-spring";
import "../../styles/BuildingInfoMenu.css";
import {
	spaceEachWord,
	capitalizeEachWord,
} from "../../helpers/capitalizeEachWord";
import RoundedButton from "../ui/RoundedButton";
import useGridStore from "../../stores/gridStore";
import useResourcesStore from "../../stores/resourcesStore";
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

const ESSBuildingInfoMenu = ({ onCancel }) => {
	const {
		tiles,
		selectedTile,
		setSelectedTile,
		setCurrentModal,
		setPreviewTile,
		clearPreview,
		updatePreviewUpgrade,
		previewTile,
		applyMods,
		updatePowerMod,
		setShowCellHighlighter,
		usingKeyboard,
	} = useGridStore();
	const { updateFunds } = useResourcesStore();
	const { preloadedUIImages } = useTextureStore();
	const { playSound } = useAudioStore();

	const { urbanStructures } = gameObjects;

	const hasSetPreviewTile = useRef(false);
	const selectedTileData = selectedTile ? tiles[selectedTile] : null;
	const tileType = selectedTileData ? selectedTileData.type : null;
	const greenModsApplied =
		selectedTileData?.upgrades?.greenModsApplied || false;
	const [hideColumn, setHideColumn] = useState({
		structuralUpgrades: false,
		streetUpgrades: false,
	});
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

	const calculateModEffects = (upgrades) => {
		const effects = {
			airPollution: 0,
			temperature: 0,
			treeCount: 0,
		};

		Object.entries(upgrades).forEach(([upgrade, isActive]) => {
			if (!isActive || !greenModMetrics[upgrade]) return;

			const metrics = greenModMetrics[upgrade];

			// get the midpoint of the ranges
			if (metrics.temperature) {
				const [min, max] = metrics.temperature;
				effects.temperature += (min + max) / 2;
			}

			if (metrics.airPollution) {
				const [min, max] = metrics.airPollution;
				effects.airPollution += (min + max) / 2;
			}

			if (metrics.treeCount) {
				const [min, max] = metrics.treeCount;
				effects.treeCount += (min + max) / 2;
			}
		});

		return effects;
	};

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

	const greenModImg = {
		treeLinedStreets: preloadedUIImages["treeLinedStreets"].src,
		greenRoof: preloadedUIImages["greenRoof"].src,
		coolRoof: preloadedUIImages["coolRoof"].src,
		solarRoof: preloadedUIImages["solarRoof"].src,
	};

	const isAnyGreenModSelected = () => {
		if (!previewTile) return false;
		const upgrades = previewTile.data.upgrades;
		return ["solarRoof", "greenRoof", "coolRoof", "treeLinedStreets"].some(
			(mod) => upgrades[mod]
		);
	};

	const handleBuild = () => {
		if (!isAnyGreenModSelected()) return;
		revertPowerModRef.current = false;

		if (selectedTile && previewTile) {
			playSound("confirmModsSound");
			// Apply all green mods and power mod from the preview
			const upgradesToApply = {
				...previewTile.data.upgrades,
				greenModsApplied: true,
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
		if (!greenModsApplied && originalPowerMod && hasSolarRoof) {
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

	const handlePowerModChange = (newMod) => {
		playSound("powerModSound");
		if (newMod !== previewTile.data.upgrades.activeMods?.power) {
			updatePreviewUpgrade("activeMods", { power: newMod });
		}
		// apply the power mod
		updatePowerMod(selectedTile, newMod);
	};

	const handleGreenModToggle = (upgradeType, category) => {
		if (!previewTile) return;

		playSound("menuClickSound");

		const isCurrentlyEnabled = previewTile.data.upgrades[upgradeType];

		let newUpgrades = {
			...previewTile.data.upgrades,
			[upgradeType]: !isCurrentlyEnabled,
		};

		// If structural upgrade, clear others first
		if (category === "structuralUpgrades") {
			["solarRoof", "greenRoof", "coolRoof"].forEach((mod) => {
				if (mod !== upgradeType) {
					newUpgrades[mod] = false;
				}
			});
		}

		// Calculate all effects including temperature
		const effects = calculateModEffects(newUpgrades);
		setPreviewValues(effects);

		// Update all upgrades at once
		Object.entries(newUpgrades).forEach(([mod, value]) => {
			updatePreviewUpgrade(mod, value);
		});

		// Solar roof handling
		if (upgradeType === "solarRoof") {
			const availablePowerMods =
				selectedTileData.upgrades.connectionMods.power || [];

			if (!isCurrentlyEnabled) {
				updatePreviewUpgrade("localPower", "solar");
				setHasSolarRoof(true);
				revertPowerModRef.current = true;
				handlePowerModChange("solar");
			} else {
				updatePreviewUpgrade("localPower", null);
				setHasSolarRoof(false);
				revertPowerModRef.current = false;
				handlePowerModChange(availablePowerMods[0]);
			}
		}
	};

	const renderColumns = (upgradeList, category) => {
		if (!greenModsApplied) return;

		let status = upgradeList[tileType].every(
			(upgradeType) =>
				previewTile.data.upgrades[upgradeType] === false && greenModsApplied
		);

		// Check if the column needs to be hidden and only update the state if necessary
		if (category === "streetUpgrades" && hideColumn.streetUpgrades !== status) {
			setHideColumn((prev) => ({
				...prev,
				streetUpgrades: status,
			}));
		} else if (
			category === "structuralUpgrades" &&
			hideColumn.structuralUpgrades !== status
		) {
			setHideColumn((prev) => ({
				...prev,
				structuralUpgrades: status,
			}));
		}
	};

	const renderGreenModToggles = (upgradeList, category) => {
		if (!tileType || !upgradeList[tileType] || !previewTile) return null;
		renderColumns(upgradeList, category);

		const toolTipContent = (mod) => {
			return greenModToolTip[mod];
		};
		return upgradeList[tileType].map((upgradeType) => (
			<div key={upgradeType} className={`toggle-wrapper`}>
				<Tippy
					content={toolTipContent(upgradeType)}
					animation="shift-away-subtle"
				>
					<button
						className={`toggle ${
							previewTile.data.upgrades[upgradeType]
								? "active"
								: greenModsApplied
								? "hide"
								: ""
						}`}
						onClick={() => handleGreenModToggle(upgradeType, category)}
						disabled={greenModsApplied}
					>
						<div className="content-wrapper">
							<img
								className="mod-img"
								src={greenModImg[upgradeType]}
								alt="green mod"
							/>

							<p className="mod-name">
								{upgradeType === "treeLinedStreets"
									? "Tree-Lined Streets"
									: spaceEachWord(upgradeType)}
							</p>
						</div>
					</button>
				</Tippy>
			</div>
		));
	};

	const renderPowerModToggles = () => {
		if (!selectedTileData || !tileType || !previewTile) return null;

		// Get the current active mod from the preview tile
		const activePowerMod = previewTile.data.upgrades.activeMods?.power || "";

		// Combine available power mods with local power (if it exists)
		const availablePowerMods = [
			...(selectedTileData.upgrades.connectionMods.power || []),
			...(previewTile.data.upgrades.localPower
				? [previewTile.data.upgrades.localPower]
				: []),
		];

		return (
			<div className="power-mods-wrapper">
				<p className="power-mods-title">Energy Source</p>
				{availablePowerMods.length > 1 ? (
					<div className="custom-select-wrapper">
						<select
							className="custom-select"
							value={activePowerMod}
							onChange={(e) => handlePowerModChange(e.target.value)}
						>
							{availablePowerMods.map((mod) => (
								<option key={mod} value={mod}>
									{mod === "hydroelectric"
										? "Hydroelectric"
										: capitalizeEachWord(mod)}
								</option>
							))}
						</select>
					</div>
				) : (
					<p className="power-mod-item">
						{availablePowerMods[0] === "hydroelectric"
							? "Hydroelectric"
							: capitalizeEachWord(availablePowerMods[0])}
					</p>
				)}
			</div>
		);
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
							<p>Total {greenModsApplied ? "Spent" : "Cost"}:</p>
							<p className="cost-bubble">
								$
								{greenModsApplied
									? (
											calculateGreenModCosts() + selectedTileData.metrics.cost
									  ).toLocaleString()
									: calculateGreenModCosts().toLocaleString()}
							</p>
						</div>
					</div>

					<div
						className={`green-mods-con ${
							greenModsApplied ? "mods-applied" : ""
						}`}
					>
						<p className="green-mod-title">
							{greenModsApplied
								? "Green Mods Installed:"
								: "Possible Green Mods"}
						</p>
						<div
							className={`columns ${
								hideColumn.structuralUpgrades || hideColumn.streetUpgrades
									? "one"
									: "two"
							}`}
						>
							<div
								className={`left-column ${
									hideColumn.structuralUpgrades === true ? "hide" : ""
								}`}
							>
								<p>You may choose only one:</p>
								<div className="upgrade-toggles">
									{renderGreenModToggles(
										availableUpgrades.structuralUpgrades,
										"structuralUpgrades"
									)}
								</div>
							</div>

							<div
								className={`right-column ${
									hideColumn.streetUpgrades === true ? "hide" : ""
								}`}
							>
								<p>You may also choose this:</p>
								<div className="upgrade-toggles">
									{renderGreenModToggles(
										availableUpgrades.streetUpgrades,
										"streetUpgrades"
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="details-wrapper">
					<div className="structure-details">
						{renderPowerModToggles()}

						{displayData.metrics?.populationChange >= 0 && (
							<div>
								<p>Population </p>
								<p>{displayData.metrics.populationChange} people</p>
							</div>
						)}
						{displayData.metrics?.carTraffic && (
							<div>
								<p>Vehicle Traffic </p>
								<p>{displayData.metrics.carTraffic} cars</p>
							</div>
						)}

						{displayData.metrics?.treeCount > 0 && (
							<div>
								<p>Trees</p>
								{!greenModsApplied ? (
									<p>
										Trees Lost:{" "}
										<span>
											{Math.max(
												0,
												displayData.metrics.prevMetrics.treeCount -
													displayData.metrics.treeCount
											)}
										</span>
									</p>
								) : (
									<p>
										Current Trees:{" "}
										<span>
											{displayData.metrics.treeCount +
												displayData.metrics.greenModMetrics.treeCount}
										</span>
									</p>
								)}
								{greenModsApplied ? (
									<p>
										Trees Before Mods:
										<span>{displayData.metrics.treeCount}</span>
									</p>
								) : null}
								<p>
									{greenModsApplied
										? "Trees Added: "
										: "Avg Trees to be Added: "}
									<span>
										{greenModsApplied
											? displayData.metrics.greenModMetrics.treeCount
											: previewValues.treeCount.toFixed()}
									</span>
								</p>
							</div>
						)}
						<div>
							<p>Temperature</p>
							<p>
								Temp Increase from Building:{" "}
								<span>
									+
									{selectedTileData.metrics.temperature -
										selectedTileData.metrics.prevMetrics.temperature}
									°F
								</span>
							</p>
							{/* Only show the preview during toggling, before mods are applied */}
							{!greenModsApplied && isAnyGreenModSelected() && (
								<p>
									Avg Temp Change from Mods:{" "}
									<span>
										{previewValues.temperature > 0 ? "+" : ""}
										{previewValues.temperature}°F
									</span>
								</p>
							)}
							{/* Show actual values after mods are applied */}
							{greenModsApplied && (
								<p>
									Temp Change from Mods:{" "}
									<span>
										{selectedTileData.metrics.greenModMetrics?.temperature > 0
											? "+"
											: ""}
										{selectedTileData.metrics.greenModMetrics?.temperature.toFixed(
											2
										)}
										°F
									</span>
								</p>
							)}

							{greenModsApplied ? (
								<p>
									Heat Island Effect:{" "}
									<span>
										+
										{(
											(selectedTileData.metrics.temperature +
												selectedTileData.metrics.greenModMetrics?.temperature -
												selectedTileData.metrics.prevMetrics.temperature) /
											100
										).toFixed(2)}
										°F
									</span>
								</p>
							) : (
								<p>
									Avg Heat Island Effect:{" "}
									<span>
										+
										{(
											((selectedTileData.metrics.temperature +
												previewValues.temperature || 0) -
												selectedTileData.metrics.prevMetrics.temperature) /
											100
										).toFixed(2)}
										°F
									</span>
								</p>
							)}
						</div>

						{typeof displayData.metrics?.groundwaterPollutionIncrease ===
						"object" ? (
							<div>
								<p>Groundwater Pollution </p>
								<p>{displayData.metrics.groundwaterPollutionIncrease[0]}</p>
							</div>
						) : typeof displayData.metrics?.groundwaterPollutionIncrease ===
						  "number" ? (
							<div>
								<p>Groundwater Pollution </p>
								<p>{displayData.metrics.groundwaterPollutionIncrease}%</p>
							</div>
						) : null}

						{availableEnergySources.length === 1 ? (
							<div className="energy-source-note-item building-info ess">
								<p className="energy-source-note-text">
									If you can choose a different energy source for this building,
									you will see a drop-down menu. You can swap between available
									energy sources <b>at any time</b>.
								</p>
							</div>
						) : null}
					</div>
				</div>
			</div>

			<div className={`footer ${greenModsApplied ? "mods-applied" : ""}`}>
				{greenModsApplied ? (
					<RoundedButton
						text="Done"
						color={buildingTypeColors[buildingTypes[tileType]]}
						size={"small"}
						onClick={onCancel}
					/>
				) : (
					<>
						<div className="info">
							<p>
								Confirm adding one or more green modifications? Once added, you
								cannot make further green modification changes.
							</p>
						</div>
						<RoundedButton
							text="Cancel"
							color={buildingTypeColors[buildingTypes[tileType]]}
							size={"small"}
							onClick={handleCancel}
							fontSize={12}
						/>
						<RoundedButton
							text="Build"
							color={buildingTypeColors[buildingTypes[tileType]]}
							size={"small"}
							onClick={handleBuild}
							disabled={greenModsApplied || !isAnyGreenModSelected()}
							fontSize={12}
						/>
					</>
				)}
			</div>
		</animated.div>
	);
};

export default ESSBuildingInfoMenu;
