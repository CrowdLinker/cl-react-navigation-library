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
        {({ params }) => {
          const clone = cloneElement(children, { params });
          return <View style={style || styles.header}>{clone}</View>;
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
      {({ params, match }) => {
        if (!match) {
          return null;
        }

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

const APPBAR_HEIGHT = Platform.select({
  ios: 44,
  android: 56,
  default: 64,
});

const STATUSBAR_HEIGHT = getStatusBarHeight(true);
const BOTTOM_SPACE = getBottomSpace();
const TABBAR_HEIGHT = 49;

const styles = StyleSheet.create({
  header: {
    paddingTop: STATUSBAR_HEIGHT,
    height: APPBAR_HEIGHT + STATUSBAR_HEIGHT,
    ...Platform.select({
      web: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#A7A7AA',
      },
      ios: {
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#A7A7AA',
      },
      android: {
        elevation: 4,
      },
    }),
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
