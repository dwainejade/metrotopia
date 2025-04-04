import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import useResourcesStore from '../../stores/resourcesStore';

const UrbanizationChart = ({ title }) => {
    const { resources } = useResourcesStore();
    const { urbanization } = resources;

    if (!urbanization || !urbanization.parcels) {
        return <div>No data available for urbanization</div>;
    }

    const { residential, commercial, industrial, services } = urbanization.parcels;

    const colorMap = {
        Residential: '#4d6034',
        Commercial: '#5a72ad',
        Services: '#b79172',
        Industrial: '#7f5f91'
    };

    const chartData = [
        { name: 'Residential', value: residential, fill: colorMap.Residential },
        { name: 'Commercial', value: commercial, fill: colorMap.Commercial },
        { name: 'Industrial', value: industrial, fill: colorMap.Industrial },
        { name: 'Services', value: services, fill: colorMap.Services },
    ];

    return (
        <div>
            <ResponsiveContainer width="100%" height={250}>
                <RadialBarChart
                    cx="30%"
                    cy="50%"
                    innerRadius="20%"
                    outerRadius="90%"
                    barSize={20}
                    data={chartData}
                    startAngle={90}
                    endAngle={-270}
                >
                    <RadialBar
                        minAngle={15}
                        label={{ position: 'insideStart', fill: '#fff' }}
                        background
                        clockWise
                        dataKey="value"
                    />
                    <Tooltip />
                    <Legend iconSize={10} width={120} height={100} layout='vertical' verticalAlign='middle' align="right" />
                </RadialBarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default UrbanizationChart;