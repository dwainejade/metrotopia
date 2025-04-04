import React, { useState, useMemo, useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import useTextureStore from "../../stores/textureStore";
import CarManager from "../../helpers/CarManager";
import useGridStore from "../../stores/gridStore";

const SingleCar = ({ position, texture, scale, opacity }) => {
	return (
		<sprite position={position} scale={scale} rotation={[-Math.PI / 3.3, 0, 0]}>
			<spriteMaterial
				map={texture}
				transparent={true}
				opacity={opacity}
				depthWrite={false}
			/>
		</sprite>
	);
};

function scaleTrafficToCarCount(trafficValue) {
	const minTraffic = 40;
	const maxTraffic = 900;
	const minCars = 1;
	const maxCars = 6;

	let scaledValue =
		minCars +
		((trafficValue - minTraffic) * (maxCars - minCars)) /
			(maxTraffic - minTraffic);

	return Math.round(scaledValue);
}

const Car = ({ tileKey, tilePosition, tileWidth, tileHeight, tile, tiles }) => {
	const { preloadedTextures } = useTextureStore();
	const { isCarMovementPaused } = useGridStore();
	const carScale = [0.06, 0.06, 0.06];
	const maxCarCount = scaleTrafficToCarCount(tile.metrics?.carTraffic || 40);
	const initialCarCount = Math.floor(maxCarCount / 2);

	const lastUpdateTime = useRef(0);
	const frameInterval = 1 / 35; // limit FPS

	const pathPoints = useMemo(() => {
		const [x, y, z] = tilePosition;
		const roadWidth = tileWidth * 0.88;
		const roadHeight = tileHeight * 0.88;
		const halfRoadWidth = roadWidth / 2;
		const halfRoadHeight = roadHeight / 2;
		const adjustedZ = z + 0.098;

		return [
			[x, y, adjustedZ - halfRoadHeight],
			[x - halfRoadWidth, y, adjustedZ],
			[x, y, adjustedZ + halfRoadHeight],
			[x + halfRoadWidth, y, adjustedZ],
		];
	}, [tilePosition, tileWidth, tileHeight]);

	const textures = useMemo(() => {
		const vehicleTypes = [
			"truck",
			"truck2",
			"truck3",
			"sedan",
			"sedan2",
			"sedan3",
			"sedan4",
			"sedan5",
			"van",
			"van2",
			"van3",
		];
		const directions = ["N", "S", "W", "E"];

		return vehicleTypes.reduce((acc, vehicle) => {
			directions.forEach((direction) => {
				const key = `${vehicle}${direction}`;
				acc[key] = preloadedTextures[key];
			});
			return acc;
		}, {});
	}, [preloadedTextures]);

	const carManager = useMemo(() => {
		const maxCarCount = scaleTrafficToCarCount(tile.metrics?.carTraffic || 40);
		return new CarManager(
			pathPoints,
			tileWidth,
			tileHeight,
			tile.type,
			maxCarCount
		);
	}, [pathPoints, tileWidth, tileHeight, tile.type, tile.metrics?.carTraffic]);

	const [cars, setCars] = useState(carManager.getCars());

	useEffect(() => {
		carManager.setIsPaused(isCarMovementPaused);
	}, [isCarMovementPaused, carManager]);

	useFrame((state, delta) => {
		const currentTime = state.clock.getElapsedTime();
		if (currentTime - lastUpdateTime.current >= frameInterval) {
			carManager.updateCars(currentTime - lastUpdateTime.current);
			setCars([...carManager.getCars()]);
			lastUpdateTime.current = currentTime;
		}
	});

	const getOffset = (direction) => {
		const offset = 0.01;
		switch (direction) {
			case "N":
				return { x: 0, z: 0 };
			case "S":
				return { x: -offset, z: -offset };
			case "W":
				return { x: offset, z: -offset };
			case "E":
				return { x: offset, z: 0 };
			default:
				return { x: 0, z: 0 };
		}
	};

	return (
		<group>
			{cars.map((car, index) => {
				const position = carManager.getCarPosition(car);
				const yOffset =
					car.direction === "N" || car.direction === "E" ? 0.04 : 0.01;
				position.y += yOffset;

				const offset = getOffset(car.direction);
				position.x += offset.x;
				position.z += offset.z;

				const textureKey = `${car.type}${car.direction}`;

				return (
					<SingleCar
						key={`${tileKey}-car-${index}`}
						position={position}
						texture={textures[textureKey]}
						scale={carScale}
						opacity={car.opacity}
					/>
				);
			})}
		</group>
	);
};

export default Car;
