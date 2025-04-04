import React from "react";
import AnimatedValue from "../../helpers/AnimatedValue";

const LizardDetails = ({ wildlife }) => {
	const lizardsPreserved =
		wildlife.startingReptilesAndAmphibians > 0
			? (wildlife.currentReptilesAndAmphibians /
					wildlife.startingReptilesAndAmphibians) *
			  100
			: 100;
	return (
		<div className="bottom-categories wildlife-stats">
			<div className="bottom-checklist wildlife">
				<p>
					<span className="category-label lwl">
						Current Anole Lizards Population:{" "}
					</span>
					<AnimatedValue
						value={Math.max(0, wildlife.startingReptilesAndAmphibians || 0)}
						type="stat"
					/>{" "}
					lizards
				</p>
				<p>
					<span className="category-label lwl">
						Starting Anole Lizards Population:{" "}
					</span>
					<AnimatedValue
						value={Math.max(0, wildlife.currentReptilesAndAmphibians || 0)}
						type="stat"
					/>{" "}
					lizards
				</p>
				<p>
					<span className="category-label lwl">
						Percentage of Anole Lizards Preserved:
					</span>{" "}
					<AnimatedValue value={lizardsPreserved || 0} precision={1} />%
				</p>
			</div>
		</div>
	);
};

export default LizardDetails;
