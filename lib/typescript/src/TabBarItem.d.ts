import { type LayoutChangeEvent, type PressableAndroidRippleConfig, type StyleProp, type TextProps, type ViewStyle } from 'react-native';
import { type SharedValue } from 'react-native-reanimated';
import type { NavigationState, Route, TabDescriptor } from './types';
export type Props<T extends Route> = TabDescriptor<T> & {
    reanimatedPosition: SharedValue<number>;
    route: T;
    navigationState: NavigationState<T>;
    activeColor?: string;
    inactiveColor?: string;
    pressColor?: string;
    pressOpacity?: number;
    onLayout?: (event: LayoutChangeEvent) => void;
    onPress: () => void;
    onLongPress: () => void;
    defaultTabWidth?: number;
    style: StyleProp<ViewStyle>;
    android_ripple?: PressableAndroidRippleConfig;
    labelProps?: TextProps;
};
export declare function TabBarItem<T extends Route>(props: Props<T>): import("react/jsx-runtime").JSX.Element;
//# sourceMappingURL=TabBarItem.d.ts.map