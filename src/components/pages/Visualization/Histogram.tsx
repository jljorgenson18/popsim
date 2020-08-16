import React, { useState, useRef, useMemo } from 'react';
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

const TRUNCATE_AFTER = 50;
const MAX_BARS_AFTER_TRUNCATION = 20;

function useStableYDomain(data: SampleData, polymersOnly: boolean): [AxisDomain, AxisDomain] {
  const highestPValue = useMemo(() => {
    try {
      const highestPFromDataPoints = (dataPoints: DataPoint[]): number => {
        if (dataPoints.length > TRUNCATE_AFTER) {
          throw 'AUTO_Y';
        }
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
    } catch (val) {
      if (val === 'AUTO_Y') {
        return 'auto';
      }
      throw val;
    }
  }, [data.histograms, polymersOnly]);

  return [0, highestPValue === 'auto' ? 'auto' : Math.ceil(highestPValue)];
}

function usePlotData(selectedBin: number, histograms: HistogramData[], polymersOnly: boolean) {
  const [delayedSelectedBin] = useDebounce(selectedBin, 100, {
    trailing: true
  });
  return useMemo(() => {
    let plotData: DataPoint[] = histograms[delayedSelectedBin].h;
    let batchSize: number | null = null;
    if (plotData.length > TRUNCATE_AFTER) {
      batchSize = Math.floor(plotData.length / MAX_BARS_AFTER_TRUNCATION);
      const newPlotData: DataPoint[] = [plotData[0]];
      // Need to start at 1 because the first one is the monomer??
      let idx = 1;
      while (idx < plotData.length) {
        const nextIdx = idx + batchSize;
        const currentSlice = plotData.slice(idx, nextIdx);
        const combinedP = currentSlice.reduce((combined, point) => {
          combined += point.p;
          return combined;
        }, 0);
        newPlotData.push({
          p: combinedP,
          t: currentSlice[currentSlice.length - 1].t
        });
        idx = nextIdx;
      }
      plotData = newPlotData;
    }
    return { plotData: polymersOnly ? plotData.slice(1) : plotData, batchSize };
  }, [polymersOnly, delayedSelectedBin, histograms]);
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
  const { plotData, batchSize } = usePlotData(selectedBin, data.histograms, polymersOnly);
  const yDomain = useStableYDomain(data, polymersOnly);
  // LINES should be generated based on one or more selected values from keys
  return (
    <>
      <ResponsiveContainer height={350} width="100%">
        <BarChart data={plotData} ref={chartRef}>
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
          {batchSize ? <p>{`Batch Size: ${batchSize}`}</p> : null}
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
