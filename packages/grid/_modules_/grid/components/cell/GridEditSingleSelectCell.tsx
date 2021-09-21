import * as React from 'react';
import PropTypes from 'prop-types';
import Select, { SelectProps } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { GridRenderEditCellParams } from '../../models/params/gridCellParams';
import { isEscapeKey } from '../../utils/keyboardUtils';
import { useEnhancedEffect } from '../../utils/material-ui-utils';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';
import { GridEditModes } from '../../models/gridEditRowModel';

const renderSingleSelectOptions = (option) =>
  typeof option === 'object' ? (
    <MenuItem key={option.value} value={option.value}>
      {option.label}
    </MenuItem>
  ) : (
    <MenuItem key={option} value={option}>
      {option}
    </MenuItem>
  );

function GridEditSingleSelectCell(props: GridRenderEditCellParams & SelectProps) {
  const {
    id,
    value,
    formattedValue,
    api,
    field,
    row,
    colDef,
    cellMode,
    isEditable,
    tabIndex,
    className,
    getValue,
    hasFocus,
    ...other
  } = props;

  const ref = React.useRef<any>();
  const rootProps = useGridRootProps();
  const [open, setOpen] = React.useState(rootProps.editMode === 'cell');

  const handleChange = (event) => {
    setOpen(false);
    api.setEditCellValue({ id, field, value: event.target.value }, event);
    if (!event.key && rootProps.editMode === 'cell') {
      api.commitCellChange({ id, field }, event);
      api.setCellMode(id, field, 'view');
    }
  };

  const handleClose = (event, reason) => {
    if (rootProps.editMode === GridEditModes.Row) {
      setOpen(false);
      return;
    }
    if (reason === 'backdropClick' || isEscapeKey(event.key)) {
      api.setCellMode(id, field, 'view');
    }
  };

  const handleOpen = () => {
    setOpen(true);
  };

  useEnhancedEffect(() => {
    if (hasFocus) {
      // TODO v5: replace with inputRef.current.focus()
      // See https://github.com/mui-org/material-ui/issues/21441
      ref.current.querySelector('[role="button"]').focus();
    }
  }, [hasFocus]);

  return (
    <Select
      ref={ref}
      value={value}
      onChange={handleChange}
      open={open}
      onOpen={handleOpen}
      MenuProps={{
        onClose: handleClose,
      }}
      fullWidth
      {...other}
    >
      {colDef.valueOptions?.map(renderSingleSelectOptions)}
    </Select>
  );
}

GridEditSingleSelectCell.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  /**
   * GridApi that let you manipulate the grid.
   */
  api: PropTypes.any.isRequired,
} as any;

export { GridEditSingleSelectCell };
export const renderEditSingleSelectCell = (params) => <GridEditSingleSelectCell {...params} />;
