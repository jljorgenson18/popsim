import React, { useContext } from 'react';
import { Box, ThemeType, Heading } from 'grommet';
import Loader from 'react-loader-spinner';
import { ThemeContext } from 'styled-components';
import isString from 'lodash/isString';
export interface LoadingProps {
  message: string;
  progress?: number; // Should be 0 to 1
}

const getColor = (theme: ThemeType): string => {
  const brandColor = theme.global.colors.brand;
  const dark = (theme as any).dark as boolean;
  if (isString(brandColor)) return brandColor;
  if (dark) return brandColor.dark;
  return brandColor.light;
};
function Loading(props: LoadingProps) {
  const { message, progress } = props;
  const theme = useContext<ThemeType>(ThemeContext);
  return (
    <Box direction="column" align="center" pad="medium" gap="small" width="medium">
      <Heading level={2}>{message}</Heading>
      <Loader type="Grid" color={getColor(theme)} height={100} width={100} />
    </Box>
  );
}

export default Loading;
