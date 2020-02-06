import React, { useState } from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { VizProps } from './types';
import { RangeInput } from 'grommet';

function Histogram(props: VizProps) {
  const {
    sample: { data }
  } = props;
  const [selectedBin, setSelectedBin] = useState<number>(0);
  // Each key contains t and the histogram. User should select which histogram to use
  // based on the t value.
  const plot_data = data.histograms[selectedBin].h;
  // LINES should be generated based on one or more selected values from keys
  return (
    <>
      <BarChart data={plot_data} width={500} height={300}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="t" name="Size" />
        <YAxis />
        <Tooltip labelFormatter={(size: number) => `Size: ${size}`} />
        <Bar dataKey="p" fill="#8884d8" />
      </BarChart>
      <RangeInput
        value={selectedBin}
        max={data.histograms.length - 1}
        min={0}
        onChange={(event: any) => setSelectedBin(event.target.value)}
      />
      <p>{`Selected Time: ${data.histograms[selectedBin].t.toFixed(6)}`}</p>
    </>
  );
}

export default Histogram;
