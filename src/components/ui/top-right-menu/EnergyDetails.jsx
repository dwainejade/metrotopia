import { powerModMapping } from "../../../data/modMappings";

// to be used for clickable energy types in menu
const clickableEnergyTypes = [
	"nuclear",
	"coal",
	"hydroelectric",
	"natural gas",
	"solar",
	"wind",
];

const EnergyDetails = ({
	energy,
	handleSelectEnergyType,
	selectedEnergyType,
}) => (
	<div className="bottom-categories energy">
		<div className="top-category-details">
			<p>
				<span className="category-label">Total Parcels Using Power:</span>
				<span> {energy.totalUsage}</span>
			</p>
		</div>
		<div className="bottom-checklist energy">
			<>
				{Object.entries(energy.usage).map(([type, amount]) => {
					// const tooltipContent = `Show buildings using ${type} power`;
					return (
						// <Tooltip
						//     key={type}
						//     title={tooltipContent}
						//     position="top"
						//     arrow={true} // Adds an arrow to the tooltip
						//     animation="scale" // Optional, you can customize the animation
						// >
						<p
							key={type}
							onClick={() => handleSelectEnergyType(type)}
							style={
								selectedEnergyType === type
									? { backgroundColor: "#fbb040" }
									: {}
							}
							className={clickableEnergyTypes.includes(type) ? "clickable" : ""}
						>
							<span className="bottom-label">{powerModMapping[type]}</span>{" "}
							<span>{amount} parcels</span>
						</p>
						// </Tooltip>
					);
				})}
			</>
		</div>
		<p className="bottom-energy-note">
			Click each energy type to see all connected buildings.
		</p>
	</div>
);

export default EnergyDetails;
