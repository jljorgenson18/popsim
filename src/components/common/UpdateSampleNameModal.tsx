import React from 'react';
import { Layer, Box, Heading, Text, Button, Form } from 'grommet';

import { SampleDoc, updateSample } from 'src/db/sample';
import { useFormik } from 'formik';
import FormFieldLabel from './FormFieldLabel';

interface UpdateSampleNameModalProps {
  sample: SampleDoc;
  onClear: () => void;
}

interface UpdateSampleNameValues {
  name: string;
}
function UpdateSampleNameModal(props: UpdateSampleNameModalProps) {
  const { sample, onClear } = props;
  const initialValues: UpdateSampleNameValues = {
    name: sample.name
  };
  const formik = useFormik({
    initialValues,
    validate(values: UpdateSampleNameValues) {
      const errors: { [fieldName: string]: string } = {};
      if (!values.name) errors.name = 'Required';
      return errors;
    },
    onSubmit: async (values: UpdateSampleNameValues) => {
      await updateSample({
        ...sample,
        name: values.name
      });
      onClear();
    }
  });
  const submitted = formik.submitCount > 0;
  return (
    <Layer position="center" onClickOutside={onClear} onEsc={onClear} responsive={false}>
      <Box pad="medium" gap="small" width="medium">
        <Heading level={3}>Updating Sample Name</Heading>
        <Form onSubmit={formik.handleSubmit} noValidate>
          <FormFieldLabel
            label="Name"
            name="name"
            required
            placeholder="Sample Name"
            error={formik.errors.name}
            value={formik.values.name}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
          />
          <Box
            as="footer"
            gap="small"
            direction="row"
            align="center"
            justify="end"
            pad={{ top: 'medium', bottom: 'small' }}>
            <Button
              label={'Submit'}
              primary
              gap="small"
              type="submit"
              disabled={!formik.isValid && submitted}></Button>
            <Button label="Cancel" color="dark-3" onClick={onClear} />
          </Box>
        </Form>
      </Box>
    </Layer>
  );
}

export default UpdateSampleNameModal;
