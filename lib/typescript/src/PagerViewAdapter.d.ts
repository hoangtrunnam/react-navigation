import * as React from 'react';
import { type SharedValue } from 'react-native-reanimated';
import type { EventEmitterProps, NavigationState, PagerProps, Route } from './types';
export declare function usePagerScrollHandler(handlers: any, dependencies?: any): import("react-native-reanimated").EventHandlerProcessed<any, never>;
type Props<T extends Route> = PagerProps & {
    onIndexChange: (index: number) => void;
    onTabSelect?: (props: {
        index: number;
    }) => void;
    navigationState: NavigationState<T>;
    children: (props: EventEmitterProps & {
        reanimatedPosition: SharedValue<number>;
        render: (children: React.ReactNode) => React.ReactNode;
        jumpTo: (key: string) => void;
    }) => React.ReactElement;
};
export declare function PagerViewAdapter<T extends Route>({ keyboardDismissMode, swipeEnabled, navigationState, onIndexChange, onTabSelect, onSwipeStart, onSwipeEnd, children, style, animationEnabled, ...rest }: Props<T>): React.ReactElement<unknown, string | React.JSXElementConstructor<any>>;
export {};
//# sourceMappingURL=PagerViewAdapter.d.ts.map