import React from "react";
import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	Legend,
	ResponsiveContainer,
} from "recharts";
import useResourcesStore from "../../stores/resourcesStore";

const DynamicChart = ({
	metric,
	color = "#8884d8",
	title,
	xLabel = "Buildings and Green Modifications",
	yLabel,
}) => {
	const { getHistoricalData } = useResourcesStore();
	const data = getHistoricalData(metric);

	// Get the min and max from the data
	const minValue = Math.min(...data.map((item) => item.value));
	const maxValue = Math.max(...data.map((item) => item.value));

	// apply 10% padding
	const range = maxValue - minValue;
	const padding = range * 0.1;

	// Ensure min value never goes below 0
	const paddedMinValue = Math.max(0, Math.floor(minValue - padding));
	const paddedMaxValue = Math.ceil(maxValue + padding);

	const leftLabel = {
		wildlife: "Animal Population",
		trees: "No. of Trees",
		population: "Population",
	};

	const legendText = {
		wildlife: "Population",
		trees: "Trees",
		population: "Population",
	};

	const customLegend = (value, entry) => {
		return <span>{legendText[metric]}</span>;
	};

	return (
		<div style={{ width: "100%", height: 250 }}>
			<ResponsiveContainer>
				<LineChart
					data={data}
					margin={{
						top: 20,
						right: 30,
						left: 30,
						bottom: 15,
					}}
				>
					<CartesianGrid strokeDasharray="3 3" />
					<XAxis
						dataKey="index"
						label={{
							value: xLabel,
							position: "insideBottom",
							offset: -10,
						}}
					/>

					<YAxis
						dataKey="value"
						domain={[paddedMinValue, paddedMaxValue]}
						allowDecimals={false}
						label={{
							value: yLabel ? yLabel : `${leftLabel[metric]}`,
							angle: -90,
							position: "insideLeft",
							dy: yLabel ? 90 : 50,
							offset: -12,
						}}
					/>
					{/* <Legend
						verticalAlign="top"
						height={25}
						margin={{ bottom: 20 }}
						formatter={customLegend}
					/> */}
					<Line type="monotone" dataKey="value" stroke={color} dot={false} />
				</LineChart>
			</ResponsiveContainer>
		</div>
	);
};

export default DynamicChart;
