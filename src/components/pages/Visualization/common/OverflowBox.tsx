import React from 'react';
import { Box } from 'grommet';

interface OverflowBoxProps {
  children: React.ReactNode | React.ReactNode[];
  maxHeight?: string;
}

function OverflowBox(props: OverflowBoxProps) {
  const { children, maxHeight = '160px' } = props;
  return (
    <Box overflow="auto" style={{ display: 'block' }} height={{ min: '0px', max: maxHeight }}>
      {children}
    </Box>
  );
}

export default OverflowBox;
