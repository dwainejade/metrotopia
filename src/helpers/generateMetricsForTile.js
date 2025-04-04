import gameObjects from '../data/gameObjects';

const randomize = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const parseRange = (range) => {
  if (Array.isArray(range) && range.length === 2) {
    const [min, max] = range;
    return randomize(min, max);
  }
  return range;
};

const generateMetricsForTile = (tileType) => {
  const baseData = gameObjects.naturalFeatures[tileType] || gameObjects.urbanStructures[tileType] || {};
  const baseMetrics = baseData.metrics || {};
  const baseUpgrades = baseData.improvements || {};
  const baseGroundwaterPollution = baseData.metrics.groundwaterPollution

  let randomMetrics = {};
  let upgrades = {};

  // Generate random metrics for all properties
  for (const [key, value] of Object.entries(baseMetrics)) {
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      // Handle nested objects (like wildlife)
      randomMetrics[key] = {};
      for (const [nestedKey, nestedValue] of Object.entries(value)) {
        randomMetrics[key][nestedKey] = parseRange(nestedValue);
      }
    } else {
      randomMetrics[key] = parseRange(value);
    }
  }

  // Set upgrades
  upgrades = {
    ...baseUpgrades,
    connectionMods: {
      power: [],
      transportation: [],
      waste: []
    }
  };

  // add groundwater pollution
  if (baseGroundwaterPollution) {
    randomMetrics.groundwaterPollution = baseGroundwaterPollution;
  }

  // Merge baseMetrics with randomMetrics, giving priority to randomMetrics
  const mergedMetrics = {
    ...baseMetrics,
    ...randomMetrics,
    wildlife: {
      ...(baseMetrics.wildlife || {}),
      ...(randomMetrics.wildlife || {})
    }
  };

  return { metrics: mergedMetrics, upgrades };
};

export default generateMetricsForTile;