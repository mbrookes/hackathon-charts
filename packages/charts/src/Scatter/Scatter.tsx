import React, { useCallback, useContext } from 'react';
import * as d3 from 'd3';
import ChartContext from '../ChartContext';
import useThrottle from '../hooks/useThrottle';
import { getSymbol, isInRange } from '../utils';

const plot = (value, domain, size) => {
  return ((value - domain[0]) / (domain[1] - domain[0])) * size;
};

export interface ScatterProps {
  /**
   * The data to be plotted. Either an array of objects, or nested arrays of objects.
   */
  data: any[];
  /**
   * The fill color of the markers.
   */
  fill: string;
  /**
   * If `true`, the marker fill and stroke will be inverted.
   */

  invertMarkers: boolean;
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
   * The maximum size of the markers.
   * @default 500
   */
  maxSize: number;
  /**
   * The minimum size of the markers.
   */
  minSize: number;
  /**
   * For nested arrays, the series to be plotted.
   */
  series: number;
  /**
   * The stroke color of the marker line.
   */
  stroke: string;
  /**
   * The stroke pattern of the marker.
   */
  strokeDasharray: string;
  /**
   * The stroke width of the marker.
   */
  strokeWidth: number;
  xKey: string;
  yKey: string;
  zDomain: [number, number];
  zKey: string;
}

type ScatterComponent = (props: ScatterProps & React.RefAttributes<SVGSVGElement>) => JSX.Element;

const Scatter = React.forwardRef(function Grid(props: ScatterProps, ref: React.Ref<SVGSVGElement>) {
  const {
    chartRef,
    data,
    dimensions: { boundedHeight, marginLeft, marginTop },
    highlightMarkers,
    invertMarkers: invertMarkersContext,
    markerShape: markerShapeContext,
    markerSize,
    xKey: xKeyContext,
    xScale,
    yKey: yKeyContext,
    yScale,
    zDomain: zDomainContext,
    zKey: zKeyContext,
  } = useContext(ChartContext) as any;

  const {
    data: dataProp,
    fill,
    invertMarkers = invertMarkersContext,
    markerShape = markerShapeContext,
    maxSize = 500,
    minSize = markerSize || 30,
    series,
    stroke,
    strokeDasharray,
    strokeWidth,
    xKey = xKeyContext,
    yKey = yKeyContext,
    zDomain = zDomainContext,
    zKey = zKeyContext,
  } = props;

  const chartData = dataProp || data[series] || data;

  const [mousePosition, setMousePosition] = React.useState({
    x: -1,
    y: -1,
  });

  const handleMouseMove = useThrottle(
    useCallback(
      (event) => {
        setMousePosition({
          x: event.offsetX - marginLeft,
          y: event.offsetY - marginTop,
        });
      },
      [marginLeft, marginTop],
    ),
  );

  const handleMouseOut = useCallback(() => {
    setMousePosition({
      x: -1,
      y: -1,
    });
  }, []);

  React.useEffect(() => {
    const chart = chartRef.current;

    if (highlightMarkers) {
      chart.addEventListener('mousemove', handleMouseMove);
      chart.addEventListener('mouseout', handleMouseOut);
    } else {
      chart.removeEventListener('mousemove', handleMouseMove);
      chart.removeEventListener('mouseout', handleMouseOut);
    }

    return () => {
      chart.removeEventListener('mousemove', handleMouseMove);
      chart.removeEventListener('mouseout', handleMouseOut);
    };
  }, [chartRef, handleMouseMove, handleMouseOut, highlightMarkers]);

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
    <g ref={ref}>
      {chartData.map(
        // @ts-ignore TODO: Fix me
        ({ [xKey]: x, [yKey]: y, [zKey]: z }, i) =>
          (markerShape !== 'none' || highlightMarker(x)) && (
            <path
              // @ts-ignore TODO: Fix me
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
              strokeDasharray={strokeDasharray}
              strokeWidth={strokeWidth}
              key={i}
            />
          ),
      )}
    </g>
  );
}) as ScatterComponent;

export default Scatter;
