import Grid from '@mui/charts/Grid';
import Line from '@mui/charts/Line';
import LineChart from '@mui/charts/LineChart';
import XAxis from '@mui/charts/XAxis';
import YAxis from '@mui/charts/YAxis';
import * as React from 'react';

const lineData1 = [
  { x: new Date(2015, 0, 1), y: 4 },
  { x: new Date(2016, 0, 1), y: 14 },
  { x: new Date(2017, 0, 1), y: 36 },
  { x: new Date(2018, 0, 1), y: 38 },
  { x: new Date(2019, 0, 1), y: 54 },
  { x: new Date(2020, 0, 1), y: 47 },
  { x: new Date(2021, 0, 1), y: 70 },
];

export default function SmoothedLineChart() {
  return (
    <LineChart smoothed data={lineData1} xScaleType="time">
      <Grid />
      <XAxis />
      <YAxis suffix="kg" />
      <Line stroke="rgb(150,219,124)" markerShape="none" />
    </LineChart>
  );
}
