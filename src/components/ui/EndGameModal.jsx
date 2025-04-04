import "../../styles/ResetModal.css";
import RoundedButton from "./RoundedButton";
import useGridStore from "../../stores/gridStore";
import useVersionStore from "../../stores/versionStore";

const GameContent = {
	lose: {
		title: "BETTER LUCK NEXT TIME!",
		content: (
			<div>
				<p>
					Unfortunately, while you reached your target population, you did not
					hit your wildlife conservation goals.
				</p>
				<p>Please try again in a new scenario!</p>
			</div>
		),
	},
	win: {
		title: "WELL DONE!",
		content: (
			<div>
				You've met the population goals while preserving as much natural habitat
				as possible.
			</div>
		),
	},
};

const EndGameModal = ({ gameWon, gameLost, reason, onClose }) => {
	const { current: version } = useVersionStore();
	const { setScreen, endModalReason } = useGridStore();

	const handleResetGame = () => {
		setScreen("start");
	};

	return (
		<div className="modal-wrapper">
			<div className="modal">
				<div className="modal-header">
					<h2>{gameWon ? "WELL DONE!" : "GAME OVER"}</h2>
				</div>

				<div className="modal-content">
					{gameWon ? (
						<>
							{version === "lwl" && (
								<p>
									You successfully rebuilt after the hurricane while protecting
									the anole lizard population. Nice work!
								</p>
							)}
							{(version === "pp" || version === "ee") && (
								<p>
									You succeeded in following the government’s environmental
									policies while adhering to zoning laws. Nice work!
								</p>
							)}
							{(version === "main" || version === "ess") && (
								<p>
									You've successfully balanced urban development with
									environmental preservation!
								</p>
							)}
						</>
					) : (
						<>
							<p>
								{endModalReason === "insufficientFunds"
									? "Unfortunately, you have run out of funds to build your city, and you had not yet reached your goals."
									: "You've reached the population target, but failed to meet other environmental goals:"}
								{endModalReason === "treesNotPreserved" &&
									" Tree preservation goal not met."}
								{endModalReason === "wildlifeNotPreserved" &&
									version !== "lwl" &&
									" Wildlife preservation goal not met."}
								{endModalReason === "wildlifeNotPreserved" &&
									version === "lwl" &&
									" Lizard preservation goal not met."}
								{endModalReason === "airPollutionTooHigh" &&
									" Air pollution exceeded acceptable levels."}
								{endModalReason === "groundwaterPollutionTooHigh" &&
									" Groundwater pollution exceeded acceptable levels."}
								{endModalReason === "lowSatisfaction" &&
									" Citizen satisfaction was too low."}
								{endModalReason === "lizardsPreserved" &&
									" Lizard preservation goal not met."}
								{endModalReason === "insufficientConnections" &&
									" Didn't make enough connections with retail centers."}
								{endModalReason === "insufficientTaxRevenue" &&
									" Didn't make enough tax revenue."}
							</p>
							{!gameWon && <p>Please try again in a new scenario!</p>}
						</>
					)}
				</div>

				<footer className="modal-footer">
					{/* {type === "lose" ? (
						<RoundedButton
							text="Start Over"
							color="#4a6537"
							size={"large"}
							onClick={handleResetGame}
						/>
					) : ( */}
					<>
						<RoundedButton
							text="Start Over"
							color="#4a6537"
							size={"large"}
							onClick={handleResetGame}
						/>
						<RoundedButton
							text="Keep Building"
							color="#78AAA1"
							size={"large"}
							onClick={onClose}
						/>
					</>
					{/* )} */}
				</footer>
			</div>
		</div>
	);
};

export default EndGameModal;
