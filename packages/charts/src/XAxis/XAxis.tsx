import React, { useContext } from 'react';
import ChartContext from '../ChartContext';

export interface XAxisProps {
  /**
   * If true, the axia line is disabled.
   * @default false
   */
  disableLine: boolean;
  /**
   * If true, the ticks are disabled.
   * @default false
   */
  disableTicks: boolean;
  /**
   * The fill color of the axis text.
   * @default 'currentColor'
   */
  fill: string;
  /**
   * The font size of the axis text.
   * @default 12
   */
  fontSize: number;
  /**
   * The label of the axis.
   */
  label: string;
  /**
   * The font size of the axis label.
   * @default 14
   */
  labelFontSize: number;
  /**
   * The stroke color of the axis line.
   * @default 'currentColor'
   */
  stroke: string;
  /**
   * The size of the ticks.
   * @default 6
   */
  tickSize: number;
}

type XAxisComponent = (props: XAxisProps & React.RefAttributes<SVGSVGElement>) => JSX.Element;

const XAxis = React.forwardRef(function Grid(props: XAxisProps, ref: React.Ref<SVGSVGElement>) {
  const {
    dimensions: { boundedHeight, boundedWidth },
    xTicks,
  } = useContext(ChartContext) as any;
  const {
    disableLine = false,
    disableTicks = false,
    fill = 'currentColor',
    fontSize = 10,
    label,
    labelFontSize = 14,
    stroke = 'currentColor',
    tickSize: tickSizeProp = 6,
  } = props;

  const tickSize = disableTicks ? 4 : tickSizeProp;

  return (
    <g transform={`translate(0, ${boundedHeight})`} ref={ref}>
      {!disableLine && <line x2={boundedWidth} stroke={stroke} shapeRendering="crispEdges" />}
      {xTicks.map(({ value, offset }, index) => (
        <g key={index} transform={`translate(${offset}, 0)`}>
          {!disableTicks && <line y2={tickSize} stroke={stroke} shapeRendering="crispEdges" />}
          <text
            fill={fill}
            transform={`translate(0, ${fontSize + tickSize + 2})`}
            textAnchor="middle"
            fontSize={fontSize}
          >
            {value}
          </text>
        </g>
      ))}
      {label && (
        <text
          fill={fill}
          transform={`translate(${boundedWidth / 2}, ${fontSize + tickSize + 20})`}
          fontSize={labelFontSize}
          textAnchor="middle"
        >
          {label}
        </text>
      )}
    </g>
  );
}) as XAxisComponent;

export default XAxis;
