import React, { useState, useEffect, useRef } from 'react';
import gameObjects, { greenModMetrics } from '../../data/gameObjects';
import { greenModCosts } from '../../data/gameObjects';
import { useSpring, animated } from 'react-spring';
import '../../styles/BuildingInfoMenu.css';
import { spaceEachWord, capitalizeEachWord } from '../../helpers/capitalizeEachWord';
import RoundedButton from './RoundedButton';
import useGridStore from '../../stores/gridStore';
import useResourcesStore from '../../stores/resourcesStore';
import useTextureStore from '../../stores/textureStore';
import useAudioStore from '../../stores/audioStore';
import Tippy from '@tippyjs/react';

const availableUpgrades = {
	structuralUpgrades: {
		singleFamilyHomes: ['coolRoof', 'solarRoof'],
		apartmentComplex: ['greenRoof', 'coolRoof', 'solarRoof'],
		retailCenter: ['greenRoof', 'coolRoof', 'solarRoof'],
		mediumOfficeBuildings: ['greenRoof', 'coolRoof', 'solarRoof'],
		tallOfficeBuilding: ['greenRoof', 'coolRoof', 'solarRoof'],
		hotels: ['greenRoof', 'coolRoof', 'solarRoof'],
		hospital: ['greenRoof', 'coolRoof', 'solarRoof'],
		governmentBuilding: ['greenRoof', 'coolRoof', 'solarRoof'],
		warehouse: ['greenRoof', 'coolRoof', 'solarRoof'],
		factory: ['coolRoof', 'solarRoof'],
	},
	streetUpgrades: {
		singleFamilyHomes: ['treeLinedStreets', 'natureCrossings'],
		apartmentComplex: ['treeLinedStreets', 'natureCrossings'],
		retailCenter: ['treeLinedStreets', 'natureCrossings'],
		mediumOfficeBuildings: ['treeLinedStreets', 'natureCrossings'],
		tallOfficeBuilding: ['treeLinedStreets', 'natureCrossings'],
		hotels: ['treeLinedStreets', 'natureCrossings'],
		hospital: ['treeLinedStreets', 'natureCrossings'],
		governmentBuilding: ['treeLinedStreets', 'natureCrossings'],
		warehouse: ['treeLinedStreets', 'natureCrossings'],
		factory: ['treeLinedStreets', 'natureCrossings'],
	},
};

const buildingTypes = {
	singleFamilyHomes: 'residential-info',
	apartmentComplex: 'residential-info',
	factory: 'industrial-info',
	warehouse: 'industrial-info',
	governmentBuilding: 'services-info',
	hospital: 'services-info',
	hotels: 'commercial-info',
	mediumOfficeBuildings: 'commercial-info',
	retailCenter: 'commercial-info',
	tallOfficeBuilding: 'commercial-info',
};

const buildingTypeColors = {
	'residentail-info': '#4a6537',
	'commercial-info': '#779de0',
	'services-info': '#c78e67',
	'industrial-info': '#8d5999',
};

