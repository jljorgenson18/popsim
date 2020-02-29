import React, { useState } from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';
import { CheckBox } from 'grommet';

function Mass(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  const [deviation, setDeviation] = useState(false);
  return (
    <TimeSeriesChart
      dataKeys={[deviation ? 'M_dev' : 'M']}
      vizName={deviation ? 'Mass Deviation' : 'Mass'}
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

export default Mass;
