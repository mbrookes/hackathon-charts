import React, { useContext } from 'react';
import * as d3 from 'd3';
import ChartContext from '../ChartContext';
import { getSymbol } from '../utils';

export interface LegendProps {
  /**
   * The color of the label.
   * @default '#777'
   */
  labelColor: string;
  /**
   * The font size of the label.
   * @default 12
   */
  labelFontSize: number;
  /**
   * The size of the markers in the legend.
   * @default 30
   */
  markerSize: number;
  /**
   * The position of the legend in the chart.
   * @default 'top'
   */
  position: 'top' | 'bottom';
  /**
   * The spacing between the legend items.
   * @default 50
   */
  spacing: number;
}

type LegendComponent = (props: LegendProps & React.RefAttributes<SVGSVGElement>) => JSX.Element;

const Legend = React.forwardRef(function Grid(props: LegendProps, ref: React.Ref<SVGSVGElement>) {
  const {
    dimensions: { boundedHeight, boundedWidth },
    invertMarkers,
    seriesMeta,
  } = useContext(ChartContext) as any;

  const {
    labelColor = '#777',
    labelFontSize = 12,
    markerSize = 30,
    position = 'top',
    spacing = 50,
  } = props;

  return (
    <g
      transform={`translate(${boundedWidth / 2 - (Object.keys(seriesMeta).length * spacing) / 2}, ${
        position === 'top' ? 0 : boundedHeight + 68
      })`}
      style={{ pointerEvents: 'none' }}
      ref={ref}
    >
      {seriesMeta &&
        Object.keys(seriesMeta).map((series) => {
          const { label, stroke } = seriesMeta[series];
          let { fill, markerShape } = seriesMeta[series];

          if (!markerShape || markerShape === 'none') {
            markerShape = 'circle';
          }

          // fill is not always defined for line charts
          if (!fill || fill === 'none') {
            fill = stroke;
          }

          return (
            <React.Fragment key={series}>
              <path
                // @ts-ignore TODO: Fix me
                d={d3.symbol(d3.symbols[getSymbol(markerShape, series)], markerSize)()}
                fill={invertMarkers ? stroke : fill}
                stroke={invertMarkers ? fill : stroke}
                // @ts-ignore TODO: Fix me
                transform={`translate(${series * spacing - markerSize / 5}, -4)`}
              />
              <text
                fill={labelColor}
                // @ts-ignore TODO: Fix me
                transform={`translate(${series * spacing}, 0)`}
                fontSize={labelFontSize}
                // textAnchor="middle"
              >
                {label}
              </text>
            </React.Fragment>
          );
        })}
    </g>
  );
}) as LegendComponent;

export default Legend;
