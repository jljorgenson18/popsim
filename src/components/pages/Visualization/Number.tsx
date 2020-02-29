import React from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';

function NumberChart(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  return (
    <TimeSeriesChart
      dataKeys={['P']}
      deviationDataKeys={['P_dev']}
      vizName="Number"
      deviationVizName="Number Deviation"
      sampleName={name}
      data={data.moments as any}
    />
  );
}

export default NumberChart;
