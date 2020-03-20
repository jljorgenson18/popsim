import React, { useContext } from 'react';
import { Box, ThemeType, Heading, Text } from 'grommet';
import Loader from 'react-loader-spinner';
import { Line } from 'rc-progress';
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
  const mainColor = getColor(theme);
  const percent = progress != null ? progress * 100 : null;
  return (
    <Box direction="column" align="center" pad="medium" gap="medium" width="medium">
      <Heading level={2}>{message}</Heading>
      {percent != null ? (
        <Box direction="row" align="center" gap="small" width="100%">
          <Line percent={percent} strokeWidth={4} strokeColor={mainColor} style={{ flexGrow: 1 }} />
          <Text style={{ width: 38, textAlign: 'right' }}>{`${Math.round(percent)}%`}</Text>
        </Box>
      ) : null}
      <Loader type="ThreeDots" color={mainColor} height={30} width={60} />
    </Box>
  );
}

export default Loading;
