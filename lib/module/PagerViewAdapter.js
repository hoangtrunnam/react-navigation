"use strict";

/* eslint-disable import-x/no-extraneous-dependencies */
import * as React from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import ViewPager from 'react-native-pager-view';
import Reanimated, { useEvent, useHandler, useSharedValue } from 'react-native-reanimated';
import useLatestCallback from 'use-latest-callback';
import { jsx as _jsx } from "react/jsx-runtime";
const AnimatedViewPager = Reanimated.createAnimatedComponent(ViewPager);
export function usePagerScrollHandler(handlers, dependencies) {
  const {
    context,
    doDependenciesDiffer
  } = useHandler(handlers, dependencies);
  const subscribeForEvents = ['onPageScroll'];
  return useEvent(event => {
    'worklet';

    const {
      onPageScroll
    } = handlers;
    if (onPageScroll && event.eventName.endsWith('onPageScroll')) {
      onPageScroll(event, context);
    }
  }, subscribeForEvents, doDependenciesDiffer);
}
export function PagerViewAdapter({
  keyboardDismissMode = 'auto',
  swipeEnabled = true,
  navigationState,
  onIndexChange,
  onTabSelect,
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
  const positionReanimated = useSharedValue(index);
  React.useEffect(() => {
    navigationStateRef.current = navigationState;
  });
  const jumpTo = useLatestCallback(key => {
    const index = navigationStateRef.current.routes.findIndex(route => route.key === key);
    if (animationEnabled) {
      pagerRef.current?.setPage(index);
    } else {
      pagerRef.current?.setPageWithoutAnimation(index);
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
        positionReanimated.value = index;
      }
    }
  }, [keyboardDismissMode, index, animationEnabled, positionReanimated]);
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
  const scrollHandler = usePagerScrollHandler({
    onPageScroll: e => {
      'worklet';

      positionReanimated.value = e.offset + e.position;
    }
  });
  return children({
    reanimatedPosition: positionReanimated,
    addEnterListener,
    jumpTo,
    render: children => /*#__PURE__*/_jsx(AnimatedViewPager, {
      ...rest,
      // AnimatedViewPager with Reanimated crashes when orientation changes because:
      // 1. When screen rotates, ViewPager is destroyed and recreated with native lifecycle
      // 2. Reanimated still keeps references to the destroyed component
      // 3. Layout animations still try to apply to components that no longer exist
      // 4. Results in error: "config is not a function, it is object"
      // 5. Should turn off: layout, exiting, entering
      entering: undefined,
      exiting: undefined,
      layout: undefined,
      ref: pagerRef,
      style: [styles.container, style],
      initialPage: index,
      keyboardDismissMode: keyboardDismissMode === 'auto' ? 'on-drag' : keyboardDismissMode,
      onPageScroll: scrollHandler,
      onPageSelected: e => {
        const index = e.nativeEvent.position;
        indexRef.current = index;
        onIndexChange(index);
        onTabSelect?.({
          index
        });
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