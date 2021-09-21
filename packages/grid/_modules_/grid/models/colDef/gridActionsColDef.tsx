import { GRID_STRING_COL_DEF } from './gridStringColDef';
import { GridColTypeDef } from './gridColDef';
import { renderActionsCell } from '../../components/cell/GridActionsCell';

export const GRID_ACTIONS_COL_DEF: GridColTypeDef = {
  ...GRID_STRING_COL_DEF,
  sortable: false,
  filterable: false,
  width: 100,
  align: 'center',
  headerAlign: 'center',
  headerName: '',
  disableColumnMenu: true,
  disableExport: true,
  renderCell: renderActionsCell,
};
