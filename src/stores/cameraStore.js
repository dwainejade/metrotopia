import { create } from "zustand";
import * as THREE from "three";

const createCameraStore = () => {
	const panRef = {
		limits: { minX: 0, maxX: 0, minZ: 0, maxZ: 0 },
		speed: 12,
		autoSpeed: 0.001,
		duration: 15000,
		lastStartTime: 0,
		currentDirection: null,
	};

	const zoomRef = {
		current: 800,
		target: null,
		min: 150,
		max: 2600,
		speed: 0.1,
		target: null,
		baseSpeed: 0.01,
		lerpFactor: 0.1,
		// Define specific zoom levels for buttons
		levels: [
			150, // Most zoomed out
			200,
			300,
			500,
			800,
			1100,
			1500,
			2000,
			2600, // Most zoomed in
		],
	};

	const autoPanRef = {
		isActive: false,
	};

	const getNextZoomLevel = (currentZoom, direction) => {
		const levels = zoomRef.levels;
		const currentLevel = levels.reduce((prev, curr) =>
			Math.abs(curr - currentZoom) < Math.abs(prev - currentZoom) ? curr : prev
		);
		const currentIndex = levels.indexOf(currentLevel);

		if (direction > 0) {
			// Zoom in
			return currentIndex < levels.length - 1
				? levels[currentIndex + 1]
				: levels[levels.length - 1];
		} else {
			// Zoom out
			return currentIndex > 0 ? levels[currentIndex - 1] : levels[0];
		}
	};

	return create((set, get) => ({
		camera: null,
		isCameraCentering: false,
		targetCameraPosition: null,

		setCamera: (camera) => set({ camera }),
		setIsCameraCentering: (isCentering) =>
			set({ isCameraCentering: isCentering }),

		resetCamera: () => {
			const { camera, setIsCameraCentering, stopAutoPan } = get();
			if (!camera) {
				console.warn("Camera is not set");
				return;
			}

			stopAutoPan();
			setIsCameraCentering(false);

			camera.position.set(0, 40, 0);
			camera.zoom = 120;
			camera.updateProjectionMatrix();

			// Reset refs
			zoomRef.current = 300;
			zoomRef.target = null;
			panRef.currentDirection = null;
			panRef.lastStartTime = 0;
			autoPanRef.isActive = false;

			// Reset state
			set({
				camera: null,
				isCameraCentering: false,
				targetCameraPosition: null,
			});
		},

		setPanLimits: () => {
			panRef.limits = {
				minX: -3,
				maxX: 3,
				minZ: -2,
				maxZ: 2,
			};
		},

		selectRandomSpotAndDirection: () => {
			const { limits } = panRef;
			if (!limits.minX || !limits.maxX || !limits.minZ || !limits.maxZ) {
				console.warn("Pan limits are not properly set:", limits);
				return null;
			}

			const randomX = Math.random() * (limits.maxX - limits.minX) + limits.minX;
			const randomZ = Math.random() * (limits.maxZ - limits.minZ) + limits.minZ;
			const randomAngle = Math.random() * Math.PI * 2;

			return {
				position: new THREE.Vector3(randomX, 40, randomZ),
				direction: new THREE.Vector2(
					Math.cos(randomAngle),
					Math.sin(randomAngle)
				),
			};
		},

		getAutoPanRef: () => autoPanRef,

		startAutoPan: () => {
			const { camera, selectRandomSpotAndDirection } = get();
			if (!camera) {
				console.warn("Camera is not set");
				return;
			}

			const spotAndDirection = selectRandomSpotAndDirection();
			if (!spotAndDirection) {
				console.warn("Failed to select random spot and direction");
				return;
			}

			const { position, direction } = spotAndDirection;

			camera.position.copy(position);
			camera.zoom = 800;
			camera.updateProjectionMatrix();

			zoomRef.current = 800;
			panRef.lastStartTime = Date.now();
			panRef.currentDirection = direction;
			autoPanRef.isActive = true;
		},

		stopAutoPan: () => {
			autoPanRef.isActive = false;
		},

		updateAutoPan: () => {
			const { camera, startAutoPan } = get();
			if (!camera || !autoPanRef.isActive) return;

			const currentTime = Date.now();
			if (currentTime - panRef.lastStartTime > panRef.duration) {
				startAutoPan();
				return;
			}

			const newX =
				camera.position.x + panRef.currentDirection.x * panRef.autoSpeed;
			const newZ =
				camera.position.z + panRef.currentDirection.y * panRef.autoSpeed;

			camera.position.x = THREE.MathUtils.clamp(
				newX,
				panRef.limits.minX + 1,
				panRef.limits.maxX - 1
			);
			camera.position.z = THREE.MathUtils.clamp(
				newZ,
				panRef.limits.minZ + 1,
				panRef.limits.maxZ - 1
			);

			camera.updateProjectionMatrix();
		},

		centerOnPosition: (tileKey) => {
			const tileWidth = 1;
			const tileHeight = 0.49;
			const tileGap = 0.005;

			const [row, col] = tileKey.split("-").map(Number);

			const x = (col - row) * (tileWidth + tileGap) * 0.5;
			const z = (col + row) * (tileHeight + tileGap) * 0.5;

			const targetX = x - 0.2;
			const targetZ = z - 0.1;

			set({
				targetCameraPosition: [targetX, targetZ],
				isCameraCentering: true,
			});
		},

		calculateZoomDelta: (deltaY, mousePoint = null) => {
			const { camera } = get();
			if (!camera) return;

			// Calculate zoom speed based on current zoom level
			const zoomFactor = camera.zoom / 50;
			const speed = zoomRef.baseSpeed * (1 + zoomFactor);
			const zoomDelta = -deltaY * speed;

			// Store old zoom value
			const oldZoom = camera.zoom;

			// Apply zoom directly
			camera.zoom = THREE.MathUtils.clamp(
				camera.zoom + zoomDelta,
				zoomRef.min,
				zoomRef.max
			);

			// If we have a mouse point, adjust camera position to zoom toward that point
			if (mousePoint) {
				const zoomRatio = oldZoom / camera.zoom;
				const cameraDelta = new THREE.Vector3().subVectors(
					mousePoint,
					camera.position
				);
				const movement = cameraDelta.multiplyScalar(1 - zoomRatio);
				camera.position.add(movement);
			}

			camera.updateProjectionMatrix();
		},

		// Smooth zoom for buttons
		zoomToLevel: (direction) => {
			const { camera } = get();
			if (!camera) return;

			const nextLevel = getNextZoomLevel(camera.zoom, direction);
			zoomRef.target = nextLevel;
		},

		updateZoom: () => {
			const { camera } = get();
			if (!camera || zoomRef.target === null) return;

			const zoomDiff = zoomRef.target - camera.zoom;

			if (Math.abs(zoomDiff) < 0.1) {
				camera.zoom = zoomRef.target;
				zoomRef.current = camera.zoom;
				zoomRef.target = null;
			} else {
				camera.zoom += zoomDiff * zoomRef.lerpFactor;
				zoomRef.current = camera.zoom;
			}

			camera.updateProjectionMatrix();
		},

		zoom: (deltaY, targetPoint = null) => {
			const { calculateZoomDelta } = get();
			calculateZoomDelta(deltaY, targetPoint);
		},

		// Update existing zoomToTarget to use specific levels
		zoomToTarget: (tileKey, speed = zoomRef.speed) => {
			const { centerOnPosition } = get();
			if (!tileKey) {
				centerOnPosition("5-5");
				zoomRef.target = zoomRef.levels[1]; // Use second level for default view
				return;
			}
			centerOnPosition(tileKey);
			zoomRef.target = zoomRef.levels[4]; // Use middle level for focusing
		},

		pan: (direction) => {
			const { camera } = get();
			if (!camera) return;

			const speed = panRef.speed / camera.zoom;
			let dx = 0,
				dz = 0;

			switch (direction) {
				case "up":
					dz = -speed;
					break;
				case "down":
					dz = speed;
					break;
				case "left":
					dx = -speed;
					break;
				case "right":
					dx = speed;
					break;
			}

			camera.position.x = THREE.MathUtils.clamp(
				camera.position.x + dx,
				panRef.limits.minX - 3,
				panRef.limits.maxX + 3
			);
			camera.position.z = THREE.MathUtils.clamp(
				camera.position.z + dz,
				panRef.limits.minZ - 2,
				panRef.limits.maxZ + 2
			);
			camera.updateProjectionMatrix();
		},
	}));
};

const useCameraStore = createCameraStore();

export default useCameraStore;
