import React from "react";
import { Check, X } from "phosphor-react";
import useStore from "../../stores/lwlGridStore";
import useAudioStore from "../../stores/audioStore";

const calculateWildlifePercentPreserved = (wildlife) => {
	const wildlifePercentages = wildlife.percentPreservedByType;
	const totalPercentage = Object.values(wildlifePercentages).reduce(
		(sum, value) => sum + value,
		0
	);
	return totalPercentage / Object.keys(wildlifePercentages).length;
};

const getTabName = (label) => {
	switch (label) {
		case "Population":
			return "population stats";
		case "Development Satisfaction":
			return "development stats";
		case "Tree Preservation":
			return "landscape stats";
		case "Wildlife Preservation":
			return "wildlife stats";
		case "Air Pollution":
			return "air pollution stats";
		case "Groundwater Pollution":
			return "water stats";
		default:
			return "win conditions";
	}
};

const ConditionItem = ({
	label,
	current,
	target,
	isMet,
	isPercentage = false,
	sign,
	setExpandedMenu,
}) => {
	const handleClick = () => {
		setExpandedMenu(getTabName(label));
		useAudioStore.getState().playSound("popUpSound2");
	};

	const formatNumber = (value) => {
		return value.toLocaleString();
	};

	return (
		<div className={`condition-item ${label}`} onClick={handleClick}>
			<span className="condition-icon">
				{isMet ? (
					<Check size={24} color="green" aria-label="Condition Met" />
				) : (
					<X size={24} color="#eb0000" aria-label="Condition Not Met" />
				)}
			</span>
			<div className="condition-details">
				<p className="condition-label">{label}</p>
				<p className="condition-values">
					Current:{" "}
					{isPercentage ? `${current.toFixed(1)}%` : formatNumber(current)} /{" "}
					Target: {isPercentage ? `${sign} ${target}%` : formatNumber(target)}
				</p>
			</div>
		</div>
	);
};

const WinConditionDetails = ({ resources, satisfaction, setExpandedMenu }) => {
	const wildlifePreserved = calculateWildlifePercentPreserved(
		resources.wildlife
	);
	const { setSelectedTopRightMenuItem } = useStore();

	const conditions = [
		{
			label: "Anole Lizard Preservation",
			current: wildlifePreserved,
			target: resources.wildlife.targetPreservation,
			isMet: wildlifePreserved >= resources.wildlife.targetPreservation,
			isPercentage: true,
			sign: "≥",
		},

		{
			label: "Buildings Constructed",
			current: `${resources.urbanization.totalBuildingCount || 0} ${
				resources.urbanization.totalBuildingCount === 1
					? "building"
					: "buildings"
			}`,
			target: `${resources.urbanization.buildingCountTarget} buildings`,
			isMet:
				(resources.urbanization.totalBuildingCount || 0) >=
				resources.urbanization.buildingCountTarget,
			isPercentage: false,
			sign: "≥",
		},
		{
			label: "Development Satisfaction",
			current: satisfaction?.score || 0,
			target: satisfaction?.threshold || 0,
			isMet: (satisfaction?.score || 0) >= (satisfaction?.threshold || 0),
			isPercentage: true,
			sign: "≥",
		},
	];

	return (
		<div className="win-conditions-container">
			<div className="bottom-checklist">
				<div>
					<h4>Primary Goal</h4>
					<div className="primary-goals">
						{conditions.map((condition) => {
							return (
								condition.label === "Anole Lizard Preservation" && (
									<ConditionItem
										key={condition.label}
										{...condition}
										setExpandedMenu={setSelectedTopRightMenuItem}
									/>
								)
							);
						})}
						<p className="population-goal-note">
							Try to build more protective buildings in locations with lower
							anole lizard populations.
						</p>
					</div>
				</div>
				<div>
					<h4 className="secondary-title">Secondary Goals</h4>
					<div className="secondary-goals">
						{conditions.map((condition) => {
							return (
								condition.label !== "Anole Lizard Preservation" && (
									<React.Fragment key={condition.label}>
										<ConditionItem
											{...condition}
											setExpandedMenu={setSelectedTopRightMenuItem}
										/>
										{condition.label === "Buildings Constructed" && (
											<p className="secondary-goal-note">
												The game ends once you build all 15 buildings!
											</p>
										)}
									</React.Fragment>
								)
							);
						})}
						<p className="secondary-goal-note">
							Make sure you’re winning in all these areas when you reach your
							population goal.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WinConditionDetails;
