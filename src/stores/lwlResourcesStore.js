import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import gameObjects, { greenModMetrics } from "../data/lwlGameObjects";
import useLwlGridStore from "./lwlGridStore";
import randomizeInRange from "../helpers/randomizeNumbers";
import {
	calculateSatisfaction,
	generateBuildingSuggestion,
} from "../helpers/calculateSatisfaction";

const initialResourceState = {
	notifications: [],

	funds: {
		starting: 500000,
		current: 500000,
		spent: 0,
		totalTaxGained: 0,
	},
	taxes: {
		income: 0,
		sales: 0,
		property: 0,
	},
	population: {
		total: 0,
		target: 7500,
		breakdown: {
			apartmentComplex: 0,
			singleFamilyHomes: 0,
		},
	},
	trees: {
		startingTrees: 0,
		currentTrees: 0,
		treesLost: 0,
		percentPreserved: 100,
		targetPreserved: 90,
		fromGreenMods: 0,
	},
	wildlife: {
		startingWildlife: 0,
		currentWildlife: 0,
		startingLargeMammals: 0,
		currentLargeMammals: 0,
		startingSmallMammals: 0,
		currentSmallMammals: 0,
		startingBirds: 0,
		currentBirds: 0,
		startingReptilesAndAmphibians: 0,
		currentReptilesAndAmphibians: 0,
		startingFish: 0,
		currentFish: 0,
		totalLost: 0,
		percentPreserved: 100,
		targetPreservation: 90, // target percent
		percentPreservedByType: {
			largeMammals: 100,
			smallMammals: 100,
			birds: 100,
			reptilesAndAmphibians: 100,
			fish: 100,
		},
	},
	temperature: {
		starting: null,
		current: null,
		// urbanHeatIslandEffect: -4.28,
		targetMaximum: 86.28,
		heatIslandMax: 0,
	},
	urbanization: {
		totalParcels: 100,
		totalBuildingCount: 0,
		buildingCountTarget: 15,
		parcels: {
			preserved: 100,
			urbanized: 0,
			residential: 0,
			commercial: 0,
			industrial: 0,
			services: 0,
		},
		buildings: {
			singleFamilyHomes: 0,
			apartmentComplex: 0,
			retailCenter: 0,
			mediumOfficeBuildings: 0,
			tallOfficeBuilding: 0,
			hotels: 0,
			governmentBuilding: 0,
			warehouse: 0,
			factory: 0,
		},
		connectionMods: {
			transportation: {
				airport: 0,
				"passenger train access": 0,
			},
			waste: {
				"wastewater treatment facility": 0,
			},
		},
	},
	naturalFeatures: {
		pond: 0,
		stream: 0,
		meadow: 0,
		sparseTreesArea: 0,
		someTreesArea: 0,
		thickForestedArea: 0,
	},
	energy: {
		totalUsage: 0,
		usage: {
			nuclear: 0,
			"natural gas": 0,
			coal: 0,
			hydroelectric: 0,
			solar: 0,
			wind: 0,
		},
	},
	water: {
		surface: {
			start: null, // calculated based on initial ponds and streams
			current: 0,
			lost: 0,
			percentPreserved: 100,
			targetPreserved: 20, // percent
		},
		groundwater: {
			total: 70000000,
		},
	},
	pollution: {
		air: {
			start: 2,
			current: 2,
			threshold: 100,
		},
		groundwater: {
			start: 1,
			current: 1,
			threshold: 15, // percent
		},
	},
	traffic: {
		totalCars: 0,
	},

	history: {
		population: [],
		wildlife: [],
		trees: [],
	},
};

