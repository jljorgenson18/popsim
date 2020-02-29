import React, { useState } from 'react';
import { FormField, Select, Heading } from 'grommet';

import { SampleDoc } from 'src/db/sample';
import Mass from './Mass';
import NumberChart from './Number';
import Length from './Length';
import Species from './Species';
import Histogram from './Histogram';
import SpeciesVariance from './SpeciesVariance';
import Runs from './Runs';
import Page from 'src/components/common/Page';
import RawSampleData from './RawSampleData';
import { useLocation } from 'react-router-dom';

interface VisualizationProps {
  allSamples?: SampleDoc[];
}

const VizOptions = {
  Mass: Mass,
  Number: NumberChart,
  Length: Length,
  Species: Species,
  Histogram: Histogram,
  SpeciesVariance: SpeciesVariance,
  Runs: Runs,
  'Raw Sample Data': RawSampleData
} as {
  [visType: string]: any;
};

const VizOptionTypes = Object.keys(VizOptions);

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

function Visualization(props: VisualizationProps) {
  const { allSamples } = props;
  const query = useQuery();
  const [currentViz, setCurrentViz] = useState<string>(VizOptionTypes[0]);
  const sampleIds = query.get('samples').split(',');
  const sample = (allSamples || []).find(sample => sample._id === sampleIds[0]);
  if (!sample) return null;
  return (
    <Page>
      <Heading level={2}>Visualize Samples</Heading>
      <FormField>
        <Select
          id="model-select"
          placeholder="Select a model"
          options={VizOptionTypes}
          name="model"
          onChange={evt => setCurrentViz(evt.value)}
          value={currentViz || ''}></Select>
      </FormField>
      {React.createElement(VizOptions[currentViz], {
        sample
      })}
    </Page>
  );
}

export default Visualization;
