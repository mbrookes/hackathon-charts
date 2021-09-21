import * as React from 'react';
import {
  GridComponentProps,
  GridInputComponentProps,
} from '../../_modules_/grid/GridComponentProps';
import { useThemeProps } from '../../_modules_/grid/utils/material-ui-utils';
import { DataGridProProps } from './DataGridProProps';
import { useProcessedProps } from '../../_modules_/grid/hooks/utils/useProcessedProps';

export const useDataGridProProps = (inProps: DataGridProProps): GridComponentProps => {
  const themedProps = useThemeProps({ props: inProps, name: 'MuiDataGrid' });

  const props = React.useMemo<GridInputComponentProps>(
    () => ({
      ...themedProps,
      // force props
      signature: 'DataGridPro',
    }),
    [themedProps],
  );

  return useProcessedProps(props);
};
