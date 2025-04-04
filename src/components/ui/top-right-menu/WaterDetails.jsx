const WaterDetails = ({ resources }) => {
	const water = resources.water;
	const pollution = resources.pollution;
	const urbanization = resources.urbanization;
	const wastewaterTreatment = urbanization.connectionMods.waste['wastewater treatment facility'];
	const septicSystems = urbanization.parcels.urbanized - urbanization.connectionMods.waste['wastewater treatment facility'];

	return (
		<div className="bottom-categories water">
			<div className="top-category-details">
				<p>
					<span className="category-label">Current Groundwater Pollution:</span>
					<span> {pollution.groundwater.current.toFixed(1)}%</span>
				</p>
			</div>
			<div className="bottom-checklist water">
				<p>
					<span className="bottom-label">Starting Groundwater Pollution</span>
					{pollution.groundwater.start.toFixed(1)}%
				</p>
				<p>
					<span className="bottom-label">Total Available Groundwater</span>{" "}
					{water.groundwater.total.toLocaleString() || 0} gallons
				</p>
				<p>
					<span className="bottom-label">
						Parcels Connected to Wastewater Treatment:
					</span>
					<span>{wastewaterTreatment}</span>
				</p>
				<p>
					<span className="bottom-label">
						Parcels Connected to Septic Systems:
					</span>
					<span>{septicSystems}</span>
				</p>
				<p>
					<span className="bottom-label">
						Starting Surface Water (Ponds and Streams):
					</span>{" "}
					{water.surface.start?.toLocaleString() || 0} gallons
				</p>
				<p>
					<span className="bottom-label">
						Surface Water Lost to Development:
					</span>{" "}
					{water.surface.lost.toLocaleString() || 0} gallons
				</p>
			</div>
		</div>
	);
};

export default WaterDetails;
