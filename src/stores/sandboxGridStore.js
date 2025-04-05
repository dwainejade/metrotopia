import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import useAudioStore from "./audioStore";
import useResourcesStore from "./sandboxResourcesStore";
import useCameraStore from "./cameraStore";
import generateMetricsForTile from "../helpers/generateMetricsForTile";
import gameObjects, {
	constants,
	assignRandomModsToCities,
	greenModMetrics,
	powerModMetrics,
	transportationConnectionModifiers,
} from "../data/sandboxGameObjects";
import {
	collectModsForNewTile,
	propagateModsToNeighbors,
} from "../helpers/propagateMods";
import { spaceEachWord } from "../helpers/capitalizeEachWord";
import { v4 as uuidv4 } from "uuid";

const verifyPondsAndMeadows = (tiles) => {
	let pondCount = 0;
	let meadowCount = 0;

	for (const key in tiles) {
		const tileType = tiles[key].type;
		if (tileType === "pond") {
			pondCount++;
		} else if (tileType === "meadow") {
			meadowCount++;
		}
	}

	// Since meadows occupy 4 tiles, divide by 4 to get the actual number of meadows
	meadowCount = meadowCount / 4;

	return { pondCount, meadowCount };
};

// render random buildings for testing cpu/gpu load
const placeRandomBuildings = () => {
	const store = useMainGridStore.getState();
	const audioStore = useAudioStore.getState();
	const resourceStore = useResourcesStore.getState();

	// First, generate the random nature grid
	store.generateRandomGrid();

	// Temporarily mute audio during mass placement
	audioStore.setMuted(true);

	// Get updated state after grid generation
	const { gridSize, placeObject, tiles, neighboringCities } =
		useMainGridStore.getState();

	// Probability settings based on tile type
	const REPLACEMENT_PROBABILITIES = {
		pond: 0.2,
		windingStream_vertical: 0.2,
		windingStream_horizontal: 0.2,
		thickForestedArea: 0.1,
		meadow: 0.95,
		sparseTreesArea: 0.9,
		someTreesArea: 0.7,
	};

	const GREEN_MOD_PROBABILITY = 0.4; // 40% chance for a green mod

	// Available building types for random selection
	const buildingTypes = [
		"singleFamilyHomes",
		"singleFamilyHomes",
		"singleFamilyHomes",
		"singleFamilyHomes",
		"apartmentComplex",
		"apartmentComplex",
		"apartmentComplex",
		"apartmentComplex",
		"apartmentComplex",
		"apartmentComplex",
		"retailCenter",
		"retailCenter",
		"mediumOfficeBuildings",
		"mediumOfficeBuildings",
		"tallOfficeBuilding",
		"tallOfficeBuilding",
		"hotels",
		"hotels",
		"hospital",
		"hospital",
		"governmentBuilding",
		"governmentBuilding",
		"warehouse",
		"factory",
	];

	// Available green mods
	const greenMods = {
		structural: ["solarRoof", "coolRoof", "greenRoof"],
		additional: ["treeLinedStreets"],
	};

	// Process each tile in the grid
	for (let row = 0; row < gridSize; row++) {
		for (let col = 0; col < gridSize; col++) {
			const key = `${row}-${col}`;
			const currentTile = tiles[key];

			// Only attempt to replace natural features with their specific probabilities
			if (gameObjects.naturalFeatures[currentTile.type]) {
				const replacementChance =
					REPLACEMENT_PROBABILITIES[currentTile.type] || 0.5;

				if (Math.random() < replacementChance) {
					// Select random building type
					const randomBuildingType =
						buildingTypes[Math.floor(Math.random() * buildingTypes.length)];

					// Collect available power mods from neighboring cities and tiles
					const collectedMods = collectModsForNewTile(
						tiles,
						key,
						gridSize,
						neighboringCities
					);
					let powerMod = null;
					if (collectedMods.power && collectedMods.power.size > 0) {
						const powerMods = Array.from(collectedMods.power);
						powerMod = powerMods[Math.floor(Math.random() * powerMods.length)];
					}

					// Try to place the building
					const success = placeObject(key, randomBuildingType, powerMod);

					// If placement was successful and we roll for green mods
					if (success && Math.random() < GREEN_MOD_PROBABILITY) {
						// Apply random green mods
						const mods = {};

						// Pick one structural mod
						const structuralMod =
							greenMods.structural[
							Math.floor(Math.random() * greenMods.structural.length)
							];
						mods[structuralMod] = true;

						// Maybe add tree-lined streets (50% chance if we're already adding green mods)
						if (Math.random() < 0.5) {
							mods.treeLinedStreets = true;
						}

						// Apply the mods
						useMainGridStore.getState().applyMods(key, {
							...mods,
							greenModsApplied: true,
						});
					}
				}
			}
		}
	}

	// Unmute audio and play a single build sound
	audioStore.setMuted(false);
	audioStore.playSound("buildSound");

	// Update resources and environmental factors
	resourceStore.updateTotalPollution();
	resourceStore.updateCurrentTemperature();
	resourceStore.calculateSurfaceWater();

	// Update environmental sound balance based on urban ratio
	const urbanRatio = useMainGridStore.getState().calculateUrbanRatio();
	audioStore.adjustEnvironmentalSoundVolumes(urbanRatio);
};

