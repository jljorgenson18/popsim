import React from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';

function Mass(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  return (
    <div>
      <TimeSeriesChart
        dataKey="M"
        deviationDataKey="M_dev"
        deviationVizName="Mass Deviation"
        vizName="Mass"
        sampleName={name}
        moments={data.moments}
      />
    </div>
  );
}

export default Mass;
