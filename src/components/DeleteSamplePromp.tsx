import React from 'react';
import { Layer, Box, Heading, Text, Button } from 'grommet';

import { SampleDoc, deleteSample } from 'src/db/sample';

interface DeleteSamplePromptProps {
  sample: SampleDoc;
  onClear: () => void;
}

function DeleteSamplePrompt(props: DeleteSamplePromptProps) {
  const { sample, onClear } = props;
  return (
    <Layer position="center" modal onClickOutside={onClear} onEsc={onClear}>
      <Box pad="medium" gap="small" width="medium">
        <Heading level={3} margin="none">
          Confirm
        </Heading>
        <Text>Are you sure you want to delete this sample?</Text>
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
                <strong>Yep!</strong>
              </Text>
            }
            onClick={async () => {
              await deleteSample(sample);
              onClear();
            }}
            primary
            color="status-critical"
          />
          <Button label="Nah I'm good" color="dark-3" onClick={onClear} />
        </Box>
      </Box>
    </Layer>
  );
}

export default DeleteSamplePrompt;
