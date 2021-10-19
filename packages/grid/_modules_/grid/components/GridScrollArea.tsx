import * as React from 'react';
import PropTypes from 'prop-types';
import { GridEvents } from '../constants/eventsConstants';
import { useGridApiEventHandler } from '../hooks/utils/useGridApiEventHandler';
import { GridScrollParams } from '../models/params/gridScrollParams';
import { useGridApiContext } from '../hooks/utils/useGridApiContext';
import { getDataGridUtilityClass } from '../gridClasses';
import { composeClasses } from '../utils/material-ui-utils';
import { useGridRootProps } from '../hooks/utils/useGridRootProps';
import { GridComponentProps } from '../GridComponentProps';

const CLIFF = 1;
const SLOP = 1.5;

interface ScrollAreaProps {
  scrollDirection: 'left' | 'right';
}

type OwnerState = ScrollAreaProps & {
  classes?: GridComponentProps['classes'];
};

const useUtilityClasses = (ownerState: OwnerState) => {
  const { scrollDirection, classes } = ownerState;

  const slots = {
    root: ['scrollArea', `scrollArea__${scrollDirection}`],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

function GridScrollAreaRaw(props: ScrollAreaProps) {
  const { scrollDirection } = props;
  const rootRef = React.useRef<HTMLDivElement>(null);
  const apiRef = useGridApiContext();
  const timeout = React.useRef<any>();
  const [dragging, setDragging] = React.useState<boolean>(false);
  const scrollPosition = React.useRef<GridScrollParams>({
    left: 0,
    top: 0,
  });

  const rootProps = useGridRootProps();
  const ownerState = { ...props, classes: rootProps.classes };
  const classes = useUtilityClasses(ownerState);

  const handleScrolling = React.useCallback((newScrollPosition) => {
    scrollPosition.current = newScrollPosition;
  }, []);

  const handleDragOver = React.useCallback(
    (event) => {
      let offset: number;

      if (scrollDirection === 'left') {
        offset = event.clientX - rootRef.current!.getBoundingClientRect().right;
      } else if (scrollDirection === 'right') {
        offset = Math.max(1, event.clientX - rootRef.current!.getBoundingClientRect().left);
      } else {
        throw new Error('MUI: Wrong drag direction');
      }

      offset = (offset - CLIFF) * SLOP + CLIFF;

      clearTimeout(timeout.current);
      // Avoid freeze and inertia.
      timeout.current = setTimeout(() => {
        apiRef.current.scroll({
          left: scrollPosition.current.left + offset,
          top: scrollPosition.current.top,
        });
      });
    },
    [scrollDirection, apiRef],
  );

  React.useEffect(() => {
    return () => {
      clearTimeout(timeout.current);
    };
  }, []);

  const toggleDragging = React.useCallback(() => {
    setDragging((prevDragging) => !prevDragging);
  }, []);

  useGridApiEventHandler(apiRef, GridEvents.rowsScroll, handleScrolling);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragStart, toggleDragging);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnd, toggleDragging);

  return dragging ? (
    <div ref={rootRef} className={classes.root} onDragOver={handleDragOver} />
  ) : null;
}

GridScrollAreaRaw.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  scrollDirection: PropTypes.oneOf(['left', 'right']).isRequired,
} as any;

const GridScrollArea = React.memo(GridScrollAreaRaw);

export { GridScrollArea };
