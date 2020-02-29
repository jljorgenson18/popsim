import React from 'react';

import styled from 'styled-components';
import { Box } from 'grommet';

interface ControlsProps {
  children: React.ReactNode | React.ReactNode[];
}

const Wrapper = styled(Box)``;
function Controls(props: ControlsProps) {
  return (
    <Wrapper pad="large" direction="column">
      {props.children}
    </Wrapper>
  );
}

export default Controls;
