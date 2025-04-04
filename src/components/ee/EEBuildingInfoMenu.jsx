import React, { useState, useEffect, useRef } from "react";
import gameObjects, {
	greenModMetrics,
	transportationConnectionModifiers,
} from "@src/data/eeGameObjects";
import { greenModCosts } from "@src/data/eeGameObjects";
import { useSpring, animated } from "react-spring";
import "@src/styles/BuildingInfoMenu.css";
import {
	spaceEachWord,
	capitalizeEachWord,
} from "@src/helpers/capitalizeEachWord";
import RoundedButton from "../ui/RoundedButton";
import useGridStore from "@src/stores/gridStore";
import useResourcesStore from "@src/stores/resourcesStore";
import useTextureStore from "@src/stores/textureStore";
import useAudioStore from "@src/stores/audioStore";
import { Info } from "phosphor-react";
import Tippy from "@tippyjs/react";
import { getPopoverProps } from "@src/helpers/getTooltipProps";

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
		singleFamilyHomes: ["treeLinedStreets", "natureCrossings"],
		apartmentComplex: ["treeLinedStreets", "natureCrossings"],
		retailCenter: ["treeLinedStreets", "natureCrossings"],
		mediumOfficeBuildings: ["treeLinedStreets", "natureCrossings"],
		tallOfficeBuilding: ["treeLinedStreets", "natureCrossings"],
		hotels: ["treeLinedStreets", "natureCrossings"],
		hospital: ["treeLinedStreets", "natureCrossings"],
		governmentBuilding: ["treeLinedStreets", "natureCrossings"],
		warehouse: ["treeLinedStreets", "natureCrossings"],
		factory: ["treeLinedStreets", "natureCrossings"],
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
	natureCrossings:
		"Makes adjacent parcels permanent nature preserves; increases small mammal populations there greatly",
	disabledNatureCrossings:
		"You cannot build nature crossings, as this parcel is not adjacent to any nature preserves.",
};

const calculateMidpoint = (range) => {
	if (Array.isArray(range)) {
		return (range[0] + range[1]) / 2;
	}
	return range;
};

const BuildingInfoMenu = ({ onCancel }) => {
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
		checkAdjacentNatureCells,
		applyNatureCrossingToPreview,
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
	const [hasWaterTreatment, setHasWaterTreatment] = useState(false);
	const [availableEnergySources, setAvailableEnergySources] = useState([]);
	const [originalPowerMod, setOriginalPowerMod] = useState(null); // Store the original power mod when component mounts
	const [hasSolarRoof, setHasSolarRoof] = useState(false);
	const revertPowerModRef = useRef(false);
	const menuRef = useRef(null);

	const [previewValues, setPreviewValues] = useState({
		airPollution: 0,
		temperature: 0,
		treeCount: 0,
		wildlife: {
			smallMammals: 0,
			birds: 0,
		},
	});

	const calculateModEffects = (upgrades) => {
		const effects = {
			airPollution: 0,
			temperature: 0,
			treeCount: 0,
			wildlife: {
				smallMammals: 0,
				birds: 0,
			},
		};

		// Calculate effects for each active upgrade
		Object.entries(upgrades).forEach(([upgrade, isActive]) => {
			if (!isActive || !greenModMetrics[upgrade]) return;

			if (greenModMetrics[upgrade].airPollution) {
				effects.airPollution += calculateMidpoint(
					greenModMetrics[upgrade].airPollution
				);
			}
			if (greenModMetrics[upgrade].temperature) {
				effects.temperature += calculateMidpoint(
					greenModMetrics[upgrade].temperature
				);
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

			if (connectedMods.waste.length) {
				setHasWaterTreatment(true);
			}
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
		natureCrossings: preloadedUIImages["natureCrossings"].src,
		greenRoof: preloadedUIImages["greenRoof"].src,
		coolRoof: preloadedUIImages["coolRoof"].src,
		solarRoof: preloadedUIImages["solarRoof"].src,
	};

	const isAnyGreenModSelected = () => {
		if (!previewTile) return false;
		const upgrades = previewTile.data.upgrades;
		return [
			"solarRoof",
			"greenRoof",
			"coolRoof",
			"treeLinedStreets",
			"natureCrossings",
		].some((mod) => upgrades[mod]);
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

	const canBuildNatureCrossing = (tileKey) => {
		return Object.values(checkAdjacentNatureCells(selectedTile)).some(
			(value) => value
		);
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

	const displayData = selectedTileData ? selectedTileData : null;

	if (!displayData) {
		return <div>Loading...</div>;
	}

	const calculateTaxIncrease = () => {
		if (!selectedTileData) return 0;
		const hasAirportAccess =
			selectedTileData.upgrades.connectionMods.transportation.includes(
				"airport"
			);
		const hasTrainAccess =
			selectedTileData.upgrades.connectionMods.transportation.includes(
				"passenger train access"
			);

		// Get base taxes from structure metrics
		const baseTaxes = {
			property: selectedTileData.metrics.taxes.property || 0,
			income: selectedTileData.metrics.taxes.income || 0,
			sales: selectedTileData.metrics.taxes.sales || 0,
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
								$ {selectedTileData.metrics.cost.toLocaleString()}
							</p>
						</div>
					</div>
				</div>

				<div className="details-wrapper ee">
					<div className="structure-details">
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

						{displayData.metrics?.temperatureChange > 0 && (
							<div>
								<p>Temperature Change </p>
								<p>{displayData.metrics.temperatureChange}</p>
							</div>
						)}

						<div class="tax-details ee">
							<p>Estimated Tax Revenue</p>
							<p style={{ display: "flex", alignItems: "center", gap: 4 }}>
								${calculateTaxIncrease().total.toLocaleString()}
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
					</div>
				</div>
			</div>

			<div className={`footer ee`}>
				<RoundedButton
					text="Done"
					color={buildingTypeColors[buildingTypes[tileType]]}
					size={"small"}
					onClick={onCancel}
				/>
			</div>
		</animated.div>
	);
};

export default BuildingInfoMenu;
