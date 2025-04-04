import React from "react";
import AnimatedValue from "../../../helpers/AnimatedValue";

const PopulationDetails = ({ population }) => (
	<div className="bottom-categories population-stats">
		<div className="top-category-details">
			<p>
				<span className="category-label">Current Population:</span>{" "}
				<AnimatedValue value={population.total} /> people
			</p>
		</div>
		<div className="bottom-checklist population">
			<p>
				<span className="bottom-label">Single-Family Homes</span>{" "}
				<span>
					<AnimatedValue value={population.breakdown.singleFamilyHomes} />{" "}
					people
				</span>
			</p>
			<p>
				<span className="bottom-label">Apartments</span>{" "}
				<span>
					<AnimatedValue value={population.breakdown.apartmentComplex} /> people
				</span>
			</p>
			<p>
				<span className="bottom-label">Target Population</span>{" "}
				<span>
					<AnimatedValue value={population.target} /> people
				</span>
			</p>
			{/* <p>
				<span className="bottom-label">Current Population</span>
				<AnimatedValue value={population.target} />
			</p> */}
		</div>
	</div>
);

export default PopulationDetails;
