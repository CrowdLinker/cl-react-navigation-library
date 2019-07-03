import React from 'react';
import { StyleProp, ViewStyle, View } from 'react-native';
import { NavigationContext, BasepathContext } from './navigation-provider';
import { NavigateOptions } from './navigation';
import { BorderlessButton } from 'react-native-gesture-handler';

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
    <NavigationContext.Consumer>
      {navigation => (
        <BasepathContext.Consumer>
          {(basepath = '/') => {
            function navigate() {
              // this might help with performance -- not sure
              requestAnimationFrame(() => {
                const base = resolve(
                  basepath,
                  navigation ? navigation.current.path : ''
                );

                navigation && navigation.navigate(to, base, state, options);
              });
            }

            return (
              <BorderlessButton onPress={() => navigate()} style={style}>
                <View style={{ flex: 1 }} accessible>
                  {children}
                </View>
              </BorderlessButton>
            );
          }}
        </BasepathContext.Consumer>
      )}
    </NavigationContext.Consumer>
  );
}

export { Link };

let paramRe = /^:(.+)/;

function resolve(pathname: string, location: string): string {
  let l = location;

  if (location.includes('?')) {
    l = location.split('?')[0];
  }

  const pathSegments = pathname.split('/').filter(Boolean);
  const locationSegments = l.split('/').filter(Boolean);

  let segments: string[] = [];

  for (let i = 0; i < pathSegments.length; i++) {
    let subpath = pathSegments[i];
    const isDynamic = paramRe.exec(subpath);

    if (isDynamic) {
      subpath = locationSegments[i];
    }

    segments.push(subpath);
  }

  return '/' + segments.join('/');
}
