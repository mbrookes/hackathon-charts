import * as React from 'react';
import PropTypes from 'prop-types';
import { unstable_useId as useId } from '@mui/material/utils';
import MenuList from '@mui/material/MenuList';
import Button, { ButtonProps } from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import { isHideMenuKey, isTabKey } from '../../utils/keyboardUtils';
import { useGridApiContext } from '../../hooks/root/useGridApiContext';
import { GridMenu } from '../menu/GridMenu';
import { GridExportCsvOptions } from '../../models/gridExport';
import { useGridRootProps } from '../../hooks/utils/useGridRootProps';

interface GridExportFormatCsv {
  format: 'csv';
  formatOptions?: GridExportCsvOptions;
}

type GridExportFormatOption = GridExportFormatCsv;

type GridExportOption = GridExportFormatOption & {
  label: React.ReactNode;
};

export interface GridToolbarExportProps extends ButtonProps {
  csvOptions?: GridExportCsvOptions;
}

const GridToolbarExport = React.forwardRef<HTMLButtonElement, GridToolbarExportProps>(
  function GridToolbarExport(props, ref) {
    const { csvOptions, onClick, ...other } = props;
    const apiRef = useGridApiContext();
    const rootProps = useGridRootProps();
    const buttonId = useId();
    const menuId = useId();
    const [anchorEl, setAnchorEl] = React.useState(null);

    const exportOptions: Array<GridExportOption> = [];
    exportOptions.push({
      label: apiRef.current.getLocaleText('toolbarExportCSV'),
      format: 'csv',
      formatOptions: csvOptions,
    });

    const handleMenuOpen = (event) => {
      setAnchorEl(event.currentTarget);
      onClick?.(event);
    };
    const handleMenuClose = () => setAnchorEl(null);
    const handleExport = (option: GridExportOption) => () => {
      if (option.format === 'csv') {
        apiRef.current.exportDataAsCsv(option.formatOptions);
      }

      setAnchorEl(null);
    };

    const handleListKeyDown = (event: React.KeyboardEvent) => {
      if (isTabKey(event.key)) {
        event.preventDefault();
      }
      if (isHideMenuKey(event.key)) {
        handleMenuClose();
      }
    };

    return (
      <React.Fragment>
        <Button
          ref={ref}
          color="primary"
          size="small"
          startIcon={<rootProps.components.ExportIcon />}
          aria-expanded={anchorEl ? 'true' : undefined}
          aria-label={apiRef.current.getLocaleText('toolbarExportLabel')}
          aria-haspopup="menu"
          aria-labelledby={menuId}
          id={buttonId}
          {...other}
          onClick={handleMenuOpen}
        >
          {apiRef.current.getLocaleText('toolbarExport')}
        </Button>
        <GridMenu
          open={Boolean(anchorEl)}
          target={anchorEl}
          onClickAway={handleMenuClose}
          position="bottom-start"
        >
          <MenuList
            id={menuId}
            className="MuiDataGrid-gridMenuList"
            aria-labelledby={buttonId}
            onKeyDown={handleListKeyDown}
            autoFocusItem={Boolean(anchorEl)}
          >
            {exportOptions.map((option, index) => (
              <MenuItem key={index} onClick={handleExport(option)}>
                {option.label}
              </MenuItem>
            ))}
          </MenuList>
        </GridMenu>
      </React.Fragment>
    );
  },
);

GridToolbarExport.propTypes = {
  // ----------------------------- Warning --------------------------------
  // | These PropTypes are generated from the TypeScript type definitions |
  // | To update them edit the TypeScript types and run "yarn proptypes"  |
  // ----------------------------------------------------------------------
  csvOptions: PropTypes.shape({
    allColumns: PropTypes.bool,
    delimiter: PropTypes.string,
    fields: PropTypes.arrayOf(PropTypes.string),
    fileName: PropTypes.string,
    utf8WithBom: PropTypes.bool,
  }),
} as any;

export { GridToolbarExport };
