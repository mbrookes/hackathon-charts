import * as React from 'react';
import clsx from 'clsx';
import { createTheme } from '@mui/material/styles';
import { createStyles, makeStyles } from '@mui/styles';
import { GridCellParams } from '../../../_modules_/grid';

const defaultTheme = createTheme();
const useStyles = makeStyles(
  (theme) =>
    createStyles({
      root: {
        width: '100%',
        fontVariantNumeric: 'tabular-nums',
      },
      positive: {
        color:
          theme.palette.mode === 'light' ? theme.palette.success.dark : theme.palette.success.light,
      },
      negative: {
        color:
          theme.palette.mode === 'light' ? theme.palette.error.dark : theme.palette.error.light,
      },
    }),
  { defaultTheme },
);

function pnlFormatter(value: number) {
  return value < 0 ? `(${Math.abs(value).toLocaleString()})` : value.toLocaleString();
}

interface PnlProps {
  value: number;
}

const Pnl = React.memo(function Pnl(props: PnlProps) {
  const { value } = props;
  const classes = useStyles();

  return (
    <div
      className={clsx(classes.root, {
        [classes.positive]: value > 0,
        [classes.negative]: value < 0,
      })}
    >
      {pnlFormatter(value)}
    </div>
  );
});

export function renderPnl(params: GridCellParams) {
  return <Pnl value={params.value as any} />;
}
