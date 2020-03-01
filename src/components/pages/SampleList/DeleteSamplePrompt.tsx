import React from 'react';
import { Layer, Box, Heading, Text, Button } from 'grommet';

import { deleteSamples, getSamplesFromIds } from 'src/db/sample';

interface DeleteSamplePromptProps {
  sampleIds: string[];
  onClear: () => void;
}

function DeleteSamplePrompt(props: DeleteSamplePromptProps) {
  const { sampleIds, onClear } = props;
  return (
    <Layer position="center" modal onClickOutside={onClear} onEsc={onClear} responsive={false}>
      <Box pad="medium" gap="small" width="medium">
        <Heading level={3} margin="none">
          Confirm
        </Heading>
        <Text>{`Are you sure you want to delete ${
          sampleIds.length === 1 ? 'this sample' : 'these samples'
        }?`}</Text>
        <Box
          as="footer"
          gap="small"
          direction="row"
          align="center"
          justify="end"
          pad={{ top: 'medium', bottom: 'small' }}>
          <Button
            label={
              <Text color="white">
                <strong>Yes</strong>
              </Text>
            }
            onClick={async () => {
              const samples = await getSamplesFromIds(sampleIds);
              await deleteSamples(samples);
              onClear();
            }}
            primary
            color="status-critical"
          />
          <Button label="No" color="dark-3" onClick={onClear} />
        </Box>
      </Box>
    </Layer>
  );
}

export default DeleteSamplePrompt;
