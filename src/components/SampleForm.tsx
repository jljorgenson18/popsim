import React from 'react';
import { Box, Button, Form, FormField, Heading, Select } from 'grommet';
import { useFormik } from 'formik';
import { SamplePayload } from 'src/db/sample';

interface SampleFormProps {
  onCancel: () => void;
  onSubmit: (payload: SamplePayload) => void;
}

function SampleForm(props: SampleFormProps) {
  const { onSubmit, onCancel } = props;
  const formik = useFormik({
    initialValues: {
      name: '',
      model: ''
    },
    validate(values) {
      const errors: { [fieldName: string]: string } = {};
      if (!values.model) {
        errors.model = 'Required';
      }
      if (!values.name) {
        errors.name = 'Required';
      }
      return errors;
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
        <FormField
          label="Name"
          name="name"
          placeholder="My sample name"
          error={(formik.touched.name || formik.submitCount > 0) && formik.errors.name}
          value={formik.values.name}
          onChange={formik.handleChange}
        />
        <FormField
          label="Model"
          htmlFor="model-select"
          error={(formik.touched.model || formik.submitCount > 0) && formik.errors.model}>
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
        <Box direction="row" gap="medium">
          <Button
            label={'Submit'}
            primary
            gap="small"
            type="submit"
            disabled={!formik.isValid && formik.submitCount > 0}></Button>
          <Button label={'Cancel'} onClick={onCancel} gap="small"></Button>
        </Box>
      </Form>
    </Box>
  );
}

export default SampleForm;
