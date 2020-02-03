import React, { useState } from 'react';
import { Box, Button, Form, FormField, Heading, Select, Text, Grid } from 'grommet';

import { SampleDoc } from 'src/db/sample';
import Mass from './Mass';
import NumberComponent from './Number';
import Length from './Length';
import Species from './Species';

interface VisualizationProps {
  sample: SampleDoc;
}

const VizOptions = {
  mass: Mass,
  number: NumberComponent,
  length: Length,
  species: Species
} as {
  [visType: string]: any;
};

const VizOptionTypes = Object.keys(VizOptions);

function Visualization(props: VisualizationProps) {
  const { sample } = props;
  console.log(sample);
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
