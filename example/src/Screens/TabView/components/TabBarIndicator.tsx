import * as React from 'react';
import {
  Platform,
  type StyleProp,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import type {
  NavigationState,
  Route,
  SceneRendererProps,
} from 'react-native-tab-view';

import { useAnimatedValue } from './useAnimatedValue';

export type GetTabWidth = (index: number) => number;

export type Props<T extends Route> = SceneRendererProps & {
  navigationState: NavigationState<T>;
  width?: 'auto' | `${number}%` | number;
  getTabWidth?: GetTabWidth;
  direction?: 'ltr' | 'rtl';
  style?: StyleProp<ViewStyle>;
  gap?: number;
  children?: React.ReactNode;
};

export function TabBarIndicator<T extends Route>({
  getTabWidth = () => 0,
  layout,
  navigationState,
  reanimatedPosition,
  width = 'auto',
  direction = 'ltr',
  gap = 0,
  style,
  children,
}: Props<T>) {
  const isIndicatorShown = React.useRef(false);
  const isWidthDynamic = width === 'auto';

  const opacity = useAnimatedValue(isWidthDynamic ? 0 : 1);

  const indicatorVisible = isWidthDynamic
    ? layout.width &&
      navigationState.routes
        .slice(0, navigationState.index)
        .every((_, r) => getTabWidth(r))
    : true;

  React.useEffect(() => {
    if (!isIndicatorShown.current && isWidthDynamic && indicatorVisible) {
      isIndicatorShown.current = true;
      opacity.value = withTiming(1, {
        duration: 150,
        easing: Easing.linear,
      });
    }
  }, [indicatorVisible, isWidthDynamic, opacity]);

  const { routes } = navigationState;

  const inputRange = routes.map((_, i) => i);

  // calculate translateX based on the actual width of each tab
  const translateXOutputRange = React.useMemo(() => {
    return routes.reduce<number[]>((acc, _, i) => {
      if (typeof width === 'number') {
        if (i === 0) return [getTabWidth(i) / 2 - width / 2];

        let sumTabWidth = 0;
        for (let j = 0; j < i; j++) {
          sumTabWidth += getTabWidth(j);
        }

        return [
          ...acc,
          sumTabWidth + getTabWidth(i) / 2 + (gap ? gap * i : 0) - width / 2,
        ];
      } else {
        // Auto width case - calculate position from the start of each tab
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
        opacity: width === 'auto' ? opacity.value : 1,
      };
    }

    const transform = [];

    if (layout.width && routes.length > 1) {
      const translateX = interpolate(
        reanimatedPosition.value,
        inputRange,
        translateXOutputRange,
        Extrapolation.CLAMP
      );

      const finalTranslateX = direction === 'rtl' ? -translateX : translateX;
      transform.push({ translateX: finalTranslateX });
    }

    if (width === 'auto') {
      const animatedWidth =
        routes.length > 1
          ? interpolate(
              reanimatedPosition.value,
              inputRange,
              widthOutputRange,
              Extrapolation.CLAMP
            )
          : widthOutputRange[0] || 1;

      return {
        width: animatedWidth,
        transform,
        opacity: opacity.value,
      };
    }

    return {
      width: width,
      transform,
    };
  }, [
    reanimatedPosition,
    layout.width,
    routes.length,
    inputRange,
    translateXOutputRange,
    direction,
    width,
    widthOutputRange,
    opacity,
  ]);

  // Handle web-specific styling - cũng cần update cho width
  const webStyle = React.useMemo(() => {
    if (Platform.OS === 'web' && width === 'auto' && reanimatedPosition) {
      const currentWidth = interpolate(
        reanimatedPosition.value,
        inputRange,
        widthOutputRange,
        Extrapolation.CLAMP
      );
      const currentTranslateX = interpolate(
        reanimatedPosition.value,
        inputRange,
        translateXOutputRange,
        Extrapolation.CLAMP
      );

      return {
        width: currentWidth,
        left: direction === 'rtl' ? -currentTranslateX : currentTranslateX,
      };
    }
    return {};
  }, [
    reanimatedPosition,
    inputRange,
    widthOutputRange,
    translateXOutputRange,
    direction,
    width,
  ]);

  const finalStyle = [
    styles.indicator,
    Platform.OS === 'web' && width === 'auto' ? webStyle : animatedStyle,
    style,
  ];

  return <Animated.View style={finalStyle}>{children}</Animated.View>;
}

const styles = StyleSheet.create({
  indicator: {
    backgroundColor: 'blue',
    position: 'absolute',
    start: 0,
    bottom: 0,
    height: 2,
    borderRadius: 16,
  },
});
