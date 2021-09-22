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

  return (
    <g>
      {chartData.map(d => <rect key={`${d[xKey]},${d[yKey]}`} fill={fill} x={`${xScale(d[xKey]) - width/chartData.length}`} y={boundedHeight - yScale(d[yKey])} width={width/chartData.length} height={yScale(d[yKey])}/>)}
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
