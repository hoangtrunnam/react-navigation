"use strict";

import * as React from 'react';
import { Platform, StyleSheet } from 'react-native';
// eslint-disable-next-line import-x/no-extraneous-dependencies
import Animated, { Easing, Extrapolation, interpolate, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { useAnimatedValue } from "./useAnimatedValue.js";
import { jsx as _jsx } from "react/jsx-runtime";
export function TabBarIndicator({
  getTabWidth,
  layout,
  navigationState,
  reanimatedPosition,
  width,
  direction,
  gap,
  style,
  children
}) {
  const isIndicatorShown = React.useRef(false);
  const isWidthDynamic = width === 'auto';
  const opacity = useAnimatedValue(isWidthDynamic ? 0 : 1);
  const indicatorVisible = isWidthDynamic ? layout.width && navigationState.routes.slice(0, navigationState.index).every((_, r) => getTabWidth(r)) : true;
  React.useEffect(() => {
    const fadeInIndicator = () => {
      if (!isIndicatorShown.current && isWidthDynamic && indicatorVisible) {
        isIndicatorShown.current = true;
        opacity.value = withTiming(1, {
          duration: 150,
          easing: Easing.linear
        });
      }
    };
    fadeInIndicator();
  }, [indicatorVisible, isWidthDynamic, opacity]);
  const {
    routes
  } = navigationState;

  // Pre-calculate input/output ranges
  const inputRange = routes.map((_, i) => i);
  const translateXOutputRange = React.useMemo(() => {
    return routes.reduce((acc, _, i) => {
      if (typeof width === 'number') {
        if (i === 0) return [getTabWidth(i) / 2 - width / 2];
        let sumTabWidth = 0;
        for (let j = 0; j < i; j++) {
          sumTabWidth += getTabWidth(j);
        }
        return [...acc, sumTabWidth + getTabWidth(i) / 2 + (gap ? gap * i : 0) - width / 2];
      } else {
        // Auto width - position at start of each tab
        if (i === 0) return [0];
        return [...acc, acc[i - 1] + getTabWidth(i - 1) + (gap ?? 0)];
      }
    }, []);
  }, [routes, getTabWidth, width, gap]);
  const widthOutputRange = React.useMemo(() => {
    return inputRange.map(getTabWidth);
  }, [inputRange, getTabWidth]);
  const animatedStyle = useAnimatedStyle(() => {
    if (!reanimatedPosition) {
      return {
        width: width === 'auto' ? 1 : width,
        opacity: width === 'auto' ? opacity.value : 1
      };
    }
    const styles = {};
    if (layout.width && routes.length > 1) {
      const translateX = interpolate(reanimatedPosition.value, inputRange, translateXOutputRange, Extrapolation.CLAMP);
      styles.transform = [{
        translateX: translateX * (direction === 'rtl' ? -1 : 1)
      }];
    }
    if (width === 'auto') {
      const animatedWidth = routes.length > 1 ? interpolate(reanimatedPosition.value, inputRange, widthOutputRange, Extrapolation.CLAMP) : widthOutputRange[0] || 1;
      styles.width = animatedWidth;
      styles.opacity = opacity.value;
    } else {
      styles.width = width;
    }
    return styles;
  }, [reanimatedPosition, layout.width, routes.length, inputRange, translateXOutputRange, widthOutputRange, direction, width, opacity]);
  const webStyle = React.useMemo(() => {
    if (Platform.OS === 'web' && width === 'auto' && reanimatedPosition) {
      const currentWidth = interpolate(reanimatedPosition.value, inputRange, widthOutputRange, Extrapolation.CLAMP);
      const currentTranslateX = interpolate(reanimatedPosition.value, inputRange, translateXOutputRange, Extrapolation.CLAMP);
      return {
        width: currentWidth,
        left: currentTranslateX * (direction === 'rtl' ? -1 : 1)
      };
    }
    return {};
  }, [reanimatedPosition, inputRange, widthOutputRange, translateXOutputRange, direction, width]);
  return /*#__PURE__*/_jsx(Animated.View, {
    style: [styles.indicator, Platform.OS === 'web' && width === 'auto' ? webStyle : animatedStyle, style],
    children: children
  });
}
const styles = StyleSheet.create({
  indicator: {
    backgroundColor: '#ffeb3b',
    position: 'absolute',
    start: 0,
    bottom: 0,
    height: 2
  }
});
//# sourceMappingURL=TabBarIndicator.js.map