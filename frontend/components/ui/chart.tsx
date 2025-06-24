import {
  BarChart as RechartsBarChart,
  Bar as RechartsBar,
  XAxis as RechartsXAxis,
  YAxis as RechartsYAxis,
  CartesianGrid as RechartsCartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer as RechartsResponsiveContainer,
  Cell as RechartsCell,
  ScatterChart as RechartsScatterChart,
  Scatter as RechartsScatter,
  ZAxis as RechartsZAxis,
} from 'recharts';

import type {
  TooltipProps,
} from 'recharts';

// ✅ Correct JSX-compatible typing
import type { FunctionComponent } from 'react';

// Explicitly cast to JSX-compatible types
export const BarChart = RechartsBarChart;
export const Bar = RechartsBar as unknown as FunctionComponent<any>;
export const XAxis = RechartsXAxis as unknown as FunctionComponent<any>;
export const YAxis = RechartsYAxis as unknown as FunctionComponent<any>;
export const CartesianGrid = RechartsCartesianGrid as unknown as FunctionComponent<any>;
export const Tooltip = RechartsTooltip as unknown as FunctionComponent<any>;
export const ResponsiveContainer = RechartsResponsiveContainer;
export const Cell = RechartsCell;
export const ScatterChart = RechartsScatterChart;
export const Scatter = RechartsScatter;
export const ZAxis = RechartsZAxis as unknown as FunctionComponent<any>;

export type { TooltipProps };
