import * as React from 'react';
import * as d3 from 'd3';
import { unstable_useForkRef as useForkRef, unstable_useId as useId } from '@mui/utils';
import ChartContext from '../ChartContext';
import useChartDimensions from '../hooks/useChartDimensions';
import useScale from '../hooks/useScale';
import useStackedArrays from '../hooks/useStackedArrays';
import useTicks from '../hooks/useTicks';
import { getExtent, getMaxDataSetLength, stringRatioToNumber } from '../utils';

interface ChartData<X, Y> {
  x: X;
  y: Y;
}

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

export interface LineChartProps<X = unknown, Y = unknown> {
  /**
   * The content of the component.
   */
  children: React.ReactNode;
  /**
   * The data to use for the chart.
   */
  data: ChartData<X, Y>[] | ChartData<X, Y>[][];
  /**
   * The fill color to use for the area.
   * @default 'none'
   */
  fill?: string;
  /**
   * The height of the chart.
   */
  height?: number;
  /**
   * If true, the markers will be highlighted when the mouse is over them.
   * @default false
   */
  highlightMarkers?: boolean;
  /**
   * Id of the root chart element.
   */
  id?: string;
  /**
   * Invert the line and fill colors of the point markers.
   * @default false
   */
  invertMarkers?: boolean;
  /**
   * The keys to use when stacking the data.
   */
  keys?: string[];
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
   * @default { top: 40, bottom: 40, left: 50, right: 30 }
   */
  margin?: Margin;
  /**
   * The shape of the markers.
   * If auto, the shape will be based on the data series.
   * @default 'circle'
   */
  markerShape?: MarkerShape;
  /**
   * The size of the markers.
   * @default 30
   */
  markerSize?: number;
  /**
   * The ratio of the height to the width of the chart.
   * @default 0.5
   */
  ratio?: string | number;
  /**
   * The maximum number of pixels per tick.
   * @default 50
   */
  tickSpacing?: number;
  /**
   * If `true`, the plotted lines will be smoothed.
   * @default false
   */
  smoothed?: boolean;
  /**
   * If `true`, the data will be stacked.
   * @default false
   */
  stacked?: boolean;
  /**
   * Override the calculated domain of the x axis.
   */
  xDomain?: X[];
  /**
   * The key to use for the x axis.
   */

  xKey?: string;
  /**
   * The scale type to use for the x axis.
   * @default 'linear'
   */
  xScaleType?: 'linear' | 'time' | 'log' | 'point' | 'pow' | 'sqrt' | 'utc';
  /**
   * Override the calculated domain of the y axis.
   * By default, the domain starts at zero. Set the value to null to calculate the true domain.
   * @default [0]
   */
  yDomain?: Y[];
  /**
   * The key to use for the y axis.
   */
  yKey?: string;
  /**
   * The scale type to use for the y axis.
   * @default 'linear'
   */
  yScaleType?: 'linear' | 'time' | 'log' | 'point' | 'pow' | 'sqrt' | 'utc';
}

type LineChartComponent = <X, Y>(
  props: LineChartProps<X, Y> & React.RefAttributes<SVGSVGElement>,
) => JSX.Element;

const LineChart = React.forwardRef(function LineChart<X = unknown, Y = unknown>(
  props: LineChartProps<X, Y>,
  ref: React.Ref<SVGSVGElement>,
) {
  const {
    children,
    data: dataProp,
    fill = 'none',
    highlightMarkers = false,
    height: heightProp,
    id: idProp,
    invertMarkers = false,
    keys,
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
    xKey = 'x',
    xScaleType = 'linear',
    yDomain: yDomainProp = [0],
    yKey = 'y',
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

  const xDomain = getExtent(data, (d) => d[xKey], xDomainProp);
  const yDomain = getExtent(data, (d) => d[yKey], yDomainProp);
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

  const chartId = useId(idProp);
  const chartHeight = heightProp || width * ratio;
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
        chartRef,
        smoothed,
        xKey,
        xScale,
        xScaleType,
        xTicks,
        yKey,
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
