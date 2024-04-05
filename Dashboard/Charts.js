import React from 'react';
import { Bar } from 'react-chartjs-2';
import '../styles/App.css';
import { Chart, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

Chart.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


const Charts = ({ dataList }) => {

    //Check if dataList is defined and not empty
    if (!dataList || dataList.length === 0) {
        return <div>No data available!</div>;
    }

    //Calculate domain distribution
    const domainDistribution = {};
    dataList.forEach((record) => {
        //Check if the 'name' property exists and is in the expected format
        if (record.name && record.name.includes('.')) {
            //Extract domain from the name using regex
            const domain = record.name.split('.')[1];
            if (domain) {
                if (domainDistribution[domain]) {
                    domainDistribution[domain]++;
                } else {
                    domainDistribution[domain] = 1;
                }
            }
        }
    });

    //Calculate record type distribution
    const typeDistribution = {};
    dataList.forEach((record) => {
        const type = record.type;
        if (typeDistribution[type]) {
            typeDistribution[type]++;
        } else {
            typeDistribution[type] = 1;
        }
    });

    //Chart data for domain distribution
    const domainChartData = {
        labels: Object.keys(domainDistribution),
        datasets: [
            {
                label: 'Domain Distribution',
                data: Object.values(domainDistribution),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            },
        ],
    };

    //Chart data for type distribution
    const typeChartData = {
        labels: Object.keys(typeDistribution),
        datasets: [
            {
                label: 'Type Distribution',
                data: Object.values(typeDistribution),
                backgroundColor: 'rgba(255, 99, 132, 0.2)',
                borderColor: 'rgba(255, 99, 132, 1)',
                borderWidth: 1,
            },
        ],
    };

    //Chart options with explicit scale type
    const options = {
        scales: {
            x: {
                type: 'category', // explicitly specifying category scale type.
                ticks: {
                    color: 'rgba(0, 0, 0, 0.7)', // Customize tick color
                },
            },
            y: {
                ticks: {
                    color: 'rgba(0, 0, 0, 0.7)', // Customize tick color
                },
            },
        },
        plugins: {
            legend: {
                labels: {
                    color: 'rgba(0, 0, 0, 0.7)', // Customize legend label color
                },
            },
        },
    };

    return (
        <div  >
            <h2>Domain Distribution</h2>
            <Bar data={domainChartData} options={options} />
            <h2>Type Distribution</h2>
            <Bar data={typeChartData} options={options} />
        </div>
    );
};

export default Charts;