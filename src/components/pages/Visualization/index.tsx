import React, { useState, useEffect } from 'react';
import { FormField, Select, Heading, Box } from 'grommet';
import { FormEdit } from 'grommet-icons';

import { SampleDoc, SampleData, getSampleDataFromSample } from 'src/db/sample';
import Mass from './Mass';
import NumberChart from './Number';
import Length from './Length';
import Histogram from './Histogram';
import Page from 'src/components/common/Page';
import RawSampleData from './RawSampleData';
import { useLocation } from 'react-router-dom';
import Reactions from './ReactionsComponent';
import UpdateSampleNameModal from 'src/components/common/UpdateSampleNameModal';

interface VisualizationProps {
  allSamples?: SampleDoc[];
}

const VizOptions = {
  Mass: Mass,
  Number: NumberChart,
  Length: Length,
  Histogram: Histogram,
  Reactions: Reactions,
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
  const [hoveringOverTitle, setHoveringOverTitle] = useState<boolean>(false);
  const [showingUpdateSampleName, setShowingUpdateSampleName] = useState<boolean>(false);
  const [sampleData, setSampleData] = useState<SampleData>(null);
  const [currentViz, setCurrentViz] = useState<string>(VizOptionTypes[0]);
  const sampleIds = query.get('samples').split(',');
  const sample = (allSamples || []).find(sample => sample._id === sampleIds[0]);
  useEffect(() => {
    if (!sample) return;
    getSampleDataFromSample(sample._id).then(sampleData => setSampleData(sampleData));
  }, [sample]);
  if (!sample || !sampleData) return null;
  return (
    <Page>
      <Heading
        style={{ display: 'flex', alignItems: 'center' }}
        level={2}
        onMouseEnter={() => setHoveringOverTitle(true)}
        onMouseLeave={() => setHoveringOverTitle(false)}>
        <span>{`Sample: ${sample.name}`}</span>
        {hoveringOverTitle ? (
          <FormEdit
            style={{ height: 32, width: 32, cursor: 'pointer' }}
            onClick={() => setShowingUpdateSampleName(true)}
          />
        ) : null}
      </Heading>
      {showingUpdateSampleName ? (
        <UpdateSampleNameModal sample={sample} onClear={() => setShowingUpdateSampleName(false)} />
      ) : null}
      <Box width={{ max: '500px' }} margin={{ vertical: 'medium' }}>
        <FormField>
          <Select
            id="viz-select"
            placeholder="Select a Visualization"
            options={VizOptionTypes}
            name="visualization"
            onChange={evt => setCurrentViz(evt.value)}
            value={currentViz || ''}></Select>
        </FormField>
      </Box>
      {React.createElement(VizOptions[currentViz], {
        sample,
        data: sampleData
      })}
    </Page>
  );
}

export default Visualization;
