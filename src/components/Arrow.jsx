import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import useTextureStore from '../stores/textureStore'; // Adjust the path as needed

const BouncingArrow = ({
    position,
    pointerType,
    tileType,
    isPreview,
    previewStructureType
}) => {
    const arrowRef = useRef();
    const { preloadedTextures } = useTextureStore();
    const { camera } = useThree(); // Access the camera directly

    const getPointerType = () => {
        if (isPreview) {
            const naturalTypes = [
                'emptyTile',
                'sparseTreesArea',
                'someTreesArea',
                'thickForestedArea',
                'meadow',
                'windingStream_horizontal',
                'windingStream_vertical',
                'pond'
            ];
            return naturalTypes.includes(previewStructureType) ? 'pointerA' : 'pointerB';
        }
        return pointerType;
    };

    const finalPointerType = getPointerType();
    const arrowTexture = preloadedTextures[finalPointerType];

    // Ensure the texture is loaded
    if (!arrowTexture) {
        console.warn('Arrow texture not found for pointer type:', finalPointerType);
        return null; // Do not render the arrow if the texture is missing
    }

    const pointerOffset = (type) => {
        const offsets = {
            singleFamilyHomes: 0.15,
            apartmentComplex: 0.38,
            tallOfficeBuilding: 0.38,
            mediumOfficeBuildings: 0.3,
            governmentBuilding: 0.3,
            warehouse: 0.2,
            factory: 0.2,
            pond: 0.15,
            sparseTreesArea: 0.15,
            someTreesArea: 0.15,
            thickForestedArea: 0.15,
            meadow: 0.15,
            windingStream_vertical: 0.15,
            windingStream_horizontal: 0.15,
            hotels: 0.3,
            hospital: 0.3
        };
        return offsets[type] || 0.35;
    };

    const finalType = isPreview ? previewStructureType : tileType;

    const zoomScale = () => {
        const newValue = 30 / camera.zoom;
        return Math.max(newValue, 0.12);
    };

    useFrame(({ clock }) => {
        if (arrowRef.current) {
            arrowRef.current.position.z =
                position[2] -
                pointerOffset(finalType) +
                Math.sin(clock.getElapsedTime() * 5.5) * 0.03;
        }
    });

    return (
        <mesh
            ref={arrowRef}
            position={[position[0], position[1] + 1, position[2]]}
            rotation={[-Math.PI / 2, 0, 0]} // Face the arrow downwards
            scale={zoomScale() * 0.8} // Use the updated zoomScale function
        >
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={arrowTexture} transparent />
        </mesh>
    );
};

export default BouncingArrow;