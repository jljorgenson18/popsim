import React from 'react';
import { Box, Button, Form, FormField, Heading, Select } from 'grommet';
import { useFormik } from 'formik';

interface SampleFormProps {
  onCancel: () => void;
  onSubmit: (payload: SamplePayload) => void;
}

interface Model1Payload {
  model: 'model 1';
}

interface Model2Payload {
  model: 'model 2';
}

interface Model3Payload {
  model: 'model 3';
}

interface Model4Payload {
  model: 'model 4';
}

export type SamplePayload = Model1Payload | Model2Payload | Model3Payload | Model4Payload;

function SampleForm(props: SampleFormProps) {
  const { onSubmit, onCancel } = props;
  const formik = useFormik({
    initialValues: {
      model: ''
    },
    onSubmit(values: SamplePayload) {
      onSubmit(values);
    }
  });
  console.log(formik);
  const currentModel = formik.values.model;
  console.log(currentModel);
  return (
    <Box pad="medium" gap="small" width="medium">
      <Form onSubmit={formik.handleSubmit}>
        <Heading level={3}>New Sample</Heading>
        <FormField label="Model" htmlFor="model-select" required>
          <Select
            id="model-select"
            placeholder="Select a model"
            options={['model 1', 'model 2', 'model 3', 'model 4']}
            name="model"
            onChange={evt => {
              formik.setFieldValue('model', evt.value as string, true);
            }}
            value={formik.values.model}></Select>
        </FormField>
        <Box direction="row" justify="between">
          <Button label={'Submit'} primary gap="small" type="submit"></Button>
          <Button label={'Cancel'} onClick={onCancel} gap="small"></Button>
        </Box>
      </Form>
    </Box>
  );
}

export default SampleForm;
