import React from 'react';
import { Main, BoxProps } from 'grommet';
import styled from 'styled-components';

interface PageProps {}

const MainContent = styled(Main)`
  height: auto;
`;
function Page(props: PageProps & BoxProps & JSX.IntrinsicElements['div']) {
  return <MainContent pad="large" {...props} />;
}

export default Page;
