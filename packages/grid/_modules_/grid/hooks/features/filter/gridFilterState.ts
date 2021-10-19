import { GridLinkOperator } from '../../../models/gridFilterItem';
import { GridFilterModel } from '../../../models/gridFilterModel';
import { GridRowId } from '../../../models/gridRows';

export const getDefaultGridFilterModel: () => GridFilterModel = () => ({
  items: [],
  linkOperator: GridLinkOperator.And,
});

export interface GridFilterState {
  filterModel: GridFilterModel;
  visibleRowsLookup: Record<GridRowId, boolean>;
  visibleRows: GridRowId[] | null;
}

export interface GridFilterInitialState {
  filterModel?: GridFilterModel;
}
