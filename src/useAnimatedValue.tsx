// eslint-disable-next-line import-x/no-extraneous-dependencies
import { useSharedValue } from 'react-native-reanimated';

export function useAnimatedValue(initialValue: number) {
  return useSharedValue(initialValue);
}
