"use strict";

import React from 'react';
import { StyleSheet } from 'react-native';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import Animated from 'react-native-reanimated';
import { jsx as _jsx } from "react/jsx-runtime";
export const TabBarItemLabel = /*#__PURE__*/React.memo(({
  color,
  label,
  style,
  icon,
  ...rest
}) => {
  if (!label) {
    return null;
  }
  return /*#__PURE__*/_jsx(Animated.Text, {
    ...rest,
    style: [styles.label, icon ? {
      marginTop: 0
    } : null, style, {
      color: color
    }],
    children: label
  });
});
TabBarItemLabel.displayName = 'TabBarItemLabel';
const styles = StyleSheet.create({
  label: {
    margin: 4,
    fontSize: 14,
    fontWeight: '500',
    backgroundColor: 'transparent'
  }
});
//# sourceMappingURL=TabBarItemLabel.js.map