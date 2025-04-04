import React from "react";
import {
	PieChart,
	Pie,
	Cell,
	ResponsiveContainer,
	Legend,
	Tooltip,
} from "recharts";
import useResourcesStore from "../../stores/resourcesStore";
import AnimatedValue from "../../helpers/AnimatedValue";

const UrbanizationPieChart = ({ title, satisfaction }) => {
	const { resources } = useResourcesStore();
	const { urbanization } = resources;

	if (!urbanization || !urbanization.parcels) {
		return <div>No data available for urbanization</div>;
	}

	const { residential, commercial, industrial, services, preserved } =
		urbanization.parcels;
	const total = residential + commercial + industrial + services;

	// Define color mapping and ideal ranges
	const categories = [
		{ name: "Residential", color: "#4d6034", target: "30%–50%" },
		{ name: "Commercial", color: "#5a72ad", target: "20%–40%" },
		{ name: "Services", color: "#b79172", target: "10%–30%" },
		{ name: "Industrial", color: "#7f5f91", target: "5%–15%" },
	];

	const CustomLegend = ({ payload }) => {
		return (
			<ul style={{ listStyle: "none", padding: 0 }}>
				{categories.map((category, index) => {
					const entry = payload?.find((p) => p.value === category.name) || {
						payload: category,
					};
					return (
						<li key={`item-${index}`} style={{ marginBottom: "10px" }}>
							<div style={{ display: "flex", alignItems: "center" }}>
								<div
									style={{
										width: "12px",
										height: "12px",
										backgroundColor: category.color,
										marginRight: "6px",
									}}
								/>
								<span>{category.name}</span>
							</div>
							<div
								style={{ marginLeft: "20px", fontSize: "0.9em", color: "#555" }}
							>
								Ideal: {category.target}
							</div>
						</li>
					);
				})}
			</ul>
		);
	};

	// Check if all parcels are preserved
	if (preserved === 100) {
		return (
			<div className="urbanization-pie-chart">
				<div className="top-category-details">
					<p>
						<span className="category-label">Development Satisfaction: </span>
						<AnimatedValue value={satisfaction.score} precision={0} />%
					</p>
				</div>
				<ResponsiveContainer width="100%" height={250}>
					<PieChart>
						<foreignObject x="1%" y="40%" width="200" height="100">
							<div
								style={{
									width: "100%",
									textAlign: "center",
									color: "#666",
									fontSize: "18px",
								}}
							>
								No buildings have been built yet.
							</div>
						</foreignObject>
						<Legend
							content={<CustomLegend />}
							layout="vertical"
							align="right"
							verticalAlign="middle"
						/>
					</PieChart>
				</ResponsiveContainer>
			</div>
		);
	}

	const pieData = categories.map((category) => ({
		name: category.name,
		value: urbanization.parcels[category.name.toLowerCase()] || 0,
		color: category.color,
		target: category.target,
		percentage: (
			((urbanization.parcels[category.name.toLowerCase()] || 0) / total) *
			100
		).toFixed(1),
	}));

	const renderCustomizedLabel = ({
		cx,
		cy,
		midAngle,
		innerRadius,
		outerRadius,
		percent,
	}) => {
		if (percent === 0) return null;
		const RADIAN = Math.PI / 180;
		const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
		const x = cx + radius * Math.cos(-midAngle * RADIAN);
		const y = cy + radius * Math.sin(-midAngle * RADIAN);

		return (
			<text
				x={x}
				y={y}
				fill="white"
				textAnchor="middle"
				dominantBaseline="central"
			>
				{`${(percent * 100).toFixed(1)}%`}
			</text>
		);
	};

	return (
		<div className="urbanization-pie-chart">
			<div className="top-category-details">
				<p>
					<span className="category-label">Development Satisfaction: </span>
					<AnimatedValue value={satisfaction.score} precision={0} />%
				</p>
			</div>
			<ResponsiveContainer width="100%" height={250}>
				<PieChart>
					<Pie
						data={pieData}
						dataKey="value"
						nameKey="name"
						cx="45%"
						cy="50%"
						innerRadius={30}
						outerRadius={90}
						fill="#82ca9d"
						labelLine={false}
						label={renderCustomizedLabel}
					>
						{pieData.map((entry, index) => (
							<Cell key={`cell-${index}`} fill={entry.color} />
						))}
					</Pie>
					<Tooltip
						contentStyle={{
							backgroundColor: "#333",
							padding: "5px 8px",
							border: "none",
							borderRadius: "4px",
						}}
						itemStyle={{ color: "#fff" }}
						formatter={(value, name, props) => [
							`${props?.payload?.value} parcels`,
							name,
						]}
					/>
					<Legend
						content={<CustomLegend />}
						layout="vertical"
						align="right"
						verticalAlign="middle"
					/>
				</PieChart>
			</ResponsiveContainer>
		</div>
	);
};

export default UrbanizationPieChart;
