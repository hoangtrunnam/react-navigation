import * as React from 'react';
import { Animated, Keyboard, Platform, StyleSheet } from 'react-native';
import ViewPager, {
  type PageScrollStateChangedNativeEvent,
} from 'react-native-pager-view';
import useLatestCallback from 'use-latest-callback';

import type {
  EventEmitterProps,
  Listener,
  NavigationState,
  PagerProps,
  Route,
} from './types';
import { useAnimatedValue } from './useAnimatedValue';

import { type SharedValue, useDerivedValue, useSharedValue } from 'react-native-reanimated';
import Reanimated, {
} from 'react-native-reanimated';

const AnimatedViewPager = Animated.createAnimatedComponent(ViewPager);
const ReAnimatedViewPager = Reanimated.createAnimatedComponent(ViewPager);

type Props<T extends Route> = PagerProps & {
  onIndexChange: (index: number) => void;
  onTabSelect?: (props: { index: number }) => void;
  navigationState: NavigationState<T>;
  children: (
    props: EventEmitterProps & {
      // Animated value which represents the state of current index
      // It can include fractional digits as it represents the intermediate value
      position: Animated.AnimatedInterpolation<number>;
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

const useNativeDriver = Platform.OS !== 'web';

export function PagerViewAdapter<T extends Route>({
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
}: Props<T>) {
  const { index } = navigationState;

  const listenersRef = React.useRef<Listener[]>([]);

  const pagerRef = React.useRef<ViewPager>(null);
  const indexRef = React.useRef<number>(index);
  const navigationStateRef = React.useRef(navigationState);

  const position = useAnimatedValue(index);
  const positionReanimated = useSharedValue(index);
  const offset = useAnimatedValue(0);
  const offsetReanimated = useSharedValue(0);


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

  const onPageScrollStateChanged = (
    state: PageScrollStateChangedNativeEvent
  ) => {
    const { pageScrollState } = state.nativeEvent;

    switch (pageScrollState) {
      case 'idle':
        onSwipeEnd?.();
        return;
      case 'dragging': {
        const subscription = offset.addListener(({ value }) => {
          const next =
            index + (value > 0 ? Math.ceil(value) : Math.floor(value));

          if (next !== index) {
            listenersRef.current.forEach((listener) => listener(next));
          }

          offset.removeListener(subscription);
        });

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

  const memoizedPosition = React.useMemo(
    () => Animated.add(position, offset),
    [offset, position]
  );


  const memoizedPositionReanimated = useDerivedValue(() => {
    return positionReanimated.value + offsetReanimated.value;
  });

  return children({
    position: memoizedPosition,
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
          // cập nhật đồng thời RN Animated và Reanimated
          position.setValue(p);
          offset.setValue(o);
          positionReanimated.value = p;
          offsetReanimated.value = o;
        }}
        onPageSelected={(e) => {
          const index = e.nativeEvent.position;
          indexRef.current = index;
          onIndexChange(index);
          onTabSelect?.({ index });
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
