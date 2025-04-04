import React, { useMemo, useCallback, useRef, useEffect } from "react";
import { Raycaster, Vector2 } from "three";
import { useThree } from "@react-three/fiber";
import useStore from "../stores/gridStore";
import useCameraStore from "../stores/cameraStore";
import Tile from "./tiles/Tile";
import NeighborTiles from "./NeighborTiles";
import ESSNeighborTiles from "./ESSNeighborTiles";
import EENeighborTiles from "./ee/EENeighborTiles";
import useTextureStore from "../stores/textureStore";
import Car from "./tiles/Car";
import BouncingArrow from "./Arrow";
import RisingFeedbackAnimation from "./ui/RisingFeedbackAnimation";
import RisingTextAnimation from "./ui/RisingTextAnimation";
import LockIcon from "./tiles/LockIcon";
import useVersionStore from "../stores/versionStore";

const naturalFeatures = [
	"sparseTreesArea",
	"someTreesArea",
	"thickForestedArea",
	"meadow",
	"windingStream_horizontal",
	"windingStream_vertical",
	"pond",
];

const Grid = () => {
	const { current: buildType } = useVersionStore(); // Correctly destructured 'current'
	const { preloadedTextures } = useTextureStore();
	const {
		gridSize,
		tiles,
		getNeighboringTilesInfo,
		setSelectedTile,
		prevSelectedTile,
		isDragging,
		selectedTile,
		getNatureCrossingState,
		isTileLocked,
		currentModal,
		setCurrentModal,
		showCellHighlighter,
		setShowCellHighlighter,
		previewTile,
		selectedEnergyType,
		feedbackAnimations,
		addFeedbackAnimation,
		removeFeedbackAnimation,
		getCellOpacity,
		clearFilter,
		usingKeyboard,
		setUsingKeyboard,
		screen,
	} = useStore();
	const { centerOnPosition } = useCameraStore();
	const { scene, camera, gl } = useThree();
	const [activePopup, setActivePopup] = React.useState(null);

	const selectedCellRef = useRef(null);

	// Memoized function to check if the tile is a natural feature
	const isNaturalFeature = useMemo(() => {
		const naturalFeaturesSet = new Set(naturalFeatures);
		return (tileType) => naturalFeaturesSet.has(tileType);
	}, []);

	const depthFactor = 0.1; // difference between each tile's y-position
	const tileWidth = 1;
	const tileHeight = 0.458;
	const tileGap = 0.002;
	const tileScale = 1;
	const offsetX = ((gridSize - 1) * (tileWidth + tileGap)) / 2;
	const offsetZ = ((gridSize - 1) * (tileHeight + tileGap)) / 2;

	const textureMap = preloadedTextures; // from textureStore
	const highlightTextureA = textureMap.highlightTextureA;
	const highlightTextureB = textureMap.highlightTextureB;

	const tilePositions = useMemo(() => {
		const positions = [];
		for (let row = 0; row < gridSize; row++) {
			for (let col = 0; col < gridSize; col++) {
				const x = (col - row) * (tileWidth + tileGap) * 0.5 + offsetX;
				const z = (col + row) * (tileHeight + tileGap) * 0.5 + offsetZ;
				const key = `${row}-${col}`;
				const depth = (row * gridSize + col + 1) * depthFactor;
				positions.push({ position: [x, depth, z], key });
			}
		}
		return positions;
	}, [gridSize, tileWidth, tileHeight, tileGap, offsetX, offsetZ]);

	const raycaster = new Raycaster();
	const pointer = new Vector2();

	const handleTileClick = useCallback(
		(event) => {
			setUsingKeyboard(false);
			if (isDragging) return;
			setActivePopup(null);

			// Get canvas bounds
			const canvas = gl.domElement;
			const rect = canvas.getBoundingClientRect();

			// Calculate click position relative to canvas
			pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			raycaster.setFromCamera(pointer, camera);
			const intersects = raycaster.intersectObjects(scene.children, true);

			for (const intersect of intersects) {
				const { object, uv } = intersect;
				const material = object.material;
				const texture = material.map;

				if (texture && texture.image) {
					const canvas = document.createElement("canvas");
					canvas.width = texture.image.width;
					canvas.height = texture.image.height;

					const context = canvas.getContext("2d");
					context.drawImage(texture.image, 0, 0);

					const x = Math.floor(uv.x * canvas.width);
					const y = Math.floor((1 - uv.y) * canvas.height);
					const pixel = context.getImageData(x, y, 1, 1).data;

					if (pixel[3] > 100) {
						// If pixel is not transparent
						const key = object.userData?.key;

						if (!key || typeof key !== "string" || !key.includes("-")) {
							continue;
						}

						// Check if the clicked tile is the same as the currently selected tile
						if (key === selectedTile) {
							setSelectedTile(null);
							setShowCellHighlighter(false);
							setCurrentModal(null);
							selectedCellRef.current = null;
							return;
						}

						const tile = tiles[key];
						if (!tile) {
							continue;
						}

						const tileType = tile.type;
						const tilePosition = tilePositions.find(
							(pos) => pos.key === key
						)?.position;

						setSelectedTile(key);
						setShowCellHighlighter(true);

						// Store selected cell data
						selectedCellRef.current = {
							key,
							type: tileType,
							position: tilePosition,
							isNatural: isNaturalFeature(tileType),
						};

						// Check if tile is locked, not an edge tile, and has no neighboring urban tiles
						const isLocked = isTileLocked(key);
						const [row, col] = key.split("-").map(Number);
						const isEdgeTile =
							row === 0 ||
							row === gridSize - 1 ||
							col === 0 ||
							col === gridSize - 1;
						const neighboringTiles = getNeighboringTilesInfo(key);
						const hasUrbanNeighbor = neighboringTiles.some(
							(neighborTile) =>
								!isNaturalFeature(neighborTile.type) &&
								neighborTile.type !== "emptyTile"
						);

						if (isLocked || (!isEdgeTile && !hasUrbanNeighbor)) {
							setCurrentModal("NaturePreserve");
						} else if (isNaturalFeature(tileType) || tileType === "emptyTile") {
							setCurrentModal("Construction");
						} else {
							setCurrentModal("BuildingInfo");
						}

						// Center camera on the selected tile
						if (key) centerOnPosition(key);

						return; // Stop checking further intersections
					}
				}
			}
		},
		[
			camera,
			gl,
			scene,
			isDragging,
			selectedTile,
			tiles,
			gridSize,
			isTileLocked,
			getNeighboringTilesInfo,
			isNaturalFeature,
			centerOnPosition,
			setSelectedTile,
			setShowCellHighlighter,
			setCurrentModal,
			tilePositions,
			addFeedbackAnimation,
		]
	);
	// Convert selected tile coordinates
	const getRowCol = useCallback((tileKey) => {
		if (!tileKey) return [0, 0];
		const [row, col] = tileKey.split("-").map(Number);
		return [row, col];
	}, []);

	// Convert row and column numbers to tile key
	const getTileKey = useCallback((row, col) => {
		return `${row}-${col}`;
	}, []);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(event) => {
			// Don't handle navigation keys if a modal is open
			if (currentModal) {
				// Only handle Escape key when modal is open
				if (event.key === "Escape") {
					setCurrentModal(null);
				}
				return;
			}

			setUsingKeyboard(true);

			// If no tile is selected and an arrow key is pressed, start from prevSelectedTile or 0-0
			if (!selectedTile && event.key.startsWith("Arrow")) {
				const startKey = prevSelectedTile || "0-0";
				const tilePosition = tilePositions.find(
					(pos) => pos.key === startKey
				)?.position;

				setSelectedTile(startKey);
				setShowCellHighlighter(true);

				selectedCellRef.current = {
					key: startKey,
					type: tiles[startKey]?.type || "emptyTile",
					position: tilePosition,
					isNatural: isNaturalFeature(tiles[startKey]?.type),
				};

				if (tilePosition) centerOnPosition(startKey);
				return;
			}

			const [currentRow, currentCol] = getRowCol(
				selectedTile || prevSelectedTile || "0-0"
			);
			let newRow = currentRow;
			let newCol = currentCol;

			switch (event.key) {
				case "ArrowUp":
					newRow = Math.max(0, currentRow - 1);
					event.preventDefault();
					break;
				case "ArrowDown":
					newRow = Math.min(gridSize - 1, currentRow + 1);
					event.preventDefault();
					break;
				case "ArrowLeft":
					newCol = Math.max(0, currentCol - 1);
					event.preventDefault();
					break;
				case "ArrowRight":
					newCol = Math.min(gridSize - 1, currentCol + 1);
					event.preventDefault();
					break;
				case "Enter": // Space key
					if (selectedTile) {
						const tile = tiles[selectedTile];
						const tileType = tile?.type;

						// Check if tile is locked, not an edge tile, and has no neighboring urban tiles
						const isLocked = isTileLocked(selectedTile);
						const [row, col] = selectedTile.split("-").map(Number);
						const isEdgeTile =
							row === 0 ||
							row === gridSize - 1 ||
							col === 0 ||
							col === gridSize - 1;
						const neighboringTiles = getNeighboringTilesInfo(selectedTile);
						const hasUrbanNeighbor = neighboringTiles.some(
							(neighborTile) =>
								!isNaturalFeature(neighborTile.type) &&
								neighborTile.type !== "emptyTile"
						);

						if (isLocked || (!isEdgeTile && !hasUrbanNeighbor)) {
							setCurrentModal("NaturePreserve");
						} else if (isNaturalFeature(tileType) || tileType === "emptyTile") {
							setCurrentModal("Construction");
						} else {
							setCurrentModal("BuildingInfo");
						}
						event.preventDefault();
					}
					break;
				case "Escape":
					setSelectedTile(null);
					setShowCellHighlighter(false);
					setCurrentModal(null);
					selectedCellRef.current = null;
					event.preventDefault();
					break;
				default:
					return;
			}

			// Update selected tile if position changed
			if (newRow !== currentRow || newCol !== currentCol) {
				const newTileKey = getTileKey(newRow, newCol);
				const tilePosition = tilePositions.find(
					(pos) => pos.key === newTileKey
				)?.position;
				const tile = tiles[newTileKey];
				const tileType = tile?.type || "emptyTile";

				setSelectedTile(newTileKey);
				setShowCellHighlighter(true);

				selectedCellRef.current = {
					key: newTileKey,
					type: tileType,
					position: tilePosition,
					isNatural: isNaturalFeature(tileType),
				};

				if (newTileKey) centerOnPosition(newTileKey);
			}
		},
		[
			selectedTile,
			gridSize,
			tiles,
			tilePositions,
			isNaturalFeature,
			isTileLocked,
			getNeighboringTilesInfo,
			centerOnPosition,
			setSelectedTile,
			setShowCellHighlighter,
			setCurrentModal,
			currentModal,
		]
	);

	// Add keyboard event listener
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	const getTextureKey = useCallback(
		(tile, key, isRoadLayer = false) => {
			const tileType = tile?.type;
			const tileUpgrades = tile?.upgrades;

			if (isRoadLayer) {
				return "road";
			}

			const handleBuildingUpgrades = (baseKey) => {
				let textureKey = baseKey;
				if (tileUpgrades?.coolRoof) textureKey += "_cool";
				if (tileUpgrades?.solarRoof) textureKey += "_solar";
				if (tileUpgrades?.greenRoof) textureKey += "_garden";
				if (tileUpgrades?.treeLinedStreets) textureKey += "_trees";
				return textureMap[textureKey] ? textureKey : baseKey;
			};

			switch (tileType) {
				case "singleFamilyHomes":
					return handleBuildingUpgrades("singleFamilyHomes");
				case "apartmentComplex":
					return handleBuildingUpgrades("apartmentComplex");
				case "retailCenter":
					return handleBuildingUpgrades("retailCenter");
				case "tallOfficeBuilding":
					return handleBuildingUpgrades("tallOfficeBuilding");
				case "mediumOfficeBuildings":
					return handleBuildingUpgrades("mediumOfficeBuildings");
				case "hotels":
					return handleBuildingUpgrades("hotels");
				case "hospital":
					return handleBuildingUpgrades("hospital");
				case "governmentBuilding":
					return handleBuildingUpgrades("governmentBuilding");
				case "warehouse":
					return handleBuildingUpgrades("warehouse");
				case "factory":
					return handleBuildingUpgrades("factory");
				default:
					return tileType || "emptyTile";
			}
		},
		[textureMap]
	);

	const isUrbanTile = useCallback(
		(tileType) => {
			return (
				tileType &&
				tileType !== "emptyTile" &&
				!naturalFeatures.includes(tileType)
			);
		},
		[tiles]
	);

	const urbanTiles = useMemo(() => {
		return Object.entries(tiles).filter(([key, tile]) =>
			isUrbanTile(tile.type)
		);
	}, [tiles, isUrbanTile]);

	const getNatureCrossingTextures = useCallback(
		(natureCrossingState) => {
			if (!natureCrossingState?.enabled) return [];

			const textures = [];
			["north", "south", "east", "west"].forEach((direction) => {
				if (natureCrossingState[direction]) {
					textures.push({
						direction,
						frontTexture: textureMap[`natureCrossing_${direction}_front`],
						backTexture: textureMap[`natureCrossing_${direction}_back`],
					});
				}
			});
			return textures;
		},
		[textureMap]
	);

	const getDepth = useCallback((direction, isBack) => {
		const baseDepth = isBack ? 0.03 : 0.05;
		const adjustment =
			direction === "north" || direction === "west" ? -0.03 : 0.0;
		return baseDepth + adjustment;
	}, []);

	const highlightedTiles = useMemo(() => {
		return Object.keys(tiles).filter((key) =>
			tiles[key].upgrades?.activeMods?.power?.includes(selectedEnergyType)
		);
	}, [tiles, selectedEnergyType]);

	useEffect(() => {
		// clear filter when activePopup closes
		if (!activePopup) {
			clearFilter();
		}
	}, [activePopup]);

	const handlePointerEnter = () => {
		document.body.style.cursor = "pointer";
	};

	const handlePointerLeave = () => {
		document.body.style.cursor = "default";
	};

	return (
		<>
			<group position={[-offsetX, 0, -offsetZ * 2]} onPointerEnter={handlePointerEnter} onPointerLeave={handlePointerLeave} >
				{tilePositions.map(({ position, key }) => {
					const [x, y, z] = position;
					const tile = tiles[key];
					const isPreview = previewTile && previewTile.key === key;
					const tileData = isPreview ? previewTile.data : tile;
					const tileType = tileData?.type || "emptyTile";
					const roadTextureKey = getTextureKey(tileData, key, true);
					const buildingTextureKey = getTextureKey(tileData, key);
					const natureCrossingState = isPreview
						? tileData.upgrades?.natureCrossings || getNatureCrossingState(key)
						: getNatureCrossingState(key);
					const natureCrossingTextures =
						getNatureCrossingTextures(natureCrossingState);
					const isHighlighted = selectedEnergyType
						? highlightedTiles.includes(key)
						: true;
					const baseOpacity = getCellOpacity(key, tile);
					const highlightOpacity = isHighlighted ? baseOpacity : 0.3;

					return (
						<React.Fragment key={isPreview ? `${key}-preview` : key}>
							{/* Road layer */}
							{isUrbanTile(tileType) && (
								<Tile
									position={position}
									scale={[tileScale, tileScale, 1]}
									onClick={handleTileClick}
									texture={textureMap[roadTextureKey]}
									isBuilding={false}
									userData={{ key }}
									opacity={isPreview ? 1 : highlightOpacity}
								/>
							)}

							{/* Building or nature layer */}
							<Tile
								position={[x, y + (isUrbanTile(tileType) ? 0.03 : 0), z]}
								scale={tileScale}
								onClick={handleTileClick}
								texture={textureMap[buildingTextureKey]}
								isBuilding={isUrbanTile(tileType)}
								userData={{ key }}
								tileType={tileType}
								opacity={isPreview ? 1 : highlightOpacity}
							/>

							{/* Nature Crossing layer */}
							{natureCrossingTextures.map(
								({ direction, frontTexture, backTexture }) => (
									<React.Fragment key={`natureCrossing-${direction}`}>
										<Tile
											position={[
												x,
												y + getDepth(direction, true) + (isPreview ? 0.03 : 0),
												z,
											]}
											scale={tileScale}
											texture={backTexture}
											isBuilding={false}
											userData={{ key }}
											natureCrossingState={natureCrossingState}
											transparent={true}
											opacity={highlightOpacity}
										/>
										<Tile
											position={[
												x,
												y + getDepth(direction, false) + (isPreview ? 0.05 : 0),
												z,
											]}
											scale={tileScale}
											texture={frontTexture}
											isBuilding={false}
											userData={{ key }}
											natureCrossingState={natureCrossingState}
											transparent={true}
											opacity={highlightOpacity}
										/>
									</React.Fragment>
								)
							)}
						</React.Fragment>
					);
				})}

				{/* highlight selected cell */}
				{showCellHighlighter && selectedCellRef.current && (
					<group
						position={selectedCellRef.current.position}
						position-y={selectedCellRef.current.position[1] + 0.06}
					>
						<mesh rotation={[-Math.PI / 2.4, 0, 0]} position={[0, 0, -0.15]}>
							<planeGeometry />
							<meshBasicMaterial
								map={
									selectedCellRef.current.isNatural && !previewTile
										? highlightTextureB
										: highlightTextureA
								}
								transparent
								depthWrite={false}
								opacity={
									tiles[selectedCellRef.current.key]?.previewData ? 0 : 0.6
								}
							/>
						</mesh>
					</group>
				)}

				{/* highlight pointer */}
				{selectedCellRef.current && showCellHighlighter && (
					<BouncingArrow
						position={selectedCellRef.current.position}
						pointerType={
							selectedCellRef.current.isNatural ? "pointerA" : "pointerB"
						}
						tileType={selectedCellRef.current.type}
						isPreview={
							!!previewTile && previewTile.key === selectedCellRef.current.key
						}
						previewStructureType={previewTile?.data?.type}
					/>
				)}

				{selectedTile &&
					selectedCellRef.current &&
					isTileLocked(selectedCellRef.current.key) && (
						<LockIcon
							position={selectedCellRef.current.position}
							texture={textureMap.lockIcon}
						/>
					)}

				{/* Tiles for neighboring city */}
				{screen !== "start" && buildType === "main" && (
					<NeighborTiles
						setActivePopup={setActivePopup}
						activePopup={activePopup}
					/>
				)}
				{screen !== "start" && (buildType === "ess" || buildType === "pp") && (
					<ESSNeighborTiles
						setActivePopup={setActivePopup}
						activePopup={activePopup}
					/>
				)}
				{screen !== "start" && buildType === "ee" && (
					<EENeighborTiles
						setActivePopup={setActivePopup}
						activePopup={activePopup}
					/>
				)}

				{urbanTiles.map(([key, tile]) => (
					<Car
						key={`car-${key}`}
						tileKey={key}
						tilePosition={tilePositions.find((pos) => pos.key === key).position}
						tileWidth={tileWidth}
						tileHeight={tileHeight}
						tile={tile}
						urbanTiles={urbanTiles}
						tiles={tiles}
					/>
				))}

				{/* Feedback animations */}
				{feedbackAnimations.map((animation) => {
					const { id, tileKey, type, position: animationPosition } = animation;
					const position =
						animationPosition ||
						tilePositions.find((pos) => pos.key === tileKey)?.position;
					if (!position) return null;

					if (type === "sprite") {
						return (
							<RisingFeedbackAnimation
								key={id}
								position={position}
								feedbackType={animation.feedbackType}
								onAnimationComplete={() => removeFeedbackAnimation(id)}
							/>
						);
					} else if (type === "text") {
						return (
							<RisingTextAnimation
								key={id}
								position={position}
								textContent={animation.textContent}
								color={animation.color}
								onAnimationComplete={() => removeFeedbackAnimation(id)}
							/>
						);
					} else {
						console.warn(`Unknown animation type: ${type}`);
						return null;
					}
				})}
			</group>
		</>
	);
};

export default Grid;
