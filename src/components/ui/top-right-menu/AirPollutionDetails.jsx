import AnimatedValue from "../../../helpers/AnimatedValue";

const AirPollutionDetails = ({ pollution, traffic }) => {
	return (
		<div className="bottom-categories pollution">
			<div className="top-category-details">
				<p>
					<span className="category-label">Starting Air Pollution: </span>
					<span>
						<AnimatedValue value={pollution.air.start} precision={2} />%
					</span>
				</p>
				<p>
					<span className="category-label">Current Air Pollution: </span>
					<span>
						<AnimatedValue value={pollution.air.current} precision={2} />%
					</span>
				</p>
			</div>
			<div className="bottom-checklist pollution">
				<p>
					<span className="bottom-label">Carbon Emissions from Vehicles</span>{" "}
					<span>
						<AnimatedValue
							value={pollution.air.breakdown?.cars || 0}
							precision={2}
						/>
						%
					</span>
				</p>
				<p>
					<span className="bottom-label">Number of Vehicles in Use</span>{" "}
					<AnimatedValue value={traffic.totalCars} precision={0} />
				</p>
				<p>
					<span className="bottom-label">
						Carbon Emissions from Energy
					</span>{" "}
					<span>
						<AnimatedValue
							value={pollution.air.breakdown?.power || 0}
							precision={2}
						/>
						%
					</span>
				</p>
				<p>
					<span className="bottom-label">Carbon Emissions from Buildings</span>{" "}
					<span>
						<AnimatedValue
							value={pollution.air.breakdown?.structure || 0}
							precision={2}
						/>
						%
					</span>
				</p>

				<p className="pollution-note">
					Note: Wind and solar energy are carbon neutral. Hydroelectric,
					nuclear, natural gas, and coal produce increasingly more carbon
					emissions, in that order.
				</p>
			</div>
		</div>
	);
};

export default AirPollutionDetails;
