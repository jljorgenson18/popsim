import { Anchor, AnchorProps } from 'grommet/components/Anchor';
import React from 'react';
import { Link, LinkProps } from 'react-router-dom';

type AnchorLinkProps = LinkProps & AnchorProps & Omit<JSX.IntrinsicElements['a'], 'color'>;

export default function AnchorLink(props: AnchorLinkProps) {
  return (
    <Anchor as={({ colorProp, hasIcon, hasLabel, focus, ...p }) => <Link {...p} />} {...props} />
  );
}
