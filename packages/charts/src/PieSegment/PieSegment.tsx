import React, { useState } from 'react';
import * as d3 from 'd3';

interface SegmentData {
  data: { value?: number; label?: string; fill: string; stroke?: string };
  endAngle: number;
  index: number;
  padAngle: number;
  startAngle: number;
  value: number;
}

export interface PieSegmentProps {
  /**
   * Radius of the segment corner.
   * @default 0
   */
  cornerRadius?: number;
  /**
   * The data to use for the segment.
   */
  data: SegmentData;
  /**
   * If true, the segment will expand when hovered
   * @default false
   */
  expandOnHover?: boolean;
  /**
   * The radius at which to start the inside of the segment.
   * @default 0
   */
  innerRadius?: number;
  /**
   * The label for the segment.
   */
  label?: string;
  /**
   * The color of the label.
   * @default 'currentColor'
   */
  labelColor?: string;
  /**
   * The font size of the label.
   * @default 12
   */
  labelFontSize?: number;
  /**
   * The radius at which to place the label.
   */
  labelRadiusPercent?: number;
  /**
   * The radius of the pie chart.
   * @default 100
   */
  radius?: number;
}

function PieSegment(props: PieSegmentProps) {
  const {
    cornerRadius = 0,
    data,
    expandOnHover,
    innerRadius = 0,
    label,
    labelColor = 'currentColor',
    labelFontSize = 12,
    labelRadiusPercent,
    radius = 100,
  } = props;

  const [radiusAdd, setRadiusAdd] = useState(0);
  const labelRadius = labelRadiusPercent
    ? (radius * labelRadiusPercent) / 50 + radiusAdd
    : radius + radiusAdd;
  const arc = d3
    .arc()
    .innerRadius(innerRadius + radiusAdd)
    .outerRadius(radius + radiusAdd)
    .cornerRadius(cornerRadius);

  const labelArc = d3
    .arc()
    .innerRadius(innerRadius + radiusAdd)
    .outerRadius(labelRadius);

  function mouseOver() {
    if (expandOnHover) {
      setRadiusAdd(((radius - innerRadius) / 100) * 10);
    }
  }

  function mouseOut() {
    setRadiusAdd(0);
  }

  return (
    <React.Fragment>
      <path
        fill={data.data.fill}
        stroke={data.data.stroke}
        // @ts-ignore TODO: fix me
        d={arc(data)}
        onMouseOver={mouseOver}
        onMouseOut={mouseOut}
      />
      <text
        textAnchor="middle"
        fill={labelColor}
        fontSize={labelFontSize}
        // @ts-ignore TODO: fix me
        transform={`translate(${labelArc.centroid(data)})`}
      >
        {label}
      </text>
    </React.Fragment>
  );
}

export default PieSegment;