const greenModToolTip = {
	greenRoof:
		'Reduces air pollution greatly and some surface temperature; adds trees and increases bird population',
	coolRoof: 'Reduces surface temperature greatly and some air pollution',
	solarRoof: 'Carbon neutral energy, but increases surface temperature',
	treeLinedStreets:
		'Adds trees, reduces air pollution, and increase bird and small mammal populations',
	natureCrossings:
		'Makes adjacent parcels permanent nature preserves; increases small mammal populations there greatly',
	disabledNatureCrossings:
		'You cannot build nature crossings, as this parcel is not adjacent to any nature preserves.',
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
		usingKeyboard
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
			if (greenModMetrics[upgrade].treeCount) {
				effects.treeCount += calculateMidpoint(
					greenModMetrics[upgrade].treeCount
				);
			}
			if (greenModMetrics[upgrade].wildlife) {
				if (greenModMetrics[upgrade].wildlife.smallMammals) {
					effects.wildlife.smallMammals += calculateMidpoint(
						greenModMetrics[upgrade].wildlife.smallMammals
					);
				}
				if (greenModMetrics[upgrade].wildlife.birds) {
					effects.wildlife.birds += calculateMidpoint(
						greenModMetrics[upgrade].wildlife.birds
					);
				}
			}
		});

		return effects;
	};

	useEffect(() => {
		if (usingKeyboard) {
			menuRef.current.focus();
		}
	}, [usingKeyboard, selectedTile])

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
		treeLinedStreets: preloadedUIImages['treeLinedStreets'].src,
		natureCrossings: preloadedUIImages['natureCrossings'].src,
		greenRoof: preloadedUIImages['greenRoof'].src,
		coolRoof: preloadedUIImages['coolRoof'].src,
		solarRoof: preloadedUIImages['solarRoof'].src,
	};

	const isAnyGreenModSelected = () => {
		if (!previewTile) return false;
		const upgrades = previewTile.data.upgrades;
		return [
			'solarRoof',
			'greenRoof',
			'coolRoof',
			'treeLinedStreets',
			'natureCrossings',
		].some((mod) => upgrades[mod]);
	};

	const handleBuild = () => {
		if (!isAnyGreenModSelected()) return;
		revertPowerModRef.current = false;

		if (selectedTile && previewTile) {
			playSound('confirmModsSound');
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

	const canBuildNatureCrossing = (tileKey) => {
		return Object.values(checkAdjacentNatureCells(selectedTile)).some(
			(value) => value
		);
	};

	const handleKeyDown = (e) => {
		e.stopPropagation();
		if (e.key === 'Escape') {
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

		// Early return if trying to build nature crossing without valid adjacent cells
		if (upgradeType === "natureCrossings" && !canBuildNatureCrossing(selectedTile)) return;

		playSound("menuClickSound");

		const isCurrentlyEnabled = previewTile.data.upgrades[upgradeType];

		// Create new upgrades object first
		const newUpgrades = {
			...previewTile.data.upgrades,
			[upgradeType]: !isCurrentlyEnabled,
		};

		// Calculate effects with new upgrades
		const newdata = calculateModEffects(newUpgrades);
		setPreviewValues(newdata);

		// Update preview with basic toggle
		updatePreviewUpgrade(upgradeType, !isCurrentlyEnabled);

		// Handle nature crossings
		if (upgradeType === "natureCrossings") {
			applyNatureCrossingToPreview(!isCurrentlyEnabled);
		}

		// Handle structural upgrades
		if (category === "structuralUpgrades") {
			// Disable other structural upgrades
			['solarRoof', 'greenRoof', 'coolRoof'].forEach(mod => {
				if (mod !== upgradeType) {
					updatePreviewUpgrade(mod, false);
				}
			});

			// Handle solar roof specifically
			if (upgradeType === 'solarRoof') {
				const availablePowerMods = selectedTileData.upgrades.connectionMods.power || [];

				if (!isCurrentlyEnabled) {
					// Enabling solar roof
					if (!availablePowerMods.includes('solar')) {
						updatePreviewUpgrade('localPower', 'solar');
						setHasSolarRoof(true);
						revertPowerModRef.current = true;
					}
					handlePowerModChange("solar");
				} else {
					// Disabling solar roof
					if (!availablePowerMods.includes('solar')) {
						updatePreviewUpgrade('localPower', null);
						setHasSolarRoof(false);
						revertPowerModRef.current = false;
					}
					if (availablePowerMods.length > 0) {
						handlePowerModChange(availablePowerMods[0]);
					}
				}
			} else if (!isCurrentlyEnabled) {
				// Handling non-solar structural upgrade being enabled
				if (!selectedTileData.upgrades.connectionMods.power?.includes("solar")) {
					updatePreviewUpgrade("localPower", null);
				}
				if (previewTile.data.upgrades.activeMods?.power === "solar") {
					const availablePowerMods = selectedTileData.upgrades.connectionMods.power || [];
					if (availablePowerMods.length > 0) {
						handlePowerModChange(availablePowerMods[0]);
					}
				}
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
		if (category === 'streetUpgrades' && hideColumn.streetUpgrades !== status) {
			setHideColumn((prev) => ({
				...prev,
				streetUpgrades: status,
			}));
		} else if (
			category === 'structuralUpgrades' &&
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
			if (mod === 'natureCrossings' && !canBuildNatureCrossing(selectedTile)) {
				return greenModToolTip['disabledNatureCrossings'];
			} else {
				return greenModToolTip[mod];
			}
		};
		return upgradeList[tileType].map((upgradeType) => (
			<div key={upgradeType} className={`toggle-wrapper`}>
				<Tippy
					content={toolTipContent(upgradeType)}
					animation="shift-away-subtle"
				>
					<button
						className={`toggle ${previewTile.data.upgrades[upgradeType]
							? 'active'
							: greenModsApplied
								? 'hide'
								: ''
							} ${upgradeType === 'natureCrossings' &&
								!canBuildNatureCrossing(selectedTile)
								? 'disable'
								: ''
							}`}
						// disabled={
						// 	greenModsApplied ||
						// 	(upgradeType === "natureCrossings" &&
						// 		!canBuildNatureCrossing(selectedTile))
						// }
						onClick={() => handleGreenModToggle(upgradeType, category)}
					>
						<div className="content-wrapper">
							<img
								className="mod-img"
								src={greenModImg[upgradeType]}
								alt="green mod"
							/>

							<p className="mod-name">
								{upgradeType === 'treeLinedStreets'
									? 'Tree-Lined Streets'
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
		const activePowerMod = previewTile.data.upgrades.activeMods?.power || '';

		// Combine available power mods with local power (if it exists)
		const availablePowerMods = [
			...(selectedTileData.upgrades.connectionMods.power || []),
			...(previewTile.data.upgrades.localPower ? [previewTile.data.upgrades.localPower] : [])
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
									{mod === 'hydroelectric'
										? 'Hydroelectric'
										: capitalizeEachWord(mod)}
								</option>
							))}
						</select>
					</div>
				) : (
					<p className="power-mod-item">
						{availablePowerMods[0] === 'hydroelectric'
							? 'Hydroelectric'
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
			if (key !== 'power' && key !== 'connectionMods') {
				// Handle natureCrossings specifically
				if (
					key === 'natureCrossings' &&
					upgrades[key] &&
					upgrades[key].enabled
				) {
					// Calculate cost based on true directions (north, south, east, west)
					const directions = ['north', 'south', 'west', 'east'];
					const trueCount = directions.reduce((count, direction) => {
						return upgrades[key][direction] ? count + 1 : count;
					}, 0);

					// Multiply the cost by the number of true directional values
					if (greenModCosts[key]) {
						totalCost += greenModCosts[key] * trueCount;
					}
				}
				// For other upgrades, simply add the cost if true
				else if (upgrades[key] === true && greenModCosts[key]) {
					totalCost += greenModCosts[key];
				}
			}
		});

		return totalCost;
	};

	const calculateAirPollution = () => {
		const pollution = displayData.metrics.pollution;
		if (!pollution) return 0;

		return (
			<ul className="pollution-list">
				<li>
					<span>Cars:</span>
					{`${pollution.cars.toFixed(1)}%`}
				</li>
				<li>
					<span>Energy:</span>
					{`${pollution.power.air}%`}
				</li>
				<li>
					<span>Building:</span>
					{`${pollution.structure.toFixed(1)}%`}
				</li>
				<li>
					<span>Green Mods:</span>
					{greenModsApplied
						? pollution.mods.air?.toFixed(1)
						: previewValues.airPollution}
					%
				</li>
			</ul>
		);
	};

	// Animation for the menu appearance
	const menuAnimation = useSpring({
		from: { opacity: 0, transform: 'translateX(-80px)' },
		to: { opacity: 1, transform: 'translateX(0px)' },
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
							{urbanStructures[tileType]?.name || 'Unknown Structure'}
						</h4>
						<div className="cost">
							<p>Total {greenModsApplied ? 'Spent' : 'Cost'}:</p>
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
						className={`green-mods-con ${greenModsApplied ? 'mods-applied' : ''
							}`}
					>
						<p className="green-mod-title">
							{greenModsApplied
								? 'Green Mods Installed:'
								: 'Possible Green Mods'}
						</p>
						<div
							className={`columns ${hideColumn.structuralUpgrades || hideColumn.streetUpgrades
								? 'one'
								: 'two'
								}`}
						>
							<div
								className={`left-column ${hideColumn.structuralUpgrades === true ? 'hide' : ''
									}`}
							>
								<p>You may choose only one:</p>
								<div className="upgrade-toggles">
									{renderGreenModToggles(
										availableUpgrades.structuralUpgrades,
										'structuralUpgrades'
									)}
								</div>
							</div>

							<div
								className={`right-column ${hideColumn.streetUpgrades === true ? 'hide' : ''
									}`}
							>
								<p>You may choose any or all of these:</p>
								<div className="upgrade-toggles">
									{renderGreenModToggles(
										availableUpgrades.streetUpgrades,
										'streetUpgrades'
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
						{/* {displayData.metrics?.electricityUsage && (
							<div>
								<p>Electricity Usage </p>
								<p>{displayData.metrics.electricityUsage}</p>
							</div>
						)} */}
						{displayData.metrics?.airPollutionChange > 0 && (
							<div>
								<p>Air Pollution </p>
								{calculateAirPollution()}
							</div>
						)}
						{displayData.metrics?.treeCount > 0 && (
							<div>
								<p>Trees</p>
								{!greenModsApplied ? (
									<p>
										Trees Lost:{' '}
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
										Current Trees:{' '}
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
									{greenModsApplied ? 'Trees Added: ' : 'Trees to be Added: '}
									<span>
										{greenModsApplied
											? displayData.metrics.greenModMetrics.treeCount
											: previewValues.treeCount.toFixed()}
									</span>
								</p>
							</div>
						)}
						{displayData.metrics?.temperatureChange > 0 && (
							<div>
								<p>Temperature Change </p>
								<p>{displayData.metrics.temperatureChange}</p>
							</div>
						)}
						{displayData.metrics?.wildlife && (
							<div>
								<p>Wildlife</p>
								<p>
									Animals Lost:{' '}
									<span>{displayData.metrics.prevMetrics.wildlife.birds}</span>
								</p>
								<p>
									{greenModsApplied ? 'Birds Added' : 'Birds to be Added'}:{' '}
									<span>
										{greenModsApplied
											? displayData.metrics.wildlife.birds
											: previewValues.wildlife.birds}
									</span>
								</p>
								<p>
									{greenModsApplied
										? 'Small Mammals Added'
										: 'Small Mammals to be Added'}
									:{' '}
									<span>
										{greenModsApplied
											? displayData.metrics.wildlife.smallMammals
											: previewValues.wildlife.smallMammals}
									</span>
								</p>
							</div>
						)}
						{typeof displayData.metrics?.groundwaterPollutionIncrease ===
							'object' ? (
							<div>
								<p>Groundwater Pollution </p>
								<p>{displayData.metrics.groundwaterPollutionIncrease[0]}</p>
							</div>
						) : typeof displayData.metrics?.groundwaterPollutionIncrease ===
							'number' ? (
							<div>
								<p>Groundwater Pollution </p>
								<p>{displayData.metrics.groundwaterPollutionIncrease}%</p>
							</div>
						) : null}

						{availableEnergySources.length === 1 ? (
							<div className="energy-source-note-item building-info">
								<p className="energy-source-note-text">
									If you can choose a different energy source for this building,
									you will see a drop-down menu. You can swap between available
									energy sources <b>at any time</b>.
								</p>
							</div>
						) : null}
						<div
							className={`wastewater-grid-item building-info ${availableEnergySources.length === 1 ? 'energy-present' : ''
								}`}
						>
							<div className="wastewater-grid-text">
								{hasWaterTreatment ? (
									availableEnergySources.length > 1 ? (
										<p>
											This parcel has access to a water treatment facility (less
											groundwater pollution).
										</p>
									) : (
										<>
											<p>This parcel has access to</p>{' '}
											<p>a water treatment facility</p>{' '}
											<p>(less groundwater pollution).</p>
										</>
									)
								) : availableEnergySources.length > 1 ? (
									<p>
										This parcel doesn't have access to a wastewater treatment
										facility (more groundwater pollution).
									</p>
								) : (
									<>
										{' '}
										<p>This parcel doesn't have access to</p>{' '}
										<p>a wastewater treatment facility</p>{' '}
										<p>(more groundwater pollution).</p>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className={`footer ${greenModsApplied ? 'mods-applied' : ''}`}>
				{greenModsApplied ? (
					<RoundedButton
						text="Done"
						color={buildingTypeColors[buildingTypes[tileType]]}
						size={'small'}
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
							size={'small'}
							onClick={handleCancel}
							fontSize={12}
						/>
						<RoundedButton
							text="Build"
							color={buildingTypeColors[buildingTypes[tileType]]}
							size={'small'}
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

export default BuildingInfoMenu;
