---
title: Charts
---

# Charts

<p class="description">The charts library you always wanted. Available in MIT and Commercial versions.</p>

The MUI charts are build using SVG elements and a lightweight dependency on d3.
Build your own charts using the decoupled, reusable React components avialable in the package.

## Overview

This is the set of charts available at this moment:

### Line Chart

{{"demo": "pages/components/charts/overview/LineChart.js"}}

```jsx
<LineChart {...chartProps}>
  <Grid disableX />
  <XAxis label="Year" />
  <YAxis label="Size" suffix="cm" />
  <Line series={0} stroke="red" fill="pink" label="Line 1" />
  <Line series={1} stroke="green" fill="linghtgreen" label="Line 2" />
  <Line series={2} stroke="blue" fill="lightblue" label="Line 3" />
  <Legend position="top" spacing={55} />
</LineChart>
```

Note that each part of the charts, the grid, the axises, the lines, the legend etc is defined as a component render as a children in the chart.
You can add/remove any part that you would not like to use, and you would not have that component in your bundle.

### Bar Charts

{{"demo": "pages/components/charts/overview/MultiBarChart.js"}}

{{"demo": "pages/components/charts/overview/BarChart.js"}}

### Scatter charts

{{"demo": "pages/components/charts/overview/ScatterChart.js"}}

For more details and demos, take a look on each chart's dedicated page.