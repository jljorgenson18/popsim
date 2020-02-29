import React, { useState } from 'react';
import { VizProps } from './types';
import TimeSeriesChart from './common/TimeSeriesChart';
import { CheckBox, Box } from 'grommet';

function Length(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  const [deviation, setDeviation] = useState(false);
  return (
    <TimeSeriesChart
      dataKeys={[deviation ? 'L_dev' : 'L']}
      vizName={deviation ? 'Length Deviation' : 'Length'}
      sampleName={name}
      data={data.moments as any}
      controlElement={
        <Box>
          <CheckBox
            checked={deviation}
            label="Standard Deviation"
            onChange={(event: any) => {
              setDeviation(event.target.checked);
            }}
          />
        </Box>
      }
    />
  );
}

export default Length;
