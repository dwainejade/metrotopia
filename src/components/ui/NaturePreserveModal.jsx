import React from "react";
import { useSpring, animated } from "react-spring";
// import useStore from '../../stores/gridStore';
import useTextureStore from "../../stores/textureStore";
import useVersionStore from "../../stores/versionStore";
import "../../styles/NaturePreserveModal.css";
import RoundedButton from "./RoundedButton";

const NaturePreserveModal = ({ onClose, tile }) => {
	const { current: version } = useVersionStore(); // Correctly destructured 'current'

	const metrics = tile?.metrics;
	if (!tile || !metrics) return null;

	const { preloadedUIImages } = useTextureStore();

	const wildlife = metrics.wildlife || {};
	const totalWildlife = () => {
		return Object.values(wildlife).reduce((sum, value) => sum + value, 0);
	};
	// Helper function to pluralize animals if count is not 1
	const pluralize = (count, noun) => (count === 1 ? noun : `${noun}s`);

	// Animation for the menu appearance
	const menuAnimation = useSpring({
		from: { opacity: 0, transform: "translateX(-80px)" },
		to: { opacity: 1, transform: "translateX(0px)" },
		config: { tension: 300, friction: 20 },
	});

	return (
		<animated.div className="nature-preserve-modal" style={menuAnimation}>
			<div className={`header ${tile.locked ? "permanent" : ""}`}>
				{preloadedUIImages && tile.locked ? (
					<img
						src={preloadedUIImages["natureCrossings"].src}
						alt="nature crossing icon"
						className="nature-crossing-icon"
					/>
				) : null}
				<h2 className="title">
					{tile.locked ? "Permanent" : null} Nature Preserve
				</h2>
			</div>

			<div className="content-wrapper">
				<div className="text-con">
					{!tile.locked && (
						<p>This parcel is currently part of a nature preserve.</p>
					)}

					<p>
						{tile.locked ? (
							<>
								<strong>
									This parcel is now zoned as a permanent nature preserve
									because it is connected to a nature crossing.
								</strong>{" "}
								Because there is safe passage for animals to enter and exit this
								parcel, there is less loss of wildlife, and thus this parcel has
								received a 50% increase in small mammal population.
							</>
						) : version !== "lwl" && version !== "pp" && version !== "ee" ? (
							<>
								You can only develop land next to the map's edge (adjacent to a
								neighboring city) or an existing structure you've built. Note
								that parcels connected to buildings via nature crossings (a
								green modification) are permanently designated as nature
								preserves and cannot be later developed.
							</>
						) : (
							<>
								You can only develop land next to the map's edge (adjacent to a
								neighboring city) or an existing structure you've built.
							</>
						)}
					</p>
				</div>

				<div className={`stats-wrapper ${version}`}>
					<div className="column">
						<div className="stat-con">
							<p className="label">Surface Water</p>
							<p className="value">
								{metrics.waterChange?.toLocaleString() || 0} gallons
							</p>
						</div>
						<div className="stat-con">
							<p className="label">Trees</p>
							<p className="value">
								{metrics.treeCount?.toLocaleString() || 0}
							</p>
						</div>
						<div className="stat-con">
							<p className="label">Surface Temperature</p>
							<p className="value">{metrics.temperature || 0}°F</p>
						</div>
					</div>

					<div className="column">
						<div className="stat-con">
							<p className="label">Wildlife</p>
							<p className="value total">{totalWildlife()} total animals</p>

							<p className="value">
								{wildlife.largeMammals || 0} large{" "}
								{pluralize(wildlife.largeMammals, "mammal")}
							</p>

							<p className="value">
								{wildlife.smallMammals
									? tile.locked
										? Math.floor(wildlife.smallMammals * 1.5)
										: wildlife.smallMammals
									: 0}{" "}
								small mammals {tile.locked ? "(+50%)" : null}
							</p>

							<p className="value">
								{version === "lwl" ? (
									<b>{wildlife.reptilesAndAmphibians || 0}</b>
								) : (
									`${wildlife.reptilesAndAmphibians || 0}`
								)}{" "}
								{version === "lwl" ? (
									<b>anole lizards</b>
								) : (
									"reptiles and amphibians"
								)}
							</p>

							<p className="value">{wildlife.birds || 0} birds</p>

							<p className="value">{wildlife.fish || 0} fish</p>
						</div>
					</div>
				</div>
			</div>

			<div className="footer">
				<RoundedButton
					text="Done"
					color="#fbb040"
					size={"small"}
					onClick={onClose}
				/>
			</div>
		</animated.div>
	);
};

export default React.memo(NaturePreserveModal);
