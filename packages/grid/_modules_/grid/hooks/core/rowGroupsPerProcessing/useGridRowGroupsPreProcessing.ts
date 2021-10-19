import * as React from 'react';
import { GridApiRef } from '../../../models/api/gridApiRef';
import {
  GridRowGroupsPreProcessingApi,
  GridRowGroupingPreProcessing,
  GridRowGroupingResult,
} from './gridRowGroupsPreProcessingApi';
import { GridEvents } from '../../../constants/eventsConstants';
import { useGridApiMethod } from '../../utils/useGridApiMethod';

const getFlatRowTree: GridRowGroupingPreProcessing = (params) => ({
  tree: new Map(params.ids.map((id) => [id.toString(), { id, depth: 0 }])),
  paths: Object.fromEntries(params.ids.map((id) => [id, [id.toString()]])),
  idRowsLookup: params.idRowsLookup,
});

export const useGridRowGroupsPreProcessing = (apiRef: GridApiRef) => {
  const rowGroupsPreProcessingRef = React.useRef(
    new Map<string, GridRowGroupingPreProcessing | null>(),
  );

  const registerRowGroupsBuilder = React.useCallback<
    GridRowGroupsPreProcessingApi['UNSTABLE_registerRowGroupsBuilder']
  >(
    (processingName, rowGroupingPreProcessing) => {
      const rowGroupingPreProcessingBefore =
        rowGroupsPreProcessingRef.current.get(processingName) ?? null;

      if (rowGroupingPreProcessingBefore !== rowGroupingPreProcessing) {
        rowGroupsPreProcessingRef.current.set(processingName, rowGroupingPreProcessing);
        apiRef.current.publishEvent(GridEvents.rowGroupsPreProcessingChange);
      }
    },
    [apiRef],
  );

  const groupRows = React.useCallback<GridRowGroupsPreProcessingApi['UNSTABLE_groupRows']>(
    (...params) => {
      let response: GridRowGroupingResult | null = null;
      const preProcessingList = Array.from(rowGroupsPreProcessingRef.current.values());

      while (!response && preProcessingList.length) {
        const preProcessing = preProcessingList.shift();

        if (preProcessing) {
          response = preProcessing(...params);
        }
      }

      if (!response) {
        return getFlatRowTree(...params)!;
      }

      return response;
    },
    [],
  );

  const rowGroupsPreProcessingApi: GridRowGroupsPreProcessingApi = {
    UNSTABLE_registerRowGroupsBuilder: registerRowGroupsBuilder,
    UNSTABLE_groupRows: groupRows,
  };

  useGridApiMethod(apiRef, rowGroupsPreProcessingApi, 'GridRowGroupsPreProcessing');
};
