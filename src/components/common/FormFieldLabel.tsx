import React from 'react';
import { FormField, Box, Text } from 'grommet';

type FormFieldLabelProps = React.ComponentProps<typeof FormField>;

function FormFieldLabel(props: FormFieldLabelProps) {
  const { required, label, ...rest } = props as any; // TODO, Figure out why this is causing problems
  return (
    <FormField
      label={
        required ? (
          <Box direction="row">
            <Text>{label}</Text>
            <Text color="status-critical">*</Text>
          </Box>
        ) : (
          label
        )
      }
      {...rest}
    />
  );
}

export default FormFieldLabel;
