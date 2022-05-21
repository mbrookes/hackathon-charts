import React, { useContext, useMemo } from 'react';
import * as d3 from 'd3';
import NoSsr from '@mui/core/NoSsr';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Typography from '@mui/material/Typography';
import ChartContext from '../ChartContext';
import useTicks from '../hooks/useTicks';
import useThrottle from '../hooks/useThrottle';
import { findObjects } from '../utils';

function getSymbol(shape, series = 0) {
  const symbolNames = 'circle cross diamond square star triangle wye'.split(/ /);
  if (shape === 'auto') {
    return series % symbolNames.length;
  }
  return symbolNames.indexOf(shape) || 0;
}

export interface TooltipProps {
  /**
   * The size of the tooltip markers.
   * @default 30
   */
  markerSize: number;
  /**
   * The content that can be rendered to replace the component.
   *
   * @param {array} highlightedData Contains the data for multiple series that are currently highlighted.
   * @returns {React.ReactNode} The content to be rendered.
   */
  renderContent: (highlightedData: any) => React.ReactNode;
  /**
   * The stroke color of the marker line.
   * @default 'rgba(200, 200, 200, 0.8)'
   */
  stroke: string;
  /**
   * The stroke pattern of the marker line.
   * @default 'none'
   */
  strokeDasharray: string;
  /**
   * The stroke width of the marker line.
   * @default 1
   */
  strokeWidth: number;
}

type TooltipComponent = (props: TooltipProps & React.RefAttributes<SVGSVGElement>) => JSX.Element;

const Tooltip = React.forwardRef(function Grid(
  props: TooltipProps,
  ref: React.Ref<HTMLDivElement>,
) {
  const {
    chartRef,
    data,
    dimensions: { boundedHeight, boundedWidth, marginLeft, marginTop },
    invertMarkers,
    xKey,
    xScale,
    yKey,
    seriesMeta,
  } = useContext(ChartContext) as any;

  const {
    stroke = 'rgba(200, 200, 200, 0.8)',
    strokeDasharray = 'none',
    strokeWidth = 1,
    markerSize = 30,
    renderContent = null,
  } = props;

  const [strokeElement, setStrokeElement] = React.useState(null);

  const updateStrokeRef = (element) => {
    setStrokeElement(element);
  };

  const isLineChart = seriesMeta[0] && seriesMeta[0].stroke;

  // Flatten the data
  // eslint-disable-next-line prefer-spread
  const flatX = [].concat.apply([], data).map((d) => d[xKey]);

  // An array of x-offset values matching the data
  const xOffsets = useMemo(() => [...new Set(flatX.map((d) => xScale(d)))].sort(d3.ascending), [
    flatX,
    xScale,
  ]);
  const [offset, setOffset] = React.useState();

  // Use a ref to avoid rerendering on every mousemove event.
  const mousePosition = React.useRef({
    x: -1,
    y: -1,
  });

  const handleMouseMove = useThrottle((event) => {
    mousePosition.current = {
      x: event.offsetX - marginLeft,
      y: event.offsetY - marginTop,
    };
    // Find the closest x-offset to the mouse position
    setOffset(
      mousePosition.current.x < 0 || mousePosition.current.x > boundedWidth
        ? undefined
        : xOffsets.reduce((a, b) => {
            return Math.abs(b - mousePosition.current.x) < Math.abs(a - mousePosition.current.x)
              ? b
              : a;
          }),
    );
  });

  React.useEffect(() => {
    const chart = chartRef.current;
    const handleMouseOut = () => {
      mousePosition.current = {
        x: -1,
        y: -1,
      };
    };

    chart.addEventListener('mousemove', handleMouseMove);
    chart.addEventListener('mouseout', handleMouseOut);

    return () => {
      chart.removeEventListener('mousemove', handleMouseMove);
      chart.removeEventListener('mouseout', handleMouseOut);
    };
  }, [chartRef, handleMouseMove]);

  // The data that matches the mouse position
  let highlightedData =
    offset !== undefined ? findObjects(data, xKey, xScale.invert(offset)) : null;

  const linesData =
    seriesMeta &&
    Object.keys(seriesMeta).map((series) => {
      // `fill` is not always defined for line charts
      if (!seriesMeta[series].fill || seriesMeta[series].fill === 'none') {
        seriesMeta[series].fill = 'white';
      }

      return {
        ...seriesMeta[series],
        // `stroke` is only defined for line charts
        stroke: seriesMeta[series].stroke || 'white',
      };
    });

  // Add the information for the markers
  highlightedData =
    highlightedData &&
    highlightedData.map((d, i) => ({
      ...d,
      ...linesData[i],
    }));

  // TODO: Make this work when the data is not equally spaced along the x-axis
  const label = useTicks({ maxTicks: xOffsets.length, scale: xScale }).find(
    (d) => d.offset === offset,
  );

  return (
    <NoSsr>
      {strokeElement && (
        <Popper
          open={strokeElement !== null}
          placement="right-start"
          anchorEl={strokeElement}
          style={{ padding: '16px', pointerEvents: 'none' }}
          ref={ref}
        >
          {!renderContent && (
            <Paper style={{ padding: '16px' }}>
              <Typography gutterBottom align="center">
                {label && label.value}
              </Typography>
              {highlightedData &&
                highlightedData
                  .sort((a, b) => d3.descending(a[yKey], b[yKey]))
                  .map((d, i) => (
                    <Typography
                      variant="caption"
                      key={i}
                      sx={{ display: 'flex', alignItems: 'center' }}
                    >
                      <svg width={markerSize} height={markerSize}>
                        <path
                          // @ts-ignore TODO: Fix me
                          d={d3.symbol(
                            d3.symbols[getSymbol(d.markerShape, d.series)],
                            markerSize,
                          )()}
                          fill={invertMarkers ? d.stroke : d.fill}
                          stroke={invertMarkers ? d.fill : d.stroke}
                          transform={`translate(${markerSize / 2}, ${markerSize / 2})`}
                        />
                      </svg>
                      {d.label}
                      {d.label ? ':' : null} {d[yKey]}
                    </Typography>
                  ))}
            </Paper>
          )}
          {renderContent && renderContent(highlightedData)}
        </Popper>
      )}
      <g transform={`translate(0, ${boundedHeight})`} style={{ pointerEvents: 'none' }}>
        {offset !== undefined && (
          <g transform={`translate(${offset}, 0)`}>
            <line
              ref={updateStrokeRef}
              y2={-boundedHeight}
              stroke={stroke}
              strokeWidth={isLineChart ? strokeWidth : 0}
              strokeDasharray={strokeDasharray}
              shapeRendering="crispEdges"
            />
          </g>
        )}
      </g>
    </NoSsr>
  );
}) as TooltipComponent;

export default Tooltip;
