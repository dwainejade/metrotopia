import { Smiley } from "phosphor-react";
import useStore from "../../stores/gridStore";
import useVersionStore from "../../stores/versionStore";
import useResourcesStore from "../../stores/resourcesStore";
import useAudioStore from "../../stores/audioStore";
import "../../styles/BottomRightUI.css";
import Tippy from "@tippyjs/react";
import AnimatedValue from "../../helpers/AnimatedValue";

// icons
import populationIcon from "../../assets/bottom-right/population.svg";
import natureIcon from "../../assets/bottom-right/nature.svg";
import wildlifeIcon from "../../assets/bottom-right/wildlife.svg";
import airIcon from "../../assets/bottom-right/air.svg";
import waterIcon from "../../assets/bottom-right/water.svg";
import thermometerIcon from "../../assets/ess/upper-right-menu/thermometer-white.svg";
import buildingIcon from "../../assets/top-right-menu/urbanization-inactive.svg";
import fundingIcon from "../../assets/top-right-menu/funding-active.svg";

// Corrected function
const calculateWildlifePercentPreserved = (wildlife) => {
	const wildlifePercentages = wildlife.percentPreservedByType;
	const totalPercentage = Object.values(wildlifePercentages).reduce(
		(sum, value) => sum + value,
		0
	);
	const averagePercentage =
		totalPercentage / Object.keys(wildlifePercentages).length;

	return averagePercentage;
};

