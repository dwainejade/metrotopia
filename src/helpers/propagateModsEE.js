import gameObjects from '../data/eeGameObjects';

// Helper function to add mods while ensuring uniqueness
const addMods = (combinedMods, newMods) => {
  Object.keys(newMods).forEach((modType) => {
    if (Array.isArray(newMods[modType])) {
      // Combine mods and ensure uniqueness using Set
      combinedMods[modType] = Array.from(
        new Set([...combinedMods[modType], ...newMods[modType]])
      );
    } else if (modType === 'code') {
      // For codes, concatenate the strings (assuming you want to concatenate codes)
      combinedMods.code += newMods.code;
    }
  });
  return combinedMods;
};

export const collectModsForNewTile = (
  tiles,
  selectedCell,
  gridSize,
  neighboringCities
) => {
  const [row, col] = selectedCell.split('-').map(Number);
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]; // Up, down, left, right

  let combinedMods = { power: [], transportation: [], waste: [], code: '' };

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      const neighborKey = `${newRow}-${newCol}`;
      const neighborTile = tiles[neighborKey];

      if (neighborTile && neighborTile.upgrades?.connectionMods) {
        // Combine the mods from the neighboring tile
        combinedMods = addMods(
          combinedMods,
          neighborTile.upgrades.connectionMods
        );
      }
    }
  });

  // Check if the tile is on the edge and collect mods from neighboring cities
  if (row === 0 && neighboringCities.north) {
    combinedMods = addMods(
      combinedMods,
      neighboringCities.north.connectionMods
    );
  }
  if (row === gridSize - 1 && neighboringCities.south) {
    combinedMods = addMods(
      combinedMods,
      neighboringCities.south.connectionMods
    );
  }
  if (col === 0 && neighboringCities.west) {
    combinedMods = addMods(combinedMods, neighboringCities.west.connectionMods);
  }
  if (col === gridSize - 1 && neighboringCities.east) {
    combinedMods = addMods(combinedMods, neighboringCities.east.connectionMods);
  }

  return combinedMods;
};

// Helper function to add buildings while ensuring uniqueness
const addBuildings = (combinedMods, newMods) => {
  Object.keys(newMods).forEach((modType) => {
    if (Array.isArray(newMods[modType])) {
      // Combine mods and ensure uniqueness using Set
      combinedMods[modType] = Array.from(
        new Set([...combinedMods[modType], ...newMods[modType]])
      );
    } else if (modType === 'code') {
      // For codes, concatenate the strings (assuming you want to concatenate codes)
      combinedMods.code += newMods.code;
    }
  });
  return combinedMods;
};
export const collectBuildingsForNewTile = (
  tiles,
  selectedCell,
  gridSize,
  newTileType
) => {
  const [row, col] = selectedCell.split('-').map(Number);
  const directions = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]; // Up, down, left, right

  let connectedBuildings = [];

  directions.forEach(([dx, dy]) => {
    const newRow = row + dx;
    const newCol = col + dy;
    if (newRow >= 0 && newRow < gridSize && newCol >= 0 && newCol < gridSize) {
      const neighborKey = `${newRow}-${newCol}`;
      const neighborTile = tiles[neighborKey];

      if (neighborTile && neighborTile.connectedBuildings) {
        // Combine the mods from the neighboring tile
        if (!neighborTile.connectedBuildings.includes(newTileType)) {
          connectedBuildings = [
            ...neighborTile.connectedBuildings,
            newTileType,
          ];
        } else {
          connectedBuildings = [...neighborTile.connectedBuildings];
        }
      } else {
        connectedBuildings = [newTileType];
      }
    }
  });

  return connectedBuildings;
};

// Helper function to combine mods from two buildings
export const combineMods = (mods1, mods2) => {
  const result = {};
  const allTypes = new Set([...Object.keys(mods1), ...Object.keys(mods2)]);

  allTypes.forEach((type) => {
    const combinedSet = new Set([
      ...(mods1[type] || []),
      ...(mods2[type] || []),
    ]);
    result[type] = Array.from(combinedSet);
  });

  return result;
};

