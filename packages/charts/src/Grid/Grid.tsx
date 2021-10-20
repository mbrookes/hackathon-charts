import React, { useContext } from 'react';
import ChartContext from '../ChartContext';

export interface GridProps {
  /**
   * Disable the x axis grid lines.
   * @default false
   */
  disableX: boolean;
  /**
   * Disable the y axis grid lines.
   * @default false
   */
  disableY: boolean;
  /**
   * The fill color of the grid.
   *  @default 'none'
   */
  fill: string;
  /**
   * The stroke color of the grid.
   *  @default 'rgba(200, 200, 200, 0.5)'
   */
  stroke: string;
  /**
   * The stroke dash array of the grid.
   * @default '0'
   */
  strokeDasharray: string;
  /**
   * The stroke width of the grid.
   * @default '1'
   */
  strokeWidth: number;
  /**
   * The stroke color of the zero grid line.
   */
  zeroStroke: string;
  /**
   * The stroke dash array of the zero grid line.
   */
  zeroStrokeDasharray: string;
  /**
   * The stroke width of the zero grid line.
   */
  zeroStrokeWidth: number;
}

type GridComponent = (props: GridProps & React.RefAttributes<SVGSVGElement>) => JSX.Element;

const Grid = React.forwardRef(function Grid(props: GridProps, ref: React.Ref<SVGSVGElement>) {
  const {
    dimensions: { boundedWidth, boundedHeight },
    xTicks,
    yTicks,
  } = useContext(ChartContext) as any;
  const {
    disableX = false,
    disableY = false,
    fill = 'none',
    stroke = 'rgba(200, 200, 200, 0.5)',
    strokeDasharray = '0',
    strokeWidth = 1,
    zeroStroke: zeroStrokeProp,
    zeroStrokeDasharray: zeroStrokeDasharrayProp,
    zeroStrokeWidth: zeroStrokeWidthProp,
  } = props;

  const getStroke = (value) => (zeroStrokeProp && value === '0' ? zeroStrokeProp : stroke);
  const getStrokeWidth = (value) =>
    zeroStrokeWidthProp && value === '0' ? zeroStrokeWidthProp : strokeWidth;
  const getStrokeDasharray = (value) =>
    zeroStrokeDasharrayProp && value === '0' ? zeroStrokeDasharrayProp : strokeDasharray;

  return (
    <g ref={ref}>
      <rect width={boundedWidth} height={boundedHeight} fill={fill} />
      <g transform={`translate(0, ${boundedHeight})`}>
        {!disableX &&
          xTicks.map(({ offset, value }, index) => (
            <line
              key={index}
              x1={offset}
              x2={offset}
              y2={-boundedHeight}
              stroke={getStroke(value)}
              strokeWidth={getStrokeWidth(value)}
              strokeDasharray={getStrokeDasharray(value)}
              shapeRendering="crispEdges"
            />
          ))}
        {!disableY &&
          yTicks.map(({ offset, value }, index) => (
            <line
              key={index}
              x2={boundedWidth}
              y1={-offset}
              y2={-offset}
              stroke={getStroke(value)}
              strokeWidth={getStrokeWidth(value)}
              strokeDasharray={getStrokeDasharray(value)}
              shapeRendering="crispEdges"
            />
          ))}
      </g>
    </g>
  );
}) as GridComponent;

export default Grid;
