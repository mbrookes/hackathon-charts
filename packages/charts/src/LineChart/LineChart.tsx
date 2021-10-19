import * as React from 'react';
import * as d3 from 'd3';
import { unstable_useForkRef as useForkRef, unstable_useId as useId } from '@mui/utils';
import ChartContext from '../ChartContext';
import useChartDimensions from '../hooks/useChartDimensions';
import useScale from '../hooks/useScale';
import useStackedArrays from '../hooks/useStackedArrays';
import useThrottle from '../hooks/useThrottle';
import useTicks from '../hooks/useTicks';
import { getExtent, getMaxDataSetLength, stringRatioToNumber } from '../utils';

interface Margin {
  bottom?: number;
  left?: number;
  right?: number;
  top?: number;
}

type MarkerShape =
  | 'auto'
  | 'circle'
  | 'cross'
  | 'diamond'
  | 'square'
  | 'star'
  | 'triangle'
  | 'wye'
  | 'none';

type Scale = 'linear' | 'time' | 'log' | 'point' | 'pow' | 'sqrt' | 'utc';

export interface LineChartProps<Record = unknown, X = unknown, Y = unknown> {
  /**
   * The keys to use when stacking the data.
   */
  keys?: string[];
  /**
   * The content of the component.
   */
  children: React.ReactNode;
  /**
   * The data to use for the chart.
   */
  data: Record[] | Record[][];
  /**
   * The fill color to use for the area.
   */
  fill?: string;
  /**
   * The height of the chart.
   */
  height?: number;
  /**
   * If true, the markers will be highlighted when the mouse is over them.
   */
  highlightMarkers?: boolean;
  /**
   * Id of the root chart element.
   */
  id?: string;
  /**
   * Invert the line and fill colors of the point markers.
   */
  invertMarkers?: boolean;
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
   * @default '18'
   */
  labelFontSize?: number;
  /**
   * The margin to use.
   * Labels and axes fall within these margins.
   */
  margin?: Margin;
  /**
   * The shape of the markers.
   * If auto, the shape will be based on the data series.
   */
  markerShape?: MarkerShape;
  /**
   * The size of the markers.
   */
  markerSize?: number;
  /**
   * The ratio of the height to the width of the chart.
   * @default 0.5
   */
  ratio?: string | number;
  /**
   * The maximum number of pixels per tick.
   */
  tickSpacing?: number;
  /**
   * If `true`, the plotted lines will be smoothed.
   */
  smoothed?: boolean;
  /**
   * If `true`, the data will be stacked.
   */
  stacked?: boolean;
  /**
   * Override the calculated domain of the x axis.
   */
  xDomain?: [X] | [X, X];
  /**
   * The key to use for the x axis or the function to access .
   */
  xValueSelector?: keyof Record | ((r: Record) => X);
  /**
   * The scale type to use for the x axis.
   */
  xScaleType?: Scale;
  /**
   * Override the calculated domain of the y axis.
   * By default, the domain starts at zero. Set the value to null to calculate the true domain.
   */
  yDomain?: [Y] | [Y, Y];
  /**
   * The key to use for the y axis.
   */
  yValueSelector?: keyof Record | ((r: Record) => Y);
  /**
   * The scale type to use for the y axis.
   */
  yScaleType?: Scale;
}

type LineChartComponent = <X, Y>(
  props: LineChartProps<X, Y> & React.RefAttributes<SVGSVGElement>,
) => JSX.Element;

