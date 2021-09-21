import * as React from 'react';
import { useGridLogger } from '../../utils/useGridLogger';
import { GridApiRef } from '../../../models/api/gridApiRef';
import { GridEvents } from '../../../constants/eventsConstants';
import { getDataGridUtilityClass } from '../../../gridClasses';
import { GridColumnHeaderParams } from '../../../models/params/gridColumnHeaderParams';
import { GridCellParams } from '../../../models/params/gridCellParams';
import { CursorCoordinates } from '../../../models/cursorCoordinates';
import { useGridApiEventHandler } from '../../root/useGridApiEventHandler';
import { useGridSelector } from '../core/useGridSelector';
import { useGridState } from '../core/useGridState';
import { gridColumnReorderDragColSelector } from './columnReorderSelector';
import { GridComponentProps } from '../../../GridComponentProps';
import { composeClasses } from '../../../utils/material-ui-utils';

const CURSOR_MOVE_DIRECTION_LEFT = 'left';
const CURSOR_MOVE_DIRECTION_RIGHT = 'right';

const getCursorMoveDirectionX = (
  currentCoordinates: CursorCoordinates,
  nextCoordinates: CursorCoordinates,
) => {
  return currentCoordinates.x <= nextCoordinates.x
    ? CURSOR_MOVE_DIRECTION_RIGHT
    : CURSOR_MOVE_DIRECTION_LEFT;
};

const hasCursorPositionChanged = (
  currentCoordinates: CursorCoordinates,
  nextCoordinates: CursorCoordinates,
): boolean =>
  currentCoordinates.x !== nextCoordinates.x || currentCoordinates.y !== nextCoordinates.y;

type OwnerState = { classes: GridComponentProps['classes'] };

const useUtilityClasses = (ownerState: OwnerState) => {
  const { classes } = ownerState;

  const slots = {
    columnHeaderDragging: ['columnHeader--dragging'],
  };

  return composeClasses(slots, getDataGridUtilityClass, classes);
};

/**
 * Only available in DataGridPro
 * @requires useGridColumns (method)
 */
export const useGridColumnReorder = (
  apiRef: GridApiRef,
  props: Pick<GridComponentProps, 'disableColumnReorder' | 'classes'>,
): void => {
  const logger = useGridLogger(apiRef, 'useGridColumnReorder');

  const [, setGridState, forceUpdate] = useGridState(apiRef);
  const dragColField = useGridSelector(apiRef, gridColumnReorderDragColSelector);
  const dragColNode = React.useRef<HTMLElement | null>(null);
  const cursorPosition = React.useRef<CursorCoordinates>({
    x: 0,
    y: 0,
  });
  const originColumnIndex = React.useRef<number | null>(null);
  const removeDnDStylesTimeout = React.useRef<any>();
  const ownerState = { classes: props.classes };
  const classes = useUtilityClasses(ownerState);

  React.useEffect(() => {
    return () => {
      clearTimeout(removeDnDStylesTimeout.current);
    };
  }, []);

  const handleColumnHeaderDragStart = React.useCallback(
    (params: GridColumnHeaderParams, event: React.MouseEvent<HTMLElement>) => {
      if (props.disableColumnReorder || params.colDef.disableReorder) {
        return;
      }

      logger.debug(`Start dragging col ${params.field}`);

      dragColNode.current = event.currentTarget;
      dragColNode.current.classList.add(classes.columnHeaderDragging);

      setGridState((state) => ({
        ...state,
        columnReorder: { ...state.columnReorder, dragCol: params.field },
      }));
      forceUpdate();

      removeDnDStylesTimeout.current = setTimeout(() => {
        dragColNode.current!.classList.remove(classes.columnHeaderDragging);
      });

      originColumnIndex.current = apiRef.current.getColumnIndex(params.field, false);
    },
    [
      props.disableColumnReorder,
      classes.columnHeaderDragging,
      logger,
      setGridState,
      forceUpdate,
      apiRef,
    ],
  );

  const handleDragEnter = React.useCallback(
    (params: GridColumnHeaderParams | GridCellParams, event: React.DragEvent<HTMLElement>) => {
      event.preventDefault();
    },
    [],
  );

  const handleDragOver = React.useCallback(
    (params: GridColumnHeaderParams | GridCellParams, event: React.DragEvent) => {
      if (!dragColField) {
        return;
      }

      logger.debug(`Dragging over col ${params.field}`);
      event.preventDefault();

      const coordinates = { x: event.clientX, y: event.clientY };

      if (
        params.field !== dragColField &&
        hasCursorPositionChanged(cursorPosition.current, coordinates)
      ) {
        const targetColIndex = apiRef.current.getColumnIndex(params.field, false);
        const targetColVisibleIndex = apiRef.current.getColumnIndex(params.field, true);
        const targetCol = apiRef.current.getColumn(params.field);
        const dragColIndex = apiRef.current.getColumnIndex(dragColField, false);
        const visibleColumnAmount = apiRef.current.getVisibleColumns().length;

        const canBeReordered =
          !targetCol.disableReorder ||
          (targetColVisibleIndex > 0 && targetColVisibleIndex < visibleColumnAmount - 1);

        const cursorMoveDirectionX = getCursorMoveDirectionX(cursorPosition.current, coordinates);
        const hasMovedLeft =
          cursorMoveDirectionX === CURSOR_MOVE_DIRECTION_LEFT && targetColIndex < dragColIndex;
        const hasMovedRight =
          cursorMoveDirectionX === CURSOR_MOVE_DIRECTION_RIGHT && dragColIndex < targetColIndex;

        if (canBeReordered && (hasMovedLeft || hasMovedRight)) {
          apiRef.current.setColumnIndex(dragColField, targetColIndex);
        }

        cursorPosition.current = coordinates;
      }
    },
    [apiRef, dragColField, logger],
  );

  const handleDragEnd = React.useCallback(
    (params: GridColumnHeaderParams | GridCellParams, event: React.DragEvent): void => {
      if (props.disableColumnReorder || !dragColField) {
        return;
      }

      logger.debug('End dragging col');
      event.preventDefault();

      clearTimeout(removeDnDStylesTimeout.current);
      dragColNode.current = null;

      // Check if the column was dropped outside the grid.
      if (event.dataTransfer.dropEffect === 'none') {
        apiRef.current.setColumnIndex(params.field, originColumnIndex.current!);
        originColumnIndex.current = null;
      }

      setGridState((state) => ({
        ...state,
        columnReorder: { ...state.columnReorder, dragCol: '' },
      }));
      forceUpdate();
    },
    [props.disableColumnReorder, logger, setGridState, forceUpdate, apiRef, dragColField],
  );

  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragStart, handleColumnHeaderDragStart);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnter, handleDragEnter);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragOver, handleDragOver);
  useGridApiEventHandler(apiRef, GridEvents.columnHeaderDragEnd, handleDragEnd);
  useGridApiEventHandler(apiRef, GridEvents.cellDragEnter, handleDragEnter);
  useGridApiEventHandler(apiRef, GridEvents.cellDragOver, handleDragOver);
  useGridApiEventHandler(apiRef, GridEvents.cellDragEnd, handleDragEnd);
};
