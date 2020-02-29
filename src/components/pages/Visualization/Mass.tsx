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
        dataKeys={['M']}
        deviationDataKeys={['M_dev']}
        deviationVizName="Mass Deviation"
        vizName="Mass"
        sampleName={name}
        data={data.moments as any}
      />
    </div>
  );
}

export default Mass;
