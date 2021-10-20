import React, { useContext, useEffect } from 'react';
import * as d3 from 'd3';
import ChartContext from '../ChartContext';
import Scatter from '../Scatter/Scatter';

function points(data, xKey) {
  return data.map((d) => ({ [xKey]: d.data[xKey], y: d[1] }));
}

export interface LineProps {
  /**
   * The data to be plotted. Either an array of objects, or nested arrays of objects.
   */
  data: any[];
  /**
   * The color of the area under the line.
   */
  fill: string;
  /**
   * The label for the line to be used in the tooltip and line.
   */
  label: string;
  /**
   * The shape of the markers.
   */
  markerShape:
    | 'auto'
    | 'circle'
    | 'cross'
    | 'diamond'
    | 'square'
    | 'star'
    | 'triangle'
    | 'wye'
    | 'none';
  /**
   * The index of the series to be plotted.
   */
  series: number;
  /**
   * If true, the line will be smoothed.
   */
  smoothed: boolean;
  /**
   * The stroke color of the marker line.
   * @default 'currentColor'
   */
  stroke: string;
  /**
   * The stroke pattern of the marker line.
   */
  strokeDasharray: string;
  /**
   * The stroke width of the marker line.
   * @default 1
   */
  strokeWidth: number;
}

type LineComponent = (props: LineProps & React.RefAttributes<SVGSVGElement>) => JSX.Element;

const Line = React.forwardRef(function Grid(props: LineProps, ref: React.Ref<SVGSVGElement>) {
  const {
    keys,
    chartId,
    data,
    dimensions: { boundedHeight },
    highlightMarkers,
    setSeriesMeta,
    markerShape: markerShapeContext,
    smoothed: smoothedContext,
    stacked,
    xKey,
    xScale,
    yKey,
    yScale,
  } = useContext(ChartContext) as any;

  const {
    data: dataProp,
    fill,
    label,
    markerShape = markerShapeContext,
    series,
    smoothed = smoothedContext,
    stroke = 'currentColor',
    strokeDasharray,
    strokeWidth = 1,
  } = props;

  const chartData = dataProp || data[series] || data;

  let linePath;
  let areaPath;
  let pointData = chartData;

  useEffect(() => {
    const id = series || 0;
    setSeriesMeta((previousSeriesMeta) => ({
      ...previousSeriesMeta,
      [id]: { fill, label, markerShape, stroke },
    }));
  }, [fill, label, markerShape, series, setSeriesMeta, stroke]);

  if (stacked && keys) {
    linePath = d3
      .line()
      // @ts-ignore TODO: Fix me
      .x((d) => xScale(d.data[xKey]))
      .y((d) => -yScale(d[1]));

    areaPath = d3
      .area()
      // @ts-ignore TODO: Fix me
      .x((d) => xScale(d.data[xKey]))
      .y0((d) => -yScale(d[0]))
      .y1((d) => -yScale(d[1]));

    pointData = points(chartData, xKey);
  } else {
    linePath = d3
      .line()
      .x((d) => xScale(d[xKey]))
      .y((d) => -yScale(d[yKey]));

    areaPath = d3
      .area()
      .x((d) => xScale(d[xKey]))
      .y1((d) => -yScale(d[yKey]))
      .y0(-yScale(yScale.domain()[0]));
  }

  if (smoothed) {
    const curve = d3.curveCatmullRom.alpha(0.5);
    linePath = linePath.curve(curve);
    areaPath = areaPath.curve(curve);
  }

  return (
    <g ref={ref}>
      <g clipPath={`url(#${chartId}-clipPath)`}>
        {fill && (
          <path
            d={areaPath(chartData)}
            stroke="none"
            fill={fill}
            strokeWidth={strokeWidth}
            transform={`translate(0, ${boundedHeight})`}
            style={{ pointerEvents: 'none' }}
          />
        )}
        <path
          d={linePath(chartData)}
          fill="none"
          stroke={stroke}
          strokeDasharray={strokeDasharray}
          strokeWidth={strokeWidth}
          transform={`translate(0, ${boundedHeight})`}
          style={{ pointerEvents: 'none' }}
        />
      </g>
      {(markerShape !== 'none' || highlightMarkers) && (
        <Scatter
          data={pointData}
          zDomain={[5, 5]}
          markerShape={markerShape}
          series={series}
          // @ts-ignore TODO: Fix me
          shape={markerShape}
          stroke={stroke}
          strokeWidth={strokeWidth}
          fill="white"
        />
      )}
    </g>
  );
}) as LineComponent;

export default Line;
