import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import ChartContext from '../ChartContext';

const YAxis = (props) => {
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
    <g transform={`translate(0, ${boundedHeight})`}>
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
};

YAxis.propTypes /* remove-proptypes */ = {
  /**
   * If true, the axia line is disabled.
   */
  disableLine: PropTypes.bool,
  /**
   * If true, the ticks are disabled.
   */
  disableTicks: PropTypes.bool,
  /**
   * The fill color of the axis text.
   */
  fill: PropTypes.string,
  /**
   * The font size of the axis text.
   */
  fontSize: PropTypes.number,
  /**
   * The label of the axis.
   */
  label: PropTypes.string,
  /**
   * The font size of the axis label.
   */
  labelFontSize: PropTypes.number,
  /**
   * The stroke color of the axis line.
   */
  stroke: PropTypes.string,
  /**
   * The size of the ticks.
   */
  tickSize: PropTypes.number,
};

export default YAxis;
