import React from 'react';
import * as d3 from 'd3';
import { blue } from '@mui/material/colors';
import PieChart from '@mui/charts/PieChart';

const labels = ['Ford', 'Tesla'];

function generateData() {
  return [0, 1].map((i) => ({
    value: Math.abs(d3.randomNormal()()),
    fill: blue[Object.keys(blue)[i + 1]],
    stroke: 'white',
    label: labels[i],
  }));
}

export default function DonutChart() {
  const data = generateData();

  return <PieChart data={data} innerRadius={90} innerLabel="Electric" />;
}
