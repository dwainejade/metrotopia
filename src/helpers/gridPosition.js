
export const calculateGridPosition = (row, col, gridSize, cellSize = 1) => {
    const halfGrid = (gridSize - 1) / 2;
    const x = (col - halfGrid) * cellSize;
    const z = (row - halfGrid) * cellSize;
    return [x, 0, z]; // y is always 0 for the ground plane
};

export const calculateGridCoordinates = (x, z, gridSize, cellSize = 1) => {
    const halfGrid = (gridSize - 1) / 2;
    const col = Math.round(x / cellSize + halfGrid);
    const row = Math.round(z / cellSize + halfGrid);
    return [row, col];
};

export const isWithinGrid = (row, col, gridSize) => {
    return row >= 0 && row < gridSize && col >= 0 && col < gridSize;
};

export function getGeometryForType(type) {
    switch (type) {
        case 'meadow':
            return <planeGeometry args={[1, 1]} />
        case 'pond':
            return <circleGeometry args={[0.5, 32]} />
        case 'windingStream':
            return <boxGeometry args={[0.8, 0.1, 0.8]} />
        case 'sparseTreesArea':
        case 'someTreesArea':
        case 'thickForestedArea':
            return <coneGeometry args={[0.5, 1, 32]} />
        default:
            return <boxGeometry args={[0.5, 0.5, 0.5]} />
    }
}

export function getRotationForType(type, cellRotation) {
    switch (type) {
        case 'meadow':
        case 'pond':
            return [-Math.PI / 2, cellRotation, 0]
        default:
            return [0, cellRotation, 0]
    }
}

export function getYoffsetForType(type) {
    switch (type) {
        case 'windingStream':
        case 'pond':
        case 'meadow':
            return 0.051
        case 'sparseTreesArea':
        case 'someTreesArea':
        case 'thickForestedArea':
            return 0.2
        default:
            return 0.1
    }
}

export function getScaleForType(type) {
    switch (type) {
        case 'windingStream':
            return [1, 1, 1]
        case 'meadow':
            return [1, 1, 0.1]
        case 'pond':
            return [0.9, 0.9, 0.9]
        case 'sparseTreesArea':
            return [0.3, 0.3, 0.3]
        case 'someTreesArea':
            return [0.4, 0.4, 0.4]
        case 'thickForestedArea':
            return [0.5, 0.5, 0.5]
        default:
            return [1, 1, 1]
    }
}

export function getColorForType(type) {
    // This function is now a fallback, as we prefer to use cell.visual.color
    switch (type) {
        case 'thickForestedArea':
            return '#006400'
        default:
            return '#41980A'
    }
}