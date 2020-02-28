import React from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';

function Length(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  return (
    <TimeSeriesChart
      dataKey="L"
      vizName="Length"
      deviationDataKey="L_dev"
      deviationVizName="Length Deviation"
      sampleName={name}
      moments={data.moments}
    />
  );
}

export default Length;
