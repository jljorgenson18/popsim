import React, { useState } from 'react';
import { Box, FormField, Select } from 'grommet';

import { SampleDoc } from 'src/db/sample';
import Mass from './Mass';
import NumberComponent from './Number';
import Length from './Length';
import Species from './Species';
import Histogram from './Histogram';

interface VisualizationProps {
  sample: SampleDoc;
}

const VizOptions = {
  Mass: Mass,
  Number: NumberComponent,
  Length: Length,
  Species: Species,
  Histogram: Histogram
} as {
  [visType: string]: any;
};

const VizOptionTypes = Object.keys(VizOptions);

function Visualization(props: VisualizationProps) {
  const { sample } = props;
  const [currentViz, setCurrentViz] = useState<string>(VizOptionTypes[0]);
  return (
    <Box
      pad="medium"
      gap="none"
      width="large"
      style={{ maxHeight: '90vh', overflowY: 'scroll' }}
      data-testid="sampleForm">
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
    </Box>
  );
}

export default Visualization;
