import * as React from 'react';
import type { SharedValue } from 'react-native-reanimated';
import type { EventEmitterProps, Layout, NavigationState, PagerProps, Route } from './types';
type Props<T extends Route> = PagerProps & {
    layout: Layout;
    onIndexChange: (index: number) => void;
    onTabSelect?: (props: {
        index: number;
    }) => void;
    navigationState: NavigationState<T>;
    children: (props: EventEmitterProps & {
        render: (children: React.ReactNode) => React.ReactNode;
        jumpTo: (key: string) => void;
        reanimatedPosition: SharedValue<number>;
    }) => React.ReactElement;
};
export declare function PanResponderAdapter<T extends Route>({ layout, keyboardDismissMode, swipeEnabled, navigationState, onIndexChange, onTabSelect, onSwipeStart, onSwipeEnd, children, style, animationEnabled, layoutDirection, }: Props<T>): React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
export {};
//# sourceMappingURL=PanResponderAdapter.d.ts.map