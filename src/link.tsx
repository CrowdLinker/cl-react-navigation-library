import React from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
import { NavigateOptions } from './navigation';
import { BorderlessButton } from 'react-native-gesture-handler';
import { NavigateContext } from './navigator';

interface LinkProps {
  to: string;
  state?: Object;
  children: any;
  style?: StyleProp<ViewStyle>;
  options?: NavigateOptions;
  component?: any;
}

function Link({ to, state, children, style, options }: LinkProps) {
  return (
    <NavigateContext.Consumer>
      {navigate => {
        return (
          <BorderlessButton
            onPress={() => {
              requestAnimationFrame(() => {
                navigate(to, state);
              });
            }}
            style={[style]}
          >
            <View accessible>{children}</View>
          </BorderlessButton>
        );
      }}
    </NavigateContext.Consumer>
  );
}

export { Link };
