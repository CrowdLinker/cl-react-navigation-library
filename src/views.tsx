import React from 'react';
import { View, StyleSheet, Platform, ViewStyle, StyleProp } from 'react-native';
import { Router } from './routing';
import { getStatusBarHeight, getBottomSpace } from './iphone-x-helpers';
import { NavigatorType } from './transition';

interface HeaderProps {
  children: any;
  style?: StyleProp<ViewStyle>;
  type?: NavigatorType;
}

function Header({ children, style, type }: HeaderProps) {
  return (
    <View style={[styles.header, style]}>
      <Router type={type}>{children}</Router>
    </View>
  );
}

function Tabbar({ children, style }: any) {
  return <View style={[styles.tabbar, style]}>{children}</View>;
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