const initialState = {
	screen: "start",
	gridSize: 10,
	tiles: [],
	isDragging: false,
	selectedTileType: null,
	selectedTile: null,
	prevSelectedTile: null,
	showCellHighlighter: false,
	upgrades: {},
	neighboringCities: {},
	previewTile: null,
	devMode: false,
	isCarMovementPaused: false,
	selectedEnergyType: null,
	currentOpenModal: null,
	activeConstructionBuildingCategory: "residential", // Used to track the active category for construction modal
	endModalReason: [],
	selectedTopRightMenuItem: null,
	activeFilter: null,
	usingKeyboard: false,
	/*
	Filter structure:
	{
		type: string ('powerType' | 'buildingType' | 'upgrades' | 'pollution' | etc),
		value: any,    // The specific value to filter by
		options?: any  // Additional filter options if needed
	}
	*/
};

const useMainGridStore = create(
	persist(
		(set, get) => ({
			...initialState,

			setSelectedTopRightMenuItem: (selectedTopRightMenuItem) =>
				set({ selectedTopRightMenuItem }),

			//////// DEV ////////////////////////////
			toggleCarMovement: () =>
				set((state) => ({ isCarMovementPaused: !state.isCarMovementPaused })),
			pauseCarMovement: () => set({ isCarMovementPaused: true }),
			resumeCarMovement: () => set({ isCarMovementPaused: false }),
			setDevMode: (state) => set({ devMode: state }),
			////////////////////////////////////////

			setScreen: (screen) => set({ screen }),
			setEndModalReason: (endModalReason) => set({ endModalReason }),

			setUsingKeyboard: (usingKeyboard) => set({ usingKeyboard }),

			activeTab: null,
			setActiveTab: (selectedTab) => set({ activeTab: selectedTab }),

			// handle all modals
			setCurrentModal: (modalName) => {
				const { currentOpenModal } = get();
				if (modalName === "Reset") {
					useAudioStore.getState().playSound("popUpSound");
					set({ showCellHighlighter: false });
				} else if (modalName && modalName !== currentOpenModal) {
					useAudioStore.getState().playSound("popUpSound2");
				}
				if (modalName === "Instructions") {
					set({ showCellHighlighter: false });
				}

				set({
					currentOpenModal: modalName,
				});
			},

			setSelectedEnergyType: (type) => set({ selectedEnergyType: type }),
			setActiveConstructionBuildingCategory: (category) =>
				set({ activeConstructionBuildingCategory: category }),

			placeRandomBuildings,

			startGame: () => {
				const { resetGame } = get();
				resetGame();
				set({ screen: "game", currentOpenModal: "Instructions" });
			},

			resetGame: () => {
				const { generateRandomGrid } = get();
				set({
					...initialState,
				});

				useResourcesStore.getState().resetResources();
				generateRandomGrid();
				useAudioStore.getState().resetSounds();
				useCameraStore.getState().resetCamera();
				useAudioStore.getState().playSound("startSound");
			},

			// update a petric metric for a tile. default replaces value but if shouldAdd is true, it adds the new value to the existing value
			updateTileMetrics: (tileKey, metricPath, value, shouldAdd = false) => {
				const { tiles } = get();
				const tile = tiles[tileKey];
				if (!tile) return; // If tile doesn't exist, do nothing

				const updateNestedMetric = (obj, path, value, shouldAdd) => {
					const parts = path.split(".");
					const lastPart = parts.pop();
					const target = parts.reduce((acc, part) => {
						if (!acc[part]) acc[part] = {};
						return acc[part];
					}, obj);

					const oldValue = target[lastPart] || 0;
					target[lastPart] = shouldAdd ? oldValue + value : value;
					return obj;
				};

				const updatedMetrics = updateNestedMetric(
					{ ...tile.metrics },
					metricPath,
					value,
					shouldAdd
				);

				const updatedTile = {
					...tile,
					metrics: updatedMetrics,
				};

				set((state) => ({
					...state,
					tiles: {
						...state.tiles,
						[tileKey]: updatedTile,
					},
				}));
				let newPath = metricPath;
				if (metricPath === "temperature") {
					newPath = "temperature.current";
				}

				// After updating the tile, trigger a resource update
				// We pass the full path and the new value to updateResourcesForMetricChange
				useResourcesStore
					.getState()
					.updateResourcesForMetricChange(
						newPath,
						updatedTile.metrics[metricPath.split(".")[0]]
					);
			},

			setIsDragging: (isDragging) => set({ isDragging }),
			setTileType: (key, type) =>
				set((state) => ({
					tiles: { ...state.tiles, [key]: type },
				})),
			setSelectedTileType: (type) => set({ selectedTileType: type }),

			setSelectedTile: (key) =>
				set((state) => {
					if (key !== null) {
						return {
							...state,
							selectedTile: key,
							prevSelectedTile: key,
						};
					} else {
						return {
							...state,
							selectedTile: null,
						};
					}
				}),

			// Pulse Building Categories in Construction Menu
			pulseCategories: {
				residential: false,
				commercial: true,
				services: true,
				industrial: true,
			},
			setPulseCategories: (category) =>
				set({
					pulseCategories: {
						...get().pulseCategories,
						[category]: false,
					},
				}),

			setShowCellHighlighter: (show) => set({ showCellHighlighter: show }),

			setGreenMods: (tileKey, upgradeType, greenMods) => {
				get().updatePreview(tileKey, greenMods);
			},

			applyConnectionMod: (tileKey, modType, value) => {
				set((state) => {
					const tile = state.tiles[tileKey];
					if (!tile) return state;

					const updatedTile = {
						...tile,
						upgrades: {
							...tile.upgrades,
							activeMods: {
								...tile.upgrades.activeMods,
								[modType]: value ? [value] : [],
							},
							connectionMods: {
								...tile.upgrades.connectionMods,
								[modType]: tile.upgrades.connectionMods[modType] || [],
							},
						},
					};

					// If the mod is being activated, add it to connectionMods if it's not already there
					if (
						value &&
						!updatedTile.upgrades.connectionMods[modType].includes(value)
					) {
						updatedTile.upgrades.connectionMods[modType] = [
							...updatedTile.upgrades.connectionMods[modType],
							value,
						];
					}

					const newState = {
						tiles: {
							...state.tiles,
							[tileKey]: updatedTile,
						},
					};

					// Update resources after applying the mod
					useResourcesStore.getState().updateResources(tile, updatedTile);

					return newState;
				});
			},

			setPreviewTile: (tileKey, buildingType, upgrades = {}) => {
				const { tiles } = get();
				const existingTile = tiles[tileKey] || {};
				const { metrics } = generateMetricsForTile(buildingType);

				set({
					previewTile: {
						key: tileKey,
						data: {
							type: buildingType,
							metrics,
							upgrades: {
								...existingTile.upgrades,
								...upgrades,
							},
						},
					},
				});
			},

			clearPreview: () => {
				set({ previewTile: null });
			},

			updatePreviewUpgrade: (upgradeType, value) => {
				set((state) => {
					if (!state.previewTile) return state;
					return {
						previewTile: {
							...state.previewTile,
							data: {
								...state.previewTile.data,
								upgrades: {
									...state.previewTile.data.upgrades,
									[upgradeType]: value,
								},
							},
						},
					};
				});
			},

			placeObject: (selectedCell, newTileType, powerMod) => {
				const { tiles, gridSize, neighboringCities, updatePowerMod } = get();
				const oldCellData = tiles[selectedCell] || {
					type: "emptyTile",
					metrics: {},
					upgrades: {},
				};

				if (selectedCell && oldCellData.type !== newTileType) {
					// Generate new metrics and upgrades for the new tile
					const { metrics: newMetrics, upgrades } =
						generateMetricsForTile(newTileType);

					// Save the previous tile's metrics
					const prevMetrics = oldCellData.metrics || {};

					// Collect mods from edges and adjacent tiles
					const collectedMods = collectModsForNewTile(
						tiles,
						selectedCell,
						gridSize,
						neighboringCities
					);

					// Assign collected mods to the new tile
					upgrades.connectionMods = collectedMods;

					const isConnectedToWaterTreatment =
						upgrades.connectionMods.waste.includes(
							"wastewater treatment facility"
						);

					// Simplify groundwater pollution calculation
					if (newMetrics.groundwaterPollution) {
						newMetrics.groundwaterPollution = isConnectedToWaterTreatment
							? newMetrics.groundwaterPollution[0]
							: newMetrics.groundwaterPollution[1];
					}

					let carTrafficModifier = 1;
					let salesTaxModifier = 1;

					upgrades.connectionMods.transportation.forEach((mod) => {
						if (transportationConnectionModifiers[mod]) {
							const modifiers = transportationConnectionModifiers[mod];
							if (
								modifiers.carTraffic &&
								modifiers.carTraffic[newMetrics.subCategory]
							) {
								carTrafficModifier *=
									modifiers.carTraffic[newMetrics.subCategory];
							}
							if (modifiers.taxes && modifiers.taxes.sales) {
								salesTaxModifier *= modifiers.taxes.sales;
							}
						}
					});

					// Apply modifiers to metrics
					newMetrics.carTraffic = Math.round(
						newMetrics.carTraffic * carTrafficModifier
					);
					if (newMetrics.taxes && newMetrics.taxes.sales) {
						newMetrics.taxes.sales = Math.round(
							newMetrics.taxes.sales * salesTaxModifier
						);
					}

					// Calculate pollution for the new tile
					const pollution = calculateTilePollution(
						newTileType,
						powerMod,
						upgrades,
						newMetrics.carTraffic
					);

					// Create new cell data
					const newCellData = {
						type: newTileType,
						metrics: {
							...newMetrics,
							pollution,
							prevMetrics, // Store the entire previous metrics object
						},
						upgrades,
						greenModsApplied: false,
					};

					let newTiles = {
						...tiles,
						[selectedCell]: newCellData,
					};

					// Propagate mods to all connected buildings
					newTiles = propagateModsToNeighbors(
						newTiles,
						gridSize,
						selectedCell,
						collectedMods
					);

					// Update the store
					set({ tiles: newTiles, selectedTile: null });

					// Update power mod
					updatePowerMod(selectedCell, powerMod);
					const { updateTileMetrics } = get();
					updateTileMetrics(
						selectedCell,
						"temperature",
						newMetrics.temperature
					);

					// Play sound
					useAudioStore.getState().playSound("buildSound");
					const urbanRatio = get().calculateUrbanRatio();
					useAudioStore.getState().adjustEnvironmentalSoundVolumes(urbanRatio);

					// Update resources
					useResourcesStore
						.getState()
						.updateResources(oldCellData, newCellData);

					// Update pollution
					useResourcesStore.getState().updateTotalPollution();
					useResourcesStore.getState().updateCurrentTemperature();
					useResourcesStore.getState().calculateSurfaceWater();
					useResourcesStore.getState().recalculateConnectionMods();

					return true;
				}
				return false;
			},

			////////////////// naure crossing functions /////////////////////////////////
			isTileLocked: (tileKey) => {
				const { tiles } = get();
				return tiles[tileKey]?.locked || false;
			},
			applyNatureCrossingToPreview: (enabled) => {
				const { previewTile, checkAdjacentNatureCells } = get();

				if (!previewTile) return;

				const { key, data } = previewTile;

				if (enabled) {
					// Enable natureCrossings: check for adjacent nature cells
					const adjacentNatureCells = checkAdjacentNatureCells(key);
					const updatedUpgrades = {
						...data.upgrades,
						natureCrossings: {
							enabled: true,
							...adjacentNatureCells,
						},
					};

					// Update the previewTile with the enabled natureCrossings
					set({
						previewTile: {
							...previewTile,
							data: {
								...data,
								upgrades: updatedUpgrades,
							},
						},
					});
				} else {
					// Disable natureCrossings: set it to null or disabled
					const updatedUpgrades = {
						...data.upgrades,
						natureCrossings: null,
					};

					// Update the previewTile with the disabled natureCrossings
					set({
						previewTile: {
							...previewTile,
							data: {
								...data,
								upgrades: updatedUpgrades,
							},
						},
					});
				}
			},
			checkAdjacentNatureCells: (tileKey) => {
				const { tiles, gridSize } = get();
				const [row, col] = tileKey.split("-").map(Number);

				const isNaturalFeature = (r, c) => {
					if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) return false;
					const tile = tiles[`${r}-${c}`];
					return Boolean(tile && gameObjects.naturalFeatures[tile.type]);
				};

				return {
					north: isNaturalFeature(row - 1, col),
					south: isNaturalFeature(row + 1, col),
					west: isNaturalFeature(row, col - 1),
					east: isNaturalFeature(row, col + 1),
				};
			},
			lockAdjacentNatureCells: (tileKey, adjacentNatureCells, currentTiles) => {
				const [row, col] = tileKey.split("-").map(Number);
				const newTiles = { ...currentTiles };

				const directions = [
					["north", -1, 0],
					["south", 1, 0],
					["west", 0, -1],
					["east", 0, 1],
				];

				// if already locked, return

				directions.forEach(([direction, dx, dy]) => {
					if (adjacentNatureCells[direction]) {
						const newRow = row + dx;
						const newCol = col + dy;
						const neighborKey = `${newRow}-${newCol}`;
						if (
							// if its a nature tile and not already locked
							newTiles[neighborKey] &&
							gameObjects.naturalFeatures[newTiles[neighborKey].type] &&
							!newTiles[neighborKey].locked
						) {
							// lock it
							newTiles[neighborKey] = {
								...newTiles[neighborKey],
								locked: true,
								// add 20% to small mammals
								metrics: {
									...newTiles[neighborKey].metrics,
									wildlife: {
										...newTiles[neighborKey].metrics.wildlife,
										smallMammals: Math.round(
											newTiles[neighborKey].metrics.wildlife.smallMammals * 1.5
										),
									},
								},
							};
						}
					}
				});

				return newTiles;
			},
			getNatureCrossingState: (tileKey) => {
				const { tiles } = get();
				const isPreview = tiles[tileKey]?.isPreview;
				const previewData = tiles[tileKey]?.previewData;
				const upgrades = isPreview
					? previewData?.upgrades
					: tiles[tileKey]?.upgrades;

				return (
					upgrades?.natureCrossings || {
						enabled: false,
						north: false,
						south: false,
						east: false,
						west: false,
					}
				);
			},
			///////////////////////////////////////////////////////////////////////

			////////////////////////// ANIMATIONS ///////////////////////////////
			feedbackAnimations: [],

			addFeedbackAnimation: (animationData) => {
				const id = uuidv4();
				set((state) => ({
					feedbackAnimations: [
						...state.feedbackAnimations,
						{ id, ...animationData },
					],
				}));
			},

			removeFeedbackAnimation: (id) => {
				set((state) => ({
					feedbackAnimations: state.feedbackAnimations.filter(
						(animation) => animation.id !== id
					),
				}));
			},
			///////////////////////////////////////////////////////////////////////

			getTileInfo: (tileKey) => {
				const { tiles } = get();
				return tiles[tileKey];
			},

			getNeighboringCityInfo: (tileKey) => {
				const { gridSize, neighboringCities } = get();
				const [row, col] = tileKey.split("-").map(Number);
				let cityInfo = {};

				if (row === 0) cityInfo.north = neighboringCities.north;
				if (row === gridSize - 1) cityInfo.south = neighboringCities.south;
				if (col === 0) cityInfo.west = neighboringCities.west;
				if (col === gridSize - 1) cityInfo.east = neighboringCities.east;

				return cityInfo;
			},

			getNeighboringTilesInfo: (tileKey) => {
				const { tiles, gridSize } = get();
				const [row, col] = tileKey.split("-").map(Number);
				const neighboringTiles = [];

				const directions = [
					[-1, 0], // Up
					[1, 0], // Down
					[0, -1], // Left
					[0, 1], // Right
				];

				for (const [dx, dy] of directions) {
					const newRow = row + dx;
					const newCol = col + dy;

					if (
						newRow >= 0 &&
						newRow < gridSize &&
						newCol >= 0 &&
						newCol < gridSize
					) {
						const neighborTileKey = `${newRow}-${newCol}`;
						const neighborTile = tiles[neighborTileKey];
						if (neighborTile) {
							neighboringTiles.push({
								key: neighborTileKey,
								...neighborTile,
							});
						}
					}
				}

				return neighboringTiles;
			},

			// check if structure can be built at location
			canBuild: (tileKey, newBuildingType) => {
				const { getNeighboringTilesInfo, gridSize } = get();
				const resourcesStore = useResourcesStore.getState();
				const currentFunds = resourcesStore.resources.funds.current;

				let canBuild = true;
				const reasons = [];

				// Check if player has enough funds
				const buildingCost =
					gameObjects.urbanStructures[newBuildingType]?.metrics?.cost || 0;
				// if (currentFunds < buildingCost) {
				// 	canBuild = false;
				// 	reasons.push(
				// 		`Insufficient funds. You need $${buildingCost} MB, but only have $${currentFunds} MB.`
				// 	);
				// }

				// Get neighboring tiles
				const neighboringTiles = getNeighboringTilesInfo(tileKey);

				// Check if the tile is on the edge of the grid
				const [row, col] = tileKey.split("-").map(Number);
				const isEdgeTile =
					row === 0 ||
					row === gridSize - 1 ||
					col === 0 ||
					col === gridSize - 1;

				// Check if there's an adjacent building or if it's on the edge
				const hasAdjacentBuilding = neighboringTiles.some(
					(tile) =>
						tile.type !== "emptyTile" && gameObjects.urbanStructures[tile.type]
				);

				if (!isEdgeTile && !hasAdjacentBuilding) {
					canBuild = false;
					reasons.push(
						"Building must be placed next to another building or on the edge of the grid."
					);
				}

				// Get building restrictions for the new building type
				const restrictions =
					gameObjects.urbanStructures[newBuildingType]?.buildingRestrictions ||
					[];

				// Check building restrictions for each neighboring tile
				const conflictingNeighbors = [];
				for (const neighborTile of neighboringTiles) {
					const neighborType = neighborTile.type;

					// Skip if the neighbor is an empty tile or a natural feature
					if (
						neighborType === "emptyTile" ||
						!gameObjects.urbanStructures[neighborType]
					)
						continue;

					// If the neighbor type is in the restrictions list, we can't build here
					if (restrictions.includes(neighborType)) {
						canBuild = false;
						conflictingNeighbors.push(
							spaceEachWord(neighborType).toLowerCase()
						);
					}
				}

				if (conflictingNeighbors.length > 0) {
					reasons.push(
						`This type of builiding is restricted for this parcel. You cannot build ${spaceEachWord(
							newBuildingType
						).toLowerCase()} adjacent to ${conflictingNeighbors.join(", ")}.`
					);
				}

				// Return an object with the result and reasons
				return {
					canBuild,
					reasons,
				};
			},

			// generateEmptyTiles: () => {
			//     const emptyTiles = generateEmptyTiles(get().gridSize);
			//     set({ tiles: emptyTiles });
			//     set((state) => ({ renderKey: state.renderKey + 1 }));
			// },

			// generate nature features based on some rules
			generateRandomGrid: () => {
				const { gridSize } = get();
				let newTiles = {};
				let maxAttempts = 100;
				let attempt = 0;

				const generateGrid = () => {
					newTiles = {};

					const isEmpty = (row, col) =>
						!newTiles[`${row}-${col}`] ||
						newTiles[`${row}-${col}`].type === "emptyTile";

					const isAdjacentTo = (row, col, featureTypes) => {
						const directions = [
							[-1, 0],
							[1, 0],
							[0, -1],
							[0, 1],
						];
						return directions.some(([dr, dc]) => {
							const newRow = row + dr;
							const newCol = col + dc;
							return (
								newRow >= 0 &&
								newRow < gridSize &&
								newCol >= 0 &&
								newCol < gridSize &&
								featureTypes.includes(newTiles[`${newRow}-${newCol}`]?.type)
							);
						});
					};

					const generateStream = () => {
						let streamRow, streamCol, rowDirection, colDirection;

						do {
							streamRow = Math.floor(Math.random() * gridSize);
							streamCol = Math.floor(Math.random() * gridSize);
							rowDirection = Math.random() < 0.5 ? -1 : 1;
							colDirection = Math.random() < 0.5 ? -1 : 1;
						} while (
							streamRow + rowDirection * 3 < 0 ||
							streamRow + rowDirection * 3 >= gridSize ||
							streamCol + colDirection * 3 < 0 ||
							streamCol + colDirection * 3 >= gridSize
						);

						// Determine if the stream is vertical (row and col both increase or both decrease)
						const isVertical =
							(rowDirection > 0 && colDirection > 0) ||
							(rowDirection < 0 && colDirection < 0);
						const streamType = isVertical
							? "windingStream_vertical"
							: "windingStream_horizontal";

						// Place the stream tiles
						for (let i = 0; i < 4; i++) {
							if (
								streamRow >= 0 &&
								streamRow < gridSize &&
								streamCol >= 0 &&
								streamCol < gridSize
							) {
								newTiles[`${streamRow}-${streamCol}`] = { type: streamType };
							}
							streamRow += rowDirection;
							streamCol += colDirection;
						}

						// Return the stream type for debugging or further use if needed
						return streamType;
					};

					const getQuadrants = () => {
						const halfSize = Math.floor(gridSize / 2);
						return [
							{
								minRow: 0,
								maxRow: halfSize - 1,
								minCol: 0,
								maxCol: halfSize - 1,
							},
							{
								minRow: 0,
								maxRow: halfSize - 1,
								minCol: halfSize,
								maxCol: gridSize - 1,
							},
							{
								minRow: halfSize,
								maxRow: gridSize - 1,
								minCol: 0,
								maxCol: halfSize - 1,
							},
							{
								minRow: halfSize,
								maxRow: gridSize - 1,
								minCol: halfSize,
								maxCol: gridSize - 1,
							},
						];
					};

					const placeFeaturesInQuadrants = (featureType, count) => {
						const quadrants = getQuadrants();
						const shuffledQuadrants = [...quadrants].sort(
							() => Math.random() - 0.5
						);

						for (let i = 0; i < count; i++) {
							const quadrant = shuffledQuadrants[i];
							let featurePlaced = false;
							let attempts = 0;

							while (!featurePlaced && attempts < 100) {
								const row =
									Math.floor(
										Math.random() * (quadrant.maxRow - quadrant.minRow + 1)
									) + quadrant.minRow;
								const col =
									Math.floor(
										Math.random() * (quadrant.maxCol - quadrant.minCol + 1)
									) + quadrant.minCol;

								if (featureType === "pond") {
									if (
										isEmpty(row, col) &&
										!isAdjacentTo(row, col, "windingStream") &&
										!isAdjacentTo(row, col, "meadow")
									) {
										newTiles[`${row}-${col}`] = { type: "pond" };
										featurePlaced = true;
									}
								} else if (featureType === "meadow") {
									if (
										row < gridSize - 1 &&
										col < gridSize - 1 &&
										isEmpty(row, col) &&
										isEmpty(row + 1, col) &&
										isEmpty(row, col + 1) &&
										isEmpty(row + 1, col + 1) &&
										!isAdjacentTo(row, col, "windingStream") &&
										!isAdjacentTo(row, col, "pond")
									) {
										newTiles[`${row}-${col}`] = { type: "meadow" };
										newTiles[`${row + 1}-${col}`] = { type: "meadow" };
										newTiles[`${row}-${col + 1}`] = { type: "meadow" };
										newTiles[`${row + 1}-${col + 1}`] = { type: "meadow" };
										featurePlaced = true;
									}
								}

								attempts++;
							}

							if (!featurePlaced) {
								return false; // Failed to place feature in this quadrant
							}
						}

						return true;
					};

					const fillRemainingSpaces = () => {
						// Step 1: Generate sparse trees next to meadows
						const generateSparseTreesNearMeadows = () => {
							for (let row = 0; row < gridSize; row++) {
								for (let col = 0; col < gridSize; col++) {
									if (isEmpty(row, col) && isAdjacentTo(row, col, ["meadow"])) {
										newTiles[`${row}-${col}`] = { type: "sparseTreesArea" };
									}
								}
							}
						};

						// Step 2: Generate some trees next to sparse trees, streams, and ponds
						const generateSomeTreesNearSparseAndWater = () => {
							for (let row = 0; row < gridSize; row++) {
								for (let col = 0; col < gridSize; col++) {
									if (
										isEmpty(row, col) &&
										isAdjacentTo(row, col, [
											"sparseTreesArea",
											"pond",
											"windingStream",
										])
									) {
										newTiles[`${row}-${col}`] = { type: "someTreesArea" };
									}
								}
							}
						};

						// Step 3: Fill any remaining empty spaces with thick forest
						const fillRemainingWithThickForest = () => {
							for (let row = 0; row < gridSize; row++) {
								for (let col = 0; col < gridSize; col++) {
									if (isEmpty(row, col)) {
										newTiles[`${row}-${col}`] = { type: "thickForestedArea" };
									}
								}
							}
						};

						// Execute the steps in order
						generateSparseTreesNearMeadows();
						generateSomeTreesNearSparseAndWater();
						fillRemainingWithThickForest();
					};

					generateStream();
					if (!placeFeaturesInQuadrants("meadow", 3)) return false;
					if (!placeFeaturesInQuadrants("pond", 4)) return false;
					fillRemainingSpaces();
					return true;
				};

				while (attempt < maxAttempts) {
					if (generateGrid()) {
						const { pondCount, meadowCount } = verifyPondsAndMeadows(newTiles);
						if (pondCount === 4 && meadowCount === 3) {
							break;
						}
					}
					attempt++;
				}

				if (attempt === maxAttempts) {
					console.error(
						"Failed to generate a valid grid after maximum attempts."
					);
					// Fallback: use the last generated grid even if it's not perfect
				}

				// New function to process all cells and generate metrics
				const processAllTiles = (tiles) => {
					const processedTiles = {};
					for (const [key, tile] of Object.entries(tiles)) {
						const { metrics, upgrades } = generateMetricsForTile(tile.type);
						processedTiles[key] = { ...tile, metrics, upgrades };
					}
					return processedTiles;
				};

				// Process all tiles to generate metrics
				const processedTiles = processAllTiles(newTiles);

				set({
					tiles: processedTiles,
					renderKey: get().renderKey + 1,
					neighboringCities: assignRandomModsToCities(),
				});

				// After the grid is generated, update the resources by mapping over the tiles
				useResourcesStore.getState().initializeResources(processedTiles);
				useResourcesStore.getState().updateCurrentTemperature();
				useResourcesStore.getState().calculateSurfaceWater();
			},

			applyMods: (tileKey, mods) => {
				const { tiles, lockAdjacentNatureCells } = get();
				const tile = tiles[tileKey];
				if (!tile) return; // Exit if the tile does not exist

				// Determine which mods are new
				const oldMods = tile.upgrades || {};
				const newMods = { ...oldMods, ...mods };

				// Recalculate pollution
				const newPollution = calculateTilePollution(
					tile.type,
					newMods.activeMods?.power,
					newMods,
					tile.metrics.carTraffic
				);

				// Update the tile's upgrades with the new mods
				const updatedTile = {
					...tile,
					upgrades: newMods,
					metrics: {
						...tile.metrics,
						pollution: newPollution,
					},
				};
				let newTiles = {
					...tiles,
					[tileKey]: updatedTile, // Update the tile with the new mods
				};

				// If the mod includes natureCrossings, lock adjacent nature cells
				if (mods.natureCrossings) {
					const adjacentNatureCells = mods.natureCrossings;
					// Lock adjacent nature cells and return the updated tiles
					newTiles = lockAdjacentNatureCells(
						tileKey,
						adjacentNatureCells,
						newTiles
					);
				}

				// Set the updated tiles in the state
				set({
					tiles: newTiles,
				});

				// Determine which green mods were added or removed
				const newGreenMods = Object.keys(newMods).filter((mod) =>
					greenModMetrics.hasOwnProperty(mod)
				);

				// Update resources based on the changes in green mods
				useResourcesStore
					.getState()
					.updateResourcesForGreenMods(tileKey, newGreenMods);
			},

			// Update resources based on the active power mod
			updatePowerMod: (tileKey, newPowerMod) => {
				const { tiles } = get();
				const tile = tiles[tileKey];
				if (!tile) return tiles;

				let oldPowerMod = null;

				if (tile.upgrades.activeMods?.power) {
					oldPowerMod = tile.upgrades.activeMods.power;
				}

				const updatedTile = {
					...tile,
					upgrades: {
						...tile.upgrades,
						activeMods: {
							...tile.upgrades.activeMods,
							power: newPowerMod,
						},
					},
				};

				const newPollution = calculateTilePollution(
					tile.type,
					newPowerMod,
					updatedTile,
					tile.metrics.carTraffic
				);

				// Calculate the temperature change from power mods
				const tempFromPowerMod = calculateTileTemperature(
					updatedTile,
					newPowerMod,
					oldPowerMod
				);

				set({
					tiles: {
						...tiles,
						[tileKey]: {
							...updatedTile,
							metrics: {
								...updatedTile.metrics,
								pollution: newPollution,
								greenModMetrics: {
									...updatedTile.metrics.greenModMetrics,
									temperature: tempFromPowerMod,
								},
							},
						},
					},
				});

				// Update energy usage and other resources
				useResourcesStore.getState().updateEnergyUsage(tile, newPowerMod);
				useResourcesStore.getState().updateTotalPollution();
				useResourcesStore.getState().updateCurrentTemperature();
			},

			// check if a tile is on the edge and apply mods based on the neighboring cities
			checkEdgeForNeighboringCity: (tileKey) => {
				const { gridSize, tiles, neighboringCities } = get();

				const collectedMods = collectModsForNewTile(
					tiles,
					tileKey,
					gridSize,
					neighboringCities
				);

				if (collectedMods) {
					const updatedTile = {
						...tiles[tileKey],
						upgrades: {
							...tiles[tileKey].upgrades,
							connectionMods: {
								power: Array.from(collectedMods.power),
								transportation: Array.from(collectedMods.transportation),
								waste: Array.from(collectedMods.waste),
							},
						},
					};
					let newTiles = {
						...tiles,
						[tileKey]: updatedTile,
					};

					// Propagate mods to neighbors
					newTiles = propagateModsToNeighbors(newTiles, gridSize);

					set({ tiles: newTiles });
				}
			},

			// calculate urban ratio based building type
			calculateUrbanRatio: () => {
				const { tiles, gridSize } = get();
				let urbanTiles = 0;
				let totalTiles = gridSize * gridSize;

				Object.values(tiles).forEach((tile) => {
					if (gameObjects.urbanStructures[tile.type]) {
						urbanTiles++;
					}
				});

				return urbanTiles / totalTiles;
			},

			///////// NEIGHBOR TILE ANIMATIONS ///////////////////////////////////
			neighborTileStates: {
				north: { clicked: false, isPulsing: true },
				south: { clicked: false, isPulsing: true },
				east: { clicked: false, isPulsing: true },
				west: { clicked: false, isPulsing: true },
			},
			setNeighborTileClicked: (direction) =>
				set((state) => ({
					neighborTileStates: {
						...state.neighborTileStates,
						[direction]: {
							...state.neighborTileStates[direction],
							clicked: true,
							isPulsing: false,
						},
					},
				})),
			toggleNeighborTilePulsing: (direction) =>
				set((state) => ({
					neighborTileStates: {
						...state.neighborTileStates,
						[direction]: {
							...state.neighborTileStates[direction],
							isPulsing: !state.neighborTileStates[direction].isPulsing,
						},
					},
				})),
			getNeighborTileState: (direction) => get().neighborTileStates[direction],

			///////// Filter related functions - filter tiles based on certain criteria ////////////////////////////////////////
			setFilter: (filterType, filterValue, options = {}) => {
				if (!filterType || filterValue === undefined) {
					set({ activeFilter: null });
					return;
				}

				set({
					activeFilter: {
						type: filterType,
						value: filterValue,
						options,
					},
				});
			},

			clearFilter: () => set({ activeFilter: null }),

			// Function to determine cell opacity based on current filters
			getCellOpacity: (key, tile) => {
				const state = get();
				const { activeFilter } = state;

				// If no filter is active, return full opacity
				if (!activeFilter) return 1;

				let matches = false;

				switch (activeFilter.type) {
					case "activePowerMod":
						matches = tile?.upgrades?.activeMods?.power?.includes(
							activeFilter.value
						);
						break;

					case "buildingType":
						matches = tile?.type === activeFilter.value;
						break;

					case "upgrades":
						matches = tile?.upgrades?.[activeFilter.value] === true;
						break;

					case "pollution":
						matches = (tile?.metrics?.pollution?.air || 0) > activeFilter.value;
						break;

					case "transportation":
						matches = tile?.upgrades?.connected?.transportation === true;
						break;

					case "temperature":
						matches = (tile?.metrics?.temperature || 0) > activeFilter.value;
						break;

					case "greenMods":
						matches = Object.entries(tile?.upgrades || {}).some(
							([key, value]) => greenModMetrics[key] && value === true
						);
						break;

					case "connectionModCode":
						matches = tile?.upgrades?.connectionMods?.code?.includes(
							activeFilter.value
						);
						break;

					case "edgeCells":
						const [row, col] = key.split("-").map(Number);
						matches =
							row === 0 ||
							row === state.gridSize - 1 ||
							col === 0 ||
							col === state.gridSize - 1;
						break;

					case "neighboringCityEdge":
						// Handle edge cells for specific neighboring city
						const [cellRow, cellCol] = key.split("-").map(Number);
						matches =
							(activeFilter.value === "north" && cellRow === 0) ||
							(activeFilter.value === "south" &&
								cellRow === state.gridSize - 1) ||
							(activeFilter.value === "east" &&
								cellCol === state.gridSize - 1) ||
							(activeFilter.value === "west" && cellCol === 0);
						break;

					case "connectedToNeighborCity": {
						const [r, c] = key.split("-").map(Number);
						const isEdgeTile =
							(activeFilter.value === "north" && r === 0) ||
							(activeFilter.value === "south" && r === state.gridSize - 1) ||
							(activeFilter.value === "east" && c === state.gridSize - 1) ||
							(activeFilter.value === "west" && c === 0);

						const hasConnectionModCode =
							tile?.upgrades?.connectionMods?.code?.includes(
								activeFilter.value
							);

						matches = isEdgeTile || hasConnectionModCode;
						break;
					}

					default:
						matches = true;
				}

				// Return full opacity for matches, reduced opacity for non-matches
				return matches ? 1 : 0.3;
			},

			// Helper function for complex filters
			isMatchingFilter: (tile, filterType, filterValue) => {
				const state = get();
				return state.getCellOpacity(tile.key, tile) === 1;
			},

			// Add initialization function
			initializeStore: () => {
				const state = get();
				const storedData = localStorage.getItem("city-grid-sandbox");

				if (
					!storedData ||
					!JSON.parse(storedData).state.tiles ||
					Object.keys(JSON.parse(storedData).state.tiles).length === 0
				) {
					// No stored data, run random building placement
					console.log("No stored data found. Generating random city...");
					state.placeRandomBuildings();
				}
			},

			// Add cleanup of the initialization
			cleanup: () => {
				// Remove the initialization listener if needed
				// This is a placeholder for any cleanup that might be needed
			},
		}),

		{
			name: "city-grid-sandbox",
			storage: createJSONStorage(() => localStorage),
			onRehydrateStorage: () => (state) => {
				// This runs after rehydration is complete
				if (state) {
					// Schedule initialization after the store is fully set up
					setTimeout(() => {
						state.initializeStore();
					}, 10);
				}
			},
		}
	)
);

