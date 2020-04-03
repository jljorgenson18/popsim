import React, { useMemo, useState, useEffect, useRef } from 'react';
import randomColor from 'randomcolor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CheckBox, RadioButtonGroup } from 'grommet';
import styled from 'styled-components';

import { VizProps } from './types';
import { useScaleInputField, useFilteredDataPoints } from './hooks';
import SaveChart from './common/SaveChart';

const SelectedRuns = styled.div`
  h4 {
    text-align: center;
    margin: 8px 0;
  }

  > div {
    display: flex;
    flex-wrap: wrap;

    > * {
      margin: 16px 24px;
    }
  }
`;

interface RunsOption {
  display: boolean;
  color: string;
}
function Runs(props: VizProps) {
  const {
    sample: { name },
    data
  } = props;

  const [RunsOptions, setRunsOptions] = useState<{
    [RunsKey: string]: RunsOption;
  }>(null);

  // We can get the Runs keys from just looking at the first Runs data
  const RunsKeys = useMemo(() => Object.keys(data.runs[0][0]).filter(key => key !== 't'), [
    data.runs[0]
  ]);
  useEffect(() => {
    const newRunsOptions = RunsKeys.reduce<typeof RunsOptions>((mapped, key) => {
      mapped[key] = {
        display: false,
        color: randomColor({
          luminosity: 'dark'
        })
      };
      return mapped;
    }, {});
    setRunsOptions(newRunsOptions);
  }, [RunsKeys]);
  const { options, scale, onChange } = useScaleInputField('scale');
  const dataRuns = useFilteredDataPoints(data.runs[0]);
  const chartRef = useRef(null);

  if (!RunsOptions) return null;
  // Each key is a specific Runs, UI should somehow allow user to select
  // multiple Runs to plot on the same graph.
  // Key "t" should be ignored as it is the x-axis
  return (
    // LINES should be generated based on one or more selected values from keys
    <>
      <LineChart data={dataRuns} width={500} height={300} ref={chartRef}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          name="Time"
          tickFormatter={(val: number) => val.toFixed(2)}
          scale={scale}
        />
        <YAxis dataKey="1" name="Number" />
        <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
        {RunsKeys.map(key => {
          const { display, color } = RunsOptions[key];
          if (!display) return null;
          return <Line key={key} type="monotone" dataKey={key} stroke={color} dot={false} />;
        }).filter(Boolean)}
      </LineChart>
      <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
      <SaveChart chartRef={chartRef} visualization={'run-' + scale} sampleName={name} />
      <SelectedRuns>
        <h4>Select Runs</h4>
        <div>
          {RunsKeys.map(key => {
            const { display, ...rest } = RunsOptions[key];
            return (
              <CheckBox
                key={key}
                checked={display}
                label={key}
                onChange={event => {
                  setRunsOptions({
                    ...RunsOptions,
                    [key]: {
                      ...rest,
                      display: event.target.checked
                    }
                  });
                }}
              />
            );
          })}
        </div>
      </SelectedRuns>
    </>
  );
}

export default Runs;
