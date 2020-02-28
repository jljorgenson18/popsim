import React from 'react';

import styled from 'styled-components';
import { Box } from 'grommet';

interface ControlsProps {
  children: React.ReactNode | React.ReactNode[];
}

const Wrapper = styled(Box)`
  display: grid;
  grid-gap: 32px;
  padding: 32px;
  grid-template-rows: auto;
  grid-template-columns: auto auto auto;
  align-items: flex-start;
  justify-content: start;
`;
function Controls(props: ControlsProps) {
  return <Wrapper>{props.children}</Wrapper>;
}

export default Controls;
