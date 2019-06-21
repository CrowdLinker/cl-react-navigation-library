import React, { Children, cloneElement } from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { Route, Link } from './routing';
import { getStatusBarHeight, getBottomSpace } from './iphone-x-helpers';

interface HeaderProps {
  children: any;
  style?: StyleProp<ViewStyle>;
  path: string;
  exact?: boolean;
}

class Header extends React.Component<HeaderProps> {
  render() {
    const { path, children, exact, style } = this.props;

    return (
      <Route path={path} exact={exact}>
        {({ params, match }) => {
          const clone = cloneElement(children, { params, match });
          return <View style={[styles.header, style]}>{clone}</View>;
        }}
      </Route>
    );
  }
}

interface TabbarProps {
  style?: StyleProp<ViewStyle>;
  children: any;
}

function Tabbar({ children, style }: TabbarProps) {
  return (
    <Route path=":active">
      {({ params }) => {
        const active = params ? params.active : '';

        return (
          <View style={style || styles.tabbar}>
            {Children.map(children, (element: any) => {
              return (
                <Link
                  to={`../${element.props.for}`}
                  style={{ flex: 1 }}
                  options={{ latest: true }}
                >
                  {cloneElement(element, {
                    active: active === element.props.for,
                  })}
                </Link>
              );
            })}
          </View>
        );
      }}
    </Route>
  );
}

// ref: https://github.com/react-navigation/stack/blob/master/src/views/Header/Header.tsx
const APPBAR_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
  default: 64,
});

const STATUSBAR_HEIGHT = getStatusBarHeight();
const BOTTOM_SPACE = getBottomSpace();
const TABBAR_HEIGHT = 49;

const platformContainerStyles = Platform.select({
  android: {
    elevation: 4,
  },
  ios: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#A7A7AA',
  },
  default: {
    // https://github.com/necolas/react-native-web/issues/44
    // Material Design
    boxShadow: `0 2px 4px -1px rgba(0,0,0,0.2), 0 4px 5px 0 rgba(0,0,0,0.14), 0 1px 10px 0 rgba(0,0,0,0.12)`,
  },
});

const styles = StyleSheet.create({
  header: {
    paddingTop: STATUSBAR_HEIGHT,
    height: APPBAR_HEIGHT + STATUSBAR_HEIGHT,
    ...platformContainerStyles,
  },

  tabbar: {
    height: TABBAR_HEIGHT + BOTTOM_SPACE,
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: BOTTOM_SPACE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, .3)',
  },
});

export { Tabbar, Header };
