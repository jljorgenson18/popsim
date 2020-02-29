import React, { useState } from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';
import { CheckBox } from 'grommet';

function NumberChart(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  const [deviation, setDeviation] = useState(false);
  return (
    <TimeSeriesChart
      dataKeys={[deviation ? 'P_dev' : 'P']}
      vizName={deviation ? 'Number Deviation' : 'Number'}
      sampleName={name}
      data={data.moments as any}
      controlElement={
        <CheckBox
          checked={deviation}
          label="Standard Deviation"
          onChange={(event: any) => {
            setDeviation(event.target.checked);
          }}
        />
      }
    />
  );
}

export default NumberChart;
