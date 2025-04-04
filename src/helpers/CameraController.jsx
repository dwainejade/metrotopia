import React, { useEffect, useRef, useMemo, useCallback } from "react";
import { useThree, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import useStore from "../stores/gridStore";
import useCameraStore from "../stores/cameraStore";

const BASE_PAN_SPEED = 2;
const BASE_ARROW_KEY_PAN_SPEED = 10;
const DRAG_THRESHOLD = 3;
const LERP_FACTOR = 0.025;
const CENTERING_THRESHOLD = 0.02;
const CAMERA_Z_OFFSET = 2.4;

function CameraController() {
	const { isDragging, setIsDragging, gridSize } = useStore();
	const {
		camera,
		gl: { domElement },
	} = useThree();

	const {
		setCamera,
		setPanLimits,
		targetCameraPosition,
		isCameraCentering,
		setIsCameraCentering,
		zoom,
	} = useCameraStore();

	// Updated mouseState to track both buttons
	const mouseState = useRef({
		leftButton: {
			isPressed: false,
			lastPosition: { x: 0, y: 0 },
			initialPosition: { x: 0, y: 0 },
		},
		rightButton: {
			isPressed: false,
			lastPosition: { x: 0, y: 0 },
			initialPosition: { x: 0, y: 0 },
		},
		isPanning: false,
	});

	const keysPressed = useRef({});

	const panLimits = useMemo(
		() => ({
			minX: -(gridSize / 1.5),
			maxX: gridSize / 1.5,
			minZ: -(gridSize * 0.46) / 1.5,
			maxZ: (gridSize * 0.46) / 1.5,
		}),
		[gridSize]
	);

	const getPanSpeed = useCallback(
		() => BASE_PAN_SPEED / camera.zoom,
		[camera.zoom]
	);

	const getArrowKeyPanSpeed = useCallback(
		() => BASE_ARROW_KEY_PAN_SPEED / camera.zoom,
		[camera.zoom]
	);

	const clampCameraPosition = useCallback(() => {
		camera.position.x = THREE.MathUtils.clamp(
			camera.position.x,
			panLimits.minX,
			panLimits.maxX
		);
		camera.position.z = THREE.MathUtils.clamp(
			camera.position.z,
			panLimits.minZ,
			panLimits.maxZ
		);
	}, [camera.position, panLimits]);

	const handleMouseMove = useCallback(
		(event) => {
			const state = mouseState.current;
			const isAnyButtonPressed = state.leftButton.isPressed || state.rightButton.isPressed;

			if (!isAnyButtonPressed) return;

			// Get the active button state
			const activeButton = state.leftButton.isPressed ? state.leftButton : state.rightButton;

			const deltaX = event.clientX - activeButton.initialPosition.x;
			const deltaY = event.clientY - activeButton.initialPosition.y;
			const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

			if (distance > DRAG_THRESHOLD && !state.isPanning) {
				state.isPanning = true;
				setIsDragging(true);
				setIsCameraCentering(false);
			}

			if (!state.isPanning) return;

			const currentPanSpeed = getPanSpeed();
			const moveX = (event.clientX - activeButton.lastPosition.x) * 0.5 * currentPanSpeed;
			const moveY = (event.clientY - activeButton.lastPosition.y) * currentPanSpeed;

			camera.position.x -= moveX;
			camera.position.z -= moveY;
			clampCameraPosition();

			// Update the last position for the active button
			if (state.leftButton.isPressed) {
				state.leftButton.lastPosition = { x: event.clientX, y: event.clientY };
			}
			if (state.rightButton.isPressed) {
				state.rightButton.lastPosition = { x: event.clientX, y: event.clientY };
			}
		},
		[isDragging, setIsDragging, setIsCameraCentering, getPanSpeed, camera, clampCameraPosition]
	);

	useEffect(() => {
		setCamera(camera);
		setPanLimits(panLimits);

		const handleWheel = (event) => {
			event.preventDefault();

			const rect = domElement.getBoundingClientRect();
			const x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
			const y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

			const mouse = new THREE.Vector3(x, y, 0);
			mouse.unproject(camera);
			const targetPoint = new THREE.Vector3(
				mouse.x,
				camera.position.y,
				mouse.z
			);

			zoom(event.deltaY, targetPoint);
			clampCameraPosition();
		};

		const handleMouseDown = (event) => {
			// Handle both left (0) and right (2) mouse buttons
			if (event.button === 0 || event.button === 2) {
				const buttonState = event.button === 0 ? 'leftButton' : 'rightButton';
				mouseState.current[buttonState] = {
					isPressed: true,
					lastPosition: { x: event.clientX, y: event.clientY },
					initialPosition: { x: event.clientX, y: event.clientY },
				};
			}
		};

		const handleMouseUp = (event) => {
			const state = mouseState.current;
			if (event.button === 0) {
				state.leftButton.isPressed = false;
			} else if (event.button === 2) {
				state.rightButton.isPressed = false;
			}

			// Only reset panning state if both buttons are released
			if (!state.leftButton.isPressed && !state.rightButton.isPressed) {
				state.isPanning = false;
				setIsDragging(false);
			}
		};

		const handleMouseLeave = () => {
			mouseState.current = {
				leftButton: { isPressed: false, lastPosition: { x: 0, y: 0 }, initialPosition: { x: 0, y: 0 } },
				rightButton: { isPressed: false, lastPosition: { x: 0, y: 0 }, initialPosition: { x: 0, y: 0 } },
				isPanning: false
			};
			setIsDragging(false);
		};

		// Event listeners
		const events = [
			["wheel", handleWheel, { passive: false }],
			["mousedown", handleMouseDown],
			["mousemove", handleMouseMove],
			["mouseup", handleMouseUp],
			["mouseleave", handleMouseLeave],
			["contextmenu", (e) => e.preventDefault()],
		];

		events.forEach(([event, handler, options]) => {
			domElement.addEventListener(event, handler, options);
		});

		return () => {
			events.forEach(([event, handler]) => {
				domElement.removeEventListener(event, handler);
			});
		};
	}, [
		camera,
		domElement,
		setCamera,
		setPanLimits,
		panLimits,
		handleMouseMove,
		zoom,
		setIsDragging
	]);

	useFrame(() => {
		if (targetCameraPosition && isCameraCentering) {
			const [targetX, targetZ] = targetCameraPosition;
			const centeredX = targetX;
			const centeredZ = targetZ - CAMERA_Z_OFFSET;

			camera.position.x += (centeredX - camera.position.x) * LERP_FACTOR;
			camera.position.z += (centeredZ - camera.position.z) * LERP_FACTOR;

			if (
				Math.abs(camera.position.x - centeredX) < CENTERING_THRESHOLD &&
				Math.abs(camera.position.z - centeredZ) < CENTERING_THRESHOLD
			) {
				setIsCameraCentering(false);
			}
		}

		clampCameraPosition();
		camera.updateProjectionMatrix();
	});

	return null;
}

export default CameraController;