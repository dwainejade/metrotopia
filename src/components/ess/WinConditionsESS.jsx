import { Check, X } from "phosphor-react";
import useStore from "../../stores/gridStore";
import useAudioStore from "../../stores/audioStore";

const getTabName = (label) => {
	switch (label) {
		case "Population":
			return "population stats";
		case "Development Satisfaction":
			return "development stats";
		case "Tree Preservation":
			return "temp and tree stats";
		case "Heat Island Effect":
			return "temp and tree stats";
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
	isTemperature = false,
	sign,
	setExpandedMenu,
}) => {
	const handleClick = () => {
		setExpandedMenu(getTabName(label));
		useAudioStore.getState().playSound("popUpSound2");
	};

	const formatNumber = (value) => {
		if (isTemperature) {
			const prefix = value > 0 ? "+" : "";
			return `${prefix}${value.toFixed(1)}°F`;
		}
		return isPercentage ? `${value.toFixed(1)}%` : value.toLocaleString();
	};

	const formatTarget = () => {
		if (isTemperature) {
			return `${sign} +${target}°F`;
		}
		return `${sign} ${formatNumber(target)}`;
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
					Current: {formatNumber(current)} / Target: {formatTarget()}
				</p>
			</div>
		</div>
	);
};

const WinConditionDetails = ({ resources, satisfaction, setExpandedMenu }) => {
	const { setSelectedTopRightMenuItem } = useStore();

	const conditions = [
		{
			label: "Heat Island Effect",
			current: resources.temperature.current - resources.temperature.starting,
			target: resources.temperature.heatIslandMax,
			isMet:
				resources.temperature.current - resources.temperature.starting <=
				resources.temperature.heatIslandMax,
			isTemperature: true,
			sign: "≤",
		},
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
	];

	return (
		<div className="win-conditions-container">
			<div className="bottom-checklist">
				<div>
					<h4>Primary Goal</h4>
					<div className="primary-goals">
						{conditions.map((condition) => {
							return (
								condition.label === "Heat Island Effect" && (
									<ConditionItem
										key={condition.label}
										{...condition}
										setExpandedMenu={setSelectedTopRightMenuItem}
									/>
								)
							);
						})}
						<p className="secondary-goal-note">
							Keep the heat island effect at or under the maximum target value.
						</p>
					</div>
				</div>

				<div>
					<h4 className="secondary-title">Secondary Goals</h4>
					<div className="secondary-goals">
						{conditions.map((condition) => {
							return (
								condition.label !== "Heat Island Effect" && (
									<ConditionItem
										key={condition.label}
										{...condition}
										setExpandedMenu={setSelectedTopRightMenuItem}
									/>
								)
							);
						})}
						<p className="secondary-goal-note">
							Make sure you're meeting all these goals while addressing the heat
							island effect.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default WinConditionDetails;
