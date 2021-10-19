import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import ChartContext from '../ChartContext';
import Scatter from '../Scatter/Scatter';

function points(data, xValueSelector) {
  return data.map((d) => ({ x: xValueSelector(d.data), y: d[1] }));
}

const Line = (props) => {
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
    xValueSelector,
    xScale,
    yValueSelector,
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
      .x((d) => xScale(xValueSelector(d.data)))
      .y((d) => -yScale(d[1]));

    areaPath = d3
      .area()
      // @ts-ignore TODO: Fix me
      .x((d) => xScale(xValueSelector(d.data)))
      .y0((d) => -yScale(d[0]))
      .y1((d) => -yScale(d[1]));

    pointData = points(chartData, xValueSelector);
  } else {
    linePath = d3
      .line()
      .x((d) => xScale(xValueSelector(d)))
      .y((d) => -yScale(yValueSelector(d)));

    areaPath = d3
      .area()
      .x((d) => xScale(xValueSelector(d)))
      .y1((d) => -yScale(yValueSelector(d)))
      .y0(-yScale(yScale.domain()[0]));
  }

  if (smoothed) {
    const curve = d3.curveCatmullRom.alpha(0.5);
    linePath = linePath.curve(curve);
    areaPath = areaPath.curve(curve);
  }

  return (
    <g>
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
};

Line.propTypes /* remove-proptypes */ = {
  /**
   * The data to be plotted. Either an array of objects, or nested arrays of objects.
   */
  data: PropTypes.array,
  /**
   * The color of the area under the line.
   */
  fill: PropTypes.string,
  /**
   * The label for the line to be used in the tooltip and legend.
   */
  label: PropTypes.string,
  /**
   * The shape of the markers.
   */
  markerShape: PropTypes.oneOf([
    'auto',
    'circle',
    'cross',
    'diamond',
    'square',
    'star',
    'triangle',
    'wye',
    'none',
  ]),
  /**
   * The index of the series to be plotted.
   */
  series: PropTypes.number,
  /**
   * If true, the line will be smoothed.
   */
  smoothed: PropTypes.bool,
  /**
   * The stroke color of the marker line.
   */
  stroke: PropTypes.string,
  /**
   * The stroke pattern of the marker line.
   */
  strokeDasharray: PropTypes.string,
  /**
   * The stroke width of the marker line.
   */
  strokeWidth: PropTypes.number,
};

export default Line;
