import React from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';

function NumberChart(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  return (
    <TimeSeriesChart
      dataKey="P"
      vizName="Number"
      deviationDataKey="P_dev"
      deviationVizName="Number Deviation"
      sampleName={name}
      moments={data.moments}
    />
  );
}

export default NumberChart;
