import { useCallback, useEffect } from "react";
import useStore from "../stores/gridStore";
import { useThree } from "@react-three/fiber";

const KeyboardControls = () => {
	const { camera, gl, scene } = useThree();

	const {
		gridSize,
		selectedTile,
		tiles,
		isDragging,
		isTileLocked,
		getNeighboringTilesInfo,
		isNaturalFeature,
		centerOnPosition,
		setSelectedTile,
		setShowCellHighlighter,
		setCurrentModal,
		tilePositions,
		addFeedbackAnimation,
	} = useStore();

	// Convert selected tile string to row and column numbers
	const getRowCol = useCallback((tileKey) => {
		if (!tileKey) return [0, 0];
		const [row, col] = tileKey.split("-").map(Number);
		return [row, col];
	}, []);

	// Convert row and column numbers to tile key string
	const getTileKey = useCallback((row, col) => {
		return `${row}-${col}`;
	}, []);

	// Handle selecting a tile with all associated actions
	const handleTileSelection = useCallback(
		(newTileKey) => {
			// Get tile info
			const tileInfo = tiles[newTileKey];
			const tilePosition = tilePositions?.find(
				(pos) => pos.key === newTileKey
			)?.position;

			// Set selection and center camera
			setSelectedTile(newTileKey);
			if (tilePosition) {
				centerOnPosition(tilePosition);
			}

			// Show cell highlighter
			setShowCellHighlighter(true);
		},
		[
			tiles,
			tilePositions,
			setSelectedTile,
			centerOnPosition,
			setShowCellHighlighter,
			setCurrentModal,
		]
	);

	// Handle keyboard navigation
	const handleKeyDown = useCallback(
		(event) => {
			// If no tile is selected and an arrow key is pressed, start at 0-0
			if (!selectedTile && event.key.startsWith("Arrow")) {
				handleTileSelection("0-0");
				return;
			}

			const [currentRow, currentCol] = getRowCol(selectedTile);
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
				case " ": // Space key
					if (selectedTile) {
						// Handle construction menu or other actions based on tile type
						const tileInfo = tiles[selectedTile];
						if (tileInfo && !isNaturalFeature(tileInfo.type)) {
							setCurrentModal("construction");
						}
						event.preventDefault();
					}
					break;
				case "Escape":
					setSelectedTile(null);
					setShowCellHighlighter(false);
					setCurrentModal(null);
					event.preventDefault();
					break;
				default:
					return;
			}

			// Update selected tile if position changed
			if (newRow !== currentRow || newCol !== currentCol) {
				const newTileKey = getTileKey(newRow, newCol);
				handleTileSelection(newTileKey);
			}
		},
		[
			selectedTile,
			gridSize,
			tiles,
			handleTileSelection,
			getRowCol,
			getTileKey,
			setSelectedTile,
			setShowCellHighlighter,
			setCurrentModal,
			isNaturalFeature,
		]
	);

	// Add keyboard event listener
	useEffect(() => {
		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	return null;
};

export default KeyboardControls;
