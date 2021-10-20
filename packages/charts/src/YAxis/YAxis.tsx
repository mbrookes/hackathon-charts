import React, { useContext } from 'react';
import ChartContext from '../ChartContext';

export interface YAxisProps {
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

type YAxisComponent = (props: YAxisProps & React.RefAttributes<SVGSVGElement>) => JSX.Element;

const YAxis = React.forwardRef(function Grid(props: YAxisProps, ref: React.Ref<SVGSVGElement>) {
  const {
    dimensions: { boundedHeight },
    yTicks,
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
      {!disableLine && <line y2={-boundedHeight} stroke={stroke} shapeRendering="crispEdges" />}
      {yTicks.map(({ value, offset }, index) => (
        <g key={index} transform={`translate(0, ${-offset})`}>
          {!disableTicks && <line x2={-tickSize} stroke={stroke} shapeRendering="crispEdges" />}
          <text
            fill={fill}
            transform={`translate(-${tickSize + 4}, ${fontSize / 2 - 2})`}
            textAnchor="end"
            fontSize={fontSize}
          >
            {value}
          </text>
        </g>
      ))}
      {label && (
        <text
          fill={fill}
          transform={`translate(0, -${boundedHeight + 14})`}
          fontSize={labelFontSize}
          textAnchor="end"
        >
          {label}
        </text>
      )}
    </g>
  );
}) as YAxisComponent;

export default YAxis;
