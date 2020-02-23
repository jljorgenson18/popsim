import React, { useMemo, useState, useEffect, useRef } from 'react';
import randomColor from 'randomcolor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CheckBox, RadioButtonGroup } from 'grommet';
import styled from 'styled-components';

import { VizProps } from './types';
import { useScaleInputField, useFilteredDataPoints } from './hooks';
import SaveChart from './common/SaveChart';

const SelectedSpeciesVariance = styled.div`
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

interface SpeciesVarianceOption {
  display: boolean;
  color: string;
}
function SpeciesVariance(props: VizProps) {
  const {
    sample: { data, name }
  } = props;

  const [speciesVarianceOptions, setSpeciesVarianceOptions] = useState<{
    [speciesVarianceKey: string]: SpeciesVarianceOption;
  }>(null);

  // We can get the speciesVariance keys from just looking at the first speciesVariance data
  const speciesVarianceKeys = useMemo(
    () => Object.keys(data.variance[0]).filter(key => key !== 't'),
    [data.variance]
  );
  useEffect(() => {
    const newSpeciesVarianceOptions = speciesVarianceKeys.reduce<typeof speciesVarianceOptions>(
      (mapped, key) => {
        mapped[key] = {
          display: false,
          color: randomColor({
            luminosity: 'dark'
          })
        };
        return mapped;
      },
      {}
    );
    setSpeciesVarianceOptions(newSpeciesVarianceOptions);
  }, [speciesVarianceKeys]);
  const { options, scale, onChange } = useScaleInputField();
  const dataSpeciesVariance = useFilteredDataPoints(data.variance);
  const chartRef = useRef(null);

  if (!speciesVarianceOptions) return null;
  // Each key is a specific speciesVariance, UI should somehow allow user to select
  // multiple speciesVariance to plot on the same graph.
  // Key "t" should be ignored as it is the x-axis
  return (
    // LINES should be generated based on one or more selected values from keys
    <>
      <LineChart data={dataSpeciesVariance} width={500} height={300} ref={chartRef}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          name="Time"
          tickFormatter={(val: number) => val.toFixed(2)}
          scale={scale}
        />
        <YAxis dataKey="1" name="Number variance" />
        <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
        {speciesVarianceKeys
          .map(key => {
            const { display, color } = speciesVarianceOptions[key];
            if (!display) return null;
            return <Line key={key} type="monotone" dataKey={key} stroke={color} dot={false} />;
          })
          .filter(Boolean)}
      </LineChart>
      <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
      <SaveChart
        chartRef={chartRef}
        visualization={'species-variance-' + scale}
        sampleName={name}
      />
      <SelectedSpeciesVariance>
        <h4>Select SpeciesVariance</h4>
        <div>
          {speciesVarianceKeys.map(key => {
            const { display, ...rest } = speciesVarianceOptions[key];
            return (
              <CheckBox
                key={key}
                checked={display}
                label={key}
                onChange={event => {
                  setSpeciesVarianceOptions({
                    ...speciesVarianceOptions,
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
      </SelectedSpeciesVariance>
    </>
  );
}

export default SpeciesVariance;
