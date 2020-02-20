import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { VizProps } from './types';
import { useScaleInputField, useFilteredDataPoints, useFilteredMoments } from './hooks';
import { RadioButtonGroup } from 'grommet';

function MassDeviation(props: VizProps) {
  const {
    sample: { data }
  } = props;
  const { options, scale, onChange } = useScaleInputField();
  const dataMassDeviation = useFilteredMoments(data.moments);
  console.log(dataMassDeviation);
  return (
    <>
      <LineChart data={dataMassDeviation} width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          name="Time"
          tickFormatter={(val: number) => val.toFixed(2)}
          scale={scale}
        />
        <YAxis dataKey="M_dev" name="MassDeviation" domain={[0, 'auto']} />
        <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
        <Line type="monotone" dataKey="M_dev" stroke="#82ca9d" dot={false} />
      </LineChart>
      <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
    </>
  );
}

export default MassDeviation;