const BottomRightUI = () => {
	const { current: version } = useVersionStore(); // Correctly destructured 'current'
	const { setSelectedTopRightMenuItem, selectedTopRightMenuItem } = useStore();
	const { resources, satisfaction, connectionPercentage, connectionTarget } =
		useResourcesStore();
	const { playSound } = useAudioStore();
	const airPollution = resources.pollution.air;
	const groundwaterPollution = resources.pollution.groundwater;

	// Helper functions to determine bar status (met/unmet)
	const isPopulationMet = () =>
		resources.population.total >= resources.population.target;

	const isSatisfactionMet = () =>
		(satisfaction?.score || 0) >= (satisfaction?.threshold || 0);

	const isTreesMet = () =>
		resources.trees.percentPreserved >= resources.trees.targetPreserved;

	const isWildlifeMet = () =>
		calculateWildlifePercentPreserved(resources.wildlife) >=
		resources.wildlife.targetPreservation;

	const isAirPollutionMet = () =>
		airPollution.current <= airPollution.threshold;

	const isWaterPollutionMet = () =>
		groundwaterPollution.current <= groundwaterPollution.threshold;

	const isBuildingConstructionMet = () =>
		resources.urbanization.totalBuildingCount >= 15;

	const isTaxesMet = () =>
		resources.taxes.sales + resources.taxes.income + resources.taxes.property >=
		resources.taxes.target;

	const getHeatIslandBarStyle = (currentTemp, startTemp) => {
		const tempDiff = currentTemp - startTemp;

		// only fill if temp difference is positive
		if (tempDiff <= 0) {
			return {
				width: "0%",
			};
		}

		// width as percentage of 10 (max range)
		const widthPercentage = Math.min((tempDiff / 6) * 100, 100);

		// color based on temperature difference
		const backgroundColor = tempDiff <= 3 ? "#99e4fb" : "rgb(255, 151, 113)";

		return {
			width: `${widthPercentage}%`,
			backgroundColor,
		};
	};

	const handleBarClick = (category) => {
		playSound("popUpSound2");
		if (selectedTopRightMenuItem === category) {
			setSelectedTopRightMenuItem(null);
			return;
		}
		setSelectedTopRightMenuItem(category);
	};

	// const [source, target] = useSingleton();

	return (
		<div className={`bottom-right-ui-wrapper ${version}`}>
			{/* <Tippy singleton={source} moveTransition="transform 0.2s ease-out" animation="shift-away-subtle" /> */}
			{/* Funds */}
			{version === "main" && (
				<>
					<Tippy content="Available Funds" animation="shift-away-subtle">
						<div
							className="funds-con"
							onClick={() => handleBarClick("funding and taxes")}
						>
							<div className="funding-data">
								<AnimatedValue
									value={resources.funds.current}
									type="currency"
								/>
							</div>
						</div>
					</Tippy>
					{/* Population */}
					<Tippy content="Current Population" animation="shift-away-subtle">
						<div
							className="population-con"
							onClick={() => handleBarClick("population stats")}
						>
							<img
								src={populationIcon}
								alt="Population Icon"
								className="icon"
							/>
							<div className="bar-con">
								<div
									className={`bar-filled population ${
										isPopulationMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${
											(resources.population.total /
												resources.population.target) *
											100
										}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue value={resources.population.total} />
								</div>
							</div>
						</div>
					</Tippy>
					{/* Satisfaction */}
					<Tippy
						content="Development Satisfaction"
						animation="shift-away-subtle"
					>
						<div
							className="satisfaction-con"
							onClick={() => handleBarClick("development stats")}
						>
							<Smiley
								weight="bold"
								size={20}
								color="#fafafa"
								className="icon"
								aria-label="Satisfaction Icon"
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled satisfaction ${
										isSatisfactionMet() ? "met" : "unmet"
									}`}
									style={{ width: `${satisfaction?.score}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue value={satisfaction?.score} precision={0} />%
								</div>
							</div>
						</div>
					</Tippy>
					{/* Trees */}
					<Tippy
						content="Percentage of Trees Preserved"
						animation="shift-away-subtle"
					>
						<div
							className="trees-con"
							onClick={() => handleBarClick("landscape stats")}
						>
							<img src={natureIcon} alt="Trees Icon" className="icon" />
							<div className="bar-con percent">
								<div
									className={`bar-filled trees ${
										isTreesMet() ? "met" : "unmet"
									}`}
									style={{ width: `${resources.trees.percentPreserved}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={resources.trees.percentPreserved}
										precision={1}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>
					{/* Wildlife */}
					<Tippy
						content="Percentage of Wildlife Preserved"
						animation="shift-away-subtle"
					>
						<div
							className="animals-con"
							onClick={() => handleBarClick("wildlife stats")}
						>
							<img src={wildlifeIcon} alt="Wildlife Icon" className="icon" />
							<div className="bar-con percent">
								<div
									className={`bar-filled animals ${
										isWildlifeMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${calculateWildlifePercentPreserved(
											resources.wildlife
										)}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={calculateWildlifePercentPreserved(
											resources.wildlife
										)}
										precision={1}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>
					{/* Air Pollution */}
					<Tippy content="Current Air Pollution" animation="shift-away-subtle">
						<div
							className="air-pollution-con"
							onClick={() => handleBarClick("air pollution stats")}
						>
							<img src={airIcon} alt="Air Pollution Icon" className="icon" />
							<div className="bar-con percent">
								<div
									className={`bar-filled air-pollution ${
										isAirPollutionMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${Math.min(
											(airPollution.current / airPollution.threshold) * 100,
											100
										)}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue value={airPollution.current} precision={1} />%
								</div>
							</div>
						</div>
					</Tippy>
					{/* Groundwater Pollution */}
					<Tippy
						content="Current Groundwater Contamination"
						animation="shift-away-subtle"
					>
						<div
							className="water-con"
							onClick={() => handleBarClick("water stats")}
						>
							<img
								src={waterIcon}
								alt="Groundwater Pollution Icon"
								className="icon"
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled water ${
										isWaterPollutionMet() ? "met" : "unmet"
									}`}
									style={{ width: `${groundwaterPollution.current}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={groundwaterPollution.current}
										precision={1}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>{" "}
				</>
			)}

			{version === "ess" && (
				// ESS Bottom Right
				<>
					<Tippy content="Available Funds" animation="shift-away-subtle">
						<div className="funds-con" style={{ cursor: "default" }}>
							<div className="funding-data">
								<AnimatedValue
									value={resources.funds.current}
									type="currency"
								/>
							</div>
						</div>
					</Tippy>
					{/* Population */}
					<Tippy content="Current Population" animation="shift-away-subtle">
						<div
							className="population-con"
							onClick={() => handleBarClick("population stats")}
						>
							<img
								src={populationIcon}
								alt="Population Icon"
								className="icon"
							/>
							<div className="bar-con">
								<div
									className={`bar-filled population ${
										isPopulationMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${
											(resources.population.total /
												resources.population.target) *
											100
										}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue value={resources.population.total} />
								</div>
							</div>
						</div>
					</Tippy>
					{/* Satisfaction */}
					<Tippy
						content="Development Satisfaction"
						animation="shift-away-subtle"
					>
						<div
							className="satisfaction-con"
							onClick={() => handleBarClick("development stats")}
						>
							<Smiley
								weight="bold"
								size={20}
								color="#fafafa"
								className="icon"
								aria-label="Satisfaction Icon"
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled satisfaction ${
										isSatisfactionMet() ? "met" : "unmet"
									}`}
									style={{ width: `${satisfaction?.score}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue value={satisfaction?.score} precision={0} />%
								</div>
							</div>
						</div>
					</Tippy>
					{/* Trees */}
					<Tippy
						content="Percentage of Trees Preserved"
						animation="shift-away-subtle"
					>
						<div
							className="trees-con"
							onClick={() => handleBarClick("temp and tree stats")}
						>
							<img src={natureIcon} alt="Trees Icon" className="icon" />
							<div className="bar-con percent">
								<div
									className={`bar-filled trees ${
										isTreesMet() ? "met" : "unmet"
									}`}
									style={{ width: `${resources.trees.percentPreserved}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={resources.trees.percentPreserved}
										precision={1}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>

					<Tippy content="Heat Island Effect" animation="shift-away-subtle">
						<div
							className="heat-island-con"
							onClick={() => handleBarClick("temp and tree stats")}
						>
							<img
								src={thermometerIcon}
								alt="Heat Island Icon"
								className="icon"
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled heat-island`}
									style={getHeatIslandBarStyle(
										resources.temperature.current,
										resources.temperature.starting
									)}
								/>
								<div className="bar-text">
									{resources.temperature.current -
										resources.temperature.starting >
									0
										? "+"
										: ""}
									<AnimatedValue
										value={
											resources.temperature.current -
											resources.temperature.starting
										}
										precision={2}
									/>
									°F
								</div>
							</div>
						</div>
					</Tippy>
				</>
			)}

			{version === "lwl" && (
				// ESS Bottom Right
				<>
					<Tippy content="Available Funds" animation="shift-away-subtle">
						<div className="funds-con" style={{ cursor: "default" }}>
							<div className="funding-data">
								<AnimatedValue
									value={resources.funds.current}
									type="currency"
								/>
							</div>
						</div>
					</Tippy>
					{/* Wildlife */}
					<Tippy
						content="Anole Lizards Preserved"
						animation="shift-away-subtle"
					>
						<div
							className="animals-con lwl"
							onClick={() => handleBarClick("anole lizard stats")}
						>
							<img src={wildlifeIcon} alt="Wildlife Icon" className="icon" />
							<div className="bar-con percent">
								<div
									className={`bar-filled animals ${
										isWildlifeMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${calculateWildlifePercentPreserved(
											resources.wildlife
										)}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={calculateWildlifePercentPreserved(
											resources.wildlife
										)}
										precision={1}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>

					{/* Building Constructed */}
					<Tippy content="Buidlings Constructed" animation="shift-away-subtle">
						<div
							className="construction-con lwl"
							onClick={() => handleBarClick("development stats")}
						>
							<img
								src={buildingIcon}
								alt="Building Icon"
								className="icon"
								style={{ filter: "brightness(0) invert(1)" }}
							/>

							<div className="bar-con percent">
								<div
									className={`bar-filled construction ${
										isBuildingConstructionMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${
											(resources.urbanization.totalBuildingCount / 15) * 100
										}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={
											(resources.urbanization.totalBuildingCount / 15) * 100
										}
										precision={0}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>

					{/* Satisfaction */}
					<Tippy
						content="Development Satisfaction"
						animation="shift-away-subtle"
					>
						<div
							className="satisfaction-con lwl"
							onClick={() => handleBarClick("development stats")}
						>
							<Smiley
								weight="bold"
								size={20}
								color="#fafafa"
								className="icon"
								aria-label="Satisfaction Icon"
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled satisfaction ${
										isSatisfactionMet() ? "met" : "unmet"
									}`}
									style={{ width: `${satisfaction?.score}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue value={satisfaction?.score} precision={0} />%
								</div>
							</div>
						</div>
					</Tippy>
				</>
			)}

			{version === "ee" && (
				// ESS Bottom Right
				<>
					<Tippy content="Available Funds" animation="shift-away-subtle">
						<div className="funds-con" style={{ cursor: "default" }}>
							<div className="funding-data">
								<AnimatedValue
									value={resources.funds.current}
									type="currency"
								/>
							</div>
						</div>
					</Tippy>
					{/* Population */}
					<Tippy content="Current Population" animation="shift-away-subtle">
						<div
							className="population-con ee"
							onClick={() => handleBarClick("population stats")}
						>
							<img
								src={populationIcon}
								alt="Population Icon"
								className="icon"
							/>
							<div className="bar-con">
								<div
									className={`bar-filled population ${
										isPopulationMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${
											(resources.population.total /
												resources.population.target) *
											100
										}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue value={resources.population.total} />
								</div>
							</div>
						</div>
					</Tippy>
					{/* Satisfaction */}
					<Tippy
						content="Development Satisfaction"
						animation="shift-away-subtle"
					>
						<div
							className="satisfaction-con ee"
							onClick={() => handleBarClick("development stats")}
						>
							<Smiley
								weight="bold"
								size={20}
								color="#fafafa"
								className="icon"
								aria-label="Satisfaction Icon"
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled satisfaction ${
										isSatisfactionMet() ? "met" : "unmet"
									}`}
									style={{ width: `${satisfaction?.score}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue value={satisfaction?.score} precision={0} />%
								</div>
							</div>
						</div>
					</Tippy>
					{/* Connections */}
					<Tippy content="Zoning Connections" animation="shift-away-subtle">
						<div
							className="connections-con ee"
							onClick={() => handleBarClick("temp and tree stats")}
						>
							<img
								src={buildingIcon}
								alt="Building Icon"
								className="icon"
								style={{ filter: "brightness(0) invert(1)" }}
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled trees ${
										connectionPercentage === 100 ? "met" : "unmet"
									}`}
									style={{ width: `${connectionPercentage || 0}%` }}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={connectionPercentage || 0}
										precision={1}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>
					{/* Tax Revenue */}
					<Tippy content="Tax Revenue" animation="shift-away-subtle">
						<div
							className="taxes-con ee"
							onClick={() => handleBarClick("temp and tree stats")}
						>
							<img
								src={fundingIcon}
								alt="Funding Icon"
								className="icon"
								style={{ filter: "brightness(0) invert(1)" }}
							/>
							<div className="bar-con percent">
								<div
									className={`bar-filled trees ${
										isTaxesMet() ? "met" : "unmet"
									}`}
									style={{
										width: `${
											((resources.taxes.sales +
												resources.taxes.income +
												resources.taxes.property) /
												resources.taxes.target) *
											100
										}%`,
									}}
								/>
								<div className="bar-text">
									<AnimatedValue
										value={
											((resources.taxes.sales +
												resources.taxes.income +
												resources.taxes.property) /
												resources.taxes.target) *
											100
										}
										precision={1}
									/>
									%
								</div>
							</div>
						</div>
					</Tippy>
				</>
			)}
		</div>
	);
};

export default BottomRightUI;
