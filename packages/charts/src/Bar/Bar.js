import React, { useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChartContext from '../ChartContext';

const Bar = (props) => {
  const {
    data,
    dimensions: { width, boundedHeight },
    xKey,
    xScale,
    yKey,
    yScale,
  } = useContext(ChartContext);

  const {
    data: dataProp,
    fill,
    series,
  } = props;

  const chartData = dataProp || data[series] || data;

  let spacingBetweenTicks = 999;
  const ticks = xScale.ticks();
  for(let i = 1; i < ticks.length; i++) {
    spacingBetweenTicks = Math.min(spacingBetweenTicks, xScale(ticks[i]) - xScale(ticks[i - 1]));
  }

  let barWidth = spacingBetweenTicks - 20;
  if(series !== undefined) {
    const numOfSeries = data.length;
    barWidth = barWidth/numOfSeries;
  }

  const getX = (d) => {
    let result = xScale(d[xKey]) - barWidth/2;
    if(series !== undefined) {
      result = xScale(d[xKey]);
      const numOfSeries = data.length;
      if(numOfSeries%2 == 0) { // even num
        const center = numOfSeries/2;
        if(series > center) {
          return result + (series-center)*barWidth;
        } else {
          return result - (center-series)*barWidth;
        }
      } {
        const center = parseInt(numOfSeries/2);
        if(series === center) {
          return result - barWidth/2;
        } else if (series > center) {
          return result + (series-center)*barWidth - barWidth/2;
        } else {
          return result - (center-series)*barWidth - barWidth/2;
        }
      }
    }

    return result;
  }

  return (
    <g>
      {chartData.map(d => 
        <rect
          key={`${d[xKey]},${d[yKey]}`}
          fill={fill}
          x={getX(d)}
          y={boundedHeight - yScale(d[yKey])}
          height={yScale(d[yKey])}
          width={barWidth}
        />
      )}
    </g>
  );
};

Bar.propTypes /* remove-proptypes */ = {
  /**
   * The data to be plotted. Either an array of objects, or nested arrays of objects.
   */
  data: PropTypes.array,
  /**
   * The color of the area under the bar.
   */
  fill: PropTypes.string,
};

export default Bar;