// Function to propagate mods to all adjacent tiles using BFS
export const propagateModsToNeighbors = (
  tiles,
  gridSize,
  startTileKey,
  newMods
) => {
  const updatedTiles = { ...tiles };
  const queue = startTileKey ? [startTileKey] : Object.keys(tiles);
  const visited = new Set();

  while (queue.length > 0) {
    const currentTileKey = queue.shift();
    if (!currentTileKey || visited.has(currentTileKey)) continue;
    visited.add(currentTileKey);

    const [row, col] = currentTileKey.split('-').map(Number);
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]; // Up, Down, Left, Right

    directions.forEach(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;
      const neighborKey = `${newRow}-${newCol}`;

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < gridSize
      ) {
        const neighborTile = updatedTiles[neighborKey];
        if (neighborTile && gameObjects.urbanStructures[neighborTile.type]) {
          // Combine the new mods with the neighbor's existing mods
          const combinedMods = combineMods(
            neighborTile.upgrades.connectionMods,
            newMods || updatedTiles[currentTileKey].upgrades.connectionMods
          );

          // Always update the tile with the combined mods
          updatedTiles[neighborKey] = {
            ...neighborTile,
            upgrades: {
              ...neighborTile.upgrades,
              connectionMods: combinedMods,
            },
          };

          // Always add to queue for further propagation
          queue.push(neighborKey);
        }
      }
    });
  }

  return updatedTiles;
};

export const combineBuildings = (mods1, mods2) => {
  const result = {};
  const allTypes = new Set([...mods1, ...mods2]);

  allTypes.forEach((type) => {
    const combinedSet = new Set([
      ...(mods1[type] || []),
      ...(mods2[type] || []),
    ]);
    result[type] = Array.from(combinedSet);
  });

  return result;
};

// Function to propagate buildings to all adjacent tiles using BFS
export const propagateBuildingsToNeighbors = (
  tiles,
  gridSize,
  startTileKey,
  newTileType
) => {
  const updatedTiles = { ...tiles };
  const queue = startTileKey ? [startTileKey] : Object.keys(tiles);
  const visited = new Set();

  while (queue.length > 0) {
    const currentTileKey = queue.shift();
    if (!currentTileKey || visited.has(currentTileKey)) continue;
    visited.add(currentTileKey);

    const [row, col] = currentTileKey.split('-').map(Number);
    const directions = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]; // Up, Down, Left, Right

    directions.forEach(([dx, dy]) => {
      const newRow = row + dx;
      const newCol = col + dy;
      const neighborKey = `${newRow}-${newCol}`;

      if (
        newRow >= 0 &&
        newRow < gridSize &&
        newCol >= 0 &&
        newCol < gridSize
      ) {
        const neighborTile = updatedTiles[neighborKey];
        if (neighborTile && gameObjects.urbanStructures[neighborTile.type]) {
          // Combine the new mods with the neighbor's existing mods
          const combinedMods = combineMods(
            neighborTile.connectedBuildings,
            newTileType || updatedTiles[currentTileKey].connectedBuildings
          );

          // Always update the tile with the combined mods
          updatedTiles[neighborKey] = {
            ...neighborTile,
            upgrades: {
              ...neighborTile.upgrades,
              connectionMods: combinedMods,
            },
          };

          // Always add to queue for further propagation
          queue.push(neighborKey);
        }
      }
    });
  }

  return updatedTiles;
};

export const findConnectedBuildingTypes = (grid) => {
  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0], // Right, Down, Left, Up
  ];
  let results = [];

  // Find all `x` positions in the grid
  for (const key in grid) {
    if (grid[key].type === 'retailCenter') {
      let [row, col] = key.split('-').map(Number);
      let buildingTypes = new Set();
      let transportationModes = new Set();
      let visited = new Set();
      let stack = [[row, col]];

      while (stack.length) {
        let [r, c] = stack.pop();

        for (let [dr, dc] of directions) {
          let newRow = r + dr;
          let newCol = c + dc;
          let newKey = `${newRow}-${newCol}`;

          if (grid[newKey] && !visited.has(newKey)) {
            let cell = grid[newKey];
            let cellType = grid[newKey].type;
            if (cell.metrics?.subCategory !== undefined) {
              buildingTypes.add(cell.metrics?.subCategory);

              if (cell.upgrades?.connectionMods?.transportation) {
                cell.upgrades?.connectionMods.transportation.forEach((mode) =>
                  transportationModes.add(mode)
                );
              }

              stack.push([newRow, newCol]);
            }

            visited.add(newKey);
          }
        }
      }

      results.push({
        xLocation: key,
        buildingTypes: [...buildingTypes],
        transportation: [...transportationModes],
      });
    }
  }

  return results;
};
