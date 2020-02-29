import React, { useMemo, useState, useEffect } from 'react';
import { CheckBox, Box } from 'grommet';

import { VizProps } from './types';
import ControlField from './common/ControlField';
import TimeSeriesChart from './common/TimeSeriesChart';

interface SpeciesOptions {
  [speciesKey: string]: boolean;
}

function Species(props: VizProps) {
  const {
    sample: { data, name }
  } = props;
  // We can get the species keys from just looking at the first species data
  const speciesKeys = useMemo(() => Object.keys(data.species[0]).filter(key => key !== 't'), [
    data.species
  ]);
  const [speciesOptions, setSpeciesOptions] = useState<SpeciesOptions>({});
  useEffect(() => {
    const newSpeciesOptions = speciesKeys.reduce<typeof speciesOptions>((mapped, key) => {
      mapped[key] = false;
      return mapped;
    }, {});
    setSpeciesOptions(newSpeciesOptions);
  }, [speciesKeys]);

  const dataKeys = useMemo(
    () => (speciesOptions ? speciesKeys.filter(key => speciesOptions[key]) : []),
    [speciesKeys, speciesOptions]
  );

  return (
    <TimeSeriesChart
      dataKeys={dataKeys}
      deviationDataKeys={['L_dev']}
      vizName="Species"
      deviationVizName="Species Deviation"
      sampleName={name}
      data={data.species as any}
      controlElement={
        <ControlField
          label="Select Species"
          input={
            <Box>
              {speciesKeys.map(key => {
                const display = !!speciesOptions[key];
                return (
                  <CheckBox
                    key={key}
                    checked={display}
                    label={key}
                    onChange={event => {
                      setSpeciesOptions({
                        ...speciesOptions,
                        [key]: event.target.checked
                      });
                    }}
                  />
                );
              })}
            </Box>
          }></ControlField>
      }
    />
  );
}
export default Species;
