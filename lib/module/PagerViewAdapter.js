"use strict";

/* eslint-disable import-x/no-extraneous-dependencies */
import * as React from 'react';
import { Animated, Keyboard, StyleSheet } from 'react-native';
import ViewPager from 'react-native-pager-view';
import { useDerivedValue, useSharedValue, withSpring } from 'react-native-reanimated';
// import Reanimated from 'react-native-reanimated';
import useLatestCallback from 'use-latest-callback';
import { useAnimatedValue } from "./useAnimatedValue.js";
import { jsx as _jsx } from "react/jsx-runtime";
const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);
// const ReAnimatedViewPager = Reanimated.createAnimatedComponent(ViewPager);

export function PagerViewAdapter({
  keyboardDismissMode = 'auto',
  swipeEnabled = true,
  navigationState,
  onIndexChange,
  onSwipeStart,
  onSwipeEnd,
  children,
  style,
  animationEnabled,
  ...rest
}) {
  const {
    index
  } = navigationState;
  const listenersRef = React.useRef([]);
  const pagerRef = React.useRef(null);
  const indexRef = React.useRef(index);
  const navigationStateRef = React.useRef(navigationState);
  const position = useAnimatedValue(index);
  const positionReanimated = useSharedValue(index);
  const offset = useAnimatedValue(0);
  const offsetReanimated = useSharedValue(0);
  const smoothPosition = useSharedValue(index);
  React.useEffect(() => {
    navigationStateRef.current = navigationState;
  });
  const jumpTo = useLatestCallback(key => {
    const index = navigationStateRef.current.routes.findIndex(route => route.key === key);
    if (animationEnabled) {
      pagerRef.current?.setPage(index);
    } else {
      pagerRef.current?.setPageWithoutAnimation(index);
      position.setValue(index);
      positionReanimated.value = index;
    }
    onIndexChange(index);
  });
  React.useEffect(() => {
    if (keyboardDismissMode === 'auto') {
      Keyboard.dismiss();
    }
    if (indexRef.current !== index) {
      if (animationEnabled) {
        pagerRef.current?.setPage(index);
      } else {
        pagerRef.current?.setPageWithoutAnimation(index);
        position.setValue(index);
        positionReanimated.value = index;
      }
    }
  }, [keyboardDismissMode, index, animationEnabled, position, positionReanimated]);
  const onPageScrollStateChanged = state => {
    const {
      pageScrollState
    } = state.nativeEvent;
    switch (pageScrollState) {
      case 'idle':
        onSwipeEnd?.();
        return;
      case 'dragging':
        {
          const subscription = offset.addListener(({
            value
          }) => {
            const next = index + (value > 0 ? Math.ceil(value) : Math.floor(value));
            if (next !== index) {
              listenersRef.current.forEach(listener => listener(next));
            }
            offset.removeListener(subscription);
          });
          onSwipeStart?.();
          return;
        }
    }
  };
  const addEnterListener = useLatestCallback(listener => {
    listenersRef.current.push(listener);
    return () => {
      const index = listenersRef.current.indexOf(listener);
      if (index > -1) {
        listenersRef.current.splice(index, 1);
      }
    };
  });
  const memoizedPosition = React.useMemo(() => Animated.add(position, offset), [offset, position]);
  const memoizedPositionReanimated = useDerivedValue(() => {
    const targetValue = positionReanimated.value + offsetReanimated.value;

    // Always use spring animation by removing the diff check
    if (!isNaN(targetValue) && targetValue !== undefined) {
      smoothPosition.value = withSpring(targetValue, {
        damping: 50,
        stiffness: 400,
        mass: 0.5
      });
    }
    return smoothPosition.value;
  }, [positionReanimated, offsetReanimated]);
  return children({
    position: memoizedPosition,
    reanimatedPosition: memoizedPositionReanimated,
    addEnterListener,
    jumpTo,
    render: children => /*#__PURE__*/_jsx(AnimatedViewPager, {
      ...rest,
      ref: pagerRef,
      style: [styles.container, style],
      initialPage: index,
      keyboardDismissMode: keyboardDismissMode === 'auto' ? 'on-drag' : keyboardDismissMode,
      onPageScroll: e => {
        const {
          position: p,
          offset: o
        } = e.nativeEvent;
        // position.setValue(p);
        // offset.setValue(o);
        positionReanimated.value = p;
        offsetReanimated.value = o;
      },
      onPageSelected: e => {
        const index = e.nativeEvent.position;
        indexRef.current = index;
        onIndexChange(index);
      },
      onPageScrollStateChanged: onPageScrollStateChanged,
      scrollEnabled: swipeEnabled,
      children: children
    })
  });
}
const styles = StyleSheet.create({
  container: {
    flex: 1
  }
});
//# sourceMappingURL=PagerViewAdapter.js.map