import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AxisDomain
} from 'recharts';
import { useDebounce } from 'use-debounce';
import { VizProps } from './types';
import { RangeInput, Box, CheckBox } from 'grommet';
import SaveChart from './common/SaveChart';
import Controls from './common/Controls';
import type { DataPoint, Histogram as HistogramData } from 'src/math/analysis';
import { SampleData } from 'src/db/sample';

function useStableYDomain(data: SampleData, polymersOnly: boolean): [AxisDomain, AxisDomain] {
  const highestPValue = useMemo(() => {
    const highestPFromDataPoints = (dataPoints: DataPoint[]): number => {
      return dataPoints.reduce((current, dataPoint) => {
        const highestP = dataPoint.p;
        if (highestP > current) return highestP;
        return current;
      }, -Infinity);
    };
    return data.histograms.reduce((current, histogram) => {
      const highestP = highestPFromDataPoints(polymersOnly ? histogram.h.slice(1) : histogram.h);
      if (highestP > current) return highestP;
      return current;
    }, -Infinity);
  }, [data.histograms, polymersOnly]);
  return [0, Math.ceil(highestPValue)];
}

function usePlotData(selectedBin: number, histograms: HistogramData[], polymersOnly: boolean) {
  const [delayedSelectedBin] = useDebounce(selectedBin, 100, {
    trailing: true
  });
  if (polymersOnly) {
    return histograms[delayedSelectedBin].h.slice(1);
  }
  return histograms[delayedSelectedBin].h;
}
function Histogram(props: VizProps) {
  const {
    sample: { name },
    data
  } = props;
  const [polymersOnly, setPolymersOnly] = useState(false);
  const [selectedBin, setSelectedBin] = useState<number>(0);

  const chartRef = useRef(null);
  // Each key contains t and the histogram. User should select which histogram to use
  // based on the t value.
  const plot_data = usePlotData(selectedBin, data.histograms, polymersOnly);
  const yDomain = useStableYDomain(data, polymersOnly);
  // LINES should be generated based on one or more selected values from keys
  return (
    <>
      <ResponsiveContainer height={350} width="100%">
        <BarChart data={plot_data} ref={chartRef}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="t" name="Size" />
          <YAxis domain={yDomain} />
          <Tooltip labelFormatter={(size: number) => `Size: ${size}`} />
          <Bar dataKey="p" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
      <Controls>
        <Box fill="horizontal">
          <RangeInput
            value={selectedBin}
            max={data.histograms.length - 1}
            min={0}
            onChange={(event: any) => setSelectedBin(event.target.value)}
          />
          <p>{`Selected Time: ${data.histograms[selectedBin].t.toFixed(6)}`}</p>
        </Box>
        <Box direction="row" gap="medium">
          <SaveChart chartRef={chartRef} visualization={'histogram'} sampleName={name} />
          <CheckBox
            checked={polymersOnly}
            label="Polymers Only"
            onChange={(event: any) => {
              setPolymersOnly(event.target.checked);
            }}
          />
        </Box>
      </Controls>
    </>
  );
}

export default Histogram;
