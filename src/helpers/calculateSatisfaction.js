export const buildingTypes = {
    residential: ['singleFamilyHomes', 'apartmentComplex'],
    commercial: ['retailCenter', 'mediumOfficeBuildings', 'tallOfficeBuilding', 'hotels'],
    industrial: ['warehouse', 'factory'],
    services: ['governmentBuilding', 'hospital']
};

export const idealRanges = {
    residential: { min: 0.30, max: 0.50 },
    commercial: { min: 0.20, max: 0.40 },
    services: { min: 0.10, max: 0.30 },
    industrial: { min: 0.05, max: 0.15 },
};

// suggest to user which building type to build next when ratios are off
export const generateBuildingSuggestion = (tiles) => {
    const buildingCounts = {
        residential: 0,
        commercial: 0,
        industrial: 0,
        services: 0,
    };

    // Count buildings
    Object.values(tiles).forEach((tile) => {
        for (const [category, buildings] of Object.entries(buildingTypes)) {
            if (buildings.includes(tile.type)) {
                buildingCounts[category]++;
                break;
            }
        }
    });

    const totalBuildings = Object.values(buildingCounts).reduce(
        (sum, count) => sum + count,
        0
    );

    // No messages if nothing has been built yet
    if (totalBuildings === 0) return []; // Return an empty array

    const messages = [];

    // Calculate actual ratios and relative deviations
    const actualRatios = {};
    const deviations = {};
    const categoriesWithLargeNegativeDeviation = [];

    for (const category in buildingCounts) {
        actualRatios[category] = buildingCounts[category] / totalBuildings || 0;
        const { min, max } = idealRanges[category];
        const idealRatio = (min + max) / 2;

        // Calculate relative deviation
        const deviation = (actualRatios[category] - idealRatio) / idealRatio; // Relative deviation
        deviations[category] = deviation;

        // Check if relative deviation is less than -15% (-0.15)
        if (deviation < -0.15) {
            categoriesWithLargeNegativeDeviation.push(category);
        }
    }

    if (categoriesWithLargeNegativeDeviation.length > 0) {
        // Identify the most underserved category (largest negative relative deviation)
        const mostUnderservedCategory = categoriesWithLargeNegativeDeviation.reduce(
            (prevCategory, currentCategory) => {
                const prevDeviation = deviations[prevCategory];
                const currentDeviation = deviations[currentCategory];

                // We are looking for the most negative relative deviation
                return currentDeviation < prevDeviation ? currentCategory : prevCategory;
            }
        );

        messages.push(
            `Your city needs more ${mostUnderservedCategory} buildings to balance development.`
        );
    }

    // Return messages (might be empty if no category is off by more than 15%)
    return messages;
};


export const calculateSatisfaction = (tiles) => {
    const buildingCounts = {
        residential: 0,
        commercial: 0,
        industrial: 0,
        services: 0,
    };

    const buildingTypeSet = new Set();

    Object.values(tiles).forEach(tile => {
        for (const [category, types] of Object.entries(buildingTypes)) {
            if (types.includes(tile.type)) {
                buildingCounts[category]++;
                buildingTypeSet.add(tile.type);
                break;
            }
        }
    });

    const totalBuildings = Object.values(buildingCounts).reduce((sum, count) => sum + count, 0);

    if (totalBuildings === 0) {
        return { score: 0, reasons: ["No buildings yet"] };
    }

    let satisfactionScore = 0;
    const reasons = [];

    // 1. Ratio Adherence (70% Total) - WITH DOUBLE PENALTIES
    let ratioScore = 0;
    for (const category in idealRanges) {
        const actualCount = buildingCounts[category];
        const { min, max } = idealRanges[category];
        const actualRatio = actualCount / totalBuildings;

        let categoryScore = 0;
        let explanation = '';

        if (actualRatio < min) {
            // Double penalty for being below min
            const penaltyFactor = 5 * (1 - (actualRatio / min));
            categoryScore = 17.5 * (1 - penaltyFactor);
            explanation = `${capitalize(category)} ratio WAY too low (${(actualRatio * 100).toFixed(1)}% < ${(min * 100).toFixed(1)}%). Score: ${categoryScore.toFixed(1)}%`;
        } else if (actualRatio > max) {
            // Double penalty for being above max
            const penaltyFactor = 2 * ((actualRatio - max) / (1 - max));
            categoryScore = 17.5 * (1 - penaltyFactor);
            explanation = `${capitalize(category)} ratio WAY too high (${(actualRatio * 100).toFixed(1)}% > ${(max * 100).toFixed(1)}%). Score: ${categoryScore.toFixed(1)}%`;
        } else {
            categoryScore = 17.5;
            explanation = `${capitalize(category)} ratio ideal (${(actualRatio * 100).toFixed(1)}%). Score: +17.5%`;
        }

        // Ensure score doesn't go negative
        categoryScore = Math.max(0, categoryScore);
        ratioScore += categoryScore;
        reasons.push(explanation);
    }

    reasons.push(`Total Ratio Score: ${ratioScore.toFixed(1)}%`);
    satisfactionScore += ratioScore;

    // 2. Building Type Diversity (30% of total score)
    const totalBuildingTypes = 10; // Total unique building types
    const uniqueTypesBuilt = buildingTypeSet.size;
    const diversityScore = (uniqueTypesBuilt / totalBuildingTypes) * 30;
    satisfactionScore += diversityScore;
    reasons.push(`Diversity Score: ${diversityScore.toFixed(1)}% (${uniqueTypesBuilt}/${totalBuildingTypes} types built)`);

    // Final Score
    satisfactionScore = Math.round(Math.max(0, Math.min(satisfactionScore, 100)));

    return { score: satisfactionScore, reasons };
};

// Helper function
const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
};

/* generateBuildingSuggestion remains unchanged from original */