// Helper function to calculate pollution for a tile
const calculateTilePollution = (tileType, powerMod, upgrades, carTraffic) => {
	const pollution = {
		cars: 0,
		power: {
			air: 0,
		},
		structure: 0,
		mods: {
			air: 0,
		},
	};

	// Calculate pollution from cars
	pollution.cars = carTraffic * constants.CAR_POLLUTION_PERCENTAGE;

	// Calculate pollution from power mod
	const powerPollution = getPowerModPollution(powerMod);
	pollution.power.air = powerPollution.air;

	// Calculate pollution from building structure
	pollution.structure = getBuildingPollution(tileType);

	// Calculate pollution reduction from green mods
	const modsPollution = getGreenModPollutionReduction(upgrades);
	pollution.mods.air = modsPollution.air;
	return pollution;
};

const calculateTileTemperature = (tile, newPowerMod, oldPowerMod = null) => {
	const currentTemperature = tile.metrics.temperature || 0;
	let newTemperature = currentTemperature;
	// remove old power mod temperature
	if (oldPowerMod) {
		newTemperature -= getPowerModTemperature(oldPowerMod);
	}
	newTemperature += getPowerModTemperature(newPowerMod);
	return newTemperature;
};

// Helper function to get pollution from building metrics
const getBuildingPollution = (tileType) => {
	const buildingMetrics = gameObjects.urbanStructures[tileType]?.metrics || {};
	return buildingMetrics.airPollutionChange || 0;
};

// Helper function to get pollution from power mod
const getPowerModPollution = (powerMod) => {
	const pollutionMetrics = powerModMetrics[powerMod]?.pollution || { air: 0 };
	return pollutionMetrics;
};

// Helper function to get temperature from power mod
const getPowerModTemperature = (powerMod) => {
	const temperatureMetrics = powerModMetrics[powerMod]?.temperature || 0;
	return temperatureMetrics;
};

// Helper function to get pollution reduction from green mods
const getGreenModPollutionReduction = (upgrades) => {
	return Object.keys(upgrades)
		.filter((mod) => greenModMetrics.hasOwnProperty(mod) && upgrades[mod])
		.reduce(
			(total, mod) => {
				const modMetrics = greenModMetrics[mod].pollution || { air: 0 };
				return {
					air: total.air + modMetrics.air,
				};
			},
			{ air: 0 }
		);
};

// Create an initialization hook
export const useMainGridStoreInitialization = () => {
	React.useEffect(() => {
		const store = useMainGridStore.getState();
		store.initializeStore();

		// Cleanup when component unmounts
		return () => {
			store.cleanup();
		};
	}, []);

	return null;
};

export default useMainGridStore;
