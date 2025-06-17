import React from 'react';
import type { StyleProp, TextProps, ViewStyle } from 'react-native';
import { StyleSheet } from 'react-native';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import Animated from 'react-native-reanimated';

interface TabBarItemLabelProps extends TextProps {
  color: string;
  label?: string;
  style: StyleProp<ViewStyle>;
  icon: React.ReactNode;
}

export const TabBarItemLabel = React.memo(
  ({ color, label, style, icon, ...rest }: TabBarItemLabelProps) => {
    if (!label) {
      return null;
    }

    return (
      <Animated.Text
        {...rest}
        style={[
          styles.label,
          icon ? { marginTop: 0 } : null,
          style,
          { color: color },
        ]}
      >
        {label}
      </Animated.Text>
    );
  }
);

TabBarItemLabel.displayName = 'TabBarItemLabel';

const styles = StyleSheet.create({
  label: {
    margin: 4,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'transparent',
  },
});
