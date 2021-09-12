import React, { useContext } from 'react';
import * as d3 from 'd3';
import ChartContext from '../ChartContext';
import { isInRange } from '../utils';

const plot = (value, domain, size) => {
  return ((value - domain[0]) / (domain[1] - domain[0])) * size;
};

function getSymbol(shape, series = 0) {
  const symbolNames = 'circle cross diamond square star triangle wye'.split(/ /);
  if (shape === 'auto') {
    return series % symbolNames.length;
  }
  return symbolNames.indexOf(shape) || 0;
}

const Scatter = (props) => {
  const {
    data,
    dimensions: { boundedHeight },
    highlightMarkers,
    invertMarkers: invertMarkersContext,
    markerShape: markerShapeContext,
    markerSize,
    mousePosition,
    xKey: xKeyContext,
    xScale,
    yKey: yKeyContext,
    yScale,
    zKey: zKeyContext,
    zDomain: zDomainContext,
  } = useContext(ChartContext);

  const {
    data: dataProp,
    series,
    minSize = markerSize || 30,
    maxSize = 500,
    fill = 'inherit',
    invertMarkers = invertMarkersContext,
    markerShape = markerShapeContext,
    stroke,
    strokeWidth,
    xKey = xKeyContext,
    yKey = yKeyContext,
    zKey = zKeyContext,
    zDomain = zDomainContext,
  } = props;

  const chartData = dataProp || data[series] || data;

  const highlightMarker = (x) => {
    return (
      highlightMarkers &&
      isInRange(
        mousePosition.x,
        xScale(x),
        (xScale(chartData[1][xKey]) - xScale(chartData[0][xKey])) / 2,
      )
    );
  };
  return (
    <g>
      {chartData.map(({ [xKey]: x, [yKey]: y, [zKey]: z }, i) => (
        <path
          d={d3.symbol(
            d3.symbols[getSymbol(markerShape, series)],
            z ? plot(z, zDomain, maxSize - minSize) + minSize : minSize,
          )()}
          transform={`translate(${xScale(x)}, 
          ${boundedHeight - yScale(y)})`}
          fill={
            (invertMarkers && !highlightMarker(x)) || (!invertMarkers && highlightMarker(x))
              ? stroke
              : fill
          }
          stroke={
            (invertMarkers && !highlightMarker(x)) || (!invertMarkers && highlightMarker(x))
              ? fill
              : stroke
          }
          strokeWidth={strokeWidth}
          key={i}
        />
      ))}
    </g>
  );
};

export default Scatter;
