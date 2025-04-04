import React, { useState, useEffect, useCallback, useRef } from "react";
import useCameraStore from "../../stores/cameraStore";
import useGridStore from "../../stores/gridStore";
import Tippy, { useSingleton } from "@tippyjs/react";

const CameraControlsUI = () => {
	const { selectedTile } = useGridStore();
	const {
		zoom,
		zoomToLevel,
		pan,
		zoomToTarget,
		updateZoom,
		currentZoomLevel,
		minZoom,
		maxZoom,
	} = useCameraStore();
	const [isPanning, setIsPanning] = useState(false);
	const [panDirection, setPanDirection] = useState(null);
	const requestRef = useRef();

	const handleCenterCamera = () => {
		zoomToTarget(selectedTile ? selectedTile : null);
	};

	const startPanning = useCallback((direction) => {
		setIsPanning(true);
		setPanDirection(direction);
	}, []);

	const stopPanning = useCallback(() => {
		setIsPanning(false);
		setPanDirection(null);
	}, []);

	const handleZoomIn = () => zoomToLevel(1);  // Zoom in
	const handleZoomOut = () => zoomToLevel(-1); // Zoom out

	const animate = useCallback(() => {
		if (isPanning && panDirection) {
			pan(panDirection);
		}
		updateZoom();
		requestRef.current = requestAnimationFrame(animate);
	}, [isPanning, panDirection, pan, updateZoom]);

	useEffect(() => {
		requestRef.current = requestAnimationFrame(animate);
		return () => {
			if (requestRef.current) {
				cancelAnimationFrame(requestRef.current);
			}
		};
	}, [animate]);

	const isZoomInDisabled = currentZoomLevel >= maxZoom;
	const isZoomOutDisabled = currentZoomLevel <= minZoom;

	const [source, target] = useSingleton();

	return (
		<div className="camera-controls-ui">
			<div className="zoom-controls">
				<Tippy singleton={source} moveTransition="transform 0.2s ease-out" animation="shift-away-subtle" />
				<Tippy content="Zoom In" singleton={target}>
					<button
						className="zoom-in-btn"
						onClick={handleZoomIn}
						disabled={isZoomInDisabled}
						aria-label="Zoom in"
					/>
				</Tippy>
				<Tippy content="Zoom Out" singleton={target}>
					<button
						className="zoom-out-btn"
						onClick={handleZoomOut}
						disabled={isZoomOutDisabled}
						aria-label="Zoom out"
					/>
				</Tippy>
			</div>

			<div className="pan-controls">
				<Tippy content="Pan Up" singleton={target}>
					<button
						className="arrow-up"
						onPointerDown={() => startPanning("up")}
						onPointerUp={stopPanning}
						onPointerLeave={stopPanning}
						aria-label="Move camera up"
					/>
				</Tippy>

				<div className="middle-con">
					<Tippy content="Pan Left" singleton={target}>
						<button
							className="arrow-left"
							onPointerDown={() => startPanning("left")}
							onPointerUp={stopPanning}
							onPointerLeave={stopPanning}
							aria-label="Move camera left"
						/>
					</Tippy>

					<Tippy
						content={selectedTile ? "Center on Selected Tile" : "Center on Map"}
						singleton={target}
					>
						<button
							className="center"
							onClick={handleCenterCamera}
							aria-label="Center camera"
						/>
					</Tippy>

					<Tippy content="Pan Right" singleton={target}>
						<button
							className="arrow-right"
							onPointerDown={() => startPanning("right")}
							onPointerUp={stopPanning}
							onPointerLeave={stopPanning}
							aria-label="Move camera right"
						/>
					</Tippy>
				</div>

				<Tippy content="Pan Down" singleton={target}>
					<button
						className="arrow-down"
						onPointerDown={() => startPanning("down")}
						onPointerUp={stopPanning}
						onPointerLeave={stopPanning}
						aria-label="Move camera down"
					/>
				</Tippy>
			</div>
		</div>
	);
};

export default CameraControlsUI;
