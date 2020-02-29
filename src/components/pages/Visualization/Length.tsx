import React from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';

function Length(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  return (
    <TimeSeriesChart
      dataKeys={['L']}
      deviationDataKeys={['L_dev']}
      vizName="Length"
      deviationVizName="Length Deviation"
      sampleName={name}
      data={data.moments as any}
    />
  );
}

export default Length;
