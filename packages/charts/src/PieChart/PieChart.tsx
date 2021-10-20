import React, { useState, useEffect } from 'react';
import * as d3 from 'd3';
import { useForkRef } from '@mui/material/utils';
import useChartDimensions from '../hooks/useChartDimensions';
import PieSegment from '../PieSegment';
import { stringRatioToNumber } from '../utils';

interface ChartData {
  value: number;
  label: string;
  fill: string;
}

interface Margin {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}

function ascending(a, b) {
  return a.value - b.value;
}

function descending(a, b) {
  return b.value - a.value;
}
export interface PieChartProps {
  /**
   * Radius of the segment corners.
   * @default 0
   */
  cornerRadius?: number;
  /**
   * The data to use for the chart.
   */
  data: ChartData[];
  /**
   * The angle to end the chart. Useful for making guages in conjunction with the `innerRadius` prop.
   */
  endAngle?: number;
  /**
   * If true, the segment will expand when hovered
   * @default false
   */
  expandOnHover?: boolean;
  /**
   * Background fill color for the chart. Typically used when creating a guage.
   */
  fill?: string;
  /**
   * The height of the chart.
   */
  height?: number;
  /**
   * The label to place at the center of the chart. Typically used with `innerRadius` to create a gauge.
   */
  innerLabel?: string;
  /**
   * The color of the inner label.
   * @default 'currentColor'
   */
  innerLabelColor?: string;
  /**
   * The font size of the inner label.
   * @default 24
   */
  innerLabelFontSize?: number;
  /**
   * The radius at which to start the inside of the segment as a percentage of the outer radius.
   * @default 0
   */
  innerRadiusPercent?: number;
  /**
   * The label to display above the chart.
   */
  label?: string;
  /**
   * The color of the label.
   * @default 'currentColor'
   */
  labelColor?: string;
  /**
   * The font size of the label.
   * @default 18
   */
  labelFontSize?: number;
  /**
   * The margin to use around the chart.
   * @default { top: 10, right: 10, bottom: 10, left: 10 }
   */
  margin?: Margin;
  /**
   * The spacing between sgements.
   * @default 0
   */
  padAngle?: number;
  /**
   * The radius of the pie chart.
   */
  radius?: number;
  /**
   * The ratio of the height to the width of the chart.
   * @default 0.5
   */
  ratio?: string | number;
  /**
   * The color of the segment labels.
   * @default 'currentColor'
   */
  segmentLabelColor?: string;
  /**
   * The font size of the segment labels.
   * @default '12'
   */
  segmentLabelFontSize?: number;
  /**
   * The radius at which to place the segment label.
   */
  segmentLabelRadiusPercent?: number;
  /**
   * The sort order for the segments.
   */
  sort?: 'ascending' | 'descending';
  /**
   * The angle in degrees from which to start rendering the first segment.
   * @default 0
   */
  startAngle?: number;
}

const PieChart = React.forwardRef<SVGSVGElement, PieChartProps>(function PieChart(props, ref) {
  const {
    cornerRadius = 0,
    data,
    endAngle: endAngleProp,
    expandOnHover = false,
    fill,
    height: heightProp,
    innerLabel,
    innerLabelFontSize = 24,
    innerRadiusPercent = 0,
    label,
    labelColor = 'currentColor',
    labelFontSize = 18,
    margin: marginProp,
    padAngle: padAngleProp = 0,
    radius: radiusProp,
    ratio: ratioProp,
    segmentLabelColor = 'currentColor',
    segmentLabelFontSize = 12,
    segmentLabelRadiusPercent,
    sort,
    startAngle: startAngleProp = 0,
    ...other
  } = props;

  const margin = { top: 10, bottom: 10, left: 10, right: 10, ...marginProp };
  const ratio = typeof ratioProp === 'string' ? stringRatioToNumber(ratioProp) : ratioProp || 0.5;

  const chartSettings = {
    marginTop: margin.top,
    marginBottom: margin.bottom,
    marginLeft: margin.left,
    marginRight: margin.right,
  };

  const [chartRef, dimensions] = useChartDimensions(chartSettings);
  const { boundedHeight, boundedWidth, width, height } = dimensions;
  const handleRef = useForkRef(chartRef, ref);
  const [percentVisible, setPercentVisible] = useState(0);

  let sortOrder;

  if (sort === 'ascending') {
    sortOrder = ascending;
  } else if (sort === 'descending') {
    sortOrder = descending;
  }

  const startAngle = (startAngleProp * Math.PI) / 180; // Degrees to radians
  const endAngle = endAngleProp
    ? (((endAngleProp * Math.PI) / 180) * percentVisible) / 100
    : startAngle + ((((360 - startAngle) * Math.PI) / 180) * percentVisible) / 100;
  const padAngle = (padAngleProp * Math.PI) / 180; // Degrees to radians

  const pie = d3
    .pie()
    .startAngle(startAngle)
    .endAngle(endAngle)
    .padAngle(padAngle)
    // @ts-ignore TODO: fix me
    .value((d) => d.value)
    .sort(sortOrder);

  // From: https://codesandbox.io/s/drilldown-piechart-in-react-and-d3-d62y5
  useEffect(() => {
    d3.select(chartRef.current)
      .transition('pie-reveal')
      .duration(500)
      .ease(d3.easeSinInOut)
      .tween('percentVisible', () => {
        const percentInterpolate = d3.interpolate(0, 100);
        return (t) => setPercentVisible(percentInterpolate(t));
      });
  }, [chartRef, data]);

  const radius = radiusProp || Math.min(boundedWidth, boundedHeight) / 2;
  const innerRadius = (radius * innerRadiusPercent) / 100;
  const chartHeight = heightProp || width * ratio;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      ref={handleRef}
      style={{ width: '100%', height: chartHeight }}
      {...other}
    >
      <g
        transform={`translate(${boundedWidth / 2 + margin.left}, ${
          boundedHeight / 2 + margin.top
        })`}
      >
        {fill && (
          <PieSegment
            data={{
              startAngle,
              endAngle,
              padAngle: 0,
              index: 0,
              value: 0,
              data: { fill },
            }}
            innerRadius={innerRadius}
            cornerRadius={cornerRadius}
            radius={radius}
          />
        )}
        {/* @ts-ignore TODO: fix me */}
        {pie(data).map((d, i) => (
          <PieSegment
            // @ts-ignore TODO: fix me
            data={d}
            expandOnHover={expandOnHover}
            innerRadius={innerRadius}
            cornerRadius={cornerRadius}
            // @ts-ignore TODO: fix me
            label={d.data.label}
            labelColor={segmentLabelColor}
            labelFontSize={segmentLabelFontSize}
            labelRadiusPercent={segmentLabelRadiusPercent}
            key={i}
            radius={radius}
          />
        ))}
      </g>
      {innerLabel && (
        <text
          fill={labelColor}
          transform={`translate(${width / 2}, ${height / 2})`}
          fontSize={innerLabelFontSize}
          textAnchor="middle"
        >
          {innerLabel}
        </text>
      )}
      {label && (
        <text
          fill={labelColor}
          transform={`translate(${width / 2}, ${50 - labelFontSize})`}
          fontSize={labelFontSize}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </svg>
  );
});

export default PieChart;
