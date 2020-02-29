import React from 'react';
import { Box, BoxProps } from 'grommet';
import styled from 'styled-components';

interface ControlFieldProps {
  label: string;
  input: React.ReactElement;
}

const FieldWrapper = styled(Box)`
  label {
    font-size: 20px;
    margin-bottom: 8px;
  }
`;

function ControlField(props: ControlFieldProps & BoxProps) {
  const { input, label, ...rest } = props;
  return (
    <FieldWrapper {...rest}>
      <label>{label}</label>
      {input}
    </FieldWrapper>
  );
}

export default ControlField;
