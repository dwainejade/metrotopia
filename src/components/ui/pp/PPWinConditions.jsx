import React from "react";
import { Check, X } from "phosphor-react";
import useStore from "@src/stores/gridStore";
import useAudioStore from "@src/stores/audioStore";

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
					Target:{" "}
					{isPercentage ? `${sign} ${target}%` : formatNumber(target)}
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
			label: "Population",
			current: resources.population.total,
			target: resources.population.target,
			isMet: resources.population.total >= resources.population.target,
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
		{
			label: "Tree Preservation",
			current: resources.trees.percentPreserved,
			target: resources.trees.targetPreserved,
			isMet:
				resources.trees.percentPreserved >= resources.trees.targetPreserved,
			isPercentage: true,
			sign: "≥",
		},
		{
			label: "Wildlife Preservation",
			current: wildlifePreserved,
			target: resources.wildlife.targetPreservation,
			isMet: wildlifePreserved >= resources.wildlife.targetPreservation,
			isPercentage: true,
			sign: "≥",
		},
		{
			label: "Air Pollution",
			current: resources.pollution.air.current,
			target: resources.pollution.air.threshold,
			isMet:
				resources.pollution.air.current <= resources.pollution.air.threshold,
			isPercentage: true,
			sign: "≤",
		}
	];

	return (
		<div className="win-conditions-container">
			<div className="bottom-checklist">
				<div>
					<h4>Primary Goal</h4>
					<div className="primary-goals">
						{conditions.map((condition) => {
							return (
								condition.label === "Population" && (
									<ConditionItem
										key={condition.label}
										{...condition}
										setExpandedMenu={setSelectedTopRightMenuItem}
									/>
								)
							);
						})}
						<p className="population-goal-note">
							Reach the population goal before running out of funding.
						</p>
					</div>
				</div>
				<div>
					<h4 className="secondary-title">Secondary Goals</h4>
					<div className="secondary-goals">
						{conditions.map((condition) => {
							return (
								condition.label !== "Population" && (
									<ConditionItem
										key={condition.label}
										{...condition}
										setExpandedMenu={setSelectedTopRightMenuItem}
									/>
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
