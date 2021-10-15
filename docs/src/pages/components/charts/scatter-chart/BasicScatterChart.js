import * as React from 'react';
import ScatterChart from '@mui/charts/ScatterChart';
import Scatter from '@mui/charts/Scatter';
import XAxis from '@mui/charts/XAxis';
import YAxis from '@mui/charts/YAxis';
import Grid from '@mui/charts/Grid';

const generateDataset = (xDomain, yDomain, zDomain) =>
  Array(20)
    .fill(0)
    .map(() => ({
      x: Math.random() * (xDomain[1] - xDomain[0]) + xDomain[0],
      y: Math.random() * (yDomain[1] - yDomain[0]) + yDomain[0],
      z: Math.random() * (zDomain[1] - zDomain[0]) + zDomain[0],
    }));

export default function MultiScatterChart() {
  return (
    <ScatterChart data={generateDataset([0, 20], [0, 50], [0, 5])}>
      <Grid zeroStrokeDasharray="0" />
      <Scatter fill="rgba(255,80,150,.5)" minSize={100} maxSize={100} />
      <XAxis suffix="cm" disableTicks />
      <YAxis suffix="kg" disableTicks />
    </ScatterChart>
  );
}