const useLwlResourcesStore = create(
	persist(
		(set, get) => ({
			resources: { ...initialResourceState },

			gameWon: null,
			gameLost: null,
			satisfaction: {
				score: 0,
				threshold: 85,
				lastUpdateScore: 0,
			},

			setGameWon: (gameWon) => set({ gameWon }),
			setGameLost: (gameLost) => set({ gameLost }),

			// get notifications
			updateNotifications: () => {
				const { tiles } = useLwlGridStore.getState();
				const suggestion = generateBuildingSuggestion(tiles);

				set((state) => ({
					notifications: [suggestion],
				}));
			},
			clearNotifications: () => {
				set({ notifications: [] });
			},

			// Update the updateSatisfaction function
			updateSatisfaction: () => {
				const { tiles, prevSelectedTile, addFeedbackAnimation } =
					useLwlGridStore.getState();
				const { population } = get().resources;
				const prevScore = get().satisfaction.score;

				const { score, reasons } = calculateSatisfaction(
					tiles,
					population,
					population.target
				);

				// If score goes up, animate feedback satisfaction
				if (score > prevScore) {
					const prevSelectedTileKey = prevSelectedTile;
					if (prevSelectedTileKey) {
						// call feedback animation function
						addFeedbackAnimation({
							tileKey: prevSelectedTileKey,
							feedbackType: "satisfaction",
							type: "sprite",
						});
					}
				}

				set((state) => ({
					satisfaction: {
						...state.satisfaction,
						score: score,
						lastUpdateScore: state.satisfaction.score,
					},
				}));

				// Update notifications after satisfaction is updated
				get().updateNotifications();
			},

			resetSatisfaction: () => {
				set({
					satisfaction: {
						score: 0,
						threshold: 85,
						lastUpdateScore: 0,
					},
				});
			},

			checkWinConditions: () => {
				const {
					resources,
					gameWon,
					gameLost,
					updateSatisfaction,
					satisfaction,
				} = get();
				const { wildlife, urbanization } = resources;
				const { setCurrentModal, setEndModalReason } =
					useLwlGridStore.getState();

				updateSatisfaction();

				// Win conditions
				const lizardsPreserved =
					wildlife.currentReptilesAndAmphibians /
						wildlife.startingReptilesAndAmphibians >=
					0.85;
				const buildingsConstrucedReached =
					urbanization.totalBuildingCount >= urbanization.buildingCountTarget;
				const satisfactionMet = satisfaction.score >= satisfaction.threshold;

				const allConditionsMet = [
					lizardsPreserved,
					buildingsConstrucedReached,
					satisfactionMet,
				].every((condition) => condition);

				// Check for win
				if (allConditionsMet && gameWon === null && gameLost === null) {
					set({ gameWon: true });
					setCurrentModal("End");
					return;
				}

				if (
					buildingsConstrucedReached &&
					(!lizardsPreserved || !satisfactionMet)
				) {
					if (gameLost) return;
					set({ gameLost: true });
					setCurrentModal("End");

					// Determine the reason for loss
					let loseReason = "";
					if (!lizardsPreserved) {
						loseReason = "lizardsPreserved";
					} else if (buildingsConstrucedReached) {
						loseReason = "buildingsConstructed";
					} else if (!satisfactionMet) {
						loseReason = "lowSatisfaction";
					}

					// Pass the lose reason to the End modal
					setEndModalReason(loseReason);
				}
			},

			resetResources: () => {
				set({
					resources: JSON.parse(JSON.stringify(initialResourceState)),
					gameWon: null,
					gameLost: null,
				});
				// showEndModal(true);
				get().resetSatisfaction();
			},

			updateFunds: (amount) =>
				set((state) => ({
					resources: {
						...state.resources,
						funds: {
							...state.resources.funds,
							current: state.resources.funds.current + amount,
							spent: state.resources.funds.spent + (amount < 0 ? -amount : 0),
						},
					},
				})),

			// Function to initialize resources based on the randomized grid
			initializeResources: (tiles) => {
				set((state) => {
					let resources = JSON.parse(JSON.stringify(initialResourceState));

					const applyMetrics = (metrics) => {
						// Count ponds and streams
						// if (typeof metrics.populationChange === "number")
						// 	resources.population.total += metrics.populationChange;
						// if (typeof metrics.carTraffic === "number")
						// resources.traffic.totalCars += metrics.carTraffic;
						// if (typeof metrics.electricityUsage === "number")
						// 	resources.energy.totalUsage += metrics.electricityUsage;
						if (typeof metrics.waterChange === "number")
							resources.water.surface.current += metrics.waterChange;
						// if (typeof metrics.temperatureIncrease === "number")
						// 	resources.temperature.current += metrics.temperatureIncrease;
						// if (typeof metrics.temperatureDecrease === "number")
						// 	resources.temperature.current += metrics.temperatureDecrease;

						if (metrics.wildlife) {
							resources.wildlife.currentLargeMammals +=
								Number(metrics.wildlife.largeMammals) || 0;
							resources.wildlife.currentSmallMammals +=
								Number(metrics.wildlife.smallMammals) || 0;
							resources.wildlife.currentBirds +=
								Number(metrics.wildlife.birds) || 0;
							resources.wildlife.currentReptilesAndAmphibians +=
								Number(metrics.wildlife.reptilesAndAmphibians) || 0;
							resources.wildlife.currentFish +=
								Number(metrics.wildlife.fish) || 0;
						}

						if (typeof metrics.treeCount === "number")
							resources.trees.currentTrees += metrics.treeCount;

						if (
							typeof metrics.taxIncome === "number" &&
							metrics.taxIncome > 0
						) {
							resources.funds.totalTaxGained += metrics.taxIncome;
						}
					};

					Object.values(tiles).forEach((tile) => {
						if (tile && tile.metrics) {
							applyMetrics(tile.metrics);
						}
					});

					// Set starting values based on the initial wildlife counts
					resources.wildlife.startingLargeMammals =
						resources.wildlife.currentLargeMammals;
					resources.wildlife.startingSmallMammals =
						resources.wildlife.currentSmallMammals;
					resources.wildlife.startingBirds = resources.wildlife.currentBirds;
					resources.wildlife.startingReptilesAndAmphibians =
						resources.wildlife.currentReptilesAndAmphibians;
					resources.wildlife.startingFish = resources.wildlife.currentFish;

					// Set the current wildlife count
					resources.wildlife.currentWildlife = Math.max(
						0,
						resources.wildlife.currentLargeMammals +
							resources.wildlife.currentSmallMammals +
							resources.wildlife.currentBirds +
							resources.wildlife.currentReptilesAndAmphibians +
							resources.wildlife.currentFish
					);

					// Set starting values for wildlife and trees
					resources.wildlife.startingWildlife =
						resources.wildlife.currentWildlife;
					resources.trees.startingTrees = resources.trees.currentTrees;

					// Initialize the history
					resources.history.population = [resources.population.total];
					resources.history.wildlife = [resources.wildlife.currentWildlife];
					resources.history.trees = [resources.trees.currentTrees];

					return { resources };
				});
			},

			updateResources: (oldCellData, newCellData) => {
				let { resources, updateUrbanizationForCell } = get();

				const applyMetrics = (cellData, factor = 1, isNewCell = false) => {
					if (!cellData || !cellData.metrics) {
						return;
					}

					const { metrics } = cellData;

					if (typeof metrics.populationChange === "number") {
						resources.population.total += factor * metrics.populationChange;
					}

					// Update population based on building type
					if (typeof metrics.populationChange === "number") {
						if (cellData.type === "apartmentComplex") {
							resources.population.breakdown.apartmentComplex +=
								factor * metrics.populationChange;
						} else if (cellData.type === "singleFamilyHomes") {
							resources.population.breakdown.singleFamilyHomes +=
								factor * metrics.populationChange;
						} else {
							// Handle other building types or generic population changes
							resources.population.total += factor * metrics.populationChange;
						}
					}

					if (typeof metrics.temperatureIncrease === "number") {
						resources.temperature.current +=
							factor * metrics.temperatureIncrease;
					}

					if (typeof metrics.temperatureDecrease === "number") {
						resources.temperature.current +=
							factor * metrics.temperatureDecrease;
					}

					if (typeof metrics.carTraffic === "number") {
						resources.traffic.totalCars += metrics.carTraffic;
					}

					if (metrics.wildlife) {
						[
							"largeMammals",
							"smallMammals",
							"birds",
							"reptilesAndAmphibians",
							"fish",
						].forEach((species) => {
							const change = Number(metrics.wildlife[species]) || 0;

							// Capitalize the first letter of the species key
							const capitalizedSpecies =
								species.charAt(0).toUpperCase() + species.slice(1);

							// Update the `current` version of each species in the resources
							const currentKey = `current${capitalizedSpecies}`;
							resources.wildlife[currentKey] = Math.max(
								0,
								(resources.wildlife[currentKey] || 0) + factor * change
							);
						});

						// Recalculate percentages for each animal type
						const calculatePercentPreserved = (current, starting) => {
							return starting > 0 ? (current / starting) * 100 : 100;
						};
						resources.wildlife.percentPreservedByType = {
							largeMammals: calculatePercentPreserved(
								resources.wildlife.currentLargeMammals,
								resources.wildlife.startingLargeMammals
							),
							smallMammals: calculatePercentPreserved(
								resources.wildlife.currentSmallMammals,
								resources.wildlife.startingSmallMammals
							),
							birds: calculatePercentPreserved(
								resources.wildlife.currentBirds,
								resources.wildlife.startingBirds
							),
							reptilesAndAmphibians: calculatePercentPreserved(
								resources.wildlife.currentReptilesAndAmphibians,
								resources.wildlife.startingReptilesAndAmphibians
							),
							fish: calculatePercentPreserved(
								resources.wildlife.currentFish,
								resources.wildlife.startingFish
							),
						};

						// Calculate overall percent preserved as the average
						const percentValues = Object.values(
							resources.wildlife.percentPreservedByType
						);
						resources.wildlife.percentPreserved =
							percentValues.reduce((sum, value) => sum + value, 0) /
							percentValues.length;
					}

					if (typeof metrics.treeCount === "number") {
						resources.trees.currentTrees = Math.max(
							0,
							resources.trees.currentTrees + factor * metrics.treeCount
						);
					}

					// Update pollution metrics
					if (metrics.pollution) {
						resources.pollution.air.current +=
							factor *
							(metrics.pollution.cars +
								metrics.pollution.power.air +
								metrics.pollution.structure +
								metrics.pollution.mods.air);
						resources.pollution.groundwater.current +=
							factor * metrics.pollution.groundwater;
					}

					if (isNewCell) {
						if (typeof metrics.cost === "number") {
							resources.funds.current -= metrics.cost;
							resources.funds.spent += metrics.cost;
						}
						// Update taxes
						if (isNewCell && metrics.taxes) {
							Object.entries(metrics.taxes).forEach(([taxType, amount]) => {
								resources.taxes[taxType] =
									(resources.taxes[taxType] || 0) + amount;
								resources.funds.totalTaxGained += amount;
								resources.funds.current += amount;
							});
						}

						updateUrbanizationForCell(newCellData);
					}
				};

				// Remove resources from old cell
				if (oldCellData.type !== "emptyTile") {
					applyMetrics(oldCellData, -1, false);
				}

				// Add resources from new cell
				if (newCellData.type !== "emptyTile") {
					applyMetrics(newCellData, 1, true);
				}

				// Recalculate totals and percentages
				resources.wildlife.currentWildlife =
					(resources.wildlife.currentLargeMammals || 0) +
					(resources.wildlife.currentSmallMammals || 0) +
					(resources.wildlife.currentBirds || 0) +
					(resources.wildlife.currentReptilesAndAmphibians || 0) +
					(resources.wildlife.currentFish || 0);

				// lizards lost
				resources.wildlife.totalLost = Math.max(
					0,
					resources.wildlife.startingReptilesAndAmphibians -
						resources.wildlife.currentReptilesAndAmphibians
				);
				resources.wildlife.percentPreserved =
					resources.wildlife.startingWildlife > 0
						? Math.min(
								100,
								Math.max(
									0,
									(resources.wildlife.currentWildlife /
										resources.wildlife.startingWildlife) *
										100
								)
						  )
						: 100;

				resources.trees.treesLost = Math.max(
					0,
					resources.trees.startingTrees - resources.trees.currentTrees
				);
				resources.trees.percentPreserved =
					resources.trees.startingTrees > 0
						? Math.min(
								100,
								Math.max(
									0,
									(resources.trees.currentTrees /
										resources.trees.startingTrees) *
										100
								)
						  )
						: 100;

				// Update history
				resources.history.population.push(resources.population.total);
				resources.history.wildlife.push(resources.wildlife.currentWildlife);
				resources.history.trees.push(resources.trees.currentTrees);

				set({ resources });
			},

			calculateSurfaceWater: () => {
				const { tiles } = useLwlGridStore.getState();
				const state = get();
				let currentSurfaceWater = 0;

				Object.values(tiles).forEach((tile) => {
					if (tile.type === "pond") currentSurfaceWater += 7500000;
					if (
						tile.type === "windingStream_horizontal" ||
						tile.type === "windingStream_vertical"
					)
						currentSurfaceWater += 50000;
				});

				// start surface is null then set it to current surface
				let startingSurfaceWater = state.resources.water.surface.start;
				if (startingSurfaceWater === null)
					startingSurfaceWater = currentSurfaceWater;

				// Update the surface water metrics
				set((state) => ({
					resources: {
						...state.resources,
						water: {
							...state.resources.water,
							surface: {
								...state.resources.water.surface,
								start: startingSurfaceWater,
								current: currentSurfaceWater,
								lost: Math.max(
									0,
									state.resources.water.surface.start - currentSurfaceWater
								),
								percentPreserved:
									(currentSurfaceWater / state.resources.water.surface.start) *
									100,
							},
						},
					},
				}));
			},

			updateEnergyUsage: (tile, newPower) => {
				const energyUsage = tile.metrics.electricityUsage || 0;
				const oldPower = tile.upgrades.activeMods?.power || null;

				set((state) => {
					// Clone the usage object to maintain immutability
					const newUsage = { ...state.resources.energy.usage };

					// Subtract usage from the old power type if it exists
					if (oldPower && newUsage.hasOwnProperty(oldPower)) {
						newUsage[oldPower] = Math.max(0, newUsage[oldPower] - energyUsage);
					}

					// Add usage to the new power type if it exists
					if (newPower && newUsage.hasOwnProperty(newPower)) {
						newUsage[newPower] = (newUsage[newPower] || 0) + energyUsage;
					}

					// Calculate the new total usage
					const newTotalUsage = Object.values(newUsage).reduce(
						(sum, usage) => sum + usage,
						0
					);

					return {
						resources: {
							...state.resources,
							energy: {
								...state.resources.energy,
								usage: newUsage,
								totalUsage: newTotalUsage,
							},
						},
					};
				});
			},

			updateWildlifeMetrics: (species, change) => {
				set((state) => {
					const resources = { ...state.resources };
					const wildlife = resources.wildlife;

					// Update the specific species
					const capitalizedSpecies =
						species.charAt(0).toUpperCase() + species.slice(1);
					const currentKey = `current${capitalizedSpecies}`;
					wildlife[currentKey] = Math.max(
						0,
						(wildlife[currentKey] || 0) + change
					);

					// Recalculate total wildlife
					wildlife.currentWildlife =
						(wildlife.currentLargeMammals || 0) +
						(wildlife.currentSmallMammals || 0) +
						(wildlife.currentBirds || 0) +
						(wildlife.currentReptilesAndAmphibians || 0) +
						(wildlife.currentFish || 0);

					// Recalculate total lost
					wildlife.totalLost = Math.max(
						0,
						wildlife.startingWildlife - wildlife.currentWildlife
					);

					// Recalculate percentages
					const calculatePercentPreserved = (current, starting) => {
						return starting > 0 ? (current / starting) * 100 : 100;
					};

					wildlife.percentPreservedByType = {
						largeMammals: calculatePercentPreserved(
							wildlife.currentLargeMammals,
							wildlife.startingLargeMammals
						),
						smallMammals: calculatePercentPreserved(
							wildlife.currentSmallMammals,
							wildlife.startingSmallMammals
						),
						birds: calculatePercentPreserved(
							wildlife.currentBirds,
							wildlife.startingBirds
						),
						reptilesAndAmphibians: calculatePercentPreserved(
							wildlife.currentReptilesAndAmphibians,
							wildlife.startingReptilesAndAmphibians
						),
						fish: calculatePercentPreserved(
							wildlife.currentFish,
							wildlife.startingFish
						),
					};

					// Calculate overall percent preserved
					const percentValues = Object.values(wildlife.percentPreservedByType);
					wildlife.percentPreserved =
						percentValues.reduce((sum, value) => sum + value, 0) /
						percentValues.length;

					// Update history
					resources.history.wildlife.push(wildlife.currentWildlife);

					return { resources };
				});
			},

			updateResourcesForMetricChange: (metricPath, change) => {
				if (metricPath.startsWith("wildlife.")) {
					const species = metricPath.split(".")[1];
					get().updateWildlifeMetrics(species, change[species]);
				} else {
					// Handle other metric changes as before
					set((state) => {
						const resources = { ...state.resources };
						const updateNestedProperty = (obj, path, newValue) => {
							const keys = path.split(".");
							let current = obj;
							for (let i = 0; i < keys.length - 1; i++) {
								if (current[keys[i]] === undefined) {
									current[keys[i]] = {};
								}
								current = current[keys[i]];
							}
							const lastKey = keys[keys.length - 1];
							current[lastKey] = newValue;
						};
						updateNestedProperty(resources, metricPath, change);
						return { resources };
					});
				}
			},

			recalculateAllResources: (tiles) => {
				set((state) => {
					// Reset resources to initial state
					let resources = JSON.parse(JSON.stringify(initialResourceState));
					set({ resources });

					// Process all tiles
					Object.values(tiles).forEach((tile) => {
						if (tile && tile.type) {
							const tileData =
								gameObjects.naturalFeatures[tile.type] ||
								gameObjects.urbanStructures[tile.type];
							if (tileData && tileData.metrics) {
								state.updateResourcesWithMetrics({}, tileData.metrics);
							}
						}
					});

					return {}; // State is updated within updateResourcesWithMetrics
				});
			},

			updateUrbanizationForCell: (newCellData) => {
				let { resources, checkWinConditions } = get();
				// Ensure we have valid new cell data
				if (newCellData && newCellData.metrics.subCategory) {
					const subCategory = newCellData.metrics.subCategory;
					const buildingType = newCellData.type;
					// Update specific parcel type based on the building type
					resources.urbanization.parcels[subCategory] += 1;
					// Any new building means an urbanized parcel
					resources.urbanization.parcels.urbanized += 1;

					// Recalculate preserved parcels
					resources.urbanization.parcels.preserved = Math.max(
						0,
						resources.urbanization.totalParcels -
							resources.urbanization.parcels.urbanized
					);

					// Update the specific building count
					if (resources.urbanization.buildings.hasOwnProperty(buildingType)) {
						resources.urbanization.buildings[buildingType] += 1;
						resources.urbanization.totalBuildingCount += 1;
					}
				}

				// Return the new state
				set({ resources });
			},

			calculateTotalWildlifePopulation: () => {
				const { wildlife } = get().resources;
				return wildlife.currentWildlife;
			},

			calculateTotalEnergyProduction: () => {
				const { energy } = get().resources;
				return Object.values(energy.usage).reduce(
					(sum, amount) => sum + amount,
					0
				);
			},

			calculateTotalPollution: () => {
				const { pollution } = get().resources;
				return pollution.air.current;
			},

			recalculateConnectionMods: () => {
				const { tiles } = useLwlGridStore.getState();

				set((state) => {
					const resources = { ...state.resources };
					const urbanization = resources.urbanization;

					// Reset all counts to zero
					for (const category in urbanization.connectionMods) {
						for (const mod in urbanization.connectionMods[category]) {
							urbanization.connectionMods[category][mod] = 0;
						}
					}

					// Count connections for each tile
					for (const tile of Object.values(tiles)) {
						if (tile.upgrades && tile.upgrades.connectionMods) {
							for (const category in tile.upgrades.connectionMods) {
								const mods = tile.upgrades.connectionMods[category];
								if (Array.isArray(mods)) {
									for (const mod of mods) {
										if (
											urbanization.connectionMods[category] &&
											urbanization.connectionMods[category][mod] !== undefined
										) {
											urbanization.connectionMods[category][mod]++;
										}
									}
								}
							}
						}
					}

					return { resources };
				});
			},

			// history functions
			getHistoricalData: (metric) => {
				const data = get().resources.history[metric];
				return data.map((value, index) => ({ index, value }));
			},
			pushToHistory: () => {
				const { resources } = get();

				set((state) => ({
					resources: {
						...state.resources,
						history: {
							...state.resources.history,
							population: [
								...state.resources.history.population,
								resources.population.total,
							],
							wildlife: [
								...state.resources.history.wildlife,
								resources.wildlife.currentWildlife,
							],
							trees: [
								...state.resources.history.trees,
								resources.trees.currentTrees,
							],
						},
					},
				}));
			},

			updateResourcesForGreenMods: (tileKey, newGreenMods) => {
				const { tiles } = useLwlGridStore.getState();
				const tile = tiles[tileKey];
				if (!tile) return;

				const { updateTileMetrics } = useLwlGridStore.getState();

				// Filter newGreenMods to only include those that are true in upgrades
				const activeGreenMods = newGreenMods.filter(
					(mod) => tile.upgrades[mod] !== false
				);

				// Initialize accumulated metrics object
				const accumulatedModMetrics = {
					airPollution: 0,
					temperature: 0,
					treeCount: 0,
					wildlife: {
						smallMammals: 0,
						birds: 0,
					},
				};

				activeGreenMods.forEach((mod) => {
					if (greenModMetrics[mod]) {
						const effects = greenModMetrics[mod];

						// Update pollution
						if (effects.airPollution) {
							const airPollutionChange = Array.isArray(effects.airPollution)
								? randomizeInRange(
										effects.airPollution[0],
										effects.airPollution[1],
										2
								  )
								: effects.airPollution;
							updateTileMetrics(
								tileKey,
								"pollution.mods.air",
								airPollutionChange,
								true
							);
							accumulatedModMetrics.airPollution += airPollutionChange;
						}

						// Update temperature
						if (effects.temperature) {
							const temperatureChange = Array.isArray(effects.temperature)
								? randomizeInRange(
										effects.temperature[0],
										effects.temperature[1],
										2
								  )
								: effects.temperature;
							updateTileMetrics(
								tileKey,
								"temperature",
								temperatureChange,
								true
							);
							accumulatedModMetrics.temperature += temperatureChange;
						}

						// Update tree count
						if (effects.treeCount) {
							const treeChange = Array.isArray(effects.treeCount)
								? randomizeInRange(effects.treeCount[0], effects.treeCount[1])
								: effects.treeCount;
							updateTileMetrics(tileKey, "treeCount", treeChange, true);
							get().updateTreeCount(treeChange);
							accumulatedModMetrics.treeCount += treeChange;
						}

						// Update wildlife
						if (effects.wildlife) {
							Object.entries(effects.wildlife).forEach(([species, change]) => {
								const value = Array.isArray(change)
									? randomizeInRange(change[0], change[1])
									: change;
								updateTileMetrics(tileKey, `wildlife.${species}`, value, true);

								if (species === "smallMammals" || species === "birds") {
									accumulatedModMetrics.wildlife[species] += value;
								}
							});
						}
					}
				});

				// Update the tile metrics with accumulated green mod metrics
				const updatedTile = {
					...tile,
					metrics: {
						...tile.metrics,
						greenModMetrics: accumulatedModMetrics,
					},
				};

				// Update the tile in the store
				useLwlGridStore.setState((state) => ({
					tiles: {
						...state.tiles,
						[tileKey]: updatedTile,
					},
				}));

				// Recalculate totals
				get().updateTotalPollution();
				get().updateCurrentTemperature();
			},

			updateTreeCount: (change) => {
				set((state) => {
					const newCurrentTrees = Math.max(
						0,
						state.resources.trees.currentTrees + change
					);
					const newFromGreenMods = Math.max(
						0,
						state.resources.trees.fromGreenMods + change
					);
					return {
						resources: {
							...state.resources,
							trees: {
								...state.resources.trees,
								currentTrees: newCurrentTrees,
								fromGreenMods: newFromGreenMods,
							},
						},
					};
				});

				// Push the updated state to history
				get().pushToHistory();
			},
			updateCurrentTemperature: () => {
				const { tiles, gridSize } = useLwlGridStore.getState();
				const { resources } = useLwlResourcesStore.getState();
				const totalTiles = gridSize * gridSize;

				let totalTemperature = 0;

				Object.values(tiles).forEach((tile) => {
					if (tile.metrics.temperature != null) {
						const greenTempChange =
							tile.metrics.greenModMetrics?.temperature || 0;
						totalTemperature += tile.metrics.temperature + greenTempChange;
					}
				});
				const newTemp = totalTemperature / totalTiles;
				!resources.temperature.starting &&
					(resources.temperature.starting = newTemp);
				resources.temperature.current = newTemp;
				set({ resources });
			},

			updateTotalPollution: () => {
				const { tiles, gridSize } = useLwlGridStore.getState();
				const totalTiles = gridSize * gridSize;
				const basePollution = 2;

				let totalAirPollution = 0;
				let totalGroundwaterPollution = 1 * totalTiles;

				const airPollutionBreakdown = {
					cars: 0,
					power: { air: 0 },
					structure: 0,
					mods: { air: 0 },
				};

				Object.values(tiles).forEach((tile) => {
					totalAirPollution += basePollution;

					if (tile.metrics.pollution) {
						const tileAirPollution =
							tile.metrics.pollution.cars +
							tile.metrics.pollution.power.air +
							tile.metrics.pollution.structure +
							tile.metrics.pollution.mods.air;

						totalAirPollution += tileAirPollution;

						airPollutionBreakdown.cars += tile.metrics.pollution.cars;
						airPollutionBreakdown.power.air += tile.metrics.pollution.power.air;
						airPollutionBreakdown.structure += tile.metrics.pollution.structure;
						airPollutionBreakdown.mods.air += tile.metrics.pollution.mods.air;

						totalGroundwaterPollution += tile.metrics.groundwaterPollution || 0;
					}
				});

				const averageAirPollution = totalAirPollution / totalTiles;
				const averageGroundwaterPollution =
					totalGroundwaterPollution / totalTiles;

				// Get the previous air pollution value before updating
				const previousAirPollution = get().resources.pollution.air.current;

				set((state) => ({
					resources: {
						...state.resources,
						pollution: {
							...state.resources.pollution,
							air: {
								...state.resources.pollution.air,
								previous: previousAirPollution, // Store the previous value
								current: averageAirPollution,
								breakdown: {
									cars: airPollutionBreakdown.cars / totalTiles,
									power: airPollutionBreakdown.power.air / totalTiles,
									structure: airPollutionBreakdown.structure / totalTiles,
									mods: airPollutionBreakdown.mods.air / totalTiles,
								},
							},
							groundwater: {
								...state.resources.pollution.groundwater,
								current: averageGroundwaterPollution,
							},
						},
					},
				}));
			},
		}),
		{
			name: "city-resources-lwl",
			storage: createJSONStorage(() => localStorage),
		}
	)
);

export default useLwlResourcesStore;
