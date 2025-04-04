// NOT CURRENTLY USED

import React from 'react';
import { Line } from '@react-three/drei';
import { GRID_SIZE, CELL_SIZE } from '../helpers/carGridSystem';

const StreetGrid = ({ position }) => {
    const gridLines = [];

    // Create horizontal grid lines
    for (let i = 0; i <= GRID_SIZE; i++) {
        gridLines.push([
            [0, 0, i * CELL_SIZE],
            [GRID_SIZE * CELL_SIZE, 0, i * CELL_SIZE]
        ]);
    }

    // Create vertical grid lines
    for (let i = 0; i <= GRID_SIZE; i++) {
        gridLines.push([
            [i * CELL_SIZE, 0, 0],
            [i * CELL_SIZE, 0, GRID_SIZE * CELL_SIZE]
        ]);
    }

    return (
        <group position={position}>
            {gridLines.map((points, index) => (
                <Line
                    key={`grid-${index}`}
                    points={points}
                    color="red"
                    lineWidth={1}
                    dashed={true}
                    dashScale={3}
                    dashSize={0.5}
                    dashOffset={0}
                />
            ))}
        </group>
    );
};

export default StreetGrid;