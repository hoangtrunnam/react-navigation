import React from 'react';
import type { StyleProp, TextProps, ViewStyle } from 'react-native';
interface TabBarItemLabelProps extends TextProps {
    color: string;
    label?: string;
    style: StyleProp<ViewStyle>;
    icon: React.ReactNode;
}
export declare const TabBarItemLabel: React.MemoExoticComponent<({ color, label, style, icon, ...rest }: TabBarItemLabelProps) => import("react/jsx-runtime").JSX.Element | null>;
export {};
//# sourceMappingURL=TabBarItemLabel.d.ts.map