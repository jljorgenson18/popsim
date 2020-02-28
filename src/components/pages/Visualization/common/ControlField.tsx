import React from 'react';
import { Box } from 'grommet';
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

function ControlField(props: ControlFieldProps) {
  const { input, label } = props;
  return (
    <FieldWrapper>
      <label>{label}</label>
      {input}
    </FieldWrapper>
  );
}

export default ControlField;
