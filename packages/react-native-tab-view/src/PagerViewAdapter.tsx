/* eslint-disable import-x/no-extraneous-dependencies */
import * as React from 'react';
import { Keyboard, StyleSheet } from 'react-native';
import ViewPager, {
  type PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view';
import {
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import Reanimated from 'react-native-reanimated';
import useLatestCallback from 'use-latest-callback';

import type {
  EventEmitterProps,
  Listener,
  NavigationState,
  PagerProps,
  Route,
} from './types';
import { useAnimatedValue } from './useAnimatedValue';

// const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);
const AnimatedViewPager = Reanimated.createAnimatedComponent(ViewPager);

type Props<T extends Route> = PagerProps & {
  onIndexChange: (index: number) => void;
  navigationState: NavigationState<T>;
  children: (
    props: EventEmitterProps & {
      // Reanimated shared value which represents the position
      reanimatedPosition?: SharedValue<number>;
      // Function to actually render the content of the pager
      // The parent component takes care of rendering
      render: (children: React.ReactNode) => React.ReactNode;
      // Callback to call when switching the tab
      // The tab switch animation is performed even if the index in state is unchanged
      jumpTo: (key: string) => void;
    }
  ) => React.ReactElement;
};

export function PagerViewAdapter<T extends Route>({
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
}: Props<T>) {
  const { index } = navigationState;

  const listenersRef = React.useRef<Listener[]>([]);

  const pagerRef = React.useRef<ViewPager>(null);
  const indexRef = React.useRef<number>(index);
  const navigationStateRef = React.useRef(navigationState);

  const position = useAnimatedValue(index);
  const positionReanimated = useSharedValue(index);
  const offsetReanimated = useSharedValue(0);
  const smoothPosition = useSharedValue(index);

  React.useEffect(() => {
    navigationStateRef.current = navigationState;
  });

  const jumpTo = useLatestCallback((key: string) => {
    const index = navigationStateRef.current.routes.findIndex(
      (route: { key: string }) => route.key === key
    );

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
  }, [
    keyboardDismissMode,
    index,
    animationEnabled,
    position,
    positionReanimated,
  ]);

  const onPageScrollStateChanged = (
    state: PageScrollStateChangedNativeEvent
  ) => {
    const { pageScrollState } = state.nativeEvent;

    switch (pageScrollState) {
      case 'idle':
        onSwipeEnd?.();
        return;
      case 'dragging': {
        onSwipeStart?.();
        return;
      }
    }
  };

  const addEnterListener = useLatestCallback((listener: Listener) => {
    listenersRef.current.push(listener);

    return () => {
      const index = listenersRef.current.indexOf(listener);

      if (index > -1) {
        listenersRef.current.splice(index, 1);
      }
    };
  });

  const memoizedPositionReanimated = useDerivedValue(() => {
    const targetValue = positionReanimated.value + offsetReanimated.value;

    // Chỉ apply spring khi có sự thay đổi lớn (jump)
    const diff = Math.abs(targetValue - smoothPosition.value);
    if (diff > 0.03) {
      // Threshold để detect jump
      smoothPosition.value = withSpring(targetValue, {
        damping: 50,
        stiffness: 400,
        mass: 0.5,
      });
    } else {
      smoothPosition.value = targetValue;
    }

    return smoothPosition.value;
  }, [positionReanimated, offsetReanimated]);

  return children({
    reanimatedPosition: memoizedPositionReanimated,
    addEnterListener,
    jumpTo,
    render: (children) => (
      <AnimatedViewPager
        {...rest}
        ref={pagerRef}
        style={[styles.container, style]}
        initialPage={index}
        keyboardDismissMode={
          keyboardDismissMode === 'auto' ? 'on-drag' : keyboardDismissMode
        }
        onPageScroll={(e) => {
          const { position: p, offset: o } = e.nativeEvent;
          // position.setValue(p);
          // offset.setValue(o);
          positionReanimated.value = p;
          offsetReanimated.value = o;
        }}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          indexRef.current = index;
          onIndexChange(index);
        }}
        onPageScrollStateChanged={onPageScrollStateChanged}
        scrollEnabled={swipeEnabled}
      >
        {children}
      </AnimatedViewPager>
    ),
  });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
