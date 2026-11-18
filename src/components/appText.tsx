import React from 'react';
import {
  Text,
  TextProps,
} from 'react-native';

export const FONTS = {
  400: 'Pretendard-Regular',
  500: 'Pretendard-Medium',
  600: 'Pretendard-SemiBold',
  700: 'Pretendard-Bold',
} as const;

type Props = TextProps & {
  weight?: keyof typeof FONTS;
};

export default function AppText({
  weight = 400,
  style,
  ...props
}: Props) {
  return (
    <Text
      {...props}
      style={[
        { fontFamily: FONTS[weight] },
        style,
      ]}
    />
  );
}