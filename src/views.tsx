import React, { Children, cloneElement } from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { NavigationContext } from './navigation-provider';
import { getStatusBarHeight, getBottomSpace } from './iphone-x-helpers';
import { NavigatorContext } from './navigator';
import { Link } from './link';

interface HeadersProps {
  activeIndex: number;
  children: any;
  defaultIndex: number;
}

function HeadersImpl({ activeIndex, defaultIndex, children }: HeadersProps) {
  const child = children[activeIndex] || children[defaultIndex];

  return <View>{child}</View>;
}

function Headers({ children }: { children: any }) {
  return (
    <NavigatorContext.Consumer>
      {({ activeIndex, defaultIndex }) => (
        <HeadersImpl activeIndex={activeIndex} defaultIndex={defaultIndex}>
          {children}
        </HeadersImpl>
      )}
    </NavigatorContext.Consumer>
  );
}

interface HeaderProps {
  children: any;
  style?: StyleProp<ViewStyle>;
}

function Header({ children, style }: HeaderProps) {
  return (
    <NavigatorContext.Consumer>
      {navigator => (
        <View style={[styles.header, style]}>
          {cloneElement(children, navigator)}
        </View>
      )}
    </NavigatorContext.Consumer>
  );
}

function TabbarImpl({ activeIndex, style, children }: any) {
  return (
    <View style={[styles.tabbar, style]}>
      {Children.map(children, (element: any, index: number) =>
        cloneElement(element, { active: index === activeIndex })
      )}
    </View>
  );
}

function Tabbar({ children, ...rest }: HeaderProps) {
  return (
    <NavigatorContext.Consumer>
      {({ activeIndex }) => (
        <TabbarImpl activeIndex={activeIndex} {...rest}>
          {children}
        </TabbarImpl>
      )}
    </NavigatorContext.Consumer>
  );
}

interface TabProps {
  to: string;
  children: any;
  active?: boolean; // implicit prop
  style?: StyleProp<ViewStyle>;
  activeStyle?: StyleProp<ViewStyle>;
}

function Tab({ to, children, active, style, activeStyle }: TabProps) {
  return (
    <Link to={to} style={[styles.tab, style, active && activeStyle]}>
      {Children.map(children, (element: any) =>
        cloneElement(element, { active })
      )}
    </Link>
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
    paddingHorizontal: 10,
    flexDirection: 'row',
    paddingTop: STATUSBAR_HEIGHT,
    height: APPBAR_HEIGHT + STATUSBAR_HEIGHT,
    ...platformContainerStyles,
  },

  tabbar: {
    height: TABBAR_HEIGHT + BOTTOM_SPACE,
    flexDirection: 'row',
    paddingBottom: BOTTOM_SPACE,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, .3)',
  },

  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export { STATUSBAR_HEIGHT, TABBAR_HEIGHT, APPBAR_HEIGHT, BOTTOM_SPACE };
export { Header, Headers, Tabbar, Tab };
