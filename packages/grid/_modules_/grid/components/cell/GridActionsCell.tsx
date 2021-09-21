import * as React from 'react';
import PropTypes from 'prop-types';
import IconButton from '@mui/material/IconButton';
import MenuList from '@mui/material/MenuList';
import { unstable_useId as useId } from '@mui/material/utils';
import { GridRenderCellParams } from '../../models/params/gridCellParams';
import { gridClasses } from '../../gridClasses';
import { GridMenu, GridMenuProps } from '../menu/GridMenu';
import { GridActionsColDef } from '../../models/colDef/gridColDef';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';

const hasActions = (colDef: any): colDef is GridActionsColDef =>
  typeof colDef.getActions === 'function';

type GridActionsCellProps = GridRenderCellParams & Pick<GridMenuProps, 'position'>;

const GridActionsCell = (props: GridActionsCellProps) => {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const menuId = useId();
  const buttonId = useId();
  const rootProps = useGridRootProps();
  const { colDef, id, api, position = 'bottom-end' } = props;

  if (!hasActions(colDef)) {
    throw new Error('Material-UI: Missing the `getActions` property in the `GridColDef`.');
  }

  const showMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const hideMenu = () => {
    setAnchorEl(null);
  };

  const options = colDef.getActions(api.getRowParams(id));
  const iconButtons = options.filter((option) => !option.props.showInMenu);
  const menuButtons = options.filter((option) => option.props.showInMenu);

  return (
    <div className={gridClasses.actionsCell}>
      {iconButtons.map((button, index) => React.cloneElement(button, { key: index }))}
      {menuButtons.length > 0 && (
        <IconButton
          id={buttonId}
          aria-label={api.getLocaleText('actionsCellMore')}
          aria-controls={menuId}
          aria-expanded={anchorEl ? 'true' : undefined}
          aria-haspopup="true"
          size="small"
          onClick={showMenu}
        >
          <rootProps.components.MoreActionsIcon fontSize="small" />
        </IconButton>
      )}

      {menuButtons.length > 0 && (
        <GridMenu
          id={menuId}
          onClickAway={hideMenu}
          onClick={hideMenu}
          open={Boolean(anchorEl)}
          target={anchorEl}
          position={position}
          aria-labelledby={buttonId}
        >
          <MenuList className="MuiDataGrid-gridMenuList">
            {menuButtons.map((button, index) => React.cloneElement(button, { key: index }))}
          </MenuList>
        </GridMenu>
      )}
    </div>
  );
};

GridActionsCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * GridApi that let you manipulate the grid.
   */
  api: PropTypes.any.isRequired,
  /**
   * The mode of the cell.
   */
  cellMode: PropTypes.oneOf(['edit', 'view']).isRequired,
  /**
   * The column of the row that the current cell belongs to.
   */
  colDef: PropTypes.object.isRequired,
  /**
   * The column field of the cell that triggered the event
   */
  field: PropTypes.string.isRequired,
  /**
   * The cell value formatted with the column valueFormatter.
   */
  formattedValue: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.number,
    PropTypes.object,
    PropTypes.string,
    PropTypes.bool,
  ]),
  /**
   * Get the cell value of a row and field.
   * @param {GridRowId} id The row id.
   * @param {string} field The field.
   * @returns {GridCellValue} The cell value.
   */
  getValue: PropTypes.func.isRequired,
  /**
   * If true, the cell is the active element.
   */
  hasFocus: PropTypes.bool.isRequired,
  /**
   * The grid row id.
   */
  id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  /**
   * If true, the cell is editable.
   */
  isEditable: PropTypes.bool,
  position: PropTypes.oneOf([
    'bottom-end',
    'bottom-start',
    'bottom',
    'left-end',
    'left-start',
    'left',
    'right-end',
    'right-start',
    'right',
    'top-end',
    'top-start',
    'top',
  ]),
  /**
   * The row model of the row that the current cell belongs to.
   */
  row: PropTypes.object.isRequired,
  /**
   * the tabIndex value.
   */
  tabIndex: PropTypes.oneOf([-1, 0]).isRequired,
  /**
   * The cell value, but if the column has valueGetter, use getValue.
   */
  value: PropTypes.oneOfType([
    PropTypes.instanceOf(Date),
    PropTypes.number,
    PropTypes.object,
    PropTypes.string,
    PropTypes.bool,
  ]),
} as any;

export { GridActionsCell };

export const renderActionsCell = (params) => <GridActionsCell {...params} />;