const LineChart = React.forwardRef(function LineChart<Record = unknown, X = unknown, Y = unknown>(
  props: LineChartProps<Record, X, Y>,
  ref: React.ForwardedRef<SVGSVGElement>,
) {
  const {
    keys,
    children,
    data: dataProp,
    fill = 'none',
    highlightMarkers = false,
    height: heightProp,
    id: idProp,
    invertMarkers = false,
    label,
    labelColor = 'currentColor',
    labelFontSize = 18,
    margin: marginProp,
    markerShape = 'circle',
    markerSize = 30,
    ratio: ratioProp,
    tickSpacing = 50,
    smoothed = false,
    stacked = false,
    xDomain: xDomainProp,
    xValueSelector,
    xScaleType = 'linear',
    yDomain: yDomainProp = [0],
    yValueSelector,
    yScaleType = 'linear',
    ...other
  } = props;

  let data = dataProp;
  const stackedData = useStackedArrays(dataProp);
  if (stacked) {
    if (keys) {
      const stackGen = d3.stack().keys(keys);
      // @ts-ignore TODO: fix me
      data = stackGen(dataProp);
    } else {
      data = stackedData;
    }
  }

  const margin = { top: 40, bottom: 40, left: 50, right: 30, ...marginProp };
  const ratio = typeof ratioProp === 'string' ? stringRatioToNumber(ratioProp) : ratioProp || 0.5;

  const chartSettings = {
    marginTop: margin.top,
    marginRight: margin.right,
    marginBottom: margin.bottom,
    marginLeft: margin.left,
  };

  const [chartRef, dimensions] = useChartDimensions(chartSettings);
  const handleRef = useForkRef(chartRef, ref);
  const [seriesMeta, setSeriesMeta] = React.useState([]);

  const {
    width,
    height,
    boundedWidth,
    boundedHeight,
    marginLeft,
    marginRight,
    marginTop,
    marginBottom,
  } = dimensions;

  let xGetter: (record: Record) => X;
  if (typeof xValueSelector === 'string') {
    xGetter = (record: Record) => record[xValueSelector as keyof Record] as unknown as X;
  } else if (typeof xValueSelector === 'function') {
    xGetter = xValueSelector;
  } else {
    xGetter = (record: Record) => (record as any).x as X;
  }

  let yGetter: (record: Record) => Y;
  if (typeof yValueSelector === 'string') {
    yGetter = (record: Record) => record[yValueSelector as keyof Record] as unknown as Y;
  } else if (typeof yValueSelector === 'function') {
    yGetter = yValueSelector;
  } else {
    yGetter = (record: Record) => (record as any).y as Y;
  }

  const xDomain = getExtent(data, (d: Record) => xGetter(d), xDomainProp);
  const yDomain = getExtent(data, (d: Record) => yGetter(d), yDomainProp);
  const xRange = [0, boundedWidth];
  const yRange = [0, boundedHeight];
  const maxXTicks = getMaxDataSetLength(data) - 1;
  const xScale = useScale(xScaleType, xDomain, xRange);
  const yScale = useScale(yScaleType, yDomain, yRange);

  const xTicks = useTicks({
    scale: xScale,
    tickSpacing,
    maxTicks: maxXTicks,
  });

  const yTicks = useTicks({
    scale: yScale,
    tickSpacing,
    maxTicks: 999,
  });

  const [mousePosition, setMousePosition] = React.useState({
    x: -1,
    y: -1,
  });

  const handleMouseMove = useThrottle((event) => {
    setMousePosition({
      x: event.nativeEvent.offsetX - marginLeft,
      y: event.nativeEvent.offsetY - marginTop,
    });
  });

  const handleMouseOut = () => {
    setMousePosition({
      x: -1,
      y: -1,
    });
  };

  const chartId = useId(idProp);
  const chartHeight = heightProp || (width * ratio);
  return (
    <ChartContext.Provider
      value={{
        keys,
        chartId,
        data,
        dimensions,
        highlightMarkers,
        invertMarkers,
        seriesMeta,
        markerShape,
        markerSize,
        setSeriesMeta,
        stacked,
        mousePosition,
        smoothed,
        xValueSelector: xGetter,
        xScale,
        xScaleType,
        xTicks,
        yValueSelector: yGetter,
        yScale,
        yScaleType,
        yTicks,
      }}
    >
      <svg
        viewBox={`0 0 ${width} ${height}`}
        ref={handleRef}
        id={chartId}
        {...other}
        onMouseMove={handleMouseMove}
        onMouseOut={handleMouseOut}
        style={{ width: '100%', height: chartHeight }}
      >
        <defs>
          <clipPath id={`${chartId}-clipPath`}>
            <rect
              width={Math.max(width - marginLeft - marginRight, 0)}
              height={Math.max(height - marginTop - marginBottom, 0)}
            />
          </clipPath>
        </defs>
        <rect width={width} height={height} fill={fill} rx="4" />
        <g transform={`translate(${[marginLeft, marginTop].join(',')})`}>
          <g>{children}</g>
        </g>
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
    </ChartContext.Provider>
  );
}) as LineChartComponent;

export default LineChart;
