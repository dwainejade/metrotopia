import React, { useState, useEffect, useRef } from "react";
import { useSpring, animated } from "react-spring";
import useGridStore from "@src/stores/gridStore";
import useAudioStore from "@src/stores/audioStore";
import useResourcesStore from "@src/stores/resourcesStore";
import useVersionStore from "@src/stores/versionStore";
import gameObjects, {
	transportationConnectionModifiers,
} from "@src/data/sandboxGameObjects";
import "@src/styles/ConstructionMenu.css";
import BuildingButton from "@/ui/BuildingButton";
import RoundedButton from "@/ui/RoundedButton";
import { collectModsForNewTile } from "@src/helpers/propagateMods";
import {
	spaceEachWord,
	capitalizeEachWord,
} from "@src/helpers/capitalizeEachWord";
import { Info } from "phosphor-react";
import Tippy from "@tippyjs/react";
import { getPopoverProps } from "@src/helpers/getTooltipProps";

const ConstructionMenu = ({ onCancel }) => {
	const {
		tiles,
		neighboringCities,
		placeObject,
		selectedTile,
		getTileInfo,
		canBuild,
		getNeighboringCityInfo,
		getNeighboringTilesInfo,
		gridSize,
		setPreviewTile,
		clearPreview,
		updatePreviewUpgrade,
		activeConstructionBuildingCategory,
		setActiveConstructionBuildingCategory,
		pulseCategories,
		setPulseCategories,
		usingKeyboard,
	} = useGridStore();
	const { playSound } = useAudioStore();
	const { resources } = useResourcesStore();
	const { current: version } = useVersionStore(); // Correctly destructured 'current'
	const { urbanStructures, naturalFeatures } = gameObjects;
	const [selectedStructure, setSelectedStructure] = useState(null);
	const [buildabilityMap, setBuildabilityMap] = useState({});
	const [selectedPowerMod, setSelectedPowerMod] = useState("");
	const [availablePowerConnections, setAvailablePowerConnections] = useState(
		[]
	);
	const [hasWaterTreatment, setHasWaterTreatment] = useState(false);
	const [hasAirportAccess, setHasAirportAccess] = useState(false);
	const [hasTrainAccess, setHasTrainAccess] = useState(false);
	const tileInfo = selectedTile ? getTileInfo(selectedTile) : null;
	const menuRef = useRef(null);

	const categories = {
		residential: ["singleFamilyHomes", "apartmentComplex"],
		commercial: [
			"retailCenter",
			"mediumOfficeBuildings",
			"tallOfficeBuilding",
			"hotels",
		],
		industrial: ["warehouse", "factory"],
		services: ["governmentBuilding", "hospital"],
	};

	const categoryButtonColors = {
		residentail: "#4a6537",
		commercial: "#779de0",
		services: "#c78e67",
		industrial: "#8d5999",
	};

	const handleKeyDown = (e) => {
		e.stopPropagation();
		if (e.key === "Escape") {
			onCancel();
		}
	};
	

	useEffect(() => {
		return () => {
			clearPreview();
		};
	}, [clearPreview]);

	useEffect(() => {
		if (usingKeyboard) {
			menuRef.current.focus();
		}
	}, [usingKeyboard, selectedTile]);

	useEffect(() => {
		if (selectedTile) {
			const newBuildabilityMap = {};
			Object.keys(urbanStructures).forEach((structureId) => {
				const result = canBuild(selectedTile, structureId);
				newBuildabilityMap[structureId] = result;
			});
			setBuildabilityMap(newBuildabilityMap);

			const [row, col] = selectedTile.split("-").map(Number);
			const isEdgeTile =
				row === 0 || row === gridSize - 1 || col === 0 || col === gridSize - 1;

			let powerConnections = new Set();

			if (isEdgeTile) {
				const neighboringCities = getNeighboringCityInfo(selectedTile);
				Object.values(neighboringCities).forEach((direction) => {
					if (direction.connectionMods.power) {
						powerConnections.add(direction.connectionMods.power);
					}
				});
			}

			const neighboringTiles = getNeighboringTilesInfo(selectedTile);
			neighboringTiles.forEach((tile) => {
				if (tile.upgrades?.connectionMods?.power) {
					tile.upgrades.connectionMods.power.forEach((mod) =>
						powerConnections.add(mod)
					);
				}
			});

			const collectedMods = collectModsForNewTile(
				tiles,
				selectedTile,
				gridSize,
				neighboringCities
			);
			const powerModsArray = Array.from(collectedMods["power"]);
			setAvailablePowerConnections(powerModsArray);
			const hasWaterTreatment = collectedMods.waste.includes(
				"wastewater treatment facility"
			);
			const hasAirportAccess = collectedMods.transportation.includes("airport");
			const hasTrainAccess = collectedMods.transportation.includes(
				"passenger train access"
			);
			setHasWaterTreatment(hasWaterTreatment);
			setHasAirportAccess(hasAirportAccess);
			setHasTrainAccess(hasTrainAccess);

			setSelectedPowerMod((prevMod) => {
				if (!prevMod || !powerModsArray.includes(prevMod)) {
					return powerModsArray[0];
				}
				return prevMod;
			});

			if (
				selectedStructure &&
				newBuildabilityMap[selectedStructure.id]?.canBuild
			) {
				setPreviewTile(selectedTile, selectedStructure.id, {
					activeMods: { power: [selectedPowerMod] },
				});
			} else {
				clearPreview();
				setSelectedStructure(null);
			}
		}
	}, [
		selectedTile,
		canBuild,
		getNeighboringCityInfo,
		getNeighboringTilesInfo,
		gridSize,
		selectedStructure,
		setPreviewTile,
		clearPreview,
	]);

	const handleBuildingCategory = (category) => {
		if (category === activeConstructionBuildingCategory) return;
		playSound("categoryClickSound");
		setPulseCategories(category);
		setActiveConstructionBuildingCategory(category);
		setSelectedStructure(null);
		clearPreview();
	};

	const handleStructureSelect = (structureId) => {
		playSound("menuClickSound");
		if (selectedStructure && selectedStructure.id === structureId) {
			setSelectedStructure(null);
			clearPreview();
		} else {
			setSelectedStructure(urbanStructures[structureId]);
			if (buildabilityMap[structureId]?.canBuild) {
				setPreviewTile(selectedTile, structureId, {
					activeMods: { power: [selectedPowerMod] },
				});
			}
		}
	};

	const handlePowerModChange = (e) => {
		const newPowerMod = e.target.value;
		setSelectedPowerMod(newPowerMod);
		updatePreviewUpgrade("activeMods", { power: [newPowerMod] });
	};

	const handleBuild = () => {
		if (
			selectedStructure &&
			selectedTile &&
			buildabilityMap[selectedStructure.id]?.canBuild
		) {
			placeObject(selectedTile, selectedStructure.id, selectedPowerMod);
			onCancel();
		}
	};

	// Animation for the menu appearance
	const menuAnimation = useSpring({
		from: { opacity: 0, transform: "translateX(-80px)" },
		to: { opacity: 1, transform: "translateX(0px)" },
		config: { tension: 300, friction: 20 },
	});
	const getHeaderWidth = () => {
		switch (activeConstructionBuildingCategory) {
			case "residential":
				return "71.5%";
			case "commercial":
				return "80.5%";
			case "services":
				return "89.5%";
			case "industrial":
				return "98.5%";
			default:
				return "70%";
		}
	};

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
			energyConnections: [...availablePowerConnections],
		};
		return {
			...baseObject,
			...tileInfo,
			metrics: mergedMetrics,
		};
	};

	const calculateTrafficIncrease = () => {
		if (!selectedStructure) return 0;

		// Get base traffic (average of min and max)
		const baseTraffic = Math.floor(
			(selectedStructure.metrics.carTraffic[0] +
				selectedStructure.metrics.carTraffic[1]) /
				2
		);

		// Determine building category
		const getBuildingCategory = (type) => {
			if (type.includes("home") || type === "apartmentComplex")
				return "residential";
			if (type === "warehouse" || type === "factory") return "industrial";
			return "commercial";
		};
		const category = getBuildingCategory(selectedStructure.id);

		// Initialize multiplier
		let trafficMultiplier = 1;

		// Apply airport modifier if applicable
		if (
			hasAirportAccess &&
			transportationConnectionModifiers.airport.carTraffic[category]
		) {
			trafficMultiplier = Math.max(
				trafficMultiplier,
				transportationConnectionModifiers.airport.carTraffic[category]
			);
		}

		// Apply train modifier if applicable (only affects commercial)
		if (
			hasTrainAccess &&
			category === "commercial" &&
			transportationConnectionModifiers["passenger train access"].carTraffic
				.commercial
		) {
			trafficMultiplier = Math.max(
				trafficMultiplier,
				transportationConnectionModifiers["passenger train access"].carTraffic
					.commercial
			);
		}

		// Calculate final traffic value
		const adjustedTraffic = Math.round(baseTraffic * trafficMultiplier);
		return adjustedTraffic;
	};

	const calculateTaxIncrease = () => {
		if (!selectedStructure) return 0;

		// Get base taxes from structure metrics
		const baseTaxes = {
			property: selectedStructure.metrics.taxes.property || 0,
			income: selectedStructure.metrics.taxes.income || 0,
			sales: selectedStructure.metrics.taxes.sales || 0,
		};

		// Initialize multiplier for sales tax
		let salesTaxMultiplier = 1;

		// Apply airport sales tax modifier if applicable
		if (
			hasAirportAccess &&
			transportationConnectionModifiers.airport.taxes.sales
		) {
			salesTaxMultiplier = Math.max(
				salesTaxMultiplier,
				transportationConnectionModifiers.airport.taxes.sales
			);
		}

		// Apply train sales tax modifier if applicable
		if (
			hasTrainAccess &&
			transportationConnectionModifiers["passenger train access"].taxes.sales
		) {
			salesTaxMultiplier = Math.max(
				salesTaxMultiplier,
				transportationConnectionModifiers["passenger train access"].taxes.sales
			);
		}

		// Calculate final taxes
		const adjustedSalesTax = Math.round(baseTaxes.sales * salesTaxMultiplier);
		const totalTaxes = baseTaxes.property + baseTaxes.income + adjustedSalesTax;

		return {
			total: totalTaxes,
			breakdown: {
				property: baseTaxes.property,
				income: baseTaxes.income,
				sales: adjustedSalesTax,
			},
			hasBonus: salesTaxMultiplier > 1,
			bonus: ((salesTaxMultiplier - 1) * 100).toFixed(0),
		};
	};

	const calculateBuildingImpact = () => {
		if (!selectedStructure || !tileInfo) return null;

		const mergedInfo = getMergedTileInfo();
		const structureMetrics = selectedStructure.metrics;

		return {
			surfaceWaterLost: mergedInfo.metrics.waterChange || 0,
			powerConnection: selectedPowerMod || availablePowerConnections[0],
			populationIncrease:
				structureMetrics.populationChange[0] +
					"-" +
					structureMetrics.populationChange[1] || 0,
			treesRemoved: mergedInfo.metrics.treeCount || 0,
			wildlifeDisplaced: Object.values(
				mergedInfo.metrics.wildlife || {}
			).reduce((a, b) => a + b, 0),
			groundwaterPollution: structureMetrics.groundwaterPollution
				? structureMetrics.groundwaterPollution[hasWaterTreatment ? 0 : 1] || 0
				: 0,
			powerUsageIncrease: structureMetrics.electricityUsage || 0,
			airPollutionIncrease: structureMetrics.airPollutionChange || 0,
			temperatureIncrease:
				structureMetrics.temperature - mergedInfo.metrics.temperature || 0,
			trafficIncrease: calculateTrafficIncrease() || 0,
			taxIncome: calculateTaxIncrease().total || 0,
		};
	};

	const getContentForTaxes = () => {
		const { total, breakdown, hasBonus, bonus } = calculateTaxIncrease();
		// Calculate base sales tax (before bonus)
		const baseSalesTax = hasBonus
			? Math.round(breakdown.sales / (1 + bonus / 100))
			: breakdown.sales;
		// Calculate bonus amount
		const bonusAmount = breakdown.sales - baseSalesTax;

		return (
			<div className="tax-tooltip">
				<h4 className="tax-tooltip-header">Tax Revenue Breakdown</h4>
				<div className="tax-tooltip-content">
					<div className="tax-row">
						<span>Property Tax:</span>{" "}
						<span>${breakdown.property.toLocaleString()}</span>
					</div>
					<div className="tax-row">
						<span>Income Tax:</span>{" "}
						<span>${breakdown.income.toLocaleString()}</span>
					</div>
					<div className="tax-row">
						<span>Base Sales Tax:</span>{" "}
						<span>${baseSalesTax.toLocaleString()}</span>
					</div>
					{hasBonus && breakdown.sales > 0 && (
						<div className="tax-row bonus-row">
							<span>Transportation Bonus:</span>{" "}
							<span>${bonusAmount.toLocaleString()}</span>
						</div>
					)}
					<div className="tax-row total-row">
						<span>Total:</span> <span>${total.toLocaleString()}</span>
					</div>
				</div>
			</div>
		);
	};

	const renderMetrics = () => {
		if (selectedStructure) {
			const impact = calculateBuildingImpact();

			return (
				<>
					<p className="tile-name">Parcel Statistics</p>
					<div className="impact-grid">
						<div>
							<p>Surface Water to be Lost</p>
							<p>{impact.surfaceWaterLost} Gallons</p>
						</div>

						<div>
							<p>Energy Source</p>
							{availablePowerConnections.length > 1 ? (
								<div className="custom-select-wrapper">
									<select
										className="custom-select"
										name="powerConnection"
										value={selectedPowerMod}
										onChange={handlePowerModChange}
									>
										{availablePowerConnections.map((powerConnection) => (
											<option key={powerConnection} value={powerConnection}>
												{capitalizeEachWord(powerConnection)}
											</option>
										))}
									</select>
								</div>
							) : (
								<p>{capitalizeEachWord(availablePowerConnections[0])}</p>
							)}
						</div>

						<div>
							<p>Population Increase</p>
							<p>
								{selectedStructure.id === "apartmentComplex" ||
								selectedStructure.id === "singleFamilyHomes"
									? impact.populationIncrease || 0
									: 0}{" "}
								people
							</p>
						</div>
						<div>
							<p>Trees to be Removed</p>
							<p>{impact.treesRemoved}</p>
						</div>
						<div>
							<p>Estimated Traffic Increase</p>
							<p>{impact.trafficIncrease} vehicles</p>
						</div>
						<div>
							<p>Estimated Groundwater Pollution Increase</p>
							<p>{impact.groundwaterPollution}%</p>
						</div>
						<div>
							<p>Wildlife to be Lost</p>
							<p>{impact.wildlifeDisplaced}</p>
						</div>
						<div>
							<p>Estimated Air Pollution Increase</p>
							<p>{impact.airPollutionIncrease}%</p>
						</div>
						<div>
							<p>Estimated Surface Temp Increase</p>
							<p>{impact.temperatureIncrease}°F</p>
						</div>

						<div>
							<p>Estimated Tax Revenue</p>
							<p style={{ display: "flex", alignItems: "center", gap: 4 }}>
								${impact.taxIncome.toLocaleString()}
								<Tippy
									content={getContentForTaxes()}
									{...getPopoverProps()}
									placement="right"
								>
									<button
										style={{
											cursor: "pointer",
											display: "flex",
											alignItems: "center",
											backgroundColor: "transparent",
										}}
									>
										<Info className="info-icon" size={16} color="orange" />
									</button>
								</Tippy>
							</p>
						</div>
						{availablePowerConnections.length === 1 ? (
							<div className="energy-source-note-item">
								<p className="energy-source-note-text">
									If you can choose a different energy source for this building,
									you will see a drop-down menu. You can swap between available
									energy sources <b>at any time</b>.
								</p>
							</div>
						) : null}
						<div
							className={`wastewater-grid-item post ${
								availablePowerConnections.length === 1 ? "energy-present" : ""
							}`}
						>
							<p className="wastewater-grid-text">
								{hasWaterTreatment
									? "This parcel has access to a water treatment facility (less groundwater pollution)."
									: "This parcel doesn't have access to a wastewater treatment facility (more groundwater pollution)."}
							</p>
						</div>
					</div>
				</>
			);
		} else if (tileInfo) {
			const mergedInfo = getMergedTileInfo();
			const { metrics } = mergedInfo;

			return (
				<>
					<p className="tile-name">Parcel Statistics</p>
					<div className="tile-grid">
						{metrics.populationChange !== undefined &&
							metrics.populationChange !== 0 && (
								<div>
									<p>Population Change</p>
									<p>{metrics.populationChange}</p>
								</div>
							)}
						{metrics.fundChange !== undefined && (
							<div>
								<p>Fund Change</p>
								<p>${metrics.fundChange}</p>
							</div>
						)}
						{metrics.wildlife && (
							<>
								{!metrics.wildlife.hasOwnProperty("largeMammals") ? (
									<div>
										<p>Large Mammals</p>
										<p>0</p>
									</div>
								) : null}
								{Object.entries(metrics.wildlife).map(([key, value]) => {
									if (key !== "birds" && key !== "fish") {
										return (
											<div key={key}>
												<p>{spaceEachWord(key)}</p>
												<p>{value}</p>
											</div>
										);
									}
								})}
								<div>
									<p>Birds</p>
									<p>{metrics.wildlife.birds}</p>
								</div>
								<div>
									<p>Fish</p>
									<p>{metrics.wildlife.fish || 0}</p>
								</div>
							</>
						)}
						{metrics.treeCount !== undefined && (
							<div>
								<p>Trees</p>
								<p>{metrics.treeCount}</p>
							</div>
						)}
						{metrics.temperature !== undefined && (
							<div className="temp-item">
								<p>Surface Temp</p>
								<p>{metrics.temperature}°F</p>
							</div>
						)}
						<div className="temp-item">
							<p>Surface Water</p>
							{metrics.waterChange !== undefined ? (
								<p>{metrics.waterChange.toLocaleString()} gallons</p>
							) : (
								<p>0 gallons</p>
							)}
						</div>

						{/* {metrics.temperatureChange !== undefined && (
						<p>Temperature Change: {metrics.temperatureChange}°F</p>
					)} */}

						{metrics.energyConnections !== undefined && (
							<div className="temp-item">
								<p>
									{metrics.energyConnections.length > 1
										? "Energy Connections"
										: "Energy Connection"}
								</p>
								<p>
									{metrics.energyConnections
										.map((source) =>
											source === "hydroelectric"
												? "Hydroelectric"
												: capitalizeEachWord(source)
										)
										.join(", ")}
								</p>
							</div>
						)}
						{metrics.airPollutionChange !== undefined && (
							<div>
								<p>Air Pollution Change</p>
								<p>{metrics.airPollutionChange}</p>
							</div>
						)}

						<div className="wastewater-grid-item pre">
							<p className="wastewater-grid-text">
								{hasWaterTreatment
									? "This parcel has access to a water treatment facility (less groundwater pollution)."
									: "This parcel doesn't have access to a wastewater treatment facility (more groundwater pollution)."}
							</p>
						</div>
					</div>
				</>
			);
		}
		return <p>Select a structure or cell to view metrics.</p>;
	};

	return (
		<animated.div
			style={menuAnimation}
			className={`construction-menu construction-${activeConstructionBuildingCategory}`}
			ref={menuRef}
			tabIndex={0}
			onKeyDown={handleKeyDown}
			// onMouseDown={handleMouseDown}
		>
			<div className="header-wrapper">
				<div className="header" style={{ width: getHeaderWidth() }}>
					<h2 className="title">Construction</h2>
					<div className="category-con">
						<button
							className={`residential-icon ${
								activeConstructionBuildingCategory === "residential"
									? "active"
									: ""
							} ${pulseCategories["residential"] ? "pulse" : ""}`}
							onClick={() => handleBuildingCategory("residential")}
							aria-label="See residential buildings."
						>
							{/* <House className="icon" size={iconSize} /> */}
						</button>
						<button
							className={`commercial-icon ${
								activeConstructionBuildingCategory === "commercial"
									? "active"
									: ""
							} ${pulseCategories["commercial"] ? "pulse" : ""}`}
							onClick={() => handleBuildingCategory("commercial")}
							aria-label="See commercial buildings."
						>
							{/* <Buildings className="icon" size={iconSize} /> */}
						</button>
						<button
							className={`services-icon ${
								activeConstructionBuildingCategory === "services"
									? "active"
									: ""
							} ${pulseCategories["services"] ? "pulse" : ""}`}
							onClick={() => handleBuildingCategory("services")}
							aria-label="See service buildings."
						>
							{/* <FirstAid className="icon" size={iconSize} /> */}
						</button>
						<button
							className={`industrial-icon ${
								activeConstructionBuildingCategory === "industrial"
									? "active"
									: ""
							} ${pulseCategories["industrial"] ? "pulse" : ""}`}
							onClick={() => handleBuildingCategory("industrial")}
							aria-label="See industrial buildings."
						>
							{/* <Factory className="icon" size={iconSize} /> */}
						</button>
					</div>
				</div>
			</div>

			<div className="content">
				<h3
					className={`selected-structure-title ${activeConstructionBuildingCategory}`}
				>
					{activeConstructionBuildingCategory !== null &&
						spaceEachWord(activeConstructionBuildingCategory)}
				</h3>
				<div className="building-types">
					{categories[activeConstructionBuildingCategory].map((structureId) => (
						<BuildingButton
							key={structureId}
							structureId={structureId}
							selectedStructure={selectedStructure?.id}
							handleClick={() => handleStructureSelect(structureId)}
						/>
					))}
				</div>

				<div
					className={`details-wrapper ${selectedStructure ? "highlight" : ""} `}
				>
					<div className="structure-details">{renderMetrics()}</div>
				</div>
			</div>

			<footer className="footer">
				<div className="info">
					<p>
						Confirm this construction? Once built, this parcel cannot change to
						another building type.
					</p>
				</div>

				<RoundedButton
					text="Cancel"
					color={categoryButtonColors[activeConstructionBuildingCategory]}
					size={"small"}
					onClick={onCancel}
					fontSize={12}
				/>
				<RoundedButton
					text="Build"
					color={categoryButtonColors[activeConstructionBuildingCategory]}
					size={"small"}
					onClick={handleBuild}
					onKeyDown={handleKeyDown}
					disabled={
						!selectedStructure ||
						!buildabilityMap[selectedStructure?.id]?.canBuild
					}
					fontSize={12}
				/>
			</footer>
		</animated.div>
	);
};

export default ConstructionMenu;
