import React, { useRef } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

import { VizProps } from './types';
import { useScaleInputField, useFilteredDataPoints, useFilteredMoments } from './hooks';
import { RadioButtonGroup } from 'grommet';
import SaveChart from './common/SaveChart';

function Mass(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  const { options, scale, onChange } = useScaleInputField();
  const dataMass = useFilteredMoments(data.moments);
  const chartRef = useRef(null);

  console.log(dataMass);
  return (
    <>
      <LineChart data={dataMass} width={500} height={300} ref={chartRef}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          name="Time"
          tickFormatter={(val: number) => val.toFixed(2)}
          scale={scale}
        />
        <YAxis dataKey="M" name="Mass" domain={[0, 'auto']} />
        <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
        <Line type="monotone" dataKey="M" stroke="#82ca9d" dot={false} />
      </LineChart>
      <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
      <SaveChart chartRef={chartRef} visualization={'mass-' + scale} sampleName={name} />
    </>
  );
}

export default Mass;
