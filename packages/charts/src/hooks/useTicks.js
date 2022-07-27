import { useMemo } from 'react';

function useTicks(options) {
  const { maxTicks = 999, tickSpacing = 10, scale } = options;

  return useMemo(() => {
    // band scale
    if (scale.bandwidth) {
      return scale.domain().map((d) => ({ value: d, offset: scale(d) }));
    }

    const numberOfTicksTarget = Math.min(
      maxTicks,
      Math.max(1, Math.floor((scale.range()[1] - scale.range()[0]) / tickSpacing)),
    );

    return scale.ticks(numberOfTicksTarget).map((value) => ({
      value: scale.tickFormat(numberOfTicksTarget)(value),
      offset: scale(value),
    }));
  }, [tickSpacing, maxTicks, scale]);
}

export default useTicks;

// function useTicks(scale, count) {
//   return useMemo(() => {
//     return d3.scale.linear()
//       .domain(scale.domain())
//       .range(scale.range())
//       .ticks(count);
//   }, [scale, count]);
// }
