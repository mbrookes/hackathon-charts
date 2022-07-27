import React from 'react';
import type { IData, IGroupedData } from './types';

import { BarChart } from './BarChart';
import { GroupedBarChart } from './GroupedBarChart';
import { StackedBarChart } from './StackedBarChart';
import './styles.css';

const BAR_CHART_DATA: IData[] = [
  { label: 'Apples', value: 100 },
  { label: 'Bananas', value: 200 },
  { label: 'Oranges', value: 50 },
  { label: 'Kiwis', value: 150 },
];

const GROUPED_BAR_CHART_DATA: IGroupedData[] = [
  { label: 'Apples', values: [60, 80, 100] },
  { label: 'Bananas', values: [160, 200, 120] },
  { label: 'Oranges', values: [60, 40, 10] },
];

export default function App() {
  return (
    <div className="container">
      <h1>
        <span>React and D3 examples </span>
        <span role="img" aria-label="Index pointing down emoji">
          👇
        </span>
      </h1>
      <section>
        <h2>Bar chart</h2>
        <BarChart data={BAR_CHART_DATA} />
      </section>
      <section>
        <h2>Grouped bar chart with tooltip</h2>
        <GroupedBarChart data={GROUPED_BAR_CHART_DATA} />
      </section>
      <section>
        <h2>Stacked bar chart</h2>
        <StackedBarChart data={GROUPED_BAR_CHART_DATA} />
      </section>
    </div>
  );
}
