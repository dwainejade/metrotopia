import React, { useMemo, useState, useEffect } from "react";
import { Html } from "@react-three/drei";
import useGridStore from "../stores/gridStore";
import useTextureStore from "../stores/textureStore";
import useAudioStore from "../stores/audioStore";
import { capitalizeEachWord } from "../helpers/capitalizeEachWord";
import electricityNeighbor from "../assets/neighboring-menu-icons/electricity-active.svg";
import transportationNeighbor from "../assets/neighboring-menu-icons/transportation-active.svg";
import wastewaterNeighbor from "../assets/neighboring-menu-icons/wastewater-active.svg";
import {
	connectionNames,
	powerModMapping,
	transportationModMapping,
	wasteModMapping,
} from "../data/modMappings";
import "../styles/NeighborPopup.css";

const NeighborTile = ({
	position,
	rotation,
	scale,
	direction,
	activePopup,
	setActivePopup,
}) => {
	const {
		neighboringCities,
		getNeighborTileState,
		setNeighborTileClicked,
		toggleNeighborTilePulsing,
		currentOpenModal,
		activeTab,
		setFilter,
	} = useGridStore();
	const { preloadedTextures } = useTextureStore();
	const { playSound } = useAudioStore();
	const [hovered, setHovered] = useState(false);
	const [isOpen, setIsOpen] = useState(false);
	const [prevMenuTab, setPrevMenuTab] = useState(activeTab);

	const { clicked, isPulsing } = getNeighborTileState(direction);

	useEffect(() => {
		if (!clicked && currentOpenModal !== "Instructions") {
			const intervalId = setInterval(() => {
				toggleNeighborTilePulsing(direction);
			}, 1000); // Toggle every second
			return () => clearInterval(intervalId);
		}
	}, [clicked, direction, toggleNeighborTilePulsing, currentOpenModal]);

	useEffect(() => {
		if (activePopup === direction) {
			setIsOpen(true);
		} else {
			setIsOpen(false);
		}
	}, [activePopup, direction]);

	useEffect(() => {
		if (activeTab || prevMenuTab !== activeTab) {
			setActivePopup(null);
		}
	}, [activeTab]);

	const texture = useMemo(() => {
		if (activePopup === direction) {
			return preloadedTextures[`${direction}Active`];
		}
		if (hovered || (isPulsing && !clicked)) {
			return preloadedTextures[`${direction}Hover`];
		}
		if (clicked) {
			return preloadedTextures[direction];
		}
		return preloadedTextures[direction];
	}, [direction, activePopup, hovered, clicked, isPulsing, preloadedTextures]);

	const handleClick = (event) => {
		event.stopPropagation();
		if (activePopup === direction) {
			playSound("popUpSound2");
			setActivePopup(null);
			setFilter(null);
		} else {
			playSound("popUpSound3");
			setActivePopup(direction);
			setNeighborTileClicked(direction);
			setFilter("connectedToNeighborCity", direction);
		}
	};

	const handlePointerOver = () => {
		setHovered(true);
		document.body.style.cursor = "pointer";
	};

	const handlePointerOut = () => {
		setHovered(false);
		document.body.style.cursor = "auto";
	};

	const cityData = neighboringCities[direction];

	const getPopupPosition = () => {
		switch (direction) {
			case "north":
			case "east":
				return [0, -0.5, 0];
			default:
				return [0, 0.5, 0];
		}
	};

	const getPopupTransform = () => {
		switch (direction) {
			case "north":
				return "translate(-54%, 6%)";
			case "west":
				return "translate(-54%, 6%)";
			default:
				return "translate(-54%, -106%)";
		}
	};

	if (!cityData) return null;

	const hasTransportation =
		cityData.connectionMods.transportation &&
		cityData.connectionMods.transportation.length > 0;
	const hasWasteTreatment =
		cityData.connectionMods.waste && cityData.connectionMods.waste.length > 0;

	const energyAirPollutionNotes = {
		coal: "more",
		hydroelectric: "very little",
		"natural gas": "less",
		nuclear: "little",
		solar: "no",
		wind: "no",
	};

	const transportationNotes = {
		airport:
			"(increases sales tax revenue by 30% and vehicle air pollution by 1.2%–2.5%)",
		"passenger train access":
			"(increases sales tax revenue by 20% and vehicle air pollution by 1.5%)",
	};

	return (
		<group position={position}>
			<mesh
				rotation={rotation}
				scale={scale}
				onClick={handleClick}
				onPointerOver={handlePointerOver}
				onPointerOut={handlePointerOut}
			>
				<planeGeometry />
				<meshBasicMaterial map={texture} transparent depthWrite={false} />
			</mesh>
			<Html
				as="div"
				position={getPopupPosition()}
				style={{
					width: "auto",
					height: "auto",
					transform: getPopupTransform(),
					pointerEvents: "none",
				}}
				zIndexRange={[1, 4]}
			>
				<div
					className={`neighboring-popup-container ${direction} ${isOpen ? "open" : ""
						}`}
				>
					<h3 className="neighboring-popup-header">
						{connectionNames[direction]}
					</h3>

					<div className="neighboring-popup-details">
						{cityData.connectionMods.power &&
							cityData.connectionMods.power.map((powerMod, index) => (
								<React.Fragment key={`power-${index}`}>
									<p>
										<img src={electricityNeighbor} alt="Electricity Icon" />{" "}
										{powerModMapping[powerMod] || capitalizeEachWord(powerMod)}
									</p>
									<p className="neighbor-note air-pollution">{`(produces ${energyAirPollutionNotes[powerMod]} air pollution)`}</p>
									<div className="divider"></div>
								</React.Fragment>
							))}

						{cityData.connectionMods.transportation &&
							cityData.connectionMods.transportation.map(
								(transportMod, index) => (
									<React.Fragment key={`transport-${index}`}>
										<p>
											<img
												src={transportationNeighbor}
												alt="Transportation Icon"
											/>{" "}
											{transportationModMapping[transportMod] ||
												capitalizeEachWord(transportMod)}
										</p>
										<p className="neighbor-note transportation">
											{transportationNotes[transportMod]}
										</p>
										<div className="divider"></div>
									</React.Fragment>
								)
							)}

						{cityData.connectionMods.waste &&
							cityData.connectionMods.waste.map((wasteMod, index) => (
								<React.Fragment key={`waste-${index}`}>
									<p>
										<img
											src={wastewaterNeighbor}
											alt="Wastewater Treatment Icon"
										/>{" "}
										{wasteModMapping[wasteMod] || capitalizeEachWord(wasteMod)}
									</p>
									<p className="neighbor-note wastewater">
										{`(creates less groundwater pollution)`}
									</p>
									<div className="divider"></div>
								</React.Fragment>
							))}

						{!hasWasteTreatment && hasTransportation && (
							<>
								<p className="no-access-text">No Wastewater Treatment Access</p>
								<p className="neighbor-note wastewater">
									{`(creates more groundwater pollution)`}
								</p>
							</>
						)}
						{!hasTransportation && hasWasteTreatment && (
							<>
								<p className="no-access-text transportation">
									No Major Transportation Access
								</p>
							</>
						)}
					</div>
				</div>
			</Html>
		</group>
	);
};

const NeighborTiles = ({ activePopup, setActivePopup }) => {
	const tilePositions = [
		{
			position: [7.5, 0, 2.9],
			rotation: [-Math.PI / 5, 0, 0],
			scale: 0.4,
			direction: "north",
		},
		{
			position: [7.4, 0, 5.6],
			rotation: [-Math.PI / 5, 0, 0],
			scale: 0.4,
			direction: "east",
		},
		{
			position: [1.5, 0, 2.8],
			rotation: [-Math.PI / 5, 0, 0],
			scale: 0.4,
			direction: "west",
		},
		{
			position: [1.6, 0, 5.7],
			rotation: [-Math.PI / 5, 0, 0],
			scale: 0.4,
			direction: "south",
		},
	];

	return (
		<>
			{tilePositions.map((tile, index) => (
				<NeighborTile
					key={index}
					{...tile}
					activePopup={activePopup}
					setActivePopup={setActivePopup}
				/>
			))}
		</>
	);
};

export default NeighborTiles;
