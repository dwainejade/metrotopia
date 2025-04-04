export const constants = {
	CAR_POLLUTION_PERCENTAGE: 0.05,
	STANDARD_TEMPERATURE: 72,
};

const standardTemperature = constants.STANDARD_TEMPERATURE;

const gameObjects = {
	// Natural Features
	naturalFeatures: {
		emptyTile: {
			id: "emptyTile",
			name: "Empty Tile",
			category: "naturalFeatures",
			metrics: {},
		},
		sparseTreesArea: {
			id: "sparseTreesArea",
			name: "Sparse Trees Area",
			category: "naturalFeatures",
			metrics: {
				populationChange: 0,
				wildlife: {
					smallMammals: [40, 125], // 40-125 randomized
					birds: [30, 100], // 30-100 randomized
					reptilesAndAmphibians: [10, 60], // 10-60 randomized
				},
				treeCount: [50, 115], // 50-115 randomized

				temperature: standardTemperature - 2,
				// airPollutionChange: -5,
			},
		},
		someTreesArea: {
			id: "someTreesArea",
			name: "Some Trees Area",
			category: "naturalFeatures",
			metrics: {
				populationChange: 0,
				wildlife: {
					largeMammals: [1, 2], // 1-2 randomized
					smallMammals: [75, 175], // 75-175 randomized
					birds: [50, 150], // 50-150 randomized
					reptilesAndAmphibians: [25, 100], // 25-100 randomized
				},
				treeCount: [115, 230], // 115-230 randomized
				temperature: standardTemperature - 5,
				// airPollutionChange: -15,
			},
		},
		thickForestedArea: {
			id: "thickForestedArea",
			name: "Thick Forested Area",
			category: "naturalFeatures",
			metrics: {
				populationChange: 0,
				wildlife: {
					largeMammals: [1, 3], // 1-3 randomized
					smallMammals: [100, 230], // 100-230 randomized
					birds: [100, 300], // 100-300 randomized
					reptilesAndAmphibians: [45, 150], // 45-150 randomized
				},
				treeCount: [230, 460], // 230-460 randomized
				temperature: standardTemperature - 10,
				// airPollutionChange: -30,
			},
		},
		meadow: {
			id: "meadow",
			name: "Meadow",
			category: "naturalFeatures",
			metrics: {
				populationChange: 0,
				wildlife: {
					smallMammals: [250, 500], // 250-500 randomized
					birds: [3, 15], // 3-15 randomized
					reptilesAndAmphibians: [5, 40], // 5-40 randomized
				},
				treeCount: [1, 10], // 50-115 randomized
				temperature: standardTemperature - 5, // Current temp + 5
				// airPollutionChange: -5,
			},
			visual: {
				description: "Visually, grass only. No trees.",
			},
		},
		pond: {
			id: "pond",
			name: "Pond",
			category: "naturalFeatures",
			metrics: {
				populationChange: 0,
				wildlife: {
					smallMammals: [9, 23], // 9-23 randomized
					birds: [41, 138], // 41-138 randomized
					reptilesAndAmphibians: [425, 650], // 425-650 randomized
					fish: [10000, 20000], // 10000-20000 randomized
				},
				treeCount: [10, 20], // 10-20 randomized
				waterChange: 7500000, // gallons
				temperature: standardTemperature + 2,
			},
		},
		windingStream_horizontal: {
			id: "windingStream_horizontal",
			name: "Winding Stream",
			category: "naturalFeatures",
			metrics: {
				populationChange: 0,
				wildlife: {
					smallMammals: [40, 125], // 40-125 randomized
					birds: [7, 44], // 7-44 randomized
					reptilesAndAmphibians: [24, 132], // 24-132 randomized
					fish: [15, 145], // 15-145 randomized
				},
				treeCount: [25, 50], // 25-50 randomized
				waterChange: 50000, // gallons
				temperature: standardTemperature - 7, // Current temp - 7
			},
		},
		windingStream_vertical: {
			id: "windingStream_vertical",
			name: "Winding Stream",
			category: "naturalFeatures",
			metrics: {
				populationChange: 0,
				wildlife: {
					smallMammals: [40, 125], // 40-125 randomized
					birds: [7, 44], // 7-44 randomized
					reptilesAndAmphibians: [24, 132], // 24-132 randomized
					fish: [15, 145], // 15-145 randomized
				},
				treeCount: [25, 50], // 25-50 randomized
				waterChange: 50000, // gallons
				temperature: standardTemperature - 7, // Current temp - 7
			},
		},
	},

	// Urban Structures
	urbanStructures: {
		singleFamilyHomes: {
			id: "singleFamilyHomes",
			name: "Single-Family Homes",
			category: "urbanStructures",
			metrics: {
				subCategory: "residential",
				cost: 5000,
				populationChange: [30, 60], // 30-60 randomized
				taxes: {
					income: 500,
					property: 100,
				},
				carTraffic: [12, 20], // 12-20 randomized
				electricityUsage: 1,
				airPollutionChange: 100, // percent
				waterChange: -50,
				groundwaterPollution: [10, 20], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 4,
				treeCount: [5, 10],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "As many detached homes as we can fit in a square",
			},
			improvements: {
				greenRoof: false, // Not possible for this parcel
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: [
				"singleFamilyHomes",
				"mediumOfficeBuildings",
				"tallOfficeBuilding",
				"warehouse",
				"factory",
			],
		},
		apartmentComplex: {
			id: "apartmentComplex",
			name: "Apartment Complex",
			category: "urbanStructures",
			metrics: {
				subCategory: "residential",
				cost: 20000,
				populationChange: [550, 720], // 550-720 randomized
				taxes: {
					income: 1500,
					property: 500,
				},
				carTraffic: [400, 500], // 300-400 randomized
				electricityUsage: 1,
				airPollutionChange: 300, // percent
				waterChange: -300,
				groundwaterPollution: [20, 30], // [low, high] low if next to water treatment facility
				temperature: standardTemperature + 9,
				treeCount: [2, 5],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "2-3 apartment buildings (whatever fits)",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: ["apartmentComplex", "warehouse", "factory"],
		},
		retailCenter: {
			id: "retailCenter",
			name: "Retail Center",
			category: "urbanStructures",
			metrics: {
				subCategory: "commercial",
				cost: 15000,
				populationChange: 0,
				taxes: {
					sales: 1000,
					property: 500,
				},
				carTraffic: [80, 100], // 80-100 randomized
				electricityUsage: 1,
				airPollutionChange: 350, // percent
				waterChange: -100,
				groundwaterPollution: [30, 40], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 10,
				treeCount: [2, 5],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "Several stores",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: ["factory", "retailCenter"],
		},
		mediumOfficeBuildings: {
			id: "mediumOfficeBuildings",
			name: "Medium Office Buildings",
			category: "urbanStructures",
			metrics: {
				subCategory: "commercial",
				cost: 25000,
				populationChange: 0,
				taxes: {
					sales: 100,
					property: 1000,
				},
				carTraffic: [125, 150], // 125-150 randomized
				electricityUsage: 1,
				airPollutionChange: 300, // percent
				waterChange: -150,
				groundwaterPollution: [20, 30], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 8,
				treeCount: [3, 6],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "2-3 2-4 story office buildings",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: [
				"singleFamilyHomes",
				"factory",
				"mediumOfficeBuildings",
			],
		},
		tallOfficeBuilding: {
			id: "tallOfficeBuilding",
			name: "Tall Office Building",
			category: "urbanStructures",
			metrics: {
				subCategory: "commercial",
				cost: 50000,
				populationChange: 0,
				taxes: {
					sales: 200,
					property: 2000,
				},
				carTraffic: [250, 300], // 250-300 randomized
				electricityUsage: 1,
				airPollutionChange: 1000, // percent
				waterChange: -250,
				groundwaterPollution: [35, 45], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 11,
				treeCount: [2, 5],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "One tall office building",
				modelUrl: "public/models/Skyscraper.glb",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: [
				"singleFamilyHomes",
				"factory",
				"tallOfficeBuilding",
			],
			specialRequirements:
				"Must be built connected to side with a transportation hub",
		},
		hotels: {
			id: "hotels",
			name: "Hotels",
			category: "urbanStructures",
			metrics: {
				subCategory: "commercial",
				cost: 30000,
				populationChange: 0,
				taxes: {
					sales: 800,
					property: 500,
				},
				carTraffic: [100, 150], // 100-150 randomized
				electricityUsage: 1,
				airPollutionChange: 450, // percent
				waterChange: -200,
				groundwaterPollution: [25, 35], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 7,
				treeCount: [2, 5],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "2-3 hotels",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: ["factory", "hotels"],
		},
		governmentBuilding: {
			id: "governmentBuilding",
			name: "Government Building",
			category: "urbanStructures",
			metrics: {
				subCategory: "services",
				cost: 40000,
				populationChange: 0,
				taxes: {
					property: 0,
				},
				carTraffic: [30, 50], // 30-50 randomized
				electricityUsage: 1,
				airPollutionChange: 250, // percent
				waterChange: -100,
				groundwaterPollution: [20, 30], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 5,
				treeCount: [1, 3],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "2-3 buildings (school, fire, police)",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: ["factory", "governmentBuilding"],
		},
		hospital: {
			id: "hospital",
			name: "Hospital",
			category: "urbanStructures",
			metrics: {
				subCategory: "services",
				cost: 50000,
				populationChange: 0,
				taxes: {
					sales: 1000,
					property: 500,
				},
				carTraffic: [30, 50], // 30-50 randomized
				electricityUsage: 1,
				airPollutionChange: 450, // percent
				waterChange: -100,
				groundwaterPollution: [20, 30], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 7,
				treeCount: [1, 4],
			},
			visual: {
				description: "2-3 buildings (school, fire, police)",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: ["hospital", "factory"],
		},
		warehouse: {
			id: "warehouse",
			name: "Warehouse",
			category: "urbanStructures",
			metrics: {
				subCategory: "industrial",
				cost: 60000,
				populationChange: 0,
				taxes: {
					sales: 2000,
					property: 1000,
				},
				carTraffic: [175, 200], // 175-200 randomized
				electricityUsage: 1,
				airPollutionChange: 175, // percent
				waterChange: -50,
				groundwaterPollution: [20, 30], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 10,
				treeCount: [1, 3],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "1 warehouse",
			},
			improvements: {
				greenRoof: false,
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: [
				"warehouse",
				"singleFamilyHomes",
				"apartmentComplex",
			],
		},
		factory: {
			id: "factory",
			name: "Factory",
			category: "urbanStructures",
			metrics: {
				subCategory: "industrial",
				cost: 100000,
				populationChange: 0,
				taxes: {
					sales: 5000,
					property: 2000,
				},
				carTraffic: [300, 400], // 800-1000 randomized
				electricityUsage: 1,
				airPollutionChange: 1000, // percent
				waterChange: -500,
				groundwaterPollution: [70, 80], // [low, high] if next to water treatment facility
				temperature: standardTemperature + 12,
				treeCount: [1, 3],
				wildlife: {
					largeMammals: null,
					smallMammals: null,
					birds: null,
					reptilesAndAmphibians: null,
				},
			},
			visual: {
				description: "1 factory with smokestacks (animated?)",
			},
			improvements: {
				greenRoof: false, // Not possible for this parcel
				coolRoof: false,
				solarRoof: false,
				treeLinedStreets: false,
				natureCrossings: null,
			},
			buildingRestrictions: [
				"factory",
				"singleFamilyHomes",
				"apartmentComplex",
				"retailCenter",
				"hotels",
				"governmentBuilding",
				"mediumOfficeBuildings",
				"tallOfficeBuilding",
				"hospital",
			],
		},
	},
};

export default gameObjects;

const possibleMods = {
	power: ["nuclear", "coal", "hydroelectric", "natural gas", "wind"],
	transportation: ["airport", "passenger train access"],
	waste: ["wastewater treatment facility"],
};

const neighboringCities = {
	north: {
		connectionMods: {
			code: ["north"],
			power: [],
			transportation: [],
			waste: [],
		},
	},
	south: {
		connectionMods: {
			code: ["south"],
			power: [],
			transportation: [],
			waste: [],
		},
	},
	east: {
		connectionMods: {
			code: ["east"],
			power: [],
			transportation: [],
			waste: [],
		},
	},
	west: {
		connectionMods: {
			code: ["west"],
			power: [],
			transportation: [],
			waste: [],
		},
	},
};

// randomize mods for neighboring cities
export const assignRandomModsToCities = () => {
	const updatedNeighboringCities = JSON.parse(
		JSON.stringify(neighboringCities)
	);
	const cities = Object.keys(updatedNeighboringCities);

	// Assign unique power mod to each side
	const shuffledPowerMods = [...possibleMods.power].sort(
		() => 0.5 - Math.random()
	);
	cities.forEach((city, index) => {
		updatedNeighboringCities[city].connectionMods.power = [
			shuffledPowerMods[index],
		];
	});

	// Assign wastewater treatment to opposite sides
	const oppositePairs = [
		["north", "south"],
		["east", "west"],
	];
	const chosenPair =
		oppositePairs[Math.floor(Math.random() * oppositePairs.length)];

	chosenPair.forEach((city) => {
		updatedNeighboringCities[city].connectionMods.waste = [
			"wastewater treatment facility",
		];
		updatedNeighboringCities[city].connectionMods.transportation = []; // Clear transportation
	});

	// Assign transportation to the other two sides
	const transportationCities = cities.filter(
		(city) => !chosenPair.includes(city)
	);
	const shuffledTransportationMods = [...possibleMods.transportation].sort(
		() => 0.5 - Math.random()
	);
	transportationCities.forEach((city, index) => {
		updatedNeighboringCities[city].connectionMods.transportation = [
			shuffledTransportationMods[index],
		];
		updatedNeighboringCities[city].connectionMods.waste = []; // Clear waste
	});

	return updatedNeighboringCities;
};

export const powerModMetrics = {
	nuclear: {
		pollution: { air: 150 },
		temperature: 3,
	},
	coal: {
		pollution: { air: 1000 },
		temperature: 6,
	},
	"natural gas": {
		pollution: { air: 300 },
		temperature: 4,
	},
	"hydroelectric": {
		pollution: { air: 100 },
		temperature: 2,
	},
	solar: {
		pollution: { air: 0 },
		temperature: 2,
	},
	wind: {
		pollution: { air: 0 },
		temperature: -2,
		wildlife: { birds: -100 },
	},
};

export const greenModCosts = {
	greenRoof: 50,
	coolRoof: 10,
	solarRoof: 100,
	treeLinedStreets: 125,
	natureCrossings: 250, // per side
};

export const greenModMetrics = {
	solarRoof: {
		temperature: [2, 3], // + 3-4 degrees (randomized)
	},
	greenRoof: {
		airPollution: [-20, -30], // - 15-20% (randomized)
		temperature: [-0.5, -1], // - 2-3 degrees (randomized)
		treeCount: [5, 10], // + 5-10 trees (randomized)
	},
	coolRoof: {
		airPollution: [-10, -20], // - 15-20% (randomized)
		temperature: [-2, -3], // - 2-3 degrees (randomized)
	},
	treeLinedStreets: {
		airPollution: [-10, -20], // - 15-20% (randomized)
		temperature: [-1, -2],
		treeCount: [45, 55], // + 45-55 trees (randomized)
		wildlife: {
			smallMammals: [20, 40], //  30-40 (randomized)
			birds: [30, 50], // 30-50 (randomized)
		},
	},
	natureCrossings: {
		wildlife: {
			smallMammals: [20, 40], //  30-40 (randomized)
		},
	},
};

export const transportationConnectionModifiers = {
	airport: {
		carTraffic: {
			residential: 1.2,
			industrial: 1.5,
			commercial: 2.5,
		},
		taxes: {
			sales: 1.3, // 20% increase
		},
	},
	"passenger train access": {
		carTraffic: {
			commercial: 1.5,
		},
		taxes: {
			sales: 1.2, // 20% increase
		},
	},
};
