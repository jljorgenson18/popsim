import React, { useMemo, useState, useEffect, useRef } from 'react';
import randomColor from 'randomcolor';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { CheckBox, RadioButtonGroup } from 'grommet';
import styled from 'styled-components';

import { VizProps } from './types';
import { useScaleInputField, useFilteredDataPoints } from './hooks';
import SaveChart from './common/SaveChart';
import Controls from './common/Controls';
import ControlField from './common/ControlField';

interface SpeciesOption {
  display: boolean;
  color: string;
}
function Species(props: VizProps) {
  const {
    sample: { data, name }
  } = props;

  const [speciesOptions, setSpeciesOptions] = useState<{
    [speciesKey: string]: SpeciesOption;
  }>(null);
  console.log(data.species);

  // We can get the species keys from just looking at the first species data
  const speciesKeys = useMemo(() => Object.keys(data.species[0]).filter(key => key !== 't'), [
    data.species
  ]);
  console.log(speciesKeys);

  useEffect(() => {
    const newSpeciesOptions = speciesKeys.reduce<typeof speciesOptions>((mapped, key) => {
      mapped[key] = {
        display: false,
        color: randomColor({
          luminosity: 'dark'
        })
      };
      return mapped;
    }, {});
    setSpeciesOptions(newSpeciesOptions);
  }, [speciesKeys]);
  const { options, scale, onChange } = useScaleInputField('scale');
  const dataSpecies = useFilteredDataPoints(data.species);
  const chartRef = useRef(null);

  if (!speciesOptions) return null;
  // Each key is a specific species, UI should somehow allow user to select
  // multiple species to plot on the same graph.
  // Key "t" should be ignored as it is the x-axis
  return (
    // LINES should be generated based on one or more selected values from keys
    <>
      <LineChart data={dataSpecies} width={500} height={300} ref={chartRef}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="t"
          name="Time"
          tickFormatter={(val: number) => val.toFixed(2)}
          scale={scale}
        />
        <YAxis dataKey="1" name="Number" />
        <Tooltip labelFormatter={(time: number) => `Time: ${time.toFixed(2)}`} />
        {speciesKeys
          .map(key => {
            const { display, color } = speciesOptions[key];
            if (!display) return null;
            return (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                dot={false}
                strokeWidth={3}
              />
            );
          })
          .filter(Boolean)}
      </LineChart>
      <Controls>
        <ControlField
          label="Scale"
          input={
            <RadioButtonGroup name="scale" options={options} value={scale} onChange={onChange} />
          }
        />
        <ControlField
          label="Select Species"
          input={
            <div>
              {speciesKeys.map(key => {
                const { display, ...rest } = speciesOptions[key];
                return (
                  <CheckBox
                    key={key}
                    checked={display}
                    label={key}
                    onChange={event => {
                      setSpeciesOptions({
                        ...speciesOptions,
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
          }></ControlField>
        <SaveChart chartRef={chartRef} visualization={'species-' + scale} sampleName={name} />
      </Controls>
    </>
  );
}

export default Species;
