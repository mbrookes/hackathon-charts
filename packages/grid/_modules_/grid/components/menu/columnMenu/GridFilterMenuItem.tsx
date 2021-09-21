import * as React from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import { useGridApiContext } from '../../../hooks/root/useGridApiContext';
import { GridFilterItemProps } from './GridFilterItemProps';
import { useGridRootProps } from '../../../hooks/utils/useGridRootProps';

const GridFilterMenuItem = (props: GridFilterItemProps) => {
  const { column, onClick } = props;
  const apiRef = useGridApiContext();
  const rootProps = useGridRootProps();

  const showFilter = React.useCallback(
    (event: React.MouseEvent<HTMLElement>) => {
      onClick(event);
      apiRef.current.showFilterPanel(column?.field);
    },
    [apiRef, column?.field, onClick],
  );

  if (rootProps.disableColumnFilter || !column?.filterable) {
    return null;
  }

  return (
    <MenuItem onClick={showFilter}>{apiRef.current.getLocaleText('columnMenuFilter')}</MenuItem>
  );
};

GridFilterMenuItem.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  column: PropTypes.shape({
    align: PropTypes.oneOf(['center', 'left', 'right']),
    cellClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    description: PropTypes.string,
    disableColumnMenu: PropTypes.bool,
    disableExport: PropTypes.bool,
    disableReorder: PropTypes.bool,
    editable: PropTypes.bool,
    field: PropTypes.string.isRequired,
    filterable: PropTypes.bool,
    filterOperators: PropTypes.arrayOf(
      PropTypes.shape({
        getApplyFilterFn: PropTypes.func.isRequired,
        InputComponent: PropTypes.elementType,
        InputComponentProps: PropTypes.object,
        label: PropTypes.string,
        value: PropTypes.string.isRequired,
      }),
    ),
    flex: PropTypes.number,
    headerAlign: PropTypes.oneOf(['center', 'left', 'right']),
    headerClassName: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    headerName: PropTypes.string,
    hide: PropTypes.bool,
    hideSortIcons: PropTypes.bool,
    minWidth: PropTypes.number,
    renderCell: PropTypes.func,
    renderEditCell: PropTypes.func,
    renderHeader: PropTypes.func,
    resizable: PropTypes.bool,
    sortable: PropTypes.bool,
    sortComparator: PropTypes.func,
    type: PropTypes.string,
    valueFormatter: PropTypes.func,
    valueGetter: PropTypes.func,
    valueOptions: PropTypes.arrayOf(
      PropTypes.oneOfType([
        PropTypes.number,
        PropTypes.shape({
          label: PropTypes.string.isRequired,
          value: PropTypes.any.isRequired,
        }),
        PropTypes.string,
      ]).isRequired,
    ),
    valueParser: PropTypes.func,
    width: PropTypes.number,
  }).isRequired,
  onClick: PropTypes.func.isRequired,
} as any;

export { GridFilterMenuItem };
