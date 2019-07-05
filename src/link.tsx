import React from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
import { NavigationContext, BasepathContext } from './navigation-provider';
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
    <BasepathContext.Consumer>
      {(basepath = '/') => (
        <NavigateContext.Consumer>
          {navigate => {
            return (
              <BorderlessButton
                onPress={() => {
                  requestAnimationFrame(() => {
                    navigate(to, state || {}, basepath);
                  });
                }}
                style={[{ flex: 1 }, style]}
              >
                <View style={{ flex: 1 }} accessible>
                  {children}
                </View>
              </BorderlessButton>
            );
          }}
        </NavigateContext.Consumer>
      )}
    </BasepathContext.Consumer>
  );
}

export { Link };
