/* eslint-disable react/display-name */
import React from 'react';
import { MDXProvider, Components as MDXComponents } from '@mdx-js/react';

import Page from './common/Page';
import { Heading, Paragraph } from 'grommet';
import styled from 'styled-components';

const MarkdownPage = styled(Page)`
  .math.math-display {
  }
`;
const mdxComponents: MDXComponents = {
  wrapper: function MDXContentContainer(props: { children: React.ReactNode }) {
    const { children } = props;
    return (
      <MarkdownPage direction="column" align="stretch">
        {children}
      </MarkdownPage>
    );
  },
  h1: (props: { children: React.ReactNode }) => <Heading level={1}>{props.children}</Heading>,
  h2: (props: { children: React.ReactNode }) => <Heading level={2}>{props.children}</Heading>,
  h3: (props: { children: React.ReactNode }) => <Heading level={3}>{props.children}</Heading>,
  p: (props: { children: React.ReactNode }) => <Paragraph>{props.children}</Paragraph>
};

export default function Provider(props: { children: React.ReactNode }) {
  return <MDXProvider components={mdxComponents}>{props.children}</MDXProvider>;
}
