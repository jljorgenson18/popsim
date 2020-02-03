import React from 'react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { VizProps } from './types';

function Histogram(props: VizProps) {
  const {
    sample: { data }
  } = props;
  const keys = Object.keys(data.histograms);
  // Each key contains t and the histogram. User should select which histogram to use
  // based on the t value.
  const plot_data = data.histograms[80].h;
  return (
    // LINES should be generated based on one or more selected values from keys
    <BarChart data={plot_data} width={500} height={300}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="t" name="Time" tickFormatter={(val: number) => val.toFixed(2)} />
      <YAxis />
      <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
      <Bar dataKey="p" fill="#8884d8" />
    </BarChart>
  );
}

export default Histogram;